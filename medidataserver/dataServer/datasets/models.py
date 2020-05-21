#from __future__ import unicode_literals
from django.urls import resolve, reverse
from django.contrib.auth.models import User
from django.conf import settings
from django.db import models
from jsonfield import JSONField

import sqlalchemy

# TODO: this import has to be fixed
import os
import sys
path = os.path.dirname(__file__)
sys.path.insert(0, path + "/../sqlite_rest_api/")
from dataServer.sqlite_rest_api.sqlite_rest_api import distinctAndDistinctCombined


class Dataset(models.Model):

    name              = models.CharField(max_length=1000)
    file              = models.FileField(null=False, default='', editable=False) # editable=False hide the field from the admin form
    sqlite_file_path  = models.CharField(max_length=10000, blank=False, null=True)
    endpoint          = models.CharField(max_length=1000, blank=False, null=True)
    permission_schema = JSONField(default={}, blank=True)

    # get possible columns and column values on which to set permissions
    def permission_schema_values(self):

        # for every table and columns listed in permission_schema
        uniquevalues_request_data = {}
        for table, columns in self.permission_schema.iteritems():
            uniquevalues_request_data[table] = {
                'distinct' : columns
            }

        # open sqlite db
        dbLoc   = 'sqlite:///' + settings.BASE_DIR + '/' + self.sqlite_file_path
        engine  = sqlalchemy.create_engine(dbLoc)

        return distinctAndDistinctCombined(uniquevalues_request_data, engine)

    def __unicode__(self):
        return self.name



class AccessProfile(models.Model):

    name          = models.CharField(max_length=1000, null=False, default='')
    users         = models.ManyToManyField(User, blank=True)
    dataset       = models.ForeignKey(Dataset, blank=False, null=True) # blank is for form validation and null for the DB
    access_detail = JSONField(default={}, blank=True)

    def __unicode__(self):
        return self.name
