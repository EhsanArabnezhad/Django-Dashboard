# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-07-04 09:46
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('datasets', '0003_auto_20160911_1833'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='accessprofile',
            name='schema',
        ),
        migrations.RemoveField(
            model_name='dataset',
            name='schema',
        ),
        migrations.DeleteModel(
            name='Schema',
        ),
    ]
