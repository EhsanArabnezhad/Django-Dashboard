# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-07-04 15:22
from __future__ import unicode_literals

from django.db import migrations
import jsonfield.fields


class Migration(migrations.Migration):

    dependencies = [
        ('datasets', '0009_dataset_permission_schema'),
    ]

    operations = [
        migrations.AlterField(
            model_name='accessprofile',
            name='access_detail',
            field=jsonfield.fields.JSONField(blank=True, default={}),
        ),
    ]