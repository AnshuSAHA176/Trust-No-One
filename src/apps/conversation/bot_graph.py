from langgraph.graph import START, END, StateGraph
from pydantic import BaseModel
from apps.game.models import Player


class UserInfo(BaseModel):
    id:str
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
    players_info: list[PlayersInfo] = None


# def playersinfo(state: State):
#     players = Player.objects.filter(game_id=state.game_id).exclude(id=state.bot_info.id)

#     return {"players_info": [{"id": p.id, "name": p.name} for p in players]}


