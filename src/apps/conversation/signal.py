from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Message
from .task import ai_response


@receiver(post_save,sender=Message)
def message(sender,instance,created,**kwargs):
    if created:
        print(instance.receiver.is_human)
        if not instance.receiver.is_human:
            ai_response.delay(message_id = str(instance.id))


