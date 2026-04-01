from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models


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
