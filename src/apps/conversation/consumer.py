from channels.generic.websocket import AsyncWebsocketConsumer
import json
from channels.db import database_sync_to_async
from .models import Message
from apps.game.models import Game


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        self.game_group_name = f"game_{self.game_id}"

        await self.channel_layer.group_add(self.game_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.game_group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                "type": "chat.message",
                "sender": data["sender"],
                "receiver": data["receiver"],
                "content": data["content"],
            },
        )

    async def chat_message(self, event):
        db = await self.save_message(
            sender_id=event["sender"], receiver_id=event["receiver"], content=event["content"]
        )
        await self.send(text_data=json.dumps({"message": event["content"]}))

    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, content):
        try:
            game = Game.objects.get(id=self.game_id)

            sender = game.players.get(id=sender_id)
            receiver = game.players.get(id=receiver_id)

            return Message.objects.create(
                game=game,
                sender=sender,
                receiver=receiver,
                content=content,
            )

        except (Game.DoesNotExist, Game.MultipleObjectsReturned,
                Exception) as e:
            print(f"Message save failed: {e}")
            return None
