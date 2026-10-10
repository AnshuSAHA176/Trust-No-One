from django.urls import path
from .views import GameView,VoteView

urlpatterns=[
    path('',GameView.as_view(),name='game'),
    path('<uuid:game_id>/vote/',VoteView.as_view(),name='vote'),
]

