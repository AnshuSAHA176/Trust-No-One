from django.urls import path
from .views import AskQuestionView,AnswersQuestionView


urlpatterns=[
    path('<str:conversation_id>/answer/',AnswersQuestionView.as_view(),name='ask question'),
    path('ask/',AskQuestionView.as_view(),name='ask question'),
]