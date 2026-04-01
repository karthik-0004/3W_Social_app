from datetime import datetime

from rest_framework import generics, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Post
from .serializers import (
	CommentSerializer,
	LoginSerializer,
	PostSerializer,
	RegisterSerializer,
	UserSerializer,
)


class RegisterView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		serializer = RegisterSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = serializer.save()

		refresh = RefreshToken.for_user(user)
		user_data = UserSerializer(user, context={'request': request}).data

		return Response(
			{
				'access': str(refresh.access_token),
				'refresh': str(refresh),
				'user': user_data,
			},
			status=status.HTTP_201_CREATED,
		)


class LoginView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request):
		serializer = LoginSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = serializer.validated_data['user']

		refresh = RefreshToken.for_user(user)
		user_data = UserSerializer(user, context={'request': request}).data

		return Response(
			{
				'access': str(refresh.access_token),
				'refresh': str(refresh),
				'user': user_data,
			},
			status=status.HTTP_200_OK,
		)


class PostPagination(PageNumberPagination):
	page_size = 10
	page_size_query_param = 'limit'
	max_page_size = 50
	page_query_param = 'page'


class PostListCreateView(generics.ListCreateAPIView):
	serializer_class = PostSerializer
	queryset = Post.objects.all().order_by('-created_at')
	pagination_class = PostPagination
	parser_classes = [JSONParser, MultiPartParser, FormParser]

	def get_permissions(self):
		if self.request.method == 'POST':
			return [permissions.IsAuthenticated()]
		return [permissions.AllowAny()]

	def get_serializer_context(self):
		context = super().get_serializer_context()
		context['request'] = self.request
		return context

	def create(self, request, *args, **kwargs):
		content = (request.data.get('content') or '').strip()
		image = request.data.get('image')

		if not content and not image:
			return Response({'error': 'At least content or image is required.'}, status=status.HTTP_400_BAD_REQUEST)

		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		serializer.save(
			user=request.user,
			username=request.user.username,
			likes=[],
			likes_count=0,
			comments=[],
			comments_count=0,
		)

		headers = self.get_success_headers(serializer.data)
		return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class PostDetailView(generics.RetrieveAPIView):
	serializer_class = PostSerializer
	queryset = Post.objects.all()
	lookup_field = 'pk'

	def get_serializer_context(self):
		context = super().get_serializer_context()
		context['request'] = self.request
		return context


class LikePostView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, pk):
		try:
			post = Post.objects.get(pk=pk)
		except Post.DoesNotExist:
			return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

		username = request.user.username
		likes = post.likes or []

		if username in likes:
			likes.remove(username)
		else:
			likes.append(username)

		post.likes = likes
		post.likes_count = len(likes)
		post.save()

		return Response(
			{
				'likes': post.likes,
				'likes_count': post.likes_count,
				'liked': username in post.likes,
			},
			status=status.HTTP_200_OK,
		)


class CommentPostView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, pk):
		try:
			post = Post.objects.get(pk=pk)
		except Post.DoesNotExist:
			return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

		text = (request.data.get('text') or '').strip()
		if not text:
			return Response({'error': 'Comment text is required'}, status=status.HTTP_400_BAD_REQUEST)

		comment = {
			'username': request.user.username,
			'text': text,
			'created_at': str(datetime.now()),
		}

		comments = post.comments or []
		comments.append(comment)

		post.comments = comments
		post.comments_count = len(comments)
		post.save()

		return Response(
			{
				'comments': post.comments,
				'comments_count': post.comments_count,
				'comment': comment,
			},
			status=status.HTTP_200_OK,
		)


class UserProfileView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		serializer = UserSerializer(request.user, context={'request': request})
		return Response(serializer.data, status=status.HTTP_200_OK)
