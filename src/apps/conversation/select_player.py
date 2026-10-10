
from apps.game.models import Game
from django.core.cache import cache
from .bot_turn import run_bot_turn


def get_next_player(game_id):
    game = Game.objects.get(id=game_id)

    if game.status != Game.Status.RUNNING:
        return None

    players_key = f"players:{game_id}"
    index_key = f"player_index:{game_id}"
    current_key = f"current_player:{game_id}"

    # Get cached players or fetch them from the database.
    players = cache.get(players_key)

    if players is None:
        players = list(
            game.players
            .filter(is_alive=True)
            .order_by("id")
            .values("id", "name", "is_human", "is_alive")
        )
        cache.set(players_key, players, timeout=120)

    if not players:
        return None

    # Read the current index without resetting a valid zero.
    index = cache.get(index_key, 0)
    index = index % len(players)

    # Select the player and advance the index.
    player_turn = players[index]
    cache.set(index_key, (index + 1) % len(players), timeout=120)
    cache.set(key=current_key,value=player_turn['id'],timeout=60*2)

    # Human turns are handled by the WebSocket consumer.
    if player_turn["is_human"]:
        return {
            "player_id": str(player_turn["id"]),
            "is_human": True,
        }

    # AI turns are handled by Celery.
    run_bot_turn.delay(
        game_id=str(game_id),
        bot_id=str(player_turn["id"]),
    )

    return {
        "player_id": str(player_turn["id"]),
        "is_human": False,
    }
