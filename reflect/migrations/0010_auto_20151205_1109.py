# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reflect', '0009_forumdata'),
    ]

    operations = [
        migrations.CreateModel(
            name='Session',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('mustVerify', models.BooleanField(default=0)),
                ('mustVerifyEmail', models.BooleanField(default=0)),
                ('audienceSyncVerified', models.BooleanField(default=0)),
                ('canModerate', models.BooleanField(default=0)),
                ('canReply', models.BooleanField(default=1)),
            ],
        ),
        migrations.RemoveField(
            model_name='settings',
            name='audienceSyncVerified',
        ),
        migrations.RemoveField(
            model_name='settings',
            name='canModerate',
        ),
        migrations.RemoveField(
            model_name='settings',
            name='canReply',
        ),
        migrations.RemoveField(
            model_name='settings',
            name='discoveryThumbnailsEnabled',
        ),
        migrations.AlterField(
            model_name='forumdata',
            name='session',
            field=models.ForeignKey(related_name='forum_session_data', to='reflect.Session'),
        ),
    ]
