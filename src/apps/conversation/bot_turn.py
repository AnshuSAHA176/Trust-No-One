from celery import shared_task

@shared_task(bind=True,ignore_result=True)
def run_bot_turn(game_id, bot_id):
    ...