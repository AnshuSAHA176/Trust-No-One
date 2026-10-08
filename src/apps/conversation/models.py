from django.db import models
from apps.game.models import Game, Player


class Message(models.Model):
    game = models.ForeignKey(
        Game, on_delete=models.CASCADE, related_name="conversations"
    )
    sender = models.ForeignKey(
    Player,
    on_delete=models.CASCADE,
    related_name="sent_messages"
)

    receiver = models.ForeignKey(
        Player,
        on_delete=models.CASCADE,
        related_name="received_messages"
    )
    
    content = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:

        indexes = [
            models.Index(fields=["sender", "receiver"]),
            models.Index(fields=["game"], name="message_game_idx" ),
        ]

