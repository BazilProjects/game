# Generated by Django 4.2.11 on 2024-05-03 10:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game_core', '0002_auto_20240417_1634'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='symbol',
            field=models.CharField(blank=True, max_length=2000),
        ),
    ]
