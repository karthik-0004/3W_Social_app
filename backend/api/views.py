from datetime import datetime, timedelta

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models import Case, Count, F, IntegerField, OuterRef, Q, Subquery, Value, When
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import DailyVibe, FriendRequest, Friendship, Message, Notification, Post, User
from .serializers import (
	ChangePasswordSerializer,
	CommentSerializer,
	DailyVibeSerializer,
	FriendRequestSerializer,
	LoginSerializer,
	MessageSerializer,
	NotificationSerializer,
	PostSerializer,
	ProfileUpdateSerializer,
	RegisterSerializer,
	UserPublicSerializer,
	UserSerializer,
)


def toggle_single_reaction(reaction_map, emoji, username):
	reaction_map = dict(reaction_map or {})
	had_same_reaction = username in (reaction_map.get(emoji) or [])

	for key in list(reaction_map.keys()):
		users = [item for item in (reaction_map.get(key) or []) if item != username]
		if users:
			reaction_map[key] = users
		else:
			reaction_map.pop(key, None)

	previous_users = reaction_map.get(emoji) or []
	if not had_same_reaction:
		previous_users = [*previous_users, username]

	if previous_users:
		reaction_map[emoji] = previous_users
	else:
		reaction_map.pop(emoji, None)

	return reaction_map


def are_friends(user1, user2):
	return Friendship.objects.filter(Q(user1_id=user1.id, user2_id=user2.id) | Q(user1_id=user2.id, user2_id=user1.id)).exists()


def get_friends(user):
	friendships = Friendship.objects.filter(Q(user1_id=user.id) | Q(user2_id=user.id))
	friends = []
	for friendship in friendships:
		friends.append(friendship.user2 if friendship.user1 == user else friendship.user1)
	return friends


def emit_chat_event(message, action='upsert'):
	channel_layer = get_channel_layer()
	if not channel_layer:
		return

	sender_id = message.sender_id
	receiver_id = message.receiver_id

	payload_by_user = {
		sender_id: {
			'type': 'chat_event',
			'action': action,
			'message_id': message.id,
			'from_user_id': sender_id,
			'to_user_id': receiver_id,
			'peer_id': receiver_id,
			'sent_at': timezone.now().isoformat(),
		},
		receiver_id: {
			'type': 'chat_event',
			'action': action,
			'message_id': message.id,
			'from_user_id': sender_id,
			'to_user_id': receiver_id,
			'peer_id': sender_id,
			'sent_at': timezone.now().isoformat(),
		},
	}

	for user_id, payload in payload_by_user.items():
		async_to_sync(channel_layer.group_send)(f'chat_user_{user_id}', payload)


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


class PostListCreateView(APIView):
	permission_classes = [permissions.IsAuthenticated]
	pagination_class = PostPagination
	parser_classes = [JSONParser, MultiPartParser, FormParser]

	def get(self, request):
		friends = get_friends(request.user)
		friend_ids = {friend.id for friend in friends}
		friend_ids.add(request.user.id)

		posts = list(Post.objects.all().order_by('-created_at'))
		posts.sort(
			key=lambda post: (
				0 if post.user_id in friend_ids else 1,
				-(post.created_at or timezone.now()).timestamp(),
			)
		)

		paginator = PostPagination()
		result_page = paginator.paginate_queryset(posts, request)
		serializer = PostSerializer(result_page, many=True, context={'request': request})
		return paginator.get_paginated_response(serializer.data)

	def post(self, request):
		content = (request.data.get('content') or '').strip()
		image = request.FILES.get('image')

		if not content and not image:
			return Response({'error': 'Post must have text or image'}, status=status.HTTP_400_BAD_REQUEST)

		post = Post.objects.create(
			user=request.user,
			username=request.user.username,
			content=content,
			image=image,
			likes=[],
			likes_count=0,
			comments=[],
			comments_count=0,
		)
		return Response(PostSerializer(post, context={'request': request}).data, status=status.HTTP_201_CREATED)


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

		if username in post.likes and post.user_id != request.user.id:
			Notification.objects.create(
				user=post.user,
				from_user=request.user,
				type='like',
				post=post,
			)

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

		if post.user_id != request.user.id:
			Notification.objects.create(
				user=post.user,
				from_user=request.user,
				type='comment',
				post=post,
			)

		return Response(
			{
				'comments': post.comments,
				'comments_count': post.comments_count,
				'comment': comment,
			},
			status=status.HTTP_200_OK,
		)


class DeletePostView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def delete(self, request, pk):
		try:
			post = Post.objects.get(pk=pk)
		except Post.DoesNotExist:
			return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

		if post.user_id != request.user.id:
			return Response({'error': 'Only the owner can delete this post'}, status=status.HTTP_403_FORBIDDEN)

		if post.image:
			post.image.delete(save=False)
		post.delete()
		return Response({'status': 'deleted'}, status=status.HTTP_200_OK)


class UserProfileView(APIView):
	permission_classes = [permissions.IsAuthenticated]
	parser_classes = [JSONParser, MultiPartParser, FormParser]

	def get(self, request):
		serializer = UserSerializer(request.user, context={'request': request})
		return Response(serializer.data, status=status.HTTP_200_OK)

	def patch(self, request):
		serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True, context={'request': request})
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response(UserSerializer(request.user, context={'request': request}).data, status=status.HTTP_200_OK)

	def put(self, request):
		return self.patch(request)

	def post(self, request):
		return self.patch(request)


class UserProfileUpdateView(APIView):
	permission_classes = [permissions.IsAuthenticated]
	parser_classes = [JSONParser, MultiPartParser, FormParser]

	def post(self, request):
		serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True, context={'request': request})
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response(UserSerializer(request.user, context={'request': request}).data, status=status.HTTP_200_OK)

	def patch(self, request):
		return self.post(request)

	def put(self, request):
		return self.post(request)


@api_view(['PATCH', 'PUT', 'POST'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([JSONParser, MultiPartParser, FormParser])
def profile_update_view(request):
	serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True, context={'request': request})
	serializer.is_valid(raise_exception=True)
	serializer.save()
	return Response(UserSerializer(request.user, context={'request': request}).data, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request):
		serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)


class SearchUsersView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		query = (request.query_params.get('q') or '').strip()
		if not query:
			return Response([])

		users = User.objects.filter(username__icontains=query).exclude(id=request.user.id)[:10]
		serializer = UserPublicSerializer(users, many=True, context={'request': request})
		return Response(serializer.data)


class SendFriendRequestView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, user_id):
		try:
			receiver = User.objects.get(id=user_id)
		except User.DoesNotExist:
			return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

		if receiver == request.user:
			return Response({'error': 'Cannot send request to yourself'}, status=status.HTTP_400_BAD_REQUEST)

		if are_friends(request.user, receiver):
			return Response({'error': 'Already friends'}, status=status.HTTP_400_BAD_REQUEST)

		existing = FriendRequest.objects.filter(sender=request.user, receiver=receiver).first()
		if existing:
			if existing.status == 'pending':
				return Response({'error': 'Request already sent'}, status=status.HTTP_400_BAD_REQUEST)
			if existing.status == 'rejected':
				existing.status = 'pending'
				existing.save()
				return Response(FriendRequestSerializer(existing).data, status=status.HTTP_200_OK)

		reverse_req = FriendRequest.objects.filter(sender=receiver, receiver=request.user, status='pending').first()
		if reverse_req:
			reverse_req.status = 'accepted'
			reverse_req.save()
			user1, user2 = sorted([request.user, receiver], key=lambda item: item.id)
			Friendship.objects.get_or_create(user1=user1, user2=user2)
			Notification.objects.create(user=receiver, from_user=request.user, type='friend_accepted')
			return Response({'status': 'friends', 'message': 'You are now friends!'}, status=status.HTTP_200_OK)

		friend_request = FriendRequest.objects.create(sender=request.user, receiver=receiver)
		Notification.objects.create(user=receiver, from_user=request.user, type='friend_request')
		return Response(FriendRequestSerializer(friend_request).data, status=status.HTTP_201_CREATED)


class AcceptFriendRequestView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, request_id):
		try:
			friend_request = FriendRequest.objects.get(id=request_id, receiver=request.user, status='pending')
		except FriendRequest.DoesNotExist:
			return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)

		friend_request.status = 'accepted'
		friend_request.save()

		user1, user2 = sorted([friend_request.sender, friend_request.receiver], key=lambda item: item.id)
		Friendship.objects.get_or_create(user1=user1, user2=user2)
		Notification.objects.create(user=friend_request.sender, from_user=request.user, type='friend_accepted')
		return Response({'status': 'accepted', 'message': 'Friend request accepted!'})


class RejectFriendRequestView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, request_id):
		try:
			friend_request = FriendRequest.objects.get(id=request_id, receiver=request.user, status='pending')
		except FriendRequest.DoesNotExist:
			return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)

		friend_request.status = 'rejected'
		friend_request.save()
		return Response({'status': 'rejected'})


class CancelFriendRequestView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, user_id):
		FriendRequest.objects.filter(sender=request.user, receiver_id=user_id, status='pending').delete()
		return Response({'status': 'cancelled'})


class UnfriendView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, user_id):
		Friendship.objects.filter(
			Q(user1=request.user, user2_id=user_id) | Q(user1_id=user_id, user2=request.user)
		).delete()
		FriendRequest.objects.filter(
			Q(sender=request.user, receiver_id=user_id) | Q(sender_id=user_id, receiver=request.user)
		).delete()
		return Response({'status': 'unfriended'})


class PendingRequestsView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		pending_requests = FriendRequest.objects.filter(receiver=request.user, status='pending').order_by('-created_at')
		return Response(FriendRequestSerializer(pending_requests, many=True).data)


class FriendsListView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		friends = get_friends(request.user)
		return Response(UserPublicSerializer(friends, many=True, context={'request': request}).data)


class ConversationView(APIView):
	permission_classes = [permissions.IsAuthenticated]
	parser_classes = [JSONParser, MultiPartParser, FormParser]

	def get(self, request, user_id):
		try:
			other_user = User.objects.get(id=user_id)
		except User.DoesNotExist:
			return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

		if not are_friends(request.user, other_user):
			return Response({'error': 'You must be friends to chat'}, status=status.HTTP_403_FORBIDDEN)

		messages = Message.objects.filter(
			(Q(sender=request.user) & Q(receiver=other_user)) | (Q(sender=other_user) & Q(receiver=request.user))
		).select_related('sender', 'receiver').order_by('created_at')

		Message.objects.filter(sender=other_user, receiver=request.user, is_read=False).update(is_read=True)
		serializer = MessageSerializer(messages, many=True, context={'request': request})
		return Response(serializer.data)

	def post(self, request, user_id):
		try:
			receiver = User.objects.get(id=user_id)
		except User.DoesNotExist:
			return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

		if not are_friends(request.user, receiver):
			return Response({'error': 'You must be friends to chat'}, status=status.HTTP_403_FORBIDDEN)

		text = (request.data.get('text') or '').strip()
		image = request.FILES.get('image')
		if not text and not image:
			return Response({'error': 'Message text or image required'}, status=status.HTTP_400_BAD_REQUEST)

		message_type = 'both' if text and image else 'image' if image else 'text'

		message = Message.objects.create(
			sender=request.user,
			receiver=receiver,
			text=text,
			image=image,
			message_type=message_type,
			reactions={},
		)
		emit_chat_event(message, action='upsert')
		return Response(MessageSerializer(message, context={'request': request}).data, status=status.HTTP_201_CREATED)


class ReactToMessageView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, message_id):
		emoji = (request.data.get('emoji') or '').strip()
		if not emoji:
			return Response({'error': 'Emoji is required'}, status=status.HTTP_400_BAD_REQUEST)

		try:
			message = Message.objects.get(id=message_id)
		except Message.DoesNotExist:
			return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)

		if request.user.id not in {message.sender_id, message.receiver_id}:
			return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)

		if message.is_deleted:
			return Response({'error': 'Cannot react to deleted message'}, status=status.HTTP_400_BAD_REQUEST)

		message.reactions = toggle_single_reaction(message.reactions, emoji, request.user.username)
		message.save(update_fields=['reactions'])
		emit_chat_event(message, action='upsert')
		return Response(MessageSerializer(message, context={'request': request}).data, status=status.HTTP_200_OK)


class DeleteMessageView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def delete(self, request, message_id):
		try:
			message = Message.objects.get(id=message_id)
		except Message.DoesNotExist:
			return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)

		if message.sender_id != request.user.id:
			return Response({'error': 'Only sender can delete this message'}, status=status.HTTP_403_FORBIDDEN)

		message.text = ''
		if message.image:
			message.image.delete(save=False)
		message.image = None
		message.message_type = 'text'
		message.reactions = {}
		message.is_deleted = True
		message.save(update_fields=['text', 'image', 'message_type', 'reactions', 'is_deleted'])
		emit_chat_event(message, action='delete')

		return Response(MessageSerializer(message, context={'request': request}).data, status=status.HTTP_200_OK)


class InboxView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		user = request.user

		friendship_pairs = Friendship.objects.filter(Q(user1_id=user.id) | Q(user2_id=user.id)).values_list('user1_id', 'user2_id')
		friend_ids = set()
		for user1_id, user2_id in friendship_pairs:
			friend_ids.add(user2_id if user1_id == user.id else user1_id)

		if not friend_ids:
			return Response([])

		conversation_partner_ids = Message.objects.filter(
			Q(sender_id=user.id) | Q(receiver_id=user.id)
		).annotate(
			partner_id=Case(
				When(sender_id=user.id, then=F('receiver_id')),
				default=F('sender_id'),
				output_field=IntegerField(),
			)
		).values_list('partner_id', flat=True).distinct()

		eligible_ids = set(conversation_partner_ids).intersection(friend_ids)
		if not eligible_ids:
			return Response([])

		last_message_id_subquery = Message.objects.filter(
			(Q(sender_id=user.id) & Q(receiver_id=OuterRef('pk')))
			| (Q(sender_id=OuterRef('pk')) & Q(receiver_id=user.id))
		).order_by('-created_at').values('id')[:1]

		unread_count_subquery = Message.objects.filter(
			sender_id=OuterRef('pk'),
			receiver_id=user.id,
			is_read=False,
		).values('sender_id').annotate(total=Count('id')).values('total')[:1]

		users = list(
			User.objects.filter(id__in=eligible_ids)
			.annotate(
				last_message_id=Subquery(last_message_id_subquery),
				unread_count=Coalesce(Subquery(unread_count_subquery), Value(0)),
			)
			.order_by('-last_message_id')
		)

		message_ids = [item.last_message_id for item in users if item.last_message_id]
		messages_by_id = {
			item.id: item
			for item in Message.objects.filter(id__in=message_ids).select_related('sender', 'receiver')
		}

		result = []
		for each_user in users:
			last_msg = messages_by_id.get(each_user.last_message_id)
			result.append(
				{
					'user': UserPublicSerializer(each_user, context={'request': request}).data,
					'last_message': MessageSerializer(last_msg, context={'request': request}).data if last_msg else None,
					'unread_count': each_user.unread_count or 0,
				}
			)

		result.sort(key=lambda item: item['last_message']['created_at'] if item['last_message'] else '', reverse=True)
		return Response(result)


class NotificationsView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		notifications = Notification.objects.filter(user_id=request.user.id).order_by('-created_at')[:20]
		Notification.objects.filter(user_id=request.user.id, is_read=False).update(is_read=True)
		serializer = NotificationSerializer(notifications, many=True)
		return Response(serializer.data)


class UnreadCountView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		notif_count = Notification.objects.filter(user_id=request.user.id, is_read=False).count()
		msg_count = Message.objects.filter(receiver_id=request.user.id, is_read=False).count()
		pending_requests = FriendRequest.objects.filter(receiver_id=request.user.id, status='pending').count()
		return Response({'notifications': notif_count, 'messages': msg_count, 'friend_requests': pending_requests})


class UserProfileByIdView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request, user_id):
		try:
			user = User.objects.get(id=user_id)
		except User.DoesNotExist:
			return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

		posts = Post.objects.filter(user=user).order_by('-created_at')
		vibes = DailyVibe.objects.filter(user=user).order_by('-created_at')
		return Response(
			{
				'user': UserPublicSerializer(user, context={'request': request}).data,
				'posts': PostSerializer(posts, many=True, context={'request': request}).data,
				'vibes': DailyVibeSerializer(vibes, many=True, context={'request': request}).data,
			}
		)


class CreateVibeView(APIView):
	permission_classes = [permissions.IsAuthenticated]
	parser_classes = [JSONParser, MultiPartParser, FormParser]

	def post(self, request):
		media = request.FILES.get('media')
		note = (request.data.get('note') or '').strip()
		media_type = (request.data.get('media_type') or '').strip().lower()

		if media_type not in {'image', 'video', 'note'}:
			return Response({'error': 'Invalid media_type'}, status=status.HTTP_400_BAD_REQUEST)

		if media_type in {'image', 'video'} and not media:
			return Response({'error': 'Media file is required for image/video vibes'}, status=status.HTTP_400_BAD_REQUEST)

		if media_type == 'note' and not note:
			return Response({'error': 'Note is required for note vibe'}, status=status.HTTP_400_BAD_REQUEST)

		vibe = DailyVibe.objects.create(
			user=request.user,
			media=media,
			note=note,
			media_type=media_type,
			viewers=[],
			expires_at=timezone.now() + timedelta(hours=24),
		)
		return Response(DailyVibeSerializer(vibe, context={'request': request}).data, status=status.HTTP_201_CREATED)


class FeedVibesView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		now = timezone.now()
		friends = get_friends(request.user)
		allowed_ids = {request.user.id, *[friend.id for friend in friends]}

		vibes = DailyVibe.objects.filter(user_id__in=allowed_ids, expires_at__gt=now).select_related('user').order_by('created_at')
		grouped = {}
		for vibe in vibes:
			entry = grouped.setdefault(
				vibe.user_id,
				{
					'user': {
						'id': vibe.user.id,
						'username': vibe.user.username,
						'profile_pic': request.build_absolute_uri(vibe.user.profile_pic.url) if vibe.user.profile_pic else None,
					},
					'vibes': [],
					'has_unseen': False,
				},
			)
			serialized = DailyVibeSerializer(vibe, context={'request': request}).data
			entry['vibes'].append(serialized)

		for _, entry in grouped.items():
			entry['has_unseen'] = any(not vibe.get('has_viewed') for vibe in entry['vibes'])

		result = sorted(
			grouped.values(),
			key=lambda item: (
				0 if item['user']['id'] == request.user.id else 1,
				0 if item['has_unseen'] else 1,
				item['user']['username'].lower(),
			),
		)
		return Response(result)


class ViewVibeView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, vibe_id):
		try:
			vibe = DailyVibe.objects.get(id=vibe_id)
		except DailyVibe.DoesNotExist:
			return Response({'error': 'Vibe not found'}, status=status.HTTP_404_NOT_FOUND)

		viewers = vibe.viewers or []
		if request.user.id not in viewers:
			viewers.append(request.user.id)
			vibe.viewers = viewers
			vibe.save(update_fields=['viewers'])

		return Response({'status': 'viewed', 'viewer_count': len(vibe.viewers or [])}, status=status.HTTP_200_OK)


class ReactToVibeView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, vibe_id):
		emoji = (request.data.get('emoji') or '').strip()
		if not emoji:
			return Response({'error': 'Emoji is required'}, status=status.HTTP_400_BAD_REQUEST)

		try:
			vibe = DailyVibe.objects.get(id=vibe_id)
		except DailyVibe.DoesNotExist:
			return Response({'error': 'Vibe not found'}, status=status.HTTP_404_NOT_FOUND)

		vibe.reactions = toggle_single_reaction(vibe.reactions, emoji, request.user.username)
		vibe.save(update_fields=['reactions'])

		if vibe.user_id != request.user.id:
			Notification.objects.create(user=vibe.user, from_user=request.user, type='vibe_reaction')

		return Response(DailyVibeSerializer(vibe, context={'request': request}).data, status=status.HTTP_200_OK)


class MyVibesView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		vibes = DailyVibe.objects.filter(user=request.user).order_by('-created_at')
		return Response(DailyVibeSerializer(vibes, many=True, context={'request': request}).data)


class DeleteVibeView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def delete(self, request, vibe_id):
		try:
			vibe = DailyVibe.objects.get(id=vibe_id)
		except DailyVibe.DoesNotExist:
			return Response({'error': 'Vibe not found'}, status=status.HTTP_404_NOT_FOUND)

		if vibe.user_id != request.user.id:
			return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)

		vibe.delete()
		return Response({'status': 'deleted'}, status=status.HTTP_200_OK)
