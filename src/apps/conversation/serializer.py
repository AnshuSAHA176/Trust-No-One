from rest_framework import serializers
from .models import Conversation
from apps.game.models import Game


class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = [
            "id",
            "game",
            "sender",
            "receiver",
            "question",
            "answer",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "answer",
            "created_at",
        ]

    def validate(self, attrs):
        game_id = attrs.get("game")
        game = Game.objects.filter(id=game_id, status=Game.Status.RUNNING)
        if not attrs.get("question"):
            raise serializers.ValidationError("You must ask any question")

        if not game:
            raise serializers.ValidationError("Please provide the game")

        if not game.exists():
            raise serializers.ValidationError("Please provide a valid game")

        if not game.filter(players=attrs.get("sender")):
            raise serializers.ValidationError("incorrect sender")

        if not game.filter(players=attrs.get("receiver")):
            raise serializers.ValidationError("incorrect reciver")

        return attrs

    def create(self, validated_data): 
        Conversation.objects.create(
           

            game = validated_data.get('game'),
            sender = validated_data.get('sender'),

            receiver = validated_data.get('receiver'),    
            question = validated_data.get('question')
            answer = ''
            
        )
