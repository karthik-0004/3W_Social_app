from channels.generic.websocket import AsyncJsonWebsocketConsumer


class ChatEventsConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope.get('user')
        if not user or not user.is_authenticated:
            await self.close(code=4401)
            return

        self.group_name = f'chat_user_{user.id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if getattr(self, 'group_name', None):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def chat_event(self, event):
        await self.send_json(
            {
                'type': 'chat_event',
                'action': event.get('action', 'upsert'),
                'message_id': event.get('message_id'),
                'from_user_id': event.get('from_user_id'),
                'to_user_id': event.get('to_user_id'),
                'peer_id': event.get('peer_id'),
                'sent_at': event.get('sent_at'),
            }
        )
