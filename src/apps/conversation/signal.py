from django.core.cache import cache
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.conversation.models import Message
from .task import ai_response
from .select_player import get_next_player


@receiver(post_save, sender=Message)
def message_created(sender, instance, created, **kwargs):
    if not created:
        return

    if not instance.receiver.is_human and instance.receiver.is_alive:
        ai_response.delay(message_id=str(instance.id))


@receiver(post_save, sender=Message)
def next_player(sender, instance, created, **kwargs):
    if not created:
        return

    game = instance.game
    current_key = f"current_player:{game.id}"
    current_player_id = cache.get(current_key)

    if str(current_player_id) != str(instance.sender_id):
        return

    # If a bot must answer, don't advance the turn yet.
    if not instance.receiver.is_human and instance.receiver.is_alive:
        return

    get_next_player(game_id=str(game.id))