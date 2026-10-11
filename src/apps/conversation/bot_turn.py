
import json
import logging
import uuid

from celery import shared_task
from django.db import transaction
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .bot_graph import question_graph
from apps.game.models import Game
from apps.conversation.models import Message

logger = logging.getLogger(__name__)


def validate_question_result(result, bot, game):
    """Validate the LLM result before accessing the database."""

    if not isinstance(result, dict):
        raise ValueError("Question graph must return a dictionary.")

    receiver_id = result.get("receiver_id")
    question = result.get("question")

    if not receiver_id or not isinstance(receiver_id, str):
        raise ValueError("Missing or invalid receiver_id.")

    try:
        receiver_id = uuid.UUID(receiver_id.strip())
    except (ValueError, TypeError, AttributeError) as exc:
        raise ValueError("Generated receiver_id is not a valid UUID.") from exc

    if not isinstance(question, str) or not question.strip():
        raise ValueError("Missing or empty question.")

    receiver = game.players.filter(
        id=receiver_id,
        is_alive=True,
    ).exclude(id=bot.id).first()

    if receiver is None:
        raise ValueError("Receiver is not an eligible living player.")

    return receiver, question.strip()


@shared_task(bind=True, ignore_result=True, max_retries=1)
def run_bot_turn(self, game_id, bot_id):
    try:
        game = Game.objects.get(id=game_id)

        if game.status != Game.Status.RUNNING:
            logger.info("Skipping bot turn: game %s is not running.", game_id)
            return

        bot = game.players.get(id=bot_id)

        if bot.is_human or not bot.is_alive:
            return

        players = list(
            game.players.filter(is_alive=True).exclude(id=bot.id)
        )

        if not players:
            return

        conversation_history = list(
            game.conversations.order_by("-created_at")
            .values(
                "sender_id",
                "receiver_id",
                "content",
                "created_at",
            )[:30]
        )
        conversation_history.reverse()

        # JSON-serialize UUIDs and timestamps for consistent graph input.
        for item in conversation_history:
            item["sender_id"] = str(item["sender_id"])
            item["receiver_id"] = str(item["receiver_id"])
            item["created_at"] = item["created_at"].isoformat()

        graph_input = {
            "bot_info": {
                "id": str(bot.id),
                "role": bot.role,
                "name": bot.name,
                "personality": bot.personality or "",
                "private_information": bot.private_information or "",
                "alibi": bot.alibi or "",
            },
            "game_id": str(game.id),
            "game_senario": json.dumps(game.scenario),
            "players_info": [
                {"id": str(player.id), "name": player.name}
                for player in players
            ],
            "previous_messages": conversation_history,
            "max_retry": 0,
        }

        last_error = None

        # Retry generation once if the graph returns invalid output.
        for attempt in range(2):
            try:
                result = question_graph.invoke(graph_input)
                receiver, question = validate_question_result(
                    result, bot, game
                )
                logger.warning("RAW QUESTION GRAPH RESULT: %r", result)
                break
            except (ValueError, TypeError, KeyError) as exc:
                last_error = exc
                logger.warning(
                    "Invalid question output for bot %s "
                    "(attempt %s/2): %s",
                    bot.id,
                    attempt + 1,
                    exc,
                )
        else:
            logger.error(
                "Bot %s could not generate a valid question: %s",
                bot.id,
                last_error,
            )
            return

        # Persist the question before broadcasting it.
        with transaction.atomic():
            message = Message.objects.create(
                game=game,
                sender=bot,
                receiver=receiver,
                content=question,
            )

        payload = {
            "id": str(message.id),
            "game": str(game.id),
            "sender": str(bot.id),
            "sender_name": bot.name,
            "receiver": str(receiver.id),
            "receiver_name": receiver.name,
            "content": message.content,
            "created_at": message.created_at.isoformat(),
        }

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"game_{game.id}",
            {
                "type": "chat.message",
                "message": payload,
            },
        )

        logger.info(
            "Bot %s asked %s in game %s.",
            bot.name,
            receiver.name,
            game.id,
        )

    except Exception:
        logger.exception(
            "Bot turn failed: game_id=%s bot_id=%s",
            game_id,
            bot_id,
        )
        raise