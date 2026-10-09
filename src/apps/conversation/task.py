
import json

from celery import shared_task
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from apps.game.models import Game, Player
from .models import Message



@shared_task(bind=True, ignore_result=True)
def ai_response(self, message_id):
    from .graph import response_graph
    try:
        message = Message.objects.select_related(
            "game", "sender", "receiver"
        ).get(id=message_id)

        bot = message.receiver

        # Only respond when the receiver is an AI player
        

        game = message.game

        result = response_graph.invoke({
            "game_id": str(game.id),
            "player_id": str(bot.id),
            "role": bot.role,
            "personality": bot.personality,
            "private_information": bot.private_information,
            "alibi": bot.alibi,
            "game_scenario": json.dumps(game.scenario),
        })

        reply = result["response"]

        # Save the bot's reply
        saved_message = Message.objects.create(
            game=game,
            sender=bot,
            receiver=message.sender,
            content=reply,
        )

        # Broadcast the saved reply
        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            f"game_{game.id}",
            {
                "type": "chat.message",
                "message": {
                    "id": str(saved_message.id),
                    "sender": bot.id,
                    "receiver": message.sender.id,
                    "content": saved_message.content,
                },
            },
        )

    except Message.DoesNotExist:
        return
