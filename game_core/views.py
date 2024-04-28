from django.shortcuts import render
from .models import *
def index(request):
    if Game.objects.filter(id=1).exists():
        game = Game.objects.get(id=1)
        if not game.owner_cards:
            Game.each_game(1)
    if not game:
        print("Game not found")
    if request.user==game.owner:
        myside=1
    else:
        myside=-1
    context={'myside':myside,"owner_cards":game.owner_cards,"opponent_cards":game.opponent_cards,"Cards_deck_play":game.Cards_deck_play,"c_player":game.c_player,"Last_played_Card":game.Last_played}
    return render(request, 'index.html',context)
