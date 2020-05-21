import json
import pickle
import datetime
import luigi
import pandas as pd
import pprint
import numpy as np
from enrichData import EnrichData

class CheckData( luigi.Task ):

    def requires( self ):
        return EnrichData()

    def run( self ):

        # open dataframes
        df = pd.read_pickle(self.input().fn)

        # TODO: this should be generalized
        #dfRilevazioni = df["rilevazioni"]

        # run checks
        #check = PrezziSanityCheck(dfRilevazioni)
        #dfRilevazioni = check.run()

        # keep only latest data
        #puntiVendita = dfRilevazioni['Data'].groupby(dfRilevazioni['Punto vendita']).max()
        #ultimaRilevazionePerPuntoVendita =  dict(puntiVendita)
        #for pdv, data in ultimaRilevazionePerPuntoVendita.items():
        #    mask = dfRilevazioni[ (dfRilevazioni['Punto vendita'] == pdv) & (dfRilevazioni['Data'] != data) ].index
        #    dfRilevazioni.drop(mask, inplace=True)

        #df["rilevazioni"] = dfRilevazioni

        # save
        with open(self.output().fn, 'wb') as f:
            pickle.dump(df, f, protocol=pickle.HIGHEST_PROTOCOL)

    def output( self ):
        return luigi.LocalTarget( "data/checkedDataFrame.pkl" )



class SanityCheck():

    def __init__(self, dataframe, alert_column_name='alert'):

        # store reference to dataframe
        self.df = dataframe

        # add columns to store alerts
        self.add_alert_columns(alert_column_name)


    def add_alert_columns(self, alert_column_name):

        self.alert_column_name     = alert_column_name
        self.alert_why_column_name = alert_column_name + '_why'

        # add a column for alert value and note
        self.df[self.alert_column_name]     = 0
        self.df[self.alert_why_column_name] = ''

    def run(self):

        self.populate_cache()

        # row checks
        self.df = self.df.apply(self.row_checks, axis=1)

        # column check
        # TODO: column checks

        return self.df


class PrezziSanityCheck(SanityCheck):

    def populate_cache(self):

        self.cache = {}
        self.dimensions = ['Grammatura', 'Prezzo', 'Prezzo al Kg']
        self.groupByCol = 'Descrizione'

        # precompute average and standard deviation for every important dimension
        for dim in self.dimensions:
            self.cache[dim] = {}
            groupByColumn   = self.df[ self.groupByCol ]
            groupedDim      = self.df[dim].replace([np.inf, -np.inf], np.nan).dropna().groupby(groupByColumn)
            self.cache[dim]['mean'] = dict( groupedDim.mean() )
            self.cache[dim]['std']  = dict( groupedDim.std() )

        #pprint.pprint(self.cache['Prezzo al Kg'])

    def row_checks(self, record):

        self.check_dimensions(record)
        self.check_grammatura(record)
        return record

    def check_dimensions(self, record):

        for dim in self.dimensions:
            self.check_dimension(record, dim)

    def check_dimension(self, record, dimension):

        group         = record[self.groupByCol]
        value         = record[dimension]

        if group in self.cache[dimension]['mean']:
            mean = self.cache[dimension]['mean'][group]
        else:
            mean = 0

        if group in self.cache[dimension]['std']:
            std = self.cache[dimension]['std'][group]
        else:
            std = 0

        if (std == 0) or np.isnan(std):
            zeta_point = 0
        else:
            zeta_point = ( float(value) - mean )  / std

        if np.isinf(zeta_point):
            zeta_point_hr = 'inf'
        elif np.isnan(zeta_point):
            zeta_point_hr = 'nan'
        else:
            zeta_point_hr = str( int(zeta_point * 100 ) )

        if( abs(zeta_point) > 2 ):
            if dimension == 'Prezzo al Kg':
                record[self.alert_column_name] += zeta_point
            record[self.alert_why_column_name] += ' [' + dimension + ': ' + zeta_point_hr + ']'

    def check_grammatura(self, record):

        if record['Grammatura'] < 10:
            record[self.alert_why_column_name] += ' [Grammatura < 10g]'














