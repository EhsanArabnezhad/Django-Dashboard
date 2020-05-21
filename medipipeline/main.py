import glob
import datetime
import time
import luigi
import os
import shutil
import json
from exportReport import ExportReport

def cleanPipeline(debug):

    if debug:
        # choose which step to delete. For debugging use
        #cleanFolder('data/separatedDataFrames.pkl') # Download
        cleanFolder('data/combinedDataFrame.pkl')   # Combine / Join
        cleanFolder('data/enrichedDataFrame.pkl')   # Enrich
        cleanFolder('data/checkedDataFrame.pkl')    # Check
        cleanFolder('data/exportDataFrame.pkl')     # Final
    else:
        # delete all data for total refresh. For production use
        cleanFolder('data/*')                       # CLEAN ALL
    pass

def cleanFolder(regex):
    files2remove = glob.glob(regex)
    for f in files2remove:
        os.remove(f)

if __name__ == '__main__':

    # load configuration file
    config = json.load( open('config.json') )

    # clean end-user outputs
    cleanFolder('yet_to_clean/*')

    # will download data from the week preceding this day
    days_in_total   = 30
    period_duration = 15
    today           = datetime.date.today()  # today date
    start_day       = today - datetime.timedelta(days=days_in_total - 1)
    end_day         = start_day + datetime.timedelta(days=period_duration - 1)

    for period in range(int(days_in_total/period_duration)):

        print ('\n\n====== DOWNLOADING PERIOD', start_day, 'to', end_day, '=======')

        # Remove produced file (for debugging purposes or refreshing the pipe)
        cleanPipeline(config['debug'])

        # Launch pipeline
        luigi_params = [
            "--local-scheduler",
            "--no-lock",    # important to avoid pid lock when running luigi several times!
            "--DownLoadData-start-day-to-be-downloaded=" + str(start_day),
            "--DownLoadData-end-day-to-be-downloaded="   + str(end_day)
        ]
        # cmdline_args=luigi_params,
        luigi.run( luigi_params, main_task_cls=ExportReport )

        # Copy output csv in the "to get clean folder"
        shutil.copyfile('clean/rilevazioni.export.csv', 'yet_to_clean/rilevazioni.' + str(start_day) + '--' + str(end_day) + '.export.csv')

        # update time interval
        start_day += datetime.timedelta(days=period_duration)
        end_day   += datetime.timedelta(days=period_duration)


