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
        game = attrs.get("game")

        if not game:
            raise serializers.ValidationError("Please provide the game")

        if game.status != Game.Status.RUNNING:
            raise serializers.ValidationError("Game is not running")

        if game.phase != Game.Phase.INVESTIGATION:
            raise serializers.ValidationError("Investigation is not active")

        if not game.players.filter(id=attrs.get("sender").id).exists():
            raise serializers.ValidationError("incorrect sender")

        if not game.players.filter(id=attrs.get("receiver").id).exists():
            raise serializers.ValidationError("incorrect reciver")

        
        return attrs

    def create(self, validated_data): 
        return Conversation.objects.create(
           

            game = validated_data.get('game'),
            sender = validated_data.get('sender'),

            receiver = validated_data.get('receiver'),    
            question = validated_data.get('question'),
        
            
        )


class AnswersQuestionView(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields =['answer']

    def validate(self, attrs):
        if not attrs['answer']:
            raise serializers.ValidationError('Please provide the answer')
        return attrs