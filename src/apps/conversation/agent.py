from langgraph.graph import START, StateGraph, END
from pydantic import BaseModel
from apps.game.models import Game, Player


class State(BaseModel):
    player_id: str
    role: str | None
    personality: str | None
    private_information: str | None
    alibi: str | None
    game_scenario: str | None
    previous_messages: list[str] | None


def get_context(state: State):
    player = Player.objects.get(id=state.player_id)

    return {"role":player.role,"personality":player.personality,}
