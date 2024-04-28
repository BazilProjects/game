from channels.routing import ProtocolTypeRouter, URLRouter
import os
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'matatu.settings')

asgi_application = get_asgi_application()

import matatu.routing

print("ASGI Configuration Loaded")

application = ProtocolTypeRouter({
    "http": asgi_application,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            matatu.routing.websocket_urlpatterns
        )
    )
})


print("ASGI Application Created")
