from django.db import models
from django.contrib.auth.models import User
import json,random

# Create your models here.
class Game(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE,related_name="owner")
    opponent = models.ForeignKey(User, on_delete=models.CASCADE,related_name="opponent", null=True)
    owner_online = models.BooleanField(default=False)
    opponent_online = models.BooleanField(default=False)
    winner = models.CharField(max_length=20, null=True, blank=True)
    CHOICES=(
        (1,"Game Created. Waiting for opponent"),
        (2,"Game Started"),
        (3,"Game Ended"))
    status = models.IntegerField(default=1,choices=CHOICES)
    c_player=models.CharField(max_length=3,default=1)
    owner_cards= models.CharField(max_length=2000,blank=True)
    opponent_cards=models.CharField(max_length=2000,blank=True)
    Cards_deck_play=models.CharField(max_length=2000,blank=True)
    Last_played=models.CharField(max_length=2000,blank=True)

    owner_pick_card_turn=models.BooleanField(default=True)
    opponent_pick_card_turn=models.BooleanField(default=True)

    
    def game_state(Cards_deck_play,owner_cards,opponent_cards):
        # Save the shuffled cards and remaining deck to the respective fields
        game = Game(owner_cards=json.dumps(owner_cards),
                    opponent_cards=json.dumps(opponent_cards),
                    Cards_deck_play=json.dumps(Cards_deck_play))
        game.save()
    def each_game(id):
        # Original dictionary with 54 key-value pairs
        Cards_deck = {
            #flower
            "AF": "Question",
            "2F": "Pick_2",
            "3F": "Pick_3",
            "4F": "Ignore",
            "5F": "Ignore",
            "6F": "Ignore",
            "7F": "Ignore",
            "8F": "Add_Top",
            "9F": "Ignore",
            "10F": "Ignore",
            "JF": "Add_Top",
            "QF": "Ignore",
            "KF": "Ignore",
            
            #diamond
            "AD": "Question",
            "2D": "Pick_2",
            "3D": "Pick_3",
            "4D": "Ignore",
            "5D": "Ignore",
            "6D": "Ignore",
            "7D": "Ignore",
            "8D": "Add_Top",
            "9D": "Ignore",
            "10D": "Ignore",
            "JD": "Add_Top",
            "QD": "Ignore",
            "KD": "Ignore",

            #spade
            "AS": "Question",
            "2S": "Pick_2",
            "3S": "Pick_3",
            "4S": "Ignore",
            "5S": "Ignore",
            "6S": "Ignore",
            "7S": "Ignore",
            "8S": "Add_Top",
            "9S": "Ignore",
            "10S": "Ignore",
            "JS": "Add_Top",
            "QS": "Ignore",
            "KS": "Ignore",

            #hearts
            "AH": "Question",
            "2H": "Pick_2",
            "3H": "Pick_3",
            "4H": "Ignore",
            "5H": "Ignore",
            "6H": "Ignore",
            "7H": "End_game",
            "8H": "Add_Top",
            "9H": "Ignore",
            "10H": "Ignore",
            "JH": "Add_Top",
            "QH": "Ignore",
            "KH": "Ignore",

            "RED_Joker": "Pick_5_red",
            "Black_Joker": "Pick_5_black"
        }
        # Function to shuffle an array
        def shuffle_array(array):

            for i in range(len(array) - 1, 0, -1):
                j = random.randint(0, i)
                array[i], array[j] = array[j], array[i]

            return array

        # Convert the dictionary to a list of [key, value] pairs
        entries = list(Cards_deck.items())

        shuffled_entries = shuffle_array(entries)

        owner_cards = dict(shuffled_entries[:6])
        opponent_cards = dict(shuffled_entries[6:12])
        Cards_deck_play = dict(shuffled_entries[12:])
        #if Game.objects.filter(id=id).exists():
        game = Game.objects.get(id=id)
        # Save the shuffled cards and remaining deck to the respective fields
        game.owner_cards=json.dumps(owner_cards)
        game.opponent_cards=json.dumps(opponent_cards)
        game.Cards_deck_play=json.dumps(Cards_deck_play)
        game.save()
