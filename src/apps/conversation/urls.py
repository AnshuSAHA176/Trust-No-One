from django.urls import path
from .views import MessageView,AnswersQuestionView,ConversationHistoryView


urlpatterns=[
    path('<str:conversation_id>/answer/',AnswersQuestionView.as_view(),name='ask question'),
    path('message/',MessageView.as_view(),name='ask question'),
    path('history/',ConversationHistoryView.as_view(),name='ask question'),
]