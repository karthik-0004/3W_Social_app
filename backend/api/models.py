from datetime import timedelta

from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
	def create_user(self, username, email, password=None, **extra_fields):
		if not email:
			raise ValueError('The Email field is required.')
		if not username:
			raise ValueError('The Username field is required.')

		email = self.normalize_email(email)
		user = self.model(username=username, email=email, **extra_fields)
		user.set_password(password)
		user.save(using=self._db)
		return user

	def create_superuser(self, username, email, password=None, **extra_fields):
		extra_fields.setdefault('is_staff', True)
		extra_fields.setdefault('is_superuser', True)
		extra_fields.setdefault('is_active', True)

		if extra_fields.get('is_staff') is not True:
			raise ValueError('Superuser must have is_staff=True.')
		if extra_fields.get('is_superuser') is not True:
			raise ValueError('Superuser must have is_superuser=True.')

		return self.create_user(username, email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
	username = models.CharField(max_length=150, unique=True)
	email = models.EmailField(unique=True)
	full_name = models.CharField(max_length=150, blank=True)
	bio = models.CharField(max_length=150, blank=True)
	website = models.URLField(blank=True)
	location = models.CharField(max_length=120, blank=True)
	profile_pic = models.ImageField(upload_to='profiles/', null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	is_active = models.BooleanField(default=True)
	is_staff = models.BooleanField(default=False)

	objects = UserManager()

	USERNAME_FIELD = 'email'
	REQUIRED_FIELDS = ['username']

	def __str__(self):
		return self.username


class Post(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
	username = models.CharField(max_length=150)
	content = models.TextField(blank=True)
	image = models.ImageField(upload_to='posts/', null=True, blank=True)
	likes = models.JSONField(default=list, blank=True)
	likes_count = models.IntegerField(default=0)
	comments = models.JSONField(default=list, blank=True)
	comments_count = models.IntegerField(default=0)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f'Post by {self.username} ({self.id})'


class FriendRequest(models.Model):
	STATUS_CHOICES = [
		('pending', 'Pending'),
		('accepted', 'Accepted'),
		('rejected', 'Rejected'),
	]

	sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_requests')
	receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_requests')
	status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		unique_together = ('sender', 'receiver')


class Friendship(models.Model):
	user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendships1')
	user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendships2')
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ('user1', 'user2')


class Message(models.Model):
	MESSAGE_TYPE_CHOICES = [
		('text', 'Text'),
		('image', 'Image'),
		('both', 'Both'),
	]

	sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
	receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
	text = models.TextField(blank=True, default='')
	image = models.ImageField(upload_to='chat_images/', null=True, blank=True)
	message_type = models.CharField(max_length=10, choices=MESSAGE_TYPE_CHOICES, default='text')
	reactions = models.JSONField(default=dict, blank=True)
	is_deleted = models.BooleanField(default=False)
	is_read = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['created_at']
		indexes = [
			models.Index(fields=['sender', 'receiver', 'created_at']),
			models.Index(fields=['receiver', 'is_read']),
			models.Index(fields=['sender', 'created_at']),
		]


class Notification(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
	from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications')
	type = models.CharField(max_length=20)
	post = models.ForeignKey('Post', on_delete=models.CASCADE, null=True, blank=True)
	is_read = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)


class DailyVibe(models.Model):
	MEDIA_TYPE_CHOICES = [
		('image', 'Image'),
		('video', 'Video'),
		('note', 'Note'),
	]

	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_vibes')
	media = models.FileField(upload_to='vibes/', null=True, blank=True)
	note = models.TextField(blank=True)
	media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
	viewers = models.JSONField(default=list, blank=True)
	reactions = models.JSONField(default=dict, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	expires_at = models.DateTimeField(blank=True, null=True)

	def save(self, *args, **kwargs):
		if not self.expires_at:
			self.expires_at = timezone.now() + timedelta(hours=24)
		super().save(*args, **kwargs)

	def is_expired(self):
		return timezone.now() > self.expires_at
