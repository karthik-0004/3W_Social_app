from django.contrib.auth.hashers import check_password, make_password
from rest_framework import serializers

from .models import Post, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile_pic', 'created_at']


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

    class Meta:
        model = Post
        fields = [
            'id',
            'user',
            'username',
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


class CommentSerializer(serializers.Serializer):
    text = serializers.CharField(max_length=1000)
