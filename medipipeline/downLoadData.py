import json
from sqlalchemy import create_engine
import pickle
import datetime
import luigi
import pandas as pd

class DownLoadData( luigi.Task ):

    start_day_to_be_downloaded = luigi.Parameter()
    end_day_to_be_downloaded   = luigi.Parameter()

    def run( self ):
        try:
            # load DB configuration file
            config = json.load( open('config.json') )

            # connect to DB
            self.connectToDB(config["source"])
        except Exception as e:
            print(e)

        # define timespan
        start_day = self.start_day_to_be_downloaded.replace('-', '')  # starting day
        end_day   = self.end_day_to_be_downloaded.replace('-', '')    # end day

        queries = {
            # download ultime RILEVAZIONI
            "rilevazioni": "SELECT * FROM rilevazioni WHERE data >= " + start_day + " AND data <= " + end_day,
        }

        # "SELECT * FROM xxxx" queries
        selectAllQueries = [

            # tabelle legate alle rilevazioni
            "anagraficaprd",
            "articoli",
            "imballo",
            "esposizione",
            "provenienza",
            "zonefao",
            "package",
            "reparto",

            # tabelle legate ai prodotti
            "classificazione",
            "calibri",
            "produttore",
            "brand",
            "stagionatura",

            # tabelle legate ai punti vendita
            "anagraficapv",
            "tppuntovend",
            "insegna",
            "comuni",
            "province",
            "regioni",
            "zone"
        ]
        for q in selectAllQueries:
            queries[q] = "SELECT * FROM " + q

        # here we will store queries' results as pandas dataframes
        tables = {}
        print("1")
        # run queries
        for name, query in queries.items():
            try:
                print ("Running query:", query)
                results = self.queryDB( query )
                tables[name] = pd.DataFrame(results)
            except Exception as e:
                print(e)

        # add external tables
        # TODO: write adapters
        tables['piazze']                = pd.read_csv("assets/piazze.csv", sep=";")
        tables['provenienze_pesce']     = pd.read_csv("assets/provenienze_pesce.csv", sep=";")
        tables['descrizione_bis_carne'] = pd.read_csv("assets/descrizione_bis_carne.csv", sep=";")
        tables['areenielsen']           = pd.read_csv("assets/areenielsen.csv", sep=";")
        #################

        # correct files encoding from utf-8 to latin-1, because the db is encoded al latin-1
        for table in ['piazze', 'provenienze_pesce', 'descrizione_bis_carne']:
            df = tables[table]
            #for col in df.columns:
            #    if df[col].dtype == 'object':
            #        df[col] = df[col].str.decode('utf-8').str.encode('latin-1')

        # save as CSV
        for tableName, dataFrame in tables.items():
            print (tableName)
            tables[tableName].to_csv("data/" + tableName + ".csv", index=False)

        # save as pickle
        with open(self.output().fn, 'wb') as f:
            pickle.dump(tables, f, protocol=pickle.HIGHEST_PROTOCOL)

    def connectToDB( self, s ):
        dbAddress = s["type"] + '://' + s["user"] + ':' + s["password"] + '@' + s["host"] + '/' + s["db"]
        self.engine = create_engine(dbAddress)

    def queryDB( self, query ):
        data = []
        for row in self.engine.execute(query):
            data.append( dict(row) )
        return data

    def output( self ):
        return luigi.LocalTarget("data/separatedDataFrames.pkl")
