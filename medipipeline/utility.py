import pandas as pd
import psutil
import os

# measure memory usage
def memory_usage():
    process = psutil.Process(os.getpid())
    mem_bytes = process.memory_info().rss
    return( float(mem_bytes)/1048576 )

# Substitute to pandas.apply, which has a memory leak.
# https://ys-l.github.io/posts/2015/08/28/how-not-to-use-pandas-apply/
def apply_optimized_output_series(dataFrame, function):

    rawSeries   = []

    for _, row in dataFrame.iterrows():
        processedRow = function(row)
        rawSeries.append(processedRow)

    return pd.Series(rawSeries)

if __name__ == '__main__':

    def someFunc(x):
        return x

    df = pd.DataFrame({
        'a': [1,2,3,4,5,6,7],
        'b': [7,6,5,4,3,2,1]
    })
    print (apply_optimized_output_series(df, someFunc))