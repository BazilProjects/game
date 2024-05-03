from channels.generic.websocket import AsyncJsonWebsocketConsumer, JsonWebsocketConsumer
from channels.db import database_sync_to_async
from .models import *
from django.contrib.auth.models import User
from channels.generic.websocket import AsyncWebsocketConsumer
import json

import random
 
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


Cards_deck_values = {
            #flower
            "AF": "15",
            "2F": "20",
            "3F": "30",
            "4F": "4",
            "5F": "5",
            "6F": "6",
            "7F": "7",
            "8F": "8",
            "9F": "9",
            "10F": "10",
            "JF": "11",
            "QF": "12",
            "KF": "13",
            
            #diamond
            "AD": "15",
            "2D": "20",
            "3D": "30",
            "4D": "4",
            "5D": "5",
            "6D": "6",
            "7D": "7",
            "8D": "8",
            "9D": "9",
            "10D": "10",
            "JD": "11",
            "QD": "12",
            "KD": "13",

            #spade
            "AS": "60",
            "2S": "20",
            "3S": "30",
            "4S": "4",
            "5S": "5",
            "6S": "6",
            "7S": "7",
            "8S": "8",
            "9S": "9",
            "10S": "10",
            "JS": "11",
            "QS": "12",
            "KS": "13",

            #hearts
            "AH": "15",
            "2H": "20",
            "3H": "30",
            "4H": "4",
            "5H": "5",
            "6H": "6",
            "7H": "25",
            "8H": "8",
            "9H": "9",
            "10H": "10",
            "JH":"11",
            "QH": "12",
            "KH": "13",

            "RED_Joker": "50",
            "Black_Joker": "50"
        }

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        
        user = self.scope.get("user")
        """
        if self.scope["user"].is_anonymous:
            await self.close()
            return
        """
        print('------------------------')
        print(self.game_id)
        print('------------------------')
        self.room_group_name = 'chat_%s' % self.game_id

        try: 
            self.game_id=int(self.game_id)
        except:
            await self.close()
            return
        side = await self.verify(self.game_id)
        """
        if side == False:
            await self.close()
            return
            """
        await self.accept()
        await self.join_room(side)
        if side:
            await self.opp_online()

    async def receive(self, text_data):

        content = json.loads(text_data)
        command = content.get("command", None)
        print(content)
        #if content["Last_played_Card"]:
        if "Last_played_Card" in content:
            await self.save_last_played_card(content["Last_played_Card"])
        if 'pick_cards_during_play' in content.values():
            print("entered")
            await self.pick_cards_during_play_message()
        elif command == "End_game":
            result=await self.calculate_card_values()
            await self.game_over(result)
        elif command == "resign":
            sub_command=int(content['sub_command'])
            owner,opponent=await self.get_owner_opponent_usernames()
            if sub_command==1:
                result=f"{owner}"
            elif sub_command==-1:
                result=f"{opponent}"
            await self.game_over(result)
 
        try:
            if command=="player_cards":
                print('Y'*50)
                await self.save_player_cards(content)
            if command == "start-game":
                await self.start_game()
            elif command == "game-over":
                await self.game_over(content["result"])
            elif command == "counter":
                await self.counter(content)
            elif command == "card-played":
                await self.card_played(content)
            elif command == "ask-played":
                print(content['symbol'])
                await self.ask_played(content)
            elif command == "resign_game":
                await self.resign()
                await self.game_over(content["result"])

        except:
            pass
    async def save_player_cards(self, content):
        owner_cards=content['owner_cards']
        opponent_cards=content['opponent_cards']
        print("own"*4)
        print("opp"*5)
        game_save=await self.saving_player_cards(owner_cards,opponent_cards)
        print('Player cards saved')
    @database_sync_to_async
    def saving_player_cards(self, owner_cards,opponent_cards):
        game = Game.objects.get(id=self.game_id)
        game.opponent_cards=opponent_cards
        game.owner_cards=owner_cards
        game.save()

    @database_sync_to_async
    def get_owner_opponent_usernames(self):
        game = Game.objects.get(id=self.game_id)
        opponent=game.opponent.username
        owner=game.owner.username
        return owner,opponent
    async def ask_played(self, content):
        c_player=await self.check_c_player()#turn_management_system()
        message = {
            "command":"ask-played",
            "symbol":content['symbol'],
            "c_player":c_player,

        }
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat.message',
                'message': message
            }
        )
    async def pick_cards_during_play_message(self):
        owner_cards,opponent_cards=await self.pick_cards_during_play()
        owner_pick_card_turn,opponent_pick_card_turn=await self.weather_any_player_can_pick()

        if owner_cards==None and opponent_cards==None:
            message = {
                "command":"pick_cards_during_play_not_allowed",
                "sub_command":True
            }
        else:

            message = {
                "command":"pick_cards_during_play",
                "owner_cards":owner_cards,
                "opponent_cards":opponent_cards,
                "owner_pick_card_turn":owner_pick_card_turn,
                "opponent_pick_card_turn":opponent_pick_card_turn,
            }
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat.message',
                'message': message
            }
        )
    async def counter(self, content):
        print('counter 1')
        if content['symbol']==('3S' or '3H' or '3D' or '3F'):
            print(content["Last_played_Card"])
            print('counter 2')
            if content["Last_played_Card"][0]==('2S' or '2H' or '2D' or '2F'):
                print('counter 3')
                card=await self.find_key_value_pair(Cards_deck,content['symbol'])
                myturn, opponent_cards, owner_cards = await self.return_major_variables()

                counter=await self.counter_is_possible_function(card, myturn, opponent_cards, owner_cards)
                print(counter)
                if len(counter) != 0:
                    print('counter 4')
                    owner_cards,opponent_cards= await self.pick_cards(1,content["Last_played_Card"])

                    print('*****************************************')
                    print(owner_cards,opponent_cards)
                    print('*****************************************')
                    c_player=await self.turn_management_system()
                    message = {
                        "command":"card-played",
                        "Last_played_Card":Last_played_Card,
                        "c_player":c_player,
                        "owner_cards":owner_cards,
                        "opponent_cards":opponent_cards,
                    }
                    

                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'chat.message',
                            'message': message
                        }
                    )
                    
                    owner_cards,opponent_cards= await self.pick_cards(3,content["Last_played_Card"])

                    print('*****************************************')
                    print(owner_cards,opponent_cards)
                    print('*****************************************')
                    c_player=await self.turn_management_system()
                    message = {
                        "command":"card-played",
                        "Last_played_Card":Last_played_Card,
                        "c_player":c_player,
                        "owner_cards":owner_cards,
                        "opponent_cards":opponent_cards,
                    }
                    

                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'chat.message',
                            'message': message
                        }
                    )
                else:
                    

                    print(card)
                    c_player=await self.turn_management_system()
                    owner_cards=json.loads(owner_cards.replace("'", '"'))
                    opponent_cards=json.loads(opponent_cards.replace("'", '"'))
                    owner_cards,opponent_cards= await self.pick_cards(3,card)
                    print(owner_cards)
                    print("-"*50)
                    print(opponent_cards)
                    Last_played_Card=card
                    await self.save_last_played_card(card)
                    message = {
                        "command":"card-played",
                        "Last_played_Card":Last_played_Card,
                        "c_player":c_player,
                        "owner_cards":owner_cards,
                        "opponent_cards":opponent_cards,
                        "try_to_counter":False,
                    }
                    

                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'chat.message',
                            'message': message
                        }
                    )
                    
            if content["Last_played_Card"][0]==("RED_Joker" or "Black_Joker"):
                pass
        if content['symbol']==('2S' or '2H' or '2D' or '2F'):
            if content["Last_played_Card"][0]==('2S' or '2H' or '2D' or '2F'):
                owner_cards,opponent_cards= await self.pick_cards(2,content["Last_played_Card"])

                print('*****************************************')
                print(owner_cards,opponent_cards)
                print('*****************************************')
                c_player=await self.turn_management_system()
                message = {
                    "command":"card-played",
                    "Last_played_Card":Last_played_Card,
                    "c_player":c_player,
                    "owner_cards":owner_cards,
                    "opponent_cards":opponent_cards,
                }
                

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat.message',
                        'message': message
                    }
                )
            if content["Last_played_Card"][0]==('3S' or '3H' or '3D' or '3F'):
                pass
            if content["Last_played_Card"][0]==("RED_Joker" or "Black_Joker"):
                pass
        if content['symbol']==("RED_Joker" or "Black_Joker"):
            if content["Last_played_Card"][0]==('2S' or '2H' or '2D' or '2F'):
                #set last played card == 3,return picks
                pass
            if content["Last_played_Card"][0]==('3S' or '3H' or '3D' or '3F'):
                pass
            if content["Last_played_Card"][0]==("RED_Joker" or "Black_Joker"):
                pass


    @database_sync_to_async
    def return_major_variables(self):

        print('counter 4')
        game = Game.objects.get(id=self.game_id)

        myturn = game.c_player
        print(myturn)
        opponent_cards = game.opponent_cards
        print(opponent_cards)
        owner_cards =game.owner_cards
        print(owner_cards)

        print('counter 4')
        return myturn, opponent_cards, owner_cards
    @database_sync_to_async
    def save_last_played_card(self,card):

        game = Game.objects.get(id=self.game_id)

        game.Last_played=card
        game.save()
        return None


    
    async def card_played(self, content):
        print('Card played entered')
        if 'Last_played_Card' in content:
            Last_played_Card=content['Last_played_Card']
            print(Last_played_Card)
        

        if 'sub_command' in content and content['sub_command']== 'Switch_player_turn':
            print('entered Switch_player_turn')
            c_player=await self.turn_management_system()
            message = {
            
                "command":"Switch_player_turn",
                "c_player":c_player

            }

            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat.message',
                    'message': message
                }
            )

        if Last_played_Card[1]=="Question":
            c_player=await self.check_c_player()
            
            
            message = {
            
                "command":"card-played",
                "Last_played_Card":Last_played_Card,
                "Question(Previous player Ask":"",
                "c_player":c_player

            }

            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat.message',
                    'message': message
                }
            )
        if 'make_player_turn' in content:
            print('make_player_turn')
            if content['make_player_turn']==False:
                print('False')
                if 'J' in Last_played_Card[0]:
                    print('J')
                    c_player=await self.check_c_player()
                    message = {
                    
                        "command":"card-played",
                        "Last_played_Card":Last_played_Card,
                        "c_player":c_player,

                    }
                    

                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'chat.message',
                            'message': message
                        }
                    )
                if '8' in Last_played_Card[0]:
                    c_player=await self.check_c_player()
                    message = {
                    
                        "command":"card-played",
                        "Last_played_Card":Last_played_Card,
                        "c_player":c_player,

                    }
                    

                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'chat.message',
                            'message': message
                        }
                    )
            else:
                c_player=await self.check_c_player()
                message = {
                
                    "command":"card-played",
                    "Last_played_Card":Last_played_Card,
                    "c_player":c_player,

                }
                

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat.message',
                        'message': message
                    }
                )

        if Last_played_Card[1]=="Pick_2":
            print('Pick_2 222')
            if 'possible_counter' not  in content:
                print('possible_counter 3333')
                owner_cards,opponent_cards= await self.pick_cards(2,Last_played_Card)

                print('*****************************************')
                print(owner_cards,opponent_cards)
                print('*****************************************')
                c_player=await self.turn_management_system()
                message = {
                
                    "command":"card-played",

                    "Last_played_Card":Last_played_Card,
                    "c_player":c_player,
                    "owner_cards":owner_cards,
                    "opponent_cards":opponent_cards,
                    "try_to_counter":False,

                }
                

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat.message',
                        'message': message
                    }
                )
                
            else:
                print('HALLALLUHAH')
                opponent_cards,owner_cards=await self.current_each_player_cards(Last_played_Card)
                c_player=await self.check_c_player()
                print('HALLALLUHAHjames')
                message = {
                
                    "command":"card-played",
                    "Last_played_Card":Last_played_Card,
                    "possible_counter":content["possible_counter"],
                    "c_player":c_player,
                    "try_to_counter":True,


                }
                

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat.message',
                        'message': message
                    }
                )
                print('done')
        if Last_played_Card[1]=="Pick_3":
            print('PIck 3333')
            if "possible_counter" not in content.values():
                print('possible_counter 3333')
                owner_cards,opponent_cards= await self.pick_cards(3,Last_played_Card)

                print('*****************************************')
                print(owner_cards,opponent_cards)
                print('*****************************************')
                c_player=await self.turn_management_system()
                message = {
                
                    "command":"card-played",

                    "Last_played_Card":Last_played_Card,
                    "c_player":c_player,
                    "owner_cards":owner_cards,
                    "opponent_cards":opponent_cards,
                    "try_to_counter":False,

                }
                

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat.message',
                        'message': message
                    }
                )
                
            else:
                print('HALLALLUHAH Pick_3')
                opponent_cards,owner_cards=await self.current_each_player_cards(Last_played_Card)
                c_player=await self.check_c_player()
                print('HALLALLUHAHjames Pick_3')
                message = {
                
                    "command":"card-played",
                    "Last_played_Card":Last_played_Card,
                    "possible_counter":content["possible_counter"],
                    "c_player":c_player,
                    "try_to_counter":True,


                }
                

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat.message',
                        'message': message
                    }
                )
        if Last_played_Card[1]=="Pick_5_red" or Last_played_Card[1]=="Pick_5_black":
            print('PIck 5555')
            if "possible_counter" not in content.values():
                print('possible_counter 55555')
                owner_cards,opponent_cards= await self.pick_cards(5,Last_played_Card)

                print('*****************************************')
                print(owner_cards,opponent_cards)
                print('*****************************************')
                c_player=await self.turn_management_system()
                message = {
                
                    "command":"card-played",

                    "Last_played_Card":Last_played_Card,
                    "c_player":c_player,
                    "owner_cards":owner_cards,
                    "opponent_cards":opponent_cards,
                    "try_to_counter":False,

                }
                

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat.message',
                        'message': message
                    }
                )
                
            else:
                print('HALLALLUHAH Pick_5')
                opponent_cards,owner_cards=await self.current_each_player_cards(Last_played_Card)
                c_player=await self.check_c_player()
                print('HALLALLUHAHjames Pick_5')
                message = {
                
                    "command":"card-played",
                    "Last_played_Card":Last_played_Card,
                    "possible_counter":content["possible_counter"],
                    "c_player":c_player,
                    "try_to_counter":True,


                }
                

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat.message',
                        'message': message
                    }
                )

        
        if Last_played_Card[1] =='Ignore':
            print('entered')
            c_player=await self.turn_management_system()
            message = {
                
                "command":"card-played",
                "Last_played_Card":Last_played_Card,
                "c_player":c_player
                #"Cards_deck_play":Cards_deck_play,

            }
            

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat.message',
                    'message': message
                }
            )
        
    async def start_game(self):

        message = {
            
            "command":"start-game",
            "owner":owner_cards,
            "opponent":opponent_cards,
            "Cards_deck_play":Cards_deck_play,

        }

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat.message',
                'message': message
            }
        ) 
    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps(message))




    async def disconnect(self, code):
        await self.disconn()
        await self.opp_offline()

    async def join_room(self, data):
        # Join the room group

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.send(text_data=json.dumps({
            "command":"join",
        }))

    async def opp_offline(self):
        await self.channel_layer.group_send(
            str(self.game_id),
            {
                "type": "offline.opp",
                'sender_channel_name': self.channel_name
            }
        )
    
    async def offline_opp(self,event):
        if self.channel_name != event['sender_channel_name']:
            await self.send_json({
                "command":"opponent-offline",
            })
            print("sending offline")

    async def opp_online(self):
        await self.channel_layer.group_send(
            str(self.game_id),
            {
                "type": "online.opp",
                'sender_channel_name': self.channel_name
            }
        )
    
    async def online_opp(self,event):
        if self.channel_name != event['sender_channel_name']:
            await self.send_json({
                "command":"opponent-online",
            })

    async def resign(self):
        await self.channel_layer.group_send(
            str(self.game_id),
            {
                "type": "resign.game",
                'sender_channel_name': self.channel_name
            }
        )
    async def resign_game(self,event):
        if self.channel_name != event['sender_channel_name']:
            await self.send_json({
                "command":"opponent-resigned",
            })

    @database_sync_to_async
    def game_over(self, result):
        game = Game.objects.all().filter(id=self.game_id)[0]
        if game.status == 3:
            return
        game.winner = result
        game.status = 3
        game.save()

    @database_sync_to_async
    def calculate_card_values(self):
        game = Game.objects.get(id=self.game_id)
        owner_cards=game.owner_cards
        opponent_cards=game.opponent_cards


        # Function to calculate total value of cards
        
        async def calculate_total_value(self,cards):
            total_value = 0
            for card, action in cards.items():
                total_value += int(Cards_deck_values[card])
            return total_value

        # Calculate total value of owner's cards and opponent's cards
        owner_total_value =self.calculate_total_value(owner_cards)
        opponent_total_value =self.calculate_total_value(opponent_cards)

        if owner_total_value>opponent_total_value:
            winner=game.opponent.username
            result=f"{winner}"
            
        if opponent_total_value>owner_total_value:
            winner=game.owner.username
            result=f"{winner}"
        if opponent_total_value==owner_total_value:
            result="Draw"
        print("Owner's total card value:", owner_total_value)
        print("Opponent's total card value:", opponent_total_value)

        return result

    @database_sync_to_async
    def verify(self, game_id):
        game = Game.objects.get(id=self.game_id)
        if not game:
            return False
        user = self.scope["user"]
        opp=False
        if game.opponent == user:
            game.opponent_online = True
            if game.opponent_online == True:
                opp = True
            print("Setting opponent online")
        elif game.owner == user:
            game.owner_online = True

            if game.opponent_online == True:
                opp = True
            print("Setting owner online")
        else:
            return False
        game.save()
        return opp

    @database_sync_to_async
    def disconn(self):
        user = self.scope["user"]
        game = Game.objects.all().filter(id=self.game_id)[0]
        if game.opponent == user:
            game.opponent_online = False
            print("Setting opponent offline")
        elif game.owner == user:
            game.owner_online = False
            print("Setting owner offline")
        game.save()
        
    @database_sync_to_async
    def update(self):
        game = Game.objects.all().filter(id=self.game_id)[0]
        if not game:
            print("Game not found")
            return

        game.save()
        print("Saving game details")
    @database_sync_to_async
    def turn_management_system(self):
        print("Turn made 1")
        game = Game.objects.all().filter(id=self.game_id)[0]
        print("Game object:", game)
        player = game.c_player
        print("Current player:", player)
        if int(player)==1:
            players = -1
        else:
            players=1
        if game.owner_pick_card_turn==False:
            game.owner_pick_card_turn=True
        if game.opponent_pick_card_turn==False:
            game.opponent_pick_card_turn=True
        print("New player:", players)
        game.c_player = players
        game.save()
        print("Turn made")
        return players
    @database_sync_to_async
    def check_c_player(self):
        game = Game.objects.all().filter(id=self.game_id)[0]
        c_player = game.c_player 
        return c_player

    @database_sync_to_async
    def pick_cards(self, count,Last_played_Card):
        print('count    :*****************',count)
        game = Game.objects.all().filter(id=self.game_id)[0]


        if int(game.c_player) == -1:
            print('possible_counter 1111')
            print(type(game.opponent_cards))
            print(game.opponent_cards)
            opponent_cards=json.loads((game.opponent_cards.replace("'", '"')))
            del opponent_cards[Last_played_Card[0]]
            game.opponent_cards=opponent_cards
            current_cards = json.loads(game.owner_cards)
            print('current_cards:', current_cards)  # Print current_cards variable
            Cards_deck_play = json.loads(game.Cards_deck_play)
            print('Cards_deck_play:', Cards_deck_play)  # Print Cards_deck_play variable
            new_cards = dict(list(Cards_deck_play.items())[:count])
            print('new_cards:', new_cards)  # Print new_cards variable
            remaining_entries = dict(list(Cards_deck_play.items())[count:])
            print('remaining_entries:', remaining_entries)  # Print remaining_entries variable
            game.Cards_deck_play = json.dumps(remaining_entries)
            
            print('donenenenen')
            owner_cards = {**current_cards, **new_cards}


            print('owner_cards:', owner_cards)  # Print owner_cards variable
            game.owner_cards = owner_cards
        else:
            owner_cards=json.loads(game.owner_cards.replace("'", '"'))
            print('--------------------------------')
            delete=Last_played_Card[0]
            print('***************************')
            if delete in owner_cards:
                del owner_cards[delete]
            else:
                print("Key not found in owner_cards:", delete)
            print('_______________________________')
            game.owner_cards=owner_cards
            print('possible_counter -1-1-1-1-')
            current_cards = game.opponent_cards
            print('current_cards:', current_cards)  # Print current_cards variable
            Cards_deck_play = json.loads(game.Cards_deck_play)
            print('Cards_deck_play:', Cards_deck_play)  # Print Cards_deck_play variable
            new_cards = dict(list(Cards_deck_play.items())[:count])
            print('new_cards:', new_cards)  # Print new_cards variable
            remaining_entries =  dict(list(Cards_deck_play.items())[count:])
            print('remaining_entries:', remaining_entries)  # Print remaining_entries variable
            game.Cards_deck_play = json.dumps(remaining_entries)
            
            print('donenenenen')
            current_cards=json.loads(current_cards.replace("'", '"'))
            print(type(current_cards),type(new_cards))
            opponent_cards = {**current_cards, **new_cards}
            print('opponent_cards:', opponent_cards)  # Print opponent_cards variable
            game.opponent_cards = opponent_cards
        game.save()
        game = Game.objects.all().filter(id=self.game_id)[0]
        owner_cards =json.loads(game.owner_cards.replace("'", '"'))
        opponent_cards = json.loads(game.opponent_cards.replace("'", '"'))
        print('possible_counter 8888')
        return owner_cards, opponent_cards

    async def counter_is_possible_function(self,card, myturn, opponent_cards, owner_cards):
        print('------------------------------------')
        myturn=int(myturn)
        print(myturn)
        if myturn == -1:
            opponent_CARDS =opponent_cards
            print('------------------------------------')

        elif myturn == 1:
            print('------------------------------------1')

            opponent_CARDS = owner_cards

        itemList = []

        if card[1] == 'Pick_2':
            if card[0] == '2F':
                itemList = ["3F", "AS", "Black_Joker", "2D", "2S", "2H"]
            elif card[0] == '2S':
                itemList = ["3S", "AS", "Black_Joker", "2D", "2S", "2H"]
            elif card[0] == '2D':
                itemList = ["3D", "AS", "RED_Joker", "2F", "2S", "2H"]
            elif card[0] == '2H':
                itemList = ["3H", "AS", "RED_Joker", "2D", "2S", "2F"]
        elif card[1] == 'Pick_3':
            if card[0] == '3F':
                itemList = ["2F", "AS", "Black_Joker", "3D", "3S", "3H"]
            elif card[0] == '3S':
                print('counter 7')
                itemList = ["2S", "AS", "Black_Joker", "3D", "3S", "3H"]
                print('counter 8')
            elif card[0] == '3D':
                itemList = ["2D", "AS", "RED_Joker", "3F", "3S", "3H"]
            elif card[0] == '3H':
                itemList = ["2H", "AS", "RED_Joker", "3D", "3S", "3F"]
        elif card[1] == 'Pick_5_red':
            itemList = ["AS", "Black_Joker", "3F", "3S", "2F", "2S"]
        elif card[1] == 'Pick_5_black':
            itemList = ["RED_Joker", "3D", "3H", "2D", "2H", "AS"]
        print('counter 6')
        # Extract the dictionary from the tuple

        matchingCards = []

        # Iterate over itemList and check if any item is present in opponent_CARDS
        for item in itemList:
            if item in opponent_CARDS:
                matchingCards.append(item)

        print(matchingCards)

        return matchingCards
    async def find_key_value_pair(self,dictionary, target_key):
        for key, value in dictionary.items():
            if key == target_key:
                return [key,value]
        return None  # Return None if no matching key-value pair is found
    @database_sync_to_async
    def current_each_player_cards(self,Last_played_Card):
        print('------------------------------------')
        game = Game.objects.get(id=self.game_id)
        print('------------------------------------')
        player_turn=int(game.c_player)
        print('------------------------------------')
        
        
        if player_turn == -1:
            opponent_cards=game.opponent_cards
            print('-----------OPP-------------------------')
            print(type(opponent_cards))
            print('------------------------------------')


        elif player_turn == 1:
            #working dictionary
            owner_card=(game.owner_cards.replace("'", '"'))

            owner_cards=json.loads(owner_card)#.replace("'", ""))
            
            # Assuming Last_played_Card[0] contains a key present in owner_cards
            key_to_delete = Last_played_Card[0]
            if key_to_delete in owner_cards:
                del owner_cards[key_to_delete]
                print('deleted')
            else:
                print("Key not found in owner_cards:", key_to_delete)

            """
            # Assuming Last_played_Card[0] contains a key present in owner_cards
            key_to_delete = Last_played_Card[0]

            # Create a new dictionary excluding the key to delete
            new_owner_cards = {}
            for key, value in owner_cards.items():
                if key != key_to_delete:
                    new_owner_cards[key] = value

            # Convert the new dictionary to JSON
            new_json = json.dumps(new_owner_cards)

            print(new_json)
            
            """

            game.owner_cards=json.dumps(owner_cards)
        game.save()
        game = Game.objects.all().filter(id=self.game_id)[0]
        owner_cards =json.loads(game.owner_cards.replace("'", '"'))
        opponent_cards = json.loads(game.opponent_cards.replace("'", '"'))
        return opponent_cards, owner_cards

    @database_sync_to_async
    def game_over(self, result):
        game = Game.objects.all().filter(id=self.game_id)[0]
        if game.status == 3:
            return
        game.winner = result
        game.status = 3
        game.save()


    @database_sync_to_async
    def weather_any_player_can_pick(self):
        game = Game.objects.all().filter(id=self.game_id)[0]
        if int(game.c_player) == -1 and game.opponent_pick_card_turn==True:
            game.opponent_pick_card_turn=False
        elif int(game.c_player)==1 and game.owner_pick_card_turn==True:
            game.owner_pick_card_turn=False

        game.save()
        game = Game.objects.all().filter(id=self.game_id)[0]

        owner_pick_card_turn=game.owner_pick_card_turn
        opponent_pick_card_turn=game.opponent_pick_card_turn
        
        return owner_pick_card_turn,opponent_pick_card_turn
    @database_sync_to_async
    def pick_cards_during_play(self):
        count=1
        game = Game.objects.all().filter(id=self.game_id)[0]


        if int(game.c_player) == -1 and game.opponent_pick_card_turn==True:
            opponent_cards=json.loads(game.opponent_cards.replace("'", '"'))
            current_cards = opponent_cards
            Cards_deck_play = json.loads(game.Cards_deck_play)
            new_cards = dict(list(Cards_deck_play.items())[:count])
            remaining_entries = dict(list(Cards_deck_play.items())[count:])
            game.Cards_deck_play = json.dumps(remaining_entries)
            if type(current_cards) == dict:
                pass
            else:
                current_cards=json.loads(current_cards.replace("'", '"'))
            opponent_cards= {**current_cards, **new_cards}
            game.opponent_cards=opponent_cards

        elif int(game.c_player)==1 and game.owner_pick_card_turn==True:
            owner_cards=json.loads(game.owner_cards.replace("'", '"'))
            current_cards = owner_cards
            Cards_deck_play = json.loads(game.Cards_deck_play)
            new_cards = dict(list(Cards_deck_play.items())[:count])
            remaining_entries =  dict(list(Cards_deck_play.items())[count:])
            game.Cards_deck_play = json.dumps(remaining_entries)
            if type(current_cards) == dict:
                pass
            else:
                current_cards=json.loads(current_cards.replace("'", '"'))
            owner_cards = {**current_cards, **new_cards}
            game.owner_cards = owner_cards
        else:
            return None, None
        game.save()
        game = Game.objects.all().filter(id=self.game_id)[0]
        owner_cards =json.loads(game.owner_cards.replace("'", '"'))
        opponent_cards = json.loads(game.opponent_cards.replace("'", '"'))
        return owner_cards, opponent_cards