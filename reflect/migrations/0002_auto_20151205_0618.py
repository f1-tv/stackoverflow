# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reflect', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='post',
            options={'ordering': ['createdAt'], 'verbose_name': 'Post', 'verbose_name_plural': 'Posts'},
        ),
        migrations.AddField(
            model_name='post',
            name='depth',
            field=models.IntegerField(default=0),
        ),
    ]
