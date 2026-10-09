from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Message

@receiver(post_save,sender=Message)
def message(sender,instance,created,**kwargs):
    if created:
        print(instance.receiver.is_human)
        if not instance.receiver.is_human:
            ...


