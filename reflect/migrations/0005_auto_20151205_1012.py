# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reflect', '0004_auto_20151205_0945'),
    ]

    operations = [
        migrations.AddField(
            model_name='settings',
            name='colorScheme',
            field=models.CharField(default=b'auto', max_length=20),
        ),
        migrations.AddField(
            model_name='settings',
            name='discoveryMax',
            field=models.BooleanField(default=0),
        ),
        migrations.AddField(
            model_name='settings',
            name='discoverySettingsUrl',
            field=models.CharField(max_length=200, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='settings',
            name='discoveryThumbnailsEnabled',
            field=models.BooleanField(default=0),
        ),
        migrations.AddField(
            model_name='settings',
            name='discoveryVariant',
            field=models.CharField(default=b'default', max_length=20),
        ),
        migrations.AddField(
            model_name='settings',
            name='linkAffiliationEnabled',
            field=models.BooleanField(default=0),
        ),
        migrations.AddField(
            model_name='settings',
            name='moderatorText',
            field=models.CharField(max_length=200, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='settings',
            name='organicDiscoveryEnabled',
            field=models.BooleanField(default=0),
        ),
        migrations.AddField(
            model_name='settings',
            name='promotedDiscoveryEnabled',
            field=models.BooleanField(default=0),
        ),
        migrations.AddField(
            model_name='settings',
            name='typeface',
            field=models.CharField(default=b'auto', max_length=20),
        ),
        migrations.AlterField(
            model_name='post',
            name='parent',
            field=models.CharField(max_length=20, null=True, blank=True),
        ),
    ]
