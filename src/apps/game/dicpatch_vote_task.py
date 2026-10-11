from celery import shared_task
from .models import Player





@shared_task(bind=True,ignore_result=True)
def agent_vote(self,game_id,bot_id):
    
    ...




@shared_task
def dispatch_agnet_votes(self,game_id):
    bots = Player.objects.filter(
        game_id=game_id,
        is_human=False,
        is_alive=True,
    )

    for bot in bots:
        agent_vote.delay(str(game_id), str(bot.id))



