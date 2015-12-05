# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reflect', '0003_auto_20151205_0826'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cursor',
            name='hasNext',
            field=models.BooleanField(default=True),
        ),
    ]
