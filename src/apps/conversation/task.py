from celery import shared_task



@shared_task(bind=True,ignore_result=True)
def airesponce(self,instance):
    instance.receiver.