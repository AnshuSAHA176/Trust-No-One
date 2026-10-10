
from typing import Literal

from langgraph.graph import START, END, StateGraph
from pydantic import BaseModel, Field

from apps.game.models import Player
from apps.game.llm import get_model


MAX_RETRY = 1


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
    is_valid: bool = False

import json

def generate_question(state: State):
    llm = get_model("openai/gpt-oss-20b")

    prompt = f"""
You are playing Trust No One.

Your name: {state.bot_info.name}
Your role: {state.bot_info.role}
Your personality: {state.bot_info.personality}
Your private information: {state.bot_info.private_information}
Your alibi: {state.bot_info.alibi}

Scenario: {state.game_senario}
Players: {[p.model_dump() for p in state.players_info]}
Recent conversation: {state.previous_messages}

Choose ONE other player to question.
Generate a relevant question based on the scenario.

Rules:
- Do not select yourself.
- receiver_id must be an ID from the provided players.
- Do not invent evidence.
- Return valid JSON only.

Format:
{{
    "receiver_id": "player UUID",
    "question": "Your question here"
}}
"""

    response = llm.invoke(prompt)
    data = json.loads(response.content)

    valid_ids = {
        player.id for player in state.players_info
        if player.id != state.bot_info.id
    }

    if data["receiver_id"] not in valid_ids:
        raise ValueError("LLM selected an invalid receiver.")

    return {
        "receiver_id": data["receiver_id"],
        "question": data["question"],
    }


def re_check(state: State):
    llm = get_model("openai/gpt-oss-20b")

    prompt = f"""
Evaluate this question for the game Trust No One.

Scenario: {state.game_senario}
Conversation: {state.previous_messages}
Question: {state.question}

Is the question relevant to the scenario, consistent with the bot's
role, and not based on invented evidence?

Return exactly VALID or INVALID.
"""

    result = llm.invoke(prompt)
    is_valid = result.content.strip().upper().startswith("VALID")

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
