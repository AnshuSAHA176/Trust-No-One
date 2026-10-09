import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

from apps.game.models import Game, Player
from .models import Message


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.game_id = str(self.scope["url_route"]["kwargs"]["game_id"])
        self.game_group_name = f"game_{self.game_id}"

        user = self.scope.get("user")

        if not user or not user.is_authenticated:
            await self.close(code=4001)
            return

        is_member = await self.check_membership(user.id)

        if not is_member:
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name,
        )
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "game_group_name"):
            await self.channel_layer.group_discard(
                self.game_group_name,
                self.channel_name,
            )

    async def receive(self, text_data=None, bytes_data=None):
        if not text_data:
            return

        try:
            data = json.loads(text_data)
            receiver_id = data["receiver"]
            content = data["content"].strip()

            if not content:
                return

            message_data = await self.save_message(
                user_id=self.scope["user"].id,
                receiver_id=receiver_id,
                content=content,
            )

            if not message_data:
                await self.send(
                    text_data=json.dumps(
                        {"error": "Invalid sender, receiver, or game."}
                    )
                )
                return

            await self.channel_layer.group_send(
                self.game_group_name,
                {
                    "type": "chat.message",
                    "message": "send",
                },
            )

        except (json.JSONDecodeError, KeyError, TypeError):
            await self.send(
                text_data=json.dumps(
                    {"error": "Send valid JSON with receiver and content."}
                )
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))

    @database_sync_to_async
    def check_membership(self, user_id):
        return Player.objects.filter(
            game_id=self.game_id,
            user_id=user_id,
            is_human=True,
        ).exists()

    @database_sync_to_async
    def save_message(self, user_id, receiver_id, content):
        try:
            game = Game.objects.get(id=self.game_id)

            sender = game.players.get(
                user_id=user_id,
                is_human=True,
            )
            receiver = game.players.get(id=receiver_id)

            if sender.id == receiver.id:
                return None

            message = Message.objects.create(
                game=game,
                sender=sender,
                receiver=receiver,
                content=content,
            )

            return {
                "id": str(message.id),
                "game": str(game.id),
                "sender": str(sender.id),
                "sender_name": sender.name,
                "receiver": str(receiver.id),
                "receiver_name": receiver.name,
                "content": message.content,
                "created_at": message.created_at.isoformat(),
            }

        except (Game.DoesNotExist, Player.DoesNotExist):
            return None
