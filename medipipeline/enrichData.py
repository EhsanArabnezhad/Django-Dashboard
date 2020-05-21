import os
import time
import json
import pickle
import datetime
import luigi
import pandas as pd
import numpy as np
from copy import deepcopy
from combineData import CombineData
from utility import apply_optimized_output_series, memory_usage

class EnrichData( luigi.Task ):

    def requires( self ):
        return CombineData()

    def run( self ):

        finalRenaming = {
            "rilevazioni" : {
                "classificazione.des"                   : "Categoria Merceologica",
                "rilevazioni.data"                      : "Data",
                "rilevazioni.codril"                    : "ID",
                "rilevazioni.agrbio"                    : "Biologico",
                "rilevazioni.note"                      : "Note di rilevazione",
                "rilevazioni.prezzo"                    : "Prezzo",
                "rilevazioni.umis"                      : "Grammatura",
                "rilevazioni.refrig"                    : "Refrigerato",
                "rilevazioni.ps_cattura"                : "Cattura",
                "rilevazioni.offerta"                   : "PROMO",
                "rilevazioni.cr_formato"                : "Formato",
                "rilevazioni.cmlt"                      : "Centimetri lineari",
                "rilevazioni.gs_sigla"                  : "Sigla",
                "rilevazioni.cr_filiera"                : "Tipo produttore",
                "anagraficaprd.des"                     : "Descrizione",
                "descrizione_bis_carne.descrizione_bis" : "Descrizione bis",
                "puntivendita.des"                      : "Punto vendita",
                "tppuntovend.des"                       : "Tipo punto vendita",
                "insegna.des"                           : "Insegna",
                "regioni.des"                           : "Regione",
                "areenielsen.nielsen"                   : "Area Nielsen",
                "piazze.REGIONE"                        : "Regione piazza",
                "piazze.PIAZZA"                         : "Piazza",
                "package.des"                           : "Packaging",
                "reparto.des"                           : "Reparto",
                "provenienza.des"                       : "Provenienza",
                "provenienza_cr_natoin.des"             : "Nato in",
                "provenienza_cr_all1.des"               : "Allevato in",
                "provenienza_cr_mac_in.des"             : "Macellato in",
                "provenienza_cr_sez_in.des"             : "Sezionato in",
                "zonefao.des"                           : "Provenienza FAO",
                "calibri.des"                           : "Calibro",
                "stagionatura.des"                      : "Stagionatura",
                "produttore.des"                        : "Produttore",
                "brand.des"                             : "Brand"
            },
            "puntivendita" : {
                "puntivendita.des"   : "Nome",
                "puntivendita.cap"   : "Cap",
                "puntivendita.indi"  : "Indirizzo",
                "puntivendita.lati"  : "Lat",
                "puntivendita.longi" : "Lon",
                "tppuntovend.des"    : "Tipo punto vendita",
                "insegna.des"        : "Insegna",
                "zone.des"           : "Zona",
                "comuni.des"         : "Comune",
                "province.des"       : "Provincia",
                "regioni.des"        : "Regione",
                "areenielsen.nielsen": "Area Nielsen",
                "piazze.REGIONE"     : "Regione piazza",
                "piazze.PIAZZA"      : "Piazza",
            }
        }

        # open dataframes
        dfs = pd.read_pickle(self.input().fn)

        # recoding
        for dfName, df in dfs.iteritems():

            # rename columns
            columnNames = finalRenaming[dfName]
            df.rename(columns=columnNames, inplace=True)

            #######################
            ### enrich/recodify ###
            #######################
            print ('ENRICHING', dfName)


            if(dfName == 'rilevazioni'):    # TODO: this is ugly

                # Delete special chars from textual fields (they make difficult parsing csv files)
                print ('\t\t escaping ambiguous characters')
                def escapeTextForCSV(text):
                    if pd.isnull(text):
                        return ''
                    else:
                        return text.translate(None, ',:;"')
                for textualField in ["Descrizione", "Descrizione bis", "Note di rilevazione"]:
                    dfs[dfName][textualField] = dfs[dfName][textualField].map(escapeTextForCSV)


                # Grammatura come intero
                dfs[dfName]["Grammatura"] = dfs[dfName]["Grammatura"].map(int)


                # Prezzo al kg
                print ('\t\t enriching prezzo al Kg')
                def prezzoAlKg(x):

                    if(x["Grammatura"] == 0):
                        prezzoKg = x["Prezzo"]
                    else:
                        prezzoKg = x["Prezzo"] * (1000.0 / x["Grammatura"])

                    return round(prezzoKg, 2)

                dfs[dfName]["Prezzo al Kg"] = apply_optimized_output_series( dfs[dfName], prezzoAlKg )


                # Round price
                def roundPrice(x):
                    return round(x, 2)
                dfs[dfName]["Prezzo"]       = dfs[dfName]["Prezzo"].map(roundPrice)


                # Fascia grammatura
                print ('\t\t enriching grammatura')
                def fasciaGrammatura(x):
                    if x==1000:
                        return 'al Kg'
                    elif x < 301:
                        return '0-300g'
                    elif x < 601:
                        return '301-600g'
                    elif x < 1000:
                        return '601-999g'
                    elif x < 1501:
                        return '1001-1500g'
                    elif x < 3001:
                        return '1501-3000g+'
                    elif x < 100000:
                        return '3001+'
                    else:
                        return ''
                dfs[dfName]["Fascia grammatura"] = dfs[dfName]["Grammatura"].map(fasciaGrammatura)

                # Al pezzo or not
                def pezzoOrNot(x):
                    if x != 1000:
                        return "al pezzo"
                    else:
                        return ""
                dfs[dfName]["Al pezzo"] = dfs[dfName]["Grammatura"].map(pezzoOrNot)

                # Refrigerato reduce to "Refrigerato" vs ""
                print ('\t\t enriching refrigerazione')
                def refrigeratoOrNot(x):
                    if x["Reparto"] == "Ortofrutta":
                        if x["Refrigerato"] == 1:
                            refrigerato = "Refrigerato"
                        if x["Refrigerato"] == 0:
                            refrigerato = "Non Refrigerato"
                    elif x["Reparto"] == "Pesce":
                        if x["Refrigerato"] == 1:
                            refrigerato = "Decongelato"
                        if x["Refrigerato"] == 0:
                            refrigerato = "Fresco"
                    else:
                        refrigerato = ""

                    return refrigerato

                dfs[dfName]["Refrigerato"] = apply_optimized_output_series(dfs[dfName], refrigeratoOrNot)

                # PROMO reduce to "promo" vs "non in promo"
                def promoOrNot(x):
                    if x==1:
                        return 'promo'
                    else:
                        return 'non in promo'
                df["PROMO"] = df["PROMO"].map(promoOrNot)

                # BIO
                def bioOrNot(x):
                    if x==1:
                        return 'bio'
                    else:
                        return ''
                df["Biologico"] = df["Biologico"].map(bioOrNot)

                # Formato famiglia vs. standard
                def formatoFamigliaOrStandard(x):
                    if x==1:
                        return 'famiglia'
                    else:
                        return 'standard'
                dfs[dfName]["Formato"] = dfs[dfName]["Formato"].map(formatoFamigliaOrStandard)

                # Cattura
                print ('\t\t enriching cattura')
                def pescatoOrNot(x):
                    cattura = ''
                    if x["Reparto"]=="Pesce":
                        if x["Cattura"] == 1:
                            cattura = 'Pescato'
                        else:
                            cattura = 'Allevato'
                    return cattura
                dfs[dfName]["Cattura"] = apply_optimized_output_series(dfs[dfName], pescatoOrNot)

                # Tipo produttore
                print ('\t\t enriching produttore')
                def tipoProduttore(x):
                    if x["Tipo produttore"] == 1 or pd.isnull(x["Produttore"]):
                        return "Marchio"
                    else:
                        return "Industria"
                dfs[dfName]["Tipo produttore"] = apply_optimized_output_series(dfs[dfName], tipoProduttore)

                # Packaging carne
                def packagingRecode(x):
                    if x["Reparto"]=="Carne" and x["Packaging"] == "Sottovuoto":
                        return "Skin"
                    return x["Packaging"]
                dfs[dfName]["Packaging"] = apply_optimized_output_series(dfs[dfName], packagingRecode)


                # Tipo packaging
                print ('\t\t enriching packaging')
                def tipoPackaging(x):
                    if x in ['Sfuso', 'Mazzo', 'Film']:
                        return 'Sfuso'
                    if x in ['Cestino / Vaschetta', 'Cestino / Vaschetta peso variabile', 'Vassoio', 'Vassoio peso variabile']:
                        return 'Cestino / Vassoio'
                    if x in ['Rete', 'Sacchetto']:
                        return 'Rete / Sacchetto'
                    if x in ['Busta', 'Sottovuoto', 'Skin']:
                        return 'Busta / Sottovuoto / Skin'
                    return ''

                dfs[dfName]["Tipo packaging"] = dfs[dfName]["Packaging"].map(tipoPackaging)


                # fattore k
                k_factor = pd.read_csv("assets/fattore_k.csv", sep=";")
                k_factor["k_packaging"].fillna('', inplace=True)
                k_factor_extended = []
                for k_record in k_factor.to_dict(orient='records'):
                    if k_record["k_packaging"] == "Cestino / Vassoio o Busta / Sottovuoto / Skin":

                        k_record_cestino = deepcopy(k_record)
                        k_record_cestino["k_packaging"] = "Cestino / Vassoio"
                        k_factor_extended.append(k_record_cestino)

                        k_record_busta = deepcopy(k_record)
                        k_record_busta["k_packaging"] = "Busta / Sottovuoto / Skin"
                        k_factor_extended.append(k_record_busta)

                    else:
                        k_factor_extended.append(k_record)

                k_factor_indexed = {}
                for k_record in k_factor_extended:
                    k_record_index = k_record["Descrizione"] + k_record["k_packaging"]
                    k_factor_indexed[k_record_index] = k_record

                def assign_k_factor(x):

                    k_index = x["Descrizione"]
                    if x["Reparto"] == "Ortofrutta":
                        if not pd.isnull(x["Tipo packaging"]):
                            k_index += x["Tipo packaging"]

                    if k_index in k_factor_indexed:
                        k = k_factor_indexed[k_index]["k"]
                    else:
                        k = 1

                    return k

                dfs[dfName]["k"] = apply_optimized_output_series(dfs[dfName], assign_k_factor)


                # Provenienze del pesce
                print ('\t\t enriching provenienze')
                def provenienzaPesce(x):

                    provenienza = x["Provenienza"]

                    if x["Reparto"] != "Pesce":
                        # raggruppiamo Provenienza solo per il pesce
                        return ''
                    else:
                        provenienzePesceDefaults = {
                            "FAO 27"      : "Oceano Atlantico Nord Orientale",
                            'FAO 27.III.d': "Oceano Atlantico Nord Orientale",
                            "FAO 34"      : "Oceano Atlantico Centro Orientale",
                            "FAO 37.1"    : "Mar Mediterraneo",
                            "FAO 37.2"    : "Mar Mediterraneo",
                            "FAO 37.3"    : "Mar Mediterraneo",
                            "FAO 41"      : "Oceano Atlantico Sud Occidentale",
                            "FAO 67"      : "Oceano Atlantico Nord Orientale",
                            "FAO 77"      : "Oceano Pacifico",
                            "FAO 87"      : "Oceano Pacifico",
                            "FAO 88"      : "Oceano Pacifico",
                            "FAO 18"      : "Mar Glaciale Artico",
                            "FAO 21"      : "Oceano Atlantico Nord Occidentale",
                            "FAO 31"      : "Oceano Atlantico Centro Occidentale",
                            "FAO 47"      : "Oceano Atlantico Sud Orientale",
                            "FAO 48"      : "Oceano Atlantico Sud Occidentale",
                            "FAO 37.4"    : "Mar Mediterraneo",
                            "FAO 51"      : "Oceano Indiano",
                            "FAO 57"      : "Oceano Indiano",
                            "FAO 58"      : "Oceano Indiano",
                            "FAO 61"      : "Oceano Pacifico",
                            "FAO 71"      : "Oceano Pacifico",
                            "FAO 81"      : "Oceano Pacifico"
                        }

                        provenienzaBis  = ""
                        provenienzaTris = ""
                        if pd.isnull(provenienza):
                            zonaFao = x["Provenienza FAO"]
                            provenienzaBis = provenienzePesceDefaults[zonaFao]
                        else:
                            provenienzaBis = provenienza

                        # provenienze pesce ricodificate 2016/12/02
                        provenienzaTris = x["provenienze_pesce.des_Tris"]
                        if pd.isnull(provenienzaTris):
                            provenienzaTris = provenienzaBis

                        provenienza = provenienzaTris

                    return provenienza

                dfs[dfName]["Area provenienza"] = apply_optimized_output_series(dfs[dfName], provenienzaPesce)


                # Referenze - Flavio style
                print ('\t\t enriching referenze')
                def setReferenza(x):
                    referenza = ''
                    if x["Reparto"] == "Ortofrutta":
                        referenza = self.combineValuesAsString(x, ["Descrizione", "Fascia grammatura", "Tipo packaging", "Provenienza", "Calibro", "Biologico"])
                    if x["Reparto"] == "Carne":
                        referenza = self.combineValuesAsString(x, ["Descrizione bis", "Fascia grammatura", "Tipo produttore", "Formato", "Biologico"])
                    if x["Reparto"] == "Pesce":
                        referenza = self.combineValuesAsString(x, ["Descrizione", "Cattura", "Refrigerato", "Area provenienza", "Biologico"])
                    if x["Reparto"] == "Gastronomia":
                        referenza = self.combineValuesAsString(x, ["Descrizione", "Fascia grammatura", "Stagionatura", "Biologico"])   #, "Stagionatura", "Sigla"])
                    return referenza

                dfs[dfName]["Referenza"] = apply_optimized_output_series(dfs[dfName], setReferenza)


            if(dfName == 'puntivendita'):    # TODO: this is ugly
                pass


            if(dfName in ['rilevazioni', 'puntivendita']):    # TODO: this is ugly
                def intifyAndStringify(s, name):
                    if pd.isnull(s):
                        return ''
                    else:
                        return name + str( int(s) )
                dfs[dfName]['Piazza']         = dfs[dfName]['Piazza'].map(lambda x: intifyAndStringify(x, 'Piazza '))

        ##############################
        ## Select and order columns ##
        ##############################

        selectAndOrderColumns = {
            "rilevazioni": [
                "ID",
                "Reparto",
                "Categoria Merceologica",
                "Descrizione",
                "Descrizione bis",
                "Referenza",
                "Prezzo",
                "Al pezzo",
                "Grammatura",
                "Fascia grammatura",
                "Prezzo al Kg",
                "Calibro",
                "Note di rilevazione",
                "Punto vendita",
                #"Tipo punto vendita",
                #"Insegna",
                #"Regione",
                #"Area Nielsen",
                "Regione piazza",
                "Piazza",
                "PROMO",
                "Formato",
                "Biologico",
                "Sigla",
                "Stagionatura",
                "Refrigerato",
                "Packaging",
                "Tipo packaging",
                "Cattura",
                "Provenienza",
                "Area provenienza",
                "Nato in",
                "Allevato in",
                "Macellato in",
                "Sezionato in",
                "Provenienza FAO",
                "Produttore",
                "Tipo produttore",
                "Brand",
                "Centimetri lineari",
                "Data",
                "k",
            ],
            "puntivendita": [
                "Nome",
                "Cap",
                "Indirizzo",
                "Lat",
                "Lon",
                "Tipo punto vendita",
                "Insegna",
                "Zona",
                "Comune",
                "Provincia",
                "Regione",
                "Area Nielsen",
                #"Regione piazza",
                #"Piazza",
            ]
        }

        # select and rename column, then save CSV
        for dfName in dfs.keys():

            # select only interesting columns
            columnSelectionAndOrdering = selectAndOrderColumns[dfName]
            dfs[dfName] = dfs[dfName][columnSelectionAndOrdering]    # TODO: why it is not working on the reference?

            # save
            dfs[dfName].to_csv("data/" + dfName + ".enriched.csv", index=False)

        # save all dfs as one pickle
        with open(self.output().fn, 'wb') as f:
            pickle.dump(dfs, f, protocol=pickle.HIGHEST_PROTOCOL)

        print ('====== FINISH ======')


    def combineValuesAsString( self, x, keys):
        res = ''
        for k in keys:
            if (x[k] != '') and (x[k] != None) and (not pd.isnull(x[k])):
                res += str(x[k]) + ' '
        return res.strip()

    def output( self ):
        return luigi.LocalTarget( "data/enrichedDataFrame.pkl" )
