# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-09-11 17:12
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('datasets', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='dataset',
            name='schema',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='datasets.Schema'),
        ),
    ]
