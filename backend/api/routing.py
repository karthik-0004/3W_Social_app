from django.urls import re_path

from .consumers import ChatEventsConsumer

websocket_urlpatterns = [
    re_path(r'^ws/chat/events/$', ChatEventsConsumer.as_asgi()),
]
