
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
    model = get_model("openai/gpt-oss-20b")

    prompt = f"""
You are playing Trust No One.

Scenario: {state.game_scenario}
Your role: {state.role}
Your personality: {state.personality}
Your private information: {state.private_information}
Your alibi: {state.alibi}

Recent conversation:
{json.dumps(state.previous_messages[-10:], ensure_ascii=False)}

Rules:
- Reply directly to the latest message addressed to you.
- Use 1-3 short sentences, maximum 40 words.
- Partners investigate; Gaddar protects their identity.
- Never invent evidence or change your assigned role.
- Output only your spoken reply.
"""

    result = model.invoke(prompt)
    reply = result.content.strip()

    if not reply:
        raise ValueError("LLM returned an empty response")

    return {"response": reply}




builder = StateGraph(State)

builder.add_node("previous_messages", previous_messages)
builder.add_node("generate_response", generate_response)

builder.add_edge(START, "previous_messages")
builder.add_edge("previous_messages", "generate_response")
builder.add_edge("generate_response", END)

response_graph = builder.compile()
