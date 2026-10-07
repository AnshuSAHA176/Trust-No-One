from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .serializer import ConversationSerializer


class AskQuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ConversationSerializer(data =request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)
