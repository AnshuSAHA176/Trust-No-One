
from celery import shared_task
from django.db import transaction
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .bot_graph import question_graph
from apps.game.models import Game
from apps.conversation.models import Message


@shared_task(bind=True, ignore_result=True)
def run_bot_turn(self, game_id, bot_id):
    try:
        game = Game.objects.get(id=game_id)
        bot = game.players.get(id=bot_id)

        if bot.is_human or not bot.is_alive:
            return

        # Players the bot can question
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

        result = question_graph.invoke({
            "bot_info": {
                "id": str(bot.id),
                "role": bot.role,
                "name": bot.name,
                "personality": bot.personality,
                "private_information": bot.private_information,
                "alibi": bot.alibi,
            },
            "game_id": str(game.id),
            "game_senario": game.scenario,
            "players_info": [
                {
                    "id": str(player.id),
                    "name": player.name,
                }
                for player in players
            ],
            "previous_messages": conversation_history,
            "max_retry": 0,
        })

        receiver = game.players.get(
            id=result["receiver_id"],
            is_alive=True,
        )

        if receiver.id == bot.id:
            return

        with transaction.atomic():
            message = Message.objects.create(
                game=game,
                sender=bot,
                receiver=receiver,
                content=result["question"],
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

    except Exception:
        import logging
        logging.getLogger(__name__).exception(
            "Bot turn failed: game_id=%s bot_id=%s",
            game_id,
            bot_id,
        )
        raise
