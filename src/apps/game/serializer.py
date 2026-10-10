from rest_framework import serializers
from .models import Game, Player, Voting
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


class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voting
        fields = [
            "game",
            "voter",
            "target",
        ]
        read_only_fields = [
            "id",
            "voter",
        ]

    def validate(self, attrs):
        game = attrs["game"]
        user = self.context.get("request").user

        if game.created_by.id != user.id:
            raise serializers.ValidationError(
                "You do have have permission to vote in here"
            )

        if game.status != Game.Status.RUNNING and game.phase != Game.Phase.VOTING:
            raise serializers.ValidationError("Voting time out")

        return attrs

    def create(self, validated_data):
        return Voting.objects.create(
            voter=validated_data["game"].players.get(
                user=self.context.get("request").user, is_human=True
            ),
            **validated_data
        )
