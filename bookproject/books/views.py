from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication
from django.contrib.auth import login, logout
from .models import Book
from .serializers import BookSerializer, UserSerializer, RegisterSerializer, LoginSerializer


# Custom authentication class that bypasses CSRF for API views
class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Skip CSRF check


# Create & List all books
@method_decorator(csrf_exempt, name='dispatch')
class BookListCreateView(generics.ListCreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    authentication_classes = [CsrfExemptSessionAuthentication]


# Retrieve, Update, Delete a specific book
@method_decorator(csrf_exempt, name='dispatch')
class BookDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    authentication_classes = [CsrfExemptSessionAuthentication]


# Register new user
@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    authentication_classes = [CsrfExemptSessionAuthentication]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'message': 'User registered successfully',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


# Login user
@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


# Logout user
@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    def post(self, request, *args, **kwargs):
        logout(request)
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)


# Get current user
@method_decorator(csrf_exempt, name='dispatch')
class CurrentUserView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return Response({
                'user': UserSerializer(request.user).data,
                'authenticated': True
            }, status=status.HTTP_200_OK)
        return Response({
            'user': None,
            'authenticated': False
        }, status=status.HTTP_200_OK)
