from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken

from .models import User


@database_sync_to_async
def get_user_by_id(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()


class JwtAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = (scope.get('query_string') or b'').decode()
        params = parse_qs(query_string)
        token = (params.get('token') or [None])[0]

        scope['user'] = AnonymousUser()

        if token:
            try:
                access_token = AccessToken(token)
                user_id = access_token.get('user_id')
                if user_id:
                    scope['user'] = await get_user_by_id(user_id)
            except Exception:
                scope['user'] = AnonymousUser()

        return await self.inner(scope, receive, send)


def JwtAuthMiddlewareStack(inner):
    return JwtAuthMiddleware(inner)
