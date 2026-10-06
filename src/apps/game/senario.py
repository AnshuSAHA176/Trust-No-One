from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate

from .llm import get_model


class GeneratedPlayerInformation(BaseModel):
    private_information: str = Field(
        description="Secret information known only by this player."
    )

    alibi: str = Field(
        description="A believable account of what this player was doing."
    )


class GeneratedScenario(BaseModel):
    title: str
    description: str
    location: str
    incident: str

    timeline: list[str] = Field(
        description="Important events in chronological order."
    )

    evidence: list[str] = Field(
        description="Public clues players can discover and discuss."
    )

    player_information: list[GeneratedPlayerInformation]


def generate_scenario(players: list[dict]):

    llm = get_model()

    structured_llm = llm.with_structured_output(
        GeneratedScenario
    )

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
You are the Game Master for "Trust No One".

Create a funny, suspenseful and logically solvable
social-deduction mystery set in India.

The story should naturally feel Indian.

Use realistic Indian environments such as:

- office
- wedding
- apartment
- restaurant
- cafe
- railway station
- festival
- cricket club
- hotel
- local business

Use Indian humour naturally through situations such as
chai, WhatsApp, traffic, family calls, delivery problems,
CCTV, watchmen and suspicious excuses.

Do not force jokes.

GAME:

There are exactly 4 players.

There is exactly:

- 1 Gaddar
- 3 Partners

The backend has already decided the roles.

The players are provided in order.

DO NOT create names.

DO NOT return names.

DO NOT return roles.

The application will attach the correct player
name and role after generation.

Create a mystery containing:

- a hidden truth
- a believable motive
- multiple suspicious possibilities
- fragmented information
- useful clues
- at least one contradiction
- 1 or 2 meaningful twists
- a believable Gaddar alibi
- truthful Partner information
- a final clue that can expose the Gaddar

The Gaddar should not be immediately obvious.

Partners must receive truthful information.

The Gaddar can receive information that helps them
maintain a believable lie.

The public scenario must not directly reveal
the Gaddar.

IMPORTANT:

The player_information list MUST contain exactly
one object for each supplied player.

The order MUST be exactly the same as the
supplied player list.

Do not add players.

Do not remove players.

Return only the structured output.
""",
            ),
            (
                "human",
                """
Create a new scenario for these players.

The players are listed in this exact order:

{players}

IMPORTANT:

Do not generate player names.

Do not generate roles.

Return player information in exactly this order.

Player 1 information corresponds to Player 1.

Player 2 information corresponds to Player 2.

Player 3 information corresponds to Player 3.

Player 4 information corresponds to Player 4.
""",
            ),
        ]
    )

    chain = prompt | structured_llm

    result = chain.invoke(
        {
            "players": players,
        }
    )

    # ---------------------------------------------------------
    # VALIDATE PLAYER COUNT
    # ---------------------------------------------------------

    if len(result.player_information) != len(players):
        raise ValueError(
            "LLM returned incorrect number of player information objects."
        )

    # ---------------------------------------------------------
    # ATTACH BACKEND-OWNED NAME + ROLE
    # ---------------------------------------------------------

    final_players = []

    for player, generated in zip(
        players,
        result.player_information,
    ):
        final_players.append(
            {
                "player_name": player["player_name"],
                "role": player["role"],
                "private_information": generated.private_information,
                "alibi": generated.alibi,
            }
        )

    # ---------------------------------------------------------
    # RETURN FINAL SCENARIO
    # ---------------------------------------------------------

    return {
        "title": result.title,
        "description": result.description,
        "location": result.location,
        "incident": result.incident,
        "timeline": result.timeline,
        "evidence": result.evidence,
        "players": final_players,
    }