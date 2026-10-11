from rest_framework import serializers
from .models import Game, Player, Voting
from django.db import transaction
import random
from .dicpatch_vote_task import agent_vote

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
        game = validated_data["game"]
        request = self.context["request"]

        voter = game.players.get(
            user=request.user,
            is_human=True,
            is_alive=True,
        )

        vote = Voting.objects.create(
            voter=voter,
            **validated_data,
        )

        bot_ids = list(
            game.players.filter(
                is_human=False,
                is_alive=True,
            ).values_list("id", flat=True)
        )

        transaction.on_commit(
            lambda: [
                agent_vote.delay(str(game.id), str(bot_id))
                for bot_id in bot_ids
            ]
        )

        return vote


class VoteCountSerializer(serializers.ModelSerializer):
    votes_received = serializers.SerializerMethodField()

    class Meta:
        model = Player
        fields = ["id", "name", "votes_received"]
    def get_votes_received(self, obj):
        return Voting.objects.filter(target=obj).count()


class PhaseEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields=["phase"]

    def validate_phase(self,value):
        game = self.instance

        allow_phase={
        "INVESTIGATION": ["VOTING"],
        "VOTING": ["ELIMINATION"],
        "ELIMINATION": ["INVESTIGATION", "RESULT"],
        }

        if value not in allow_phase.get(game.phase,[]):
            raise serializers.ValidationError ("This phase transition is not allowed.")

        return value