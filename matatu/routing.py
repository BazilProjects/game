
from django.urls import  path
from game_core.consumers import *

websocket_urlpatterns = [
    path('game/<game_id>', GameConsumer.as_asgi()),
]  
