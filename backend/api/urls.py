from django.urls import path

from .views import (
    CommentPostView,
    LikePostView,
    LoginView,
    PostDetailView,
    PostListCreateView,
    RegisterView,
    UserProfileView,
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('posts/', PostListCreateView.as_view(), name='posts'),
    path('posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('posts/<int:pk>/like/', LikePostView.as_view(), name='like-post'),
    path('posts/<int:pk>/comment/', CommentPostView.as_view(), name='comment-post'),
    path('profile/', UserProfileView.as_view(), name='profile'),
]
