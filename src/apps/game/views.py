from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Game, Player
from .serializer import PlayerSerializer
import random
from django.db import transaction
from rest_framework import status


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

        serializer = PlayerSerializer(human_player)

        players.append(serializer.data)

        for i, name in enumerate(random.sample(["A", "B", "C"], k=3)):
            if i == 1:
                bots = Player.objects.create(
                    name=name, game=game, role=Player.Role.GADDAR
                )
            else:

                bots = Player.objects.create(
                    name=name, game=game, role=Player.Role.SAATHI
                )
            serializer = PlayerSerializer(bots)
            players.append(serializer.data)

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
                "players": players,
            }
        )
