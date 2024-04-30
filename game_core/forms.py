# forms.py
from django import forms
from .models import Game

class GameForm(forms.ModelForm):
    class Meta:
        model = Game
        fields = ['opponent']  # Specify the fields you want to include in the form
