from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .serializer import ConversationSerializer,AnswersQuestionView
from rest_framework import generics
from rest_framework.permissions import BasePermission
from .models import Conversation
import json
from apps.game.models import Game


class IsAskedPlayer(BasePermission):
    def has_object_permission(self, request, view, obj):
        return str(obj.receiver.id) == request.data.get("receiver")


class AskQuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ConversationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AnswersQuestionView(generics.UpdateAPIView):
    
    lookup_field = "pk"
    lookup_url_kwarg = "conversation_id"
    serializer_class =AnswersQuestionView
    def get_queryset(self):
        receiver = (self.request.data.get('receiver'))
        return Conversation.objects.filter(receiver=receiver)

    def get_permissions(self):
        return [IsAskedPlayer()]

class ConversationHistory(generics.ListAPIView):
    serializer_class = ...
    def get_queryset(self):

        return Conversation.objects.filter(game__players = self.request.data.get('player'))