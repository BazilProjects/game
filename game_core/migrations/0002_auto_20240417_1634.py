# Generated by Django 3.2 on 2024-04-17 16:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game_core', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='opponent_pick_card_turn',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='game',
            name='owner_pick_card_turn',
            field=models.BooleanField(default=True),
        ),
    ]
