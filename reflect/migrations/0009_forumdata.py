# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reflect', '0008_auto_20151205_1057'),
    ]

    operations = [
        migrations.CreateModel(
            name='Forumdata',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('features', models.ForeignKey(related_name='Feature', verbose_name='Feature', to='reflect.Feature')),
                ('forum', models.ForeignKey(related_name='forumdata_', verbose_name='forumdata', to='reflect.Forum')),
                ('session', models.ForeignKey(related_name='forum_settings_data', to='reflect.Settings')),
            ],
        ),
    ]
