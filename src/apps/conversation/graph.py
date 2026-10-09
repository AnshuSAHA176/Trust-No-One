
import json

from langgraph.graph import START, StateGraph, END
from pydantic import BaseModel, Field

from apps.game.llm import get_model
from .models import Message


class State(BaseModel):
    game_id: str
    player_id: str
    role: str
    personality: str
    private_information: str
    alibi: str
    game_scenario: str
    previous_messages: list[dict] = Field(default_factory=list)
    response: str = ""


def previous_messages(state: State):
    messages = (
        Message.objects
        .filter(game_id=state.game_id)
        .select_related("sender", "receiver")
        .order_by("-created_at")[:20]
    )

    history = [
        {
            "sender": m.sender.name,
            "receiver": m.receiver.name,
            "content": m.content,
        }
        for m in reversed(list(messages))
    ]

    return {"previous_messages": history}


def generate_response(state: State):
    model = get_model()

    prompt = f"""
You are a character in the social deduction game Trust No One.

GAME SCENARIO:
{state.game_scenario}

YOUR ROLE: {state.role}
YOUR PERSONALITY: {state.personality}
YOUR PRIVATE INFORMATION: {state.private_information}
YOUR ALIBI: {state.alibi}

CONVERSATION HISTORY:
{json.dumps(state.previous_messages, ensure_ascii=False)}

RULES:
1. Reply naturally, in character, in 1-4 sentences.
2. Use your alibi, private information and conversation history.
3. A PARTNER should investigate and help uncover the truth.
4. A GADDAR may deceive strategically to protect their identity.
5. Never change your assigned role or invent new evidence.
6. Do not reveal private information unless your character chooses to.
7. Respond to the latest message directed at you.
8. Keep the conversation suspenseful and engaging.

Generate only your character's reply.
"""

    result = model.invoke(prompt)

    return {"response": result.content}


builder = StateGraph(State)

builder.add_node("previous_messages", previous_messages)
builder.add_node("generate_response", generate_response)

builder.add_edge(START, "previous_messages")
builder.add_edge("previous_messages", "generate_response")
builder.add_edge("generate_response", END)

response_graph = builder.compile()
