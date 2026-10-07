from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics



class AskQuestionView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    


        