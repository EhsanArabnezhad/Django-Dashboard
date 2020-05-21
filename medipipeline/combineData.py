import json
import pickle
import datetime
import luigi
import pandas as pd
from downLoadData import DownLoadData

class CombineData( luigi.Task ):

    def requires( self ):
        return DownLoadData()

    def run( self ):

        joins = [

            # JOIN SUI PUNTI VENDITA

            {   # csv asset file
                "type"    : "left",
                "a"       : "regioni",
                "b"       : "areenielsen",
                "key"     : ["des", "regioni"],
                "result"  : "regioni"
            },
            {
                "type"    : "left",
                "a"       : "puntivendita",
                "b"       : "insegna",
                "key"     : "codins",
                "result"  : "puntivendita"
            },
            {
                "type"    : "left",
                "a"       : "puntivendita",
                "b"       : "comuni",
                "key"     : "codcom",
                "result"  : "puntivendita"
            },
            {
                "type"    : "left",
                "a"       : "puntivendita",
                "b"       : "province",
                "key"     : "codprov",
                "result"  : "puntivendita"
            },
            {
                "type"    : "left",
                "a"       : "puntivendita",
                "b"       : "regioni",
                "key"     : "codreg",
                "result"  : "puntivendita"
            },
            {
                "type"    : "left",
                "a"       : "puntivendita",
                "b"       : "zone",
                "key"     : "codzona",
                "result"  : "puntivendita"
            },
            {
                "type"    : "left",
                "a"       : "puntivendita",
                "b"       : "tppuntovend",
                "key"     : ["codtppv", "cod"],
                "result"  : "puntivendita"
            },
            {   # csv asset file
                "type"    : "left",
                "a"       : "puntivendita",
                "b"       : "piazze",
                "key"     : ["des", "PUNTO VENDITA"],
                "result"  : "puntivendita"
            },

            # JOIN SULLE RILEVAZIONI
            {
                "type"    : "left",
                "a"       : "anagraficaprd",
                "b"       : "classificazione",
                "key"     : "codcla",
                "result"  : "anagraficaprd"
            },
            {
                "type"    : "left",
                "a"       : "anagraficaprd",
                "b"       : "descrizione_bis_carne",
                "key"     : ["des", "descrizione"],
                "result"  : "anagraficaprd"
            },
            {
                "type"    : "left",
                "a"       : "rilevazioni",
                "b"       : "anagraficaprd",
                "key"     : "codprd",
                "result"  : "rilevazioni"
            },
            {
                "type"    : "left",
                "a"       : "rilevazioni",
                "b"       : "puntivendita",
                "key"     : "codpv",
                "result"  : "rilevazioni"
            },
            {
                "type"    : "left",
                "a"       : "rilevazioni",
                "b"       : "package",
                "key"     : "codpkg",
                "result"  : "rilevazioni"
            },
            {
                "type"    : "left",
                "a"       : "rilevazioni",
                "b"       : "reparto",
                "key"     : "codrep",
                "result"  : "rilevazioni"
            },
            # TODO: multiple joins on the same table should be more elegant
            {
                "type"    : "left",
                "a"       : "rilevazioni",
                "b"       : "provenienza",
                "key"     : "codprv",
                "result"  : "rilevazioni"
            },
            {
                "type"    : "left",
                "a"       : "rilevazioni",
                "b"       : "provenienze_pesce",
                "key"     : "codprv",
                "result"  : "rilevazioni"
            },
            {
                "type"    : "left",
                "a"       : "rilevazioni",
                "b"       : "provenienza_cr_natoin",
                "key"     : ["cr_natoin", "codprv"],
                "result"  : "rilevazioni"
            },
            {
                "type"    : "left",
                "a"       : "rilevazioni",
                "b"       : "provenienza_cr_all1",
                "key"     : ["cr_all1", "codprv"],
                "result"  : "rilevazioni"
            },
            {
                "type"    : "left",
                "a"       : "rilevazioni",
                "b"       : "provenienza_cr_mac_in",
                "key"     : ["cr_mac_in", "codprv"],
                "result"  : "rilevazioni"
            },
            {
                "type"    : "left",
                "a"       : "rilevazioni",
                "b"       : "provenienza_cr_sez_in",
                "key"     : ["cr_sez_in", "codprv"],
                "result"  : "rilevazioni"
            },
            {
                "type"    : "left",
                "a"       : "rilevazioni",
                "b"       : "produttore",
                "key"     : "codpdt",
                "result"  : "rilevazioni"
            },
            {
                "type"    : "left",
                "a"       : "rilevazioni",
                "b"       : "brand",
                "key"     : "codbra",
                "result"  : "rilevazioni"
            },
            {
                "type"    : "left",
                "a"       : "rilevazioni",
                "b"       : "zonefao",
                "key"     : ["ps_zonafao", "cod"],
                "result"  : "rilevazioni"
            },
            {
                "type"    : "left",
                "a"       : "rilevazioni",
                "b"       : "calibri",
                "key"     : "codcal",
                "result"  : "rilevazioni"
            },
            {
                "type"    : "left",
                "a"       : "rilevazioni",
                "b"       : "stagionatura",
                "key"     : ["gs_stag", "cod"],
                "result"  : "rilevazioni"
            },
        ]

        # open dataframes
        tables = pd.read_pickle(self.input().fn)

        # fix for multiple joins on the same table
        # TODO: multiple joins on the same table should be more elegant
        originalTmpTable = "provenienza"
        tmpTables = ["provenienza_cr_natoin", "provenienza_cr_all1", "provenienza_cr_mac_in", "provenienza_cr_sez_in"]
        for tmpTable in tmpTables:
            tables[tmpTable] = tables[originalTmpTable].copy()
        # TODO: another non-elegant multijoin problem
        tables["puntivendita"] = tables["anagraficapv"].copy()

        # column renaming: column --> table.column (good for joins column disambiguation)
        self.addTableNameToColumnName(tables)

        # perform JOINS
        self.makeJoins(tables, joins)


        # SAVE RESULTS
        # TODO: abstract this command
        finalFrames = {
            'rilevazioni'  : tables['rilevazioni'],
            'puntivendita' : tables['puntivendita']
        }

        # Save as CSV
        for name, frame in finalFrames.iteritems():
            for col in frame.columns:
                print ("\t", col)
            frame.to_csv("data/" + name + ".combine.csv", index=False)

        # Save as pickle
        with open(self.output().fn, 'wb') as f:
            pickle.dump(finalFrames, f, protocol=pickle.HIGHEST_PROTOCOL)


    def addTableNameToColumnName(self, tables):
        for t in tables:
            print ('\n', t)
            colNames = list(tables[t].columns)
            newNames = {}
            for colName in colNames:
                newNames[colName] = t + '.' + colName
            tables[t].rename(columns=newNames, inplace=True)
            print (tables[t].columns)

    def makeJoins(self, tables, joins):

        finalResult = ''    # TODO: define edge case
        for join in joins:
            a = tables[join['a']]
            b = tables[join['b']]
            if(isinstance(join['key'], list) ):
                leftOn  = join['a'] + '.' + join['key'][0]
                rightOn = join['b'] + '.' + join['key'][1]
            else:
                leftOn  = join['a'] + '.' + join['key']
                rightOn = join['b'] + '.' + join['key']
            # TODO: not always left join are all consecutive :(

            finalResult = join['result']
            print ('\n\tJOINING', join['type'], leftOn, rightOn)
            tables[finalResult] = pd.merge( a, b, left_on=leftOn, right_on=rightOn, how=join['type'], sort=False )

    def output( self ):
        return luigi.LocalTarget( "data/combinedDataFrame.pkl" )
