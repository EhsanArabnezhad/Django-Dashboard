import sqlalchemy
import os
from django.shortcuts import render
from rest_framework.response import Response
from pprint import pprint

# TODO: this import has to be fixed
import sys
from sqlite_view import SQLiteApiTableView, SQLiteApiUniqueView
path = os.path.dirname(__file__)
sys.path.insert(0, path + "/../sqlite_rest_api/")


class PrezziChiariView(SQLiteApiTableView):

    dbPath     = 'sqlite:///' + os.path.join(os.path.dirname(__file__)) + '/db.sqlite'
    app_name   = 'prezzichiari'


class RilevazioneView(PrezziChiariView):

    table = 'rilevazioni'
    group_by_select_fields = [
        'COUNT(*)',
        'AVG(`Prezzo al Kg`)',
        'SUM(`Prezzo al Kg`)',
        'AVG(`Centimetri lineari`)',
        'SUM(`Centimetri lineari`)'
    ]
    join  = {
        'type'  : 'LEFT',
        'table' : 'puntivendita',
        'on'    : ['Punto vendita', 'Nome']
    }

class PuntoVenditaView(PrezziChiariView):

    table = 'puntivendita'
    group_by_select_fields = ['COUNT(*)']


class UniqueValuesView(SQLiteApiUniqueView):

    dbPath   = 'sqlite:///' + os.path.join(os.path.dirname(__file__)) + '/db.sqlite'
    app_name = 'prezzichiari'