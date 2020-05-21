from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response

from datasets.models import Dataset

from sqlite_rest_api import distinctAndDistinctCombined, getTableColumns, quotedFieldList

import sqlalchemy
import os
import copy
from pprint import pprint



class SQLiteApiViewBase(APIView):
    """
    Base class for SQLite api view
    """

    permission_classes = (IsAuthenticated,) # TODO: very important, authentication
    dbPath             = 'sqlite:///' + os.path.join(os.path.dirname(__file__)) + '/db.sqlite'
    app_name           = 'app_name_not_set'

    def getSqlLiteEngine(self):

        if hasattr(self, 'engine'):
            return self.engine
        else:
            dbLoc   = self.dbPath
            return sqlalchemy.create_engine(dbLoc)

    # this method will return fine-graned read permissions of a specific user on a specific dataset
    def getAccessDetail(self, request):

        access_profile =  request.user.accessprofile_set.filter(dataset__name=self.app_name).first()
        if access_profile:
            access_detail = access_profile.access_detail
        else:
            access_detail = {}

        return access_detail

    # quote and combine a comma-separated list of sql column names. Useful in query building
    def quotedFieldList(self, fields, quote='`'):
        return quotedFieldList(fields, quote)

    def serializeJoin(self, join_data_structure):

        join_statement = ' '

        if join_data_structure:
            if type(join_data_structure['on']) == list:
                column_a = join_data_structure['on'][0]
                column_b = join_data_structure['on'][1]
            else:
                column_a = join_data_structure['on']
                column_b = join_data_structure['on']

            join_statement += join_data_structure['type'] + ' JOIN `' + join_data_structure['table'] + '`'
            join_statement += ' ON `' + column_a + '`=`' + column_b + '` '

        return join_statement



class SQLiteApiUniqueView(SQLiteApiViewBase):
    """
    Manage a request for distinct values and distinct combined in several tables, i.e.:
    {
        "rilevazioni": {
            "distinct": ["Reparto", "Colore"]
        },
        "puntivendita": {
            "distinct": ["Nome"],
            "distinctCombined": ["Provincia", "Regione"]
        }
    }
    """
    join  = ''  # TODO: this should be a data structure like in the other classes

    def post(self, request, format=None):

        # organize parameters
        params = request.data
        # get permissions
        permissions = self.getAccessDetail(request)
        # prepare engine
        engine = self.getSqlLiteEngine()

        # call static method to compose query and get result
        results = distinctAndDistinctCombined(params, engine, join='', where=permissions)

        return Response(results)


class SQLiteApiTableView(SQLiteApiViewBase):
    """
    Manage a request for a select in a table, allowing joining and grouping, i.e.:
    {
        "Forma"  : ["Rotondo"],
        "Colore" : ["Bianco", "Blu"],
        "groupby": ["Colore"]
    }
    """

    table    = 'table_not_set'
    join     = {}
    group_by_select_fields = ['COUNT(*)']


    # main method to get data, via HTTP POST.
    def post(self, request, format=None):

        # organize parameters and permissions
        params      = request.data # request.query_params in case of GET
        params      = self.paramCleaning(params)
        permissions = self.getAccessDetail(request)

        # TODO: prepare groupby here

        where_params_and_permissions = self.mergeWhereParamsWithPermissions(params, permissions)

        # build query
        query = self.buildquery(self.table, where_params_and_permissions)
        print ('PERMESSI:', where_params_and_permissions)
        print ('QUERY:', query)

        # execute query
        results = self.getSqlLiteEngine().execute(query)

        return Response(results)

    # ensure every param value is wrapped in a list (may be sent from client as a simple string or number)
    def paramCleaning(self, params):

        for p, v in params.iteritems():
            if type(v) != list:
                params[p] = [v]

        return params

    # harmonize get parameters and read permissions on data
    def mergeWhereParamsWithPermissions(self, whereParams, permissions):

        mergedParams = {}

        # get the name of all columns involved
        table_columns = getTableColumns(self.table, self.getSqlLiteEngine())
        if self.join:
            join_table_columns = getTableColumns(self.join['table'], self.getSqlLiteEngine())
            table_columns += join_table_columns

        allKeys = whereParams.keys() + permissions.keys()
        allKeysUnique = list( set(allKeys) )

        # delete non selectable columns (because permissions are dataset-level and there may be permissions on columns from other tables
        keysToBeRemoved = []
        for k in allKeysUnique:
            if k != 'groupby' and (not k in table_columns): # TODO: groupby data structure should be done before
                keysToBeRemoved.append(k)
        for kToRemove in keysToBeRemoved:
            allKeysUnique.remove(kToRemove)

        # loop over unique keys in both objects
        for k in allKeysUnique:
            if (k in whereParams.keys()) and (k in permissions.keys()):
                # if keys are present in both, take intersection of their values
                setValuesW = set(whereParams[k])
                setValuesP = set(permissions[k])
                mergedParams[k] = list( setValuesW.intersection(setValuesP) )

                # in case intersection is empty (i.e. w != p), send nothing!
                if len(mergedParams[k]) == 0:
                    mergedParams[k] = ['unfindable_database_value']
            else:
                # otherwise just take the present values in any of the objects
                if k in whereParams.keys():
                    mergedParams[k] = whereParams[k]
                else:
                    mergedParams[k] = permissions[k]


        return mergedParams


    def buildquery(self, table, parameters):

        selected_fields = '*'

        # use a copy of the params
        # TODO: groupby data structure should be done before
        params  = copy.deepcopy(parameters)
        if 'groupby' in params:
            # add requested groupby columns to the GROUP BY statement
            groupby_statement = ' GROUP BY ' + self.quotedFieldList(params['groupby'])

            # correct select statement
            selected_fields = self.quotedFieldList(params['groupby']) + ',' + self.quotedFieldList(self.group_by_select_fields, quote='')

            del params['groupby'] # otherwise it will impact the WHERE statement
        else:
            groupby_statement = ''

        # prepare join statement
        join_statement = self.serializeJoin(self.join)

        return self.buildSelectQuery(selected_fields, table, join=join_statement, where=params, groupby=groupby_statement)


    # build SQL query
    def buildSelectQuery(self, selectedFields, table, join='', where='', groupby=''):

        query = 'SELECT ' + selectedFields  + ' FROM `' + table + '` ' + join + ' WHERE '

        for param, values in where.iteritems():
            #print '\t\t', param, values
            if values:
                query += '`' + str(param) + '`'
                #print values, type(values)
                if type(values) in [str, unicode]:
                    query += '= "' + values + '" '
                if type(values)==list:
                    query += ' IN('
                    for value in values:
                        query += '"' + value + '",'
                    query = query[:-1]  # take away last char
                    query += ') '
                query += ' AND '
        # take away last AND
        if query[-5:] == ' AND ':
            query = query[:-5]
        if query[-6:] == 'WHERE ':    ## no params where added to query
            query += '1 '

        # add groupby and limit
        query += groupby + ' LIMIT 20000'

        return query


