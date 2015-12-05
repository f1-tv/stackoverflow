# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reflect', '0006_feature'),
    ]

    operations = [
        migrations.AddField(
            model_name='settings',
            name='audienceSyncVerified',
            field=models.BooleanField(default=0),
        ),
        migrations.AddField(
            model_name='settings',
            name='canModerate',
            field=models.BooleanField(default=0),
        ),
        migrations.AddField(
            model_name='settings',
            name='canReply',
            field=models.BooleanField(default=1),
        ),
    ]
