from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Game, Player
from .serializer import PlayerSerializer
import random
from django.db import transaction
from rest_framework import status
from .senario import generate_scenario


class GameView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic()
    def post(self, request, *args, **kwargs):

        user = request.user
        if not request.data.get("name"):
            return Response(
                {"error": "Name is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        game = Game.objects.create(created_by=user)

        human_player = Player.objects.create(
            user=user,
            game=game,
            name=request.data["name"],
            is_human=True,
            role=Player.Role.SAATHI,
        )

        players = []

        players.append(human_player)

        for i, name in enumerate(random.sample(["A", "B", "C"], k=3)):
            if i == 1:
                bots = Player.objects.create(
                    name=name, game=game, role=Player.Role.GADDAR
                )
            else:

                bots = Player.objects.create(
                    name=name, game=game, role=Player.Role.SAATHI
                )

            players.append(bots)

        serializer = PlayerSerializer(players, many=True)
        scenario_players = [
            {
                "player_name": player.name,
                "role": player.role,
            }
            for player in players
        ]

        scenario = generate_scenario(scenario_players)

        # Save human's private information
        human_player.private_information = scenario["players"][0]["private_information"]
        human_player.alibi = scenario["players"][0]["alibi"]

        human_player.save(
            update_fields=[
                "private_information",
                "alibi",
            ]
        )

        # Save public scenario only
        game.scenario = {
            "title": scenario["title"],
            "description": scenario["description"],
            "location": scenario["location"],
            "incident": scenario["incident"],
            "timeline": scenario["timeline"],
            "evidence": scenario["evidence"],
        }

        game.save(update_fields=["scenario"])

        # Save bot private information
        for i in range(1, len(players)):
            players[i].private_information = scenario["players"][i][
                "private_information"
            ]
            players[i].alibi = scenario["players"][i]["alibi"]

            players[i].save(
                update_fields=[
                    "private_information",
                    "alibi",
                ]
            )

        return Response(
            {
                "game_id": game.id,
                "phase": game.phase,
                "status": game.status,
                "player": {
                    "id": human_player.id,
                    "name": human_player.name,
                    "role": human_player.role,
                },
                "players": serializer.data,
            }
        )
