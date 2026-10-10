
import json
import logging
from typing import Literal

from langgraph.graph import START, END, StateGraph
from pydantic import BaseModel, Field

from apps.game.llm import get_model

logger = logging.getLogger(__name__)

MAX_RETRY = 1
MAX_QUESTION_WORDS = 15


class UserInfo(BaseModel):
    id: str
    role: str
    name: str
    personality: str
    private_information: str
    alibi: str


class PlayersInfo(BaseModel):
    id: str
    name: str


class State(BaseModel):
    bot_info: UserInfo
    game_id: str
    game_senario: str
    players_info: list[PlayersInfo]
    previous_messages: list[dict] = Field(default_factory=list)
    max_retry: int = 0
    question: str = ""
    receiver_id: str = ""
    is_valid: bool = False


def parse_json_response(content) -> dict:
    """Parse JSON safely, including responses wrapped in Markdown."""

    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict):
                parts.append(block.get("text", ""))
            elif isinstance(block, str):
                parts.append(block)
        content = "".join(parts)

    if not isinstance(content, str) or not content.strip():
        raise ValueError("LLM returned empty content.")

    content = content.strip()

    # Remove optional Markdown code fences.
    if content.startswith("```"):
        lines = content.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        content = "\n".join(lines).strip()

    # Handle accidental text before or after the JSON object.
    start = content.find("{")
    end = content.rfind("}")

    if start == -1 or end <= start:
        raise ValueError(f"No JSON object found: {content[:200]!r}")

    data = json.loads(content[start:end + 1])

    if not isinstance(data, dict):
        raise ValueError("LLM output must be a JSON object.")

    return data


def generate_question(state: State):
    llm = get_model("openai/gpt-oss-20b")

    available_players = [
        player.model_dump()
        for player in state.players_info
        if player.id != state.bot_info.id
    ]

    if not available_players:
        logger.warning("No available targets for bot %s", state.bot_info.id)
        return {
            "question": "",
            "receiver_id": "",
            "is_valid": False,
        }

    prompt = f"""
You are a player in Trust No One, a funny, suspenseful social deduction
game with an Indian atmosphere.

YOUR CHARACTER
Name: {state.bot_info.name}
Role: {state.bot_info.role}
Personality: {state.bot_info.personality}
Private information: {state.bot_info.private_information}
Alibi: {state.bot_info.alibi}

SCENARIO
{state.game_senario}

PLAYERS YOU CAN QUESTION
{json.dumps(available_players, ensure_ascii=False)}

RECENT CONVERSATION
{json.dumps(state.previous_messages[-15:], default=str, ensure_ascii=False)}

TASK
Choose ONE available player and ask ONE question.

RULES
- Maximum 15 words.
- Use natural, simple conversational English.
- Be curious, suspicious, witty, or playful.
- Focus on clues, alibis, contradictions, or suspicious behaviour.
- Do not repeat a recent question.
- Do not invent evidence.
- Do not explain your reasoning or add narration.
- Never change your assigned role.
- Partners investigate; Gaddar protects their identity.
- Do not reveal private information unnecessarily.

Return a valid JSON object with exactly these fields:
{{
  "receiver_id": "exact ID of one available player",
  "question": "one short question"
}}

Return JSON only. No Markdown fences.
"""

    try:
        response = llm.invoke(prompt)
        data = parse_json_response(response.content)

        receiver_id = str(data.get("receiver_id", "")).strip()
        question = data.get("question", "")

        if not isinstance(question, str):
            raise ValueError("Question must be a string.")

        question = question.strip()

        valid_ids = {
            player.id
            for player in state.players_info
            if player.id != state.bot_info.id
        }

        if receiver_id not in valid_ids:
            raise ValueError("LLM selected an invalid receiver.")

        if not question or len(question.split()) > MAX_QUESTION_WORDS:
            raise ValueError("Question must contain 1-15 words.")

        return {
            "receiver_id": receiver_id,
            "question": question,
            "is_valid": False,
        }

    except (ValueError, TypeError, json.JSONDecodeError) as exc:
        logger.warning(
            "Question generation output invalid for bot %s: %s",
            state.bot_info.id,
            exc,
        )
        return {
            "receiver_id": "",
            "question": "",
            "is_valid": False,
        }


def re_check(state: State):
    # Do not waste another LLM call validating an empty question.
    if not state.question or not state.receiver_id:
        return {
            "is_valid": False,
            "max_retry": state.max_retry + 1,
        }

    llm = get_model("openai/gpt-oss-20b")

    prompt = f"""
You are a strict question quality checker for Trust No One.

SCENARIO
{state.game_senario}

BOT ROLE
{state.bot_info.role}

RECENT CONVERSATION
{json.dumps(state.previous_messages[-15:], default=str, ensure_ascii=False)}

PROPOSED QUESTION
{state.question}

Check that the question:
1. Contains no more than 15 words.
2. Is relevant to the scenario or conversation.
3. Does not repeat a recent question.
4. Does not invent evidence.
5. Sounds natural and asks one thing.
6. Is appropriate for the bot's role.

Reply with exactly VALID or INVALID. No explanation.
"""

    try:
        result = llm.invoke(prompt)
        verdict = str(result.content).strip().upper()
        is_valid = verdict == "VALID"
    except Exception:
        logger.exception("Question validation failed for bot %s", state.bot_info.id)
        is_valid = False

    return {
        "is_valid": is_valid,
        "max_retry": state.max_retry + 1,
    }


def check_max_retry(state: State) -> Literal["retry", "done"]:
    if state.is_valid or state.max_retry >= MAX_RETRY:
        return "done"

    return "retry"


graph_builder = StateGraph(State)

graph_builder.add_node("generate_question", generate_question)
graph_builder.add_node("re_check", re_check)

graph_builder.add_edge(START, "generate_question")
graph_builder.add_edge("generate_question", "re_check")

graph_builder.add_conditional_edges(
    "re_check",
    check_max_retry,
    {
        "retry": "generate_question",
        "done": END,
    },
)

question_graph = graph_builder.compile()
