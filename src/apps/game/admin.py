from django.contrib import admin
from .models import Player,Game,Voting
# Register your models here.
admin.site.register(Game)
admin.site.register(Player)
admin.site.register(Voting)