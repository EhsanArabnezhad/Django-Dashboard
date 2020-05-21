# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-07-04 10:04
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('datasets', '0006_accessprofile_dataset'),
    ]

    operations = [
        migrations.AlterField(
            model_name='accessprofile',
            name='dataset',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='datasets.Dataset'),
        ),
    ]
