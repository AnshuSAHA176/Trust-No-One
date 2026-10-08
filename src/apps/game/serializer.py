from rest_framework import serializers
from .models import Game, Player
from django.db import transaction
import random


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = [
            "id",
            "name",
        ]


class GameListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ["id", "status", "created_at"]
