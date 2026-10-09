from django.urls import path
from .consumer import ChatConsumer

websocket_urlpatterns = [
    path(
        "ws/games/<uuid:game_id>/chat/",
        ChatConsumer.as_asgi(),
    ),
]