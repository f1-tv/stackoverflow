# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reflect', '0002_auto_20151205_0618'),
    ]

    operations = [
        migrations.CreateModel(
            name='Cursor',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('hasPrev', models.BooleanField(default=0)),
                ('total', models.IntegerField(default=1)),
                ('prev', models.CharField(max_length=20, null=True, blank=True)),
                ('hasNext', models.BooleanField(default=0)),
                ('next', models.CharField(default=b'1:0:0', max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='Forumdata',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('code', models.IntegerField(default=0)),
                ('order', models.CharField(default=b'desc', max_length=10)),
                ('cursor', models.ForeignKey(related_name='cursor', verbose_name='Cursor', to='reflect.Cursor')),
            ],
        ),
        migrations.CreateModel(
            name='Response',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('lastModified', models.IntegerField(default=0)),
                ('posts', models.ForeignKey(related_name='response_posts', verbose_name='response_posts', to='reflect.Post')),
                ('thread', models.ForeignKey(related_name='response_thread', verbose_name='response_thread', to='reflect.Thread')),
            ],
        ),
        migrations.AddField(
            model_name='forumdata',
            name='response',
            field=models.ForeignKey(related_name='response', verbose_name='Response', to='reflect.Response'),
        ),
    ]
