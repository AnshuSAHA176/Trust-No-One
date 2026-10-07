from django.db import models
from apps.game.models import Game, Player


class Conversation(models.Model):
    game = models.ForeignKey(
        Game, on_delete=models.CASCADE, related_name="conversations"
    )
    sender = models.OneToOneField(
        Player, on_delete=models.CASCADE, related_name="sender"
    )
    receiver = models.OneToOneField(
        Player, on_delete=models.CASCADE, related_name="recevier"
    )
    question = models.TextField()

    answer = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:

        indexes = [
            models.Index(fields=["sender", "receiver"]),
            models.Index(fields=["game"], name="game"),
        ]
