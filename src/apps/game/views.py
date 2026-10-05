from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import responses
from rest_framework.permissions import IsAuthenticated


class GameView(generics.ListCreateAPIView):
    ...