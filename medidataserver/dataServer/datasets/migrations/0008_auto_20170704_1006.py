# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-07-04 10:06
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('datasets', '0007_auto_20170704_1004'),
    ]

    operations = [
        migrations.AlterField(
            model_name='accessprofile',
            name='dataset',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='datasets.Dataset'),
        ),
    ]
