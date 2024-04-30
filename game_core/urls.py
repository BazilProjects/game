from django.urls import path
from . import views

urlpatterns = [
    path('', views.games, name='index'),
    path('create', views.create_game, name='create_game'),
    path('play_game/<int:id>/', views.play_game, name='play_game'),
    # Add other URL patterns as needed
]
