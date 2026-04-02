from django.contrib.auth.hashers import check_password, make_password
from django.db.models import Q
from django.utils import timezone
from rest_framework import serializers

from .models import DailyVibe, FriendRequest, Friendship, Message, Notification, Post, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'bio', 'website', 'location', 'profile_pic', 'created_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and instance.profile_pic:
            data['profile_pic'] = request.build_absolute_uri(instance.profile_pic.url)
        return data


class UserPublicSerializer(serializers.ModelSerializer):
    friends_count = serializers.SerializerMethodField()
    friendship_status = serializers.SerializerMethodField()
    request_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'full_name',
            'bio',
            'website',
            'location',
            'profile_pic',
            'created_at',
            'friends_count',
            'friendship_status',
            'request_id',
        ]

    def get_friends_count(self, obj):
        return Friendship.objects.filter(Q(user1_id=obj.id) | Q(user2_id=obj.id)).count()

    def get_friendship_status(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 'none'
        me = request.user
        if me.id == obj.id:
            return 'self'

        if Friendship.objects.filter(Q(user1_id=me.id, user2_id=obj.id) | Q(user1_id=obj.id, user2_id=me.id)).exists():
            return 'friends'

        if FriendRequest.objects.filter(sender_id=me.id, receiver_id=obj.id, status='pending').exists():
            return 'request_sent'

        if FriendRequest.objects.filter(sender_id=obj.id, receiver_id=me.id, status='pending').exists():
            return 'request_received'

        return 'none'

    def get_request_id(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None

        me = request.user
        pending = FriendRequest.objects.filter(
            Q(sender_id=me.id, receiver_id=obj.id, status='pending') | Q(sender_id=obj.id, receiver_id=me.id, status='pending')
        ).first()
        return pending.id if pending else None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return User.objects.create(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError('No account found with this email. Please register first.') from exc

        if not check_password(password, user.password):
            raise serializers.ValidationError('Invalid email or password.')

        attrs['user'] = user
        return attrs


class PostSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user_profile_pic = serializers.SerializerMethodField()
    is_friend_post = serializers.SerializerMethodField()
    user_has_active_vibe = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id',
            'user',
            'user_id',
            'username',
            'user_profile_pic',
            'is_friend_post',
            'user_has_active_vibe',
            'content',
            'image',
            'likes',
            'likes_count',
            'comments',
            'comments_count',
            'created_at',
        ]
        read_only_fields = ['user', 'username', 'likes_count', 'comments_count', 'created_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and instance.image:
            data['image'] = request.build_absolute_uri(instance.image.url)
        return data

    def get_user_profile_pic(self, obj):
        request = self.context.get('request')
        if request and obj.user.profile_pic:
            return request.build_absolute_uri(obj.user.profile_pic.url)
        return None

    def get_is_friend_post(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        me = request.user
        if me.id == obj.user_id:
            return False
        return Friendship.objects.filter(
            Q(user1_id=me.id, user2_id=obj.user_id) | Q(user1_id=obj.user_id, user2_id=me.id)
        ).exists()

    def get_user_has_active_vibe(self, obj):
        now = timezone.now()
        return DailyVibe.objects.filter(user_id=obj.user_id, expires_at__gt=now).exists()


class DailyVibeSerializer(serializers.ModelSerializer):
    is_expired = serializers.SerializerMethodField()
    viewer_count = serializers.SerializerMethodField()
    has_viewed = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username', read_only=True)
    user_profile_pic = serializers.SerializerMethodField()

    class Meta:
        model = DailyVibe
        fields = [
            'id',
            'user',
            'username',
            'user_profile_pic',
            'media',
            'note',
            'media_type',
            'viewers',
            'created_at',
            'expires_at',
            'is_expired',
            'viewer_count',
            'has_viewed',
        ]
        read_only_fields = ['user', 'viewers', 'created_at', 'expires_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and instance.media:
            data['media'] = request.build_absolute_uri(instance.media.url)
        return data

    def get_is_expired(self, obj):
        return obj.is_expired()

    def get_viewer_count(self, obj):
        return len(obj.viewers or [])

    def get_has_viewed(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return request.user.id in (obj.viewers or [])

    def get_user_profile_pic(self, obj):
        request = self.context.get('request')
        if request and obj.user.profile_pic:
            return request.build_absolute_uri(obj.user.profile_pic.url)
        return None


class CommentSerializer(serializers.Serializer):
    text = serializers.CharField(max_length=1000)


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    receiver_username = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_username', 'receiver', 'receiver_username', 'text', 'is_read', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    from_username = serializers.CharField(source='from_user.username', read_only=True)
    from_profile_pic = serializers.ImageField(source='from_user.profile_pic', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'from_username', 'from_profile_pic', 'type', 'post', 'is_read', 'created_at']


class FriendRequestSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_id = serializers.IntegerField(source='sender.id', read_only=True)
    receiver_username = serializers.CharField(source='receiver.username', read_only=True)
    receiver_id = serializers.IntegerField(source='receiver.id', read_only=True)

    class Meta:
        model = FriendRequest
        fields = ['id', 'sender_id', 'sender_username', 'receiver_id', 'receiver_username', 'status', 'created_at']


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'full_name', 'bio', 'website', 'location', 'profile_pic']

    def validate_username(self, value):
        user = self.instance
        if User.objects.exclude(id=user.id).filter(username=value).exists():
            raise serializers.ValidationError('Username already taken.')
        return value

    def validate_email(self, value):
        user = self.instance
        if User.objects.exclude(id=user.id).filter(email=value).exists():
            raise serializers.ValidationError('Email already in use.')
        return value


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, attrs):
        user = self.context['request'].user
        if not user.check_password(attrs['current_password']):
            raise serializers.ValidationError({'current_password': 'Current password is incorrect.'})
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save(update_fields=['password'])
        return user
