import os
import sqlalchemy

# quote and combine a comma-separated list of sql column names. Useful in query building
def quotedFieldList(fields, quote='`'):
    res = ''

    if len(fields) > 0:
        for field in fields:
            res += quote + field + quote + ','
        res = res[:-1]

    return res


def selectDistinct(table, columns, engine, join='', where={}):

    results = {}

    # force columns to be an array
    if type(columns) != list:
        columns = [columns]

    # serialize where statement
    whereString = ' '
    if len(where.keys()) > 0:
        whereString += 'WHERE'
        for k,v in where.iteritems():
            whereString += ' `' + k + '` IN('
            for value in v:
                whereString += '"' + value + '",'
            whereString = whereString[:-1]  # take away last char
            whereString += ') AND '
        # take away last AND
        whereString = whereString[:-5]

    # build query
    query = 'SELECT DISTINCT ' + quotedFieldList(columns) + ' FROM `' + table + '` ' + join + ' ' + whereString

    # execute query
    print ('\n', query)
    return engine.execute(query)


def getTableColumns(table, engine):
    result = engine.execute('PRAGMA table_info(' + table + ')')
    return [row[1] for row in result]


def distinctAndDistinctCombined(JSONdistinctQuery, engine, join='', where={}):

    results = {}

    for table in JSONdistinctQuery.keys():

        # get info on the table
        allTableColumns = getTableColumns(table, engine)

        # only leave in WHERE the pertinent columns
        whereStatement = {}
        for k,v in where.iteritems():
            if k in allTableColumns:
                whereStatement[k]=v

        # prepare data structure to store results from all the queries
        results[table] = {}

        # distinct values for each column
        if 'distinct' in JSONdistinctQuery[table]:

            for column in JSONdistinctQuery[table]['distinct']:

                subresult = selectDistinct(table, column, engine, where=whereStatement)
                results[table][column] = {
                    'values': []
                }
                for row in subresult:
                    results[table][column]['values'].append(row[0])

        # distinct values for a list of columns (extracted 2 by 2: parent -> children)
        if 'distinctCombined' in JSONdistinctQuery[table]:
            for combinedColumns in JSONdistinctQuery[table]['distinctCombined']:

                for c in range(0, len(combinedColumns)-1):
                    parentColumn = combinedColumns[c]
                    childColumn  = combinedColumns[c+1]
                    results[table][parentColumn][childColumn] = {}

                    subresult = selectDistinct(table, [parentColumn, childColumn], engine, where=whereStatement)

                    for row in subresult:
                        if not row[0] in results[table][parentColumn][childColumn]:
                            results[table][parentColumn][childColumn][row[0]] = []
                        results[table][parentColumn][childColumn][row[0]].append(row[1])

    return results