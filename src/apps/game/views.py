from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Game, Player
from .serializer import (
    PlayerSerializer,
    GameListSerializer,
    VoteSerializer,
    VoteCountSerializer,
    PhaseEditSerializer,
)
import random
from django.db import transaction
from rest_framework import status
from .senario import generate_scenario
from django.db import IntegrityError, transaction
from django.db.models import Count


from apps.conversation.select_player import get_next_player


class GameView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return GameListSerializer

    def get_queryset(self):
        return Game.objects.filter(created_by=self.request.user)

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


class VoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, game_id):
        try:
            with transaction.atomic():
                serializer = VoteSerializer(
                    data={**request.data, "game": game_id},
                    context={"request": request},
                )
                serializer.is_valid(raise_exception=True)
                serializer.save()

            return Response(
                {
                    "message": "Your vote has been submitted successfully.",
                    "vote": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        except IntegrityError:
            return Response(
                {
                    "error": "You have already voted in this game. Each player can vote only once."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    def get(self, request, game_id):

        try:
            game = Game.objects.get(id=game_id)
        except Game.DoesNotExist:
            return Response(
                {"error": "Please provide valid game id"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = {
            "game_id": str(game.id),
            "status": str(game.status),
            "total_votes": game.votings.count(),
            "results": VoteCountSerializer(game.players, many=True).data,
        }
        return Response(data)


class PhaseEditView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Game.objects.all()
    serializer_class = PhaseEditSerializer


class StartGameView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, game_id):
        with transaction.atomic():
            game = Game.objects.select_for_update().get(id=game_id)

            if game.status != Game.Status.PENDING:
                return Response(
                    {"error": "Game has already started or finished."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            players = game.players.filter(is_alive=True)

            if players.count() != 4:
                return Response(
                    {"error": "The game requires exactly 4 living players."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            game.status = Game.Status.RUNNING
            game.save(update_fields=["status"])

        first_turn = get_next_player(game_id=str(game.id))

        return Response(
            {
                "message": "Game started successfully.",
                "game_id": str(game.id),
                "status": game.status,
                "first_turn": first_turn,
            },
            status=status.HTTP_200_OK,
        )


class GameFinnishedView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, game_id):
        with transaction.atomic():
            try:
                game = Game.objects.select_for_update().get(id=game_id)

            except Game.DoesNotExist:
                return Response(
                    {"error": "Please enter a valid game id"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if game.status not in [Game.Status.RUNNING]:
                return Response(
                    {
                        "error":"Game has been pending or finish"
                    },status=status.HTTP_400_BAD_REQUEST
                )

            max_vote_reciver = (
                game.players.values("id", "target", "name", "role")
                .annotate(max_player=Count("target"))
                .order_by("-max_player")[:2]
            )
            if max_vote_reciver[0]["target"] == max_vote_reciver[1]["target"]:
                winner = "Draw"

            print(max_vote_reciver)
            if max_vote_reciver[0]["role"] == "patner":
                winner = "gaddar"
            else:
                winner = "partner"

            game.status = Game.Status.FINISHED
            
            game.save(update_fields=["status"])
            if winner == 'Draw':
                return Response(
                    {
                        "game_id": str(game.id),
                        "status": game.status,
                        "message": "Its a Draw",
                    },
                    status=status.HTTP_200_OK,
                )
        game.players.filter(id=max_vote_reciver[0]["id"]).update(is_alive=False)
        return Response(
            {
                "game_id": str(game.id),
                "status": game.status,
                "winner": winner,
                "loser": "gaddar" if winner == "partner" else "partner",
                "message": "Partners win!" if winner == "partner" else "Gaddar wins!",
            },
            status=status.HTTP_200_OK,
        )
