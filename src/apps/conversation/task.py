
import json
import logging

from celery import shared_task
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .select_player import get_next_player
from .models import Message

logger = logging.getLogger(__name__)


@shared_task(bind=True, ignore_result=True)
def ai_response(self, message_id):
    from .graph import response_graph

    try:
        message = Message.objects.select_related(
            "game", "sender", "receiver"
        ).get(id=message_id)

        bot = message.receiver
        game = message.game

        # Only AI players should answer.
        if bot.is_human or not bot.is_alive:
            return

        result = response_graph.invoke({
    "game_id": str(message.game_id),
    "player_id": str(message.receiver_id),
    "role": message.receiver.role,
    "personality": message.receiver.personality,
    "private_information": message.receiver.private_information,
    "alibi": message.receiver.alibi,
    "game_scenario": json.dumps(message.game.scenario),
})

        print("RESPONSE GRAPH OUTPUT:", result)

        reply = result.get("response")

        if not reply:
            raise ValueError(
                f"Response graph returned no response. Output: {result}"
        )

        # Save the bot's reply.
        saved_message = Message.objects.create(
            game=game,
            sender=bot,
            receiver=message.sender,
            content=reply,
        )

        # Broadcast the reply using JSON-safe values.
        payload = {
            "id": str(saved_message.id),
            "game": str(game.id),
            "sender": str(bot.id),
            "sender_name": bot.name,
            "receiver": str(message.sender.id),
            "receiver_name": message.sender.name,
            "content": saved_message.content,
            "created_at": saved_message.created_at.isoformat(),
        }

        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            f"game_{game.id}",
            {
                "type": "chat.message",
                "message": payload,
            },
        )
        # At the end of ai_response, after broadcasting the bot's answer:
        get_next_player(game_id=str(game.id))
    except Message.DoesNotExist:
        logger.warning("Message %s was not found.", message_id)

    except Exception:
        logger.exception(
            "AI response failed for message %s",
            message_id,
        )
        raise
