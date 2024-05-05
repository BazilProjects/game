# forms.py
from django import forms
from .models import Game

"""class GameForm(forms.ModelForm):
    class Meta:
        model = Game
        fields = ['opponent']  # Specify the fields you want to include in the form
"""
from django import forms
from django.contrib.auth.models import User
from .models import Game

class GameForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        # Get the authenticated user if available
        self.authenticated_user = kwargs.pop('authenticated_user', None)
        super(GameForm, self).__init__(*args, **kwargs)
        
        # Filter queryset to exclude the authenticated user if available
        if self.authenticated_user:
            print(self.authenticated_user)
            self.fields['opponent'].queryset = User.objects.exclude(username=self.authenticated_user.username)
        
    class Meta:
        model = Game
        fields = ['opponent']
