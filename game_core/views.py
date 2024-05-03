from django.shortcuts import render,redirect
from .models import *
from .forms import GameForm
from django.http import HttpResponse
from django.urls import reverse_lazy
import json
def games(request):
    if request.user.is_anonymous:
        return redirect(reverse_lazy('admin:index'))
    games=Game.objects.all()
    context={'games':games}
    return render(request, 'games.html',context)
def play_game(request,id):
    if Game.objects.filter(id=id).exists():
        game = Game.objects.get(id=id)
        if not game.owner_cards:
            Game.each_game(id)
    if not game:
        print("Game not found")
    if request.user==game.owner:
        myside=1
    else:
        myside=-1
    Last_played_Card=game.Last_played
    if Last_played_Card=="":
        Last_played_Card=json.dumps('Empty')
    context={'myside':myside,"owner_cards":game.owner_cards,"opponent_cards":game.opponent_cards,"Cards_deck_play":game.Cards_deck_play,"c_player":game.c_player,"Last_played_Card":Last_played_Card}
    return render(request, 'play.html',context)

def create_game(request):
    if request.method == 'POST':
        form = GameForm(request.POST)
        if form.is_valid():
            # Save the form data to create a new Game instance
            game = form.save(commit=False)
            game.owner = request.user  # Assign the current user as the owner
            game.save()
            return HttpResponse("Game created successfully")
    else:
        form = GameForm()
    return render(request, 'create_game.html', {'form': form})
