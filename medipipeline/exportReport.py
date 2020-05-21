import luigi
import csv
import sqlalchemy
import pandas as pd
import pickle
from checkData import CheckData

class ExportReport( luigi.Task ):

    def requires( self ):
        return CheckData()

    def run( self ):

        dfs = pd.read_pickle(self.input().fn)

        for dfName in dfs:

            # take reference to a single dataframe
            df = dfs[dfName]

            # correct encoding
            #for col in df.columns:
            #    if df[col].dtype == 'object':
            #        df[col] = df[col].str.decode('latin-1').str.encode('utf-8')

            if dfName == "rilevazioni":

                # temporary filter TODO: take away this, it is API related
                # filtra per punto vendita
                #def allowedPdV(pdv):
                    # FILTRO PER PUNTO DI VENDITA
                    #pdvs = [
                    #    "ESSELUNGA BRESCIA - VIA VOLTA",
                    #    "AUCHAN CURNO",
                    #    "IPER SERIATE",
                    #    "IPERCOOP TREVIGLIO",
                    #    "COOP FOLIGNO",
                    #    "AUCHAN GIUGLIANO",
                    #]
                    #return (pdv in pdvs)
                #mask = df["Punto vendita"].map(allowedPdV)
                #df = df.loc[mask]

                # temporary filter TODO: take away this, it is API related
                # filtra per regione
                #def finalFilter(x):
                    # FILTRO PER REGIONE PIAZZA
                    #return x in [1,2,3,4,5]
                #mask = df["Regione piazza"].map(finalFilter)
                #df = df.loc[mask]

                # TODO: take away this
                #del df["Data"]
                #del df["Centimetri lineari"]

                pass

            fileName = 'data/' + dfName + '.export.csv'

            # Save as csv
            df.to_csv(fileName, index=False, sep=';', quoting=csv.QUOTE_NONE)

        # save all dfs as one pickle
        with open(self.output().fn, 'wb') as f:
            pickle.dump(dfs, f, protocol=pickle.HIGHEST_PROTOCOL)


    def output( self ):
        return luigi.LocalTarget( "data/exportDataFrame.pkl" )