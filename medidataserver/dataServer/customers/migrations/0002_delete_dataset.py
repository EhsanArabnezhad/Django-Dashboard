# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-08-28 15:45
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('customers', '0001_initial'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Dataset',
        ),
    ]
