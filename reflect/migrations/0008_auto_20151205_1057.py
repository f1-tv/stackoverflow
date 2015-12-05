# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reflect', '0007_auto_20151205_1054'),
    ]

    operations = [
        migrations.CreateModel(
            name='Threaddata',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('code', models.IntegerField(default=0)),
                ('order', models.CharField(default=b'desc', max_length=10)),
                ('cursor', models.ForeignKey(related_name='cursor', verbose_name='Cursor', to='reflect.Cursor')),
                ('response', models.ForeignKey(related_name='response', verbose_name='Response', to='reflect.Response')),
            ],
        ),
        migrations.RemoveField(
            model_name='forumdata',
            name='cursor',
        ),
        migrations.RemoveField(
            model_name='forumdata',
            name='response',
        ),
        migrations.DeleteModel(
            name='Forumdata',
        ),
    ]
