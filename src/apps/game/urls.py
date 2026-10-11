from django.urls import path
from .views import GameView,VoteView,PhaseEditView,StartGameView

urlpatterns=[
    path('',GameView.as_view(),name='game'),
    path('<uuid:game_id>/',PhaseEditView.as_view(),name='game'),
    path('<uuid:game_id>/vote/',VoteView.as_view(),name='vote'),
    path('<uuid:game_id>/start/',StartGameView.as_view(),name='vote'),
    
]

