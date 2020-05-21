import os
import glob
import csv
import json
import shutil
import time
import pandas as pd
import sqlalchemy


def reEncodeDataframe(df):
    for col in df.columns:
        if df[col].dtype == 'object':
            print '\t re-encode', col
            df[col] = df[col].map(reEncode)#df[col].str.decode('iso-8859-1').str.encode('utf-8')
            print '\t done re-encode', col
    return df


def reEncode(d):
    if pd.isnull(d):
        return ''
    else:
        return unicode(d, 'iso-8859-1')

def fixProvenienza(x):
    provenienzaIsempty = pd.isnull(x["Provenienza"]) or (x["Provenienza"] == "")
    if (x["Reparto"] == "Ortofrutta") and provenienzaIsempty:
        return "Italia"
    else:
        return x["Provenienza"]


def fixAreaProv(x):
    prov = x['Area provenienza']
    if x["Reparto"] == "Carne":
        prov = x["Nato in"]
    if x["Reparto"] in ["Gastronomia", "Ortofrutta"]:
        prov = x["Provenienza"]
    return prov

def fixBio(x):
    if x == '':
        return 'non bio'
    else:
        return x


if __name__ == '__main__':

    # load configuration file
    config = json.load( open('config.json') )

    outputFileDestination  = config["export"]["outputFileDestination"]
    cleanFileFolder = config["export"]["outputFolderFromOperator"]
    cleanFile   = glob.glob(cleanFileFolder + '*.csv')

    # check if there is a clean csv
    if len(cleanFile) == 1:
        cleanFile = cleanFile[0]

        # check last modification
        now                     = time.time()
        lastModification        = os.path.getmtime(cleanFile)
        lastModificationSeconds = now - lastModification
        lastModificationMinutes = lastModificationSeconds / 60

        # if modified more than x minutes ago
        print "Passed", lastModificationMinutes, "minutes from last modification."
        if lastModificationMinutes < config["listener"]["maxMiutesFromLastModification"]:

            # export data to DB
            print '...updating!'

            # prepare engine
            print 'preparing sql engine'
            engine = sqlalchemy.create_engine('sqlite:///' + outputFileDestination)
            print 'engine ready'

            # read csv and convert to utf-8
            df = pd.read_csv(cleanFile, sep=';', decimal='.', low_memory=False)
            print 're-encoding csv rilevaz'
            df = reEncodeDataframe(df)
            print 'done re-encoding'

            ##############
            # data fixes #
            ##############

            new_column_names = {
                'PROMO':'Promozione',
                'Descrizione bis': 'Descrizione P.C.'
            }
            df.rename(columns=new_column_names, inplace=True)

            print('fixing Provenienza Ortofrutta')
            df['Provenienza'] = df.apply(fixProvenienza, axis=1)

            print('fixing Area provenienza')
            df["Area provenienza"] = df.apply(fixAreaProv, axis=1)

            print('fixing Biologico')
            df['Biologico'] = df['Biologico'].map(fixBio)

            ##################
            # end data fixes #
            ##################

            # save rilevazioni to db
            print 'save rilevaz to db'
            df.to_sql('rilevazioni', engine, if_exists='replace', chunksize=5000)
            print 'done'

            # add also additional tables
            df = pd.read_csv('data/puntivendita.export.csv', sep=';')
            df = reEncodeDataframe(df)
            df.to_sql('puntivendita', engine, if_exists='replace', chunksize=5000)

            print "=== DONE ==="

        else:
            print "...aborting."

    else:
        print "Listener error: there must be exactly 1 clean csv. Aborting."

