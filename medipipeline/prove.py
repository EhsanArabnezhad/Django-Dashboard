
from sqlalchemy import create_engine
import json

def connectToDB( s ):
    dbAddress = s["type"] + '://' + s["user"] + ':' + s["password"] + '@' + s["host"] + '/' + s["db"]
    return create_engine(dbAddress)

def query(query_string):
    result = []
    for row in engine.execute(query_string):
        print row, '\n'
        result.append(row)
    return result


if __name__ == '__main__':
    config    = json.load( open('config.json') )
    engine = connectToDB(config["source"])
    
    query_string = 'SELECT DISTINCT `codcla` FROM `anagraficaprd`'
    print query(query_string)
