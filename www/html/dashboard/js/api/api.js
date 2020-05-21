var utils = require('./../utils/utility')

var Api = function(serverURL, username, password){
    this.serverURL = serverURL
    this.cache     = {} // this obj will store requested data in order to avoid repeating calls
    this.username  = username
    this.password  = password
}

Api.prototype.get = function(endpoint, params, callback){

    var api = this

    // overwrite endpoint and load local data (demo purposes)
    if(config.fakeData){
        this.serverURL = 'data/'
        endpoint += '.export.csv'
    } else {
        // endpoint need a final trailing slash
        if(endpoint[endpoint.length-1] != '/'){
            endpoint += '/'
        }
    }

    // "params" may be omitted. In that case the second argument is the callback funcion
    if( _.isFunction(params) ){
        callback = params
        params   = {}
    }

    var cacheAddress = endpoint + JSON.stringify(params)
    if( _.has(api.cache, cacheAddress) ){

        // retrieve data from cache
        //console.log('using cache entry', cacheAddress)
        var cacheData = api.cache[cacheAddress]
        callback(cacheData)

    } else {

        // make ajax call (should be GET but I used POST to have a better JSON params handling)
        //console.log('asking', endpoint, params)

        if(config.fakeData){
            d3.csv(this.serverURL + endpoint, function(res){

                // clean data
                var data = api.cleaning(res, endpoint)

                // select data (the endpoint will do it automatically,but not the csv)
                data = _.where(data, params)

                // precompute metadata
                //var metadata = api.metadatation(data)

                var reply = {
                    data     : data,
                    //metadata : metadata
                }

                // store data and meta in cache
                //api.setCache(endpoint, params, reply)

                // run user defined callback
                callback(reply)
            })
        } else {

            var basicAuth = this.getBaseAuth()

            $.ajax({
                url         : this.serverURL + endpoint,
                type        : "POST",
                data        :  JSON.stringify(params),      // this is easy :)
                contentType : "application/json; charset=utf-8",
                dataType    : "json",
                beforeSend: function (request){
                    request.setRequestHeader('Authorization', basicAuth)
                },
                success     : function(res){
                    // clean data
                    var data = api.cleaning(res, endpoint)

                    // precompute metadata
                    //var metadata = api.metadatation(data)

                    var reply = {
                        status   : 200,
                        data     : data,
                        //metadata : metadata
                    }

                    // store data and meta in cache
                    api.setCache(endpoint, params, reply)

                    // run user defined callback
                    callback(reply)
                },
                error       : function(data){
                    // something went wrong. Report status code and response
                    console.error(data)
                    callback({
                        status: data.status,
                        data  : data
                    })
                }
            })
        }
    }
}

Api.prototype.cleaning = function(data, endpoint){

    if(endpoint != 'uniquevalues/') {    // TODO: find a better way to manage endpoint-specific data cleaning

        _.each(data, function(d, i){

            // throw away apostrophes
            if(_.has(d, 'Descrizione') && d['Descrizione']){
                d['Descrizione']        = d['Descrizione'].replace("'", " ")
            }

            // useful for counting routines
            d['Count'] = 1

            // parse important nums
            d['Prezzo al Kg']       = +d['Prezzo al Kg']
            d['Centimetri lineari'] = +d['Centimetri lineari']

            // TODO IMPORTANT: not efficient, better to manage null values in a different way
            _.each(d, function(v,k){
                if( d[k] == null ){
                    d[k] = ""
                }
            })
        })
    }

    return data
}

// TODO: this is going to be moved server-side or pipeline-side
Api.prototype.metadatation = function(data){

    var metadata = {
        'columns': {}
    }

    // find nominal vars
    var nominalVariables = utils.getNominalVariables(data)

    // find unique values for nominal vars (useful for select boxes)
    _.each(data, function(d, i){
        _.each(nominalVariables, function(k){
            if(i==0){
                metadata.columns[k] = {
                    uniqueValues: []
                }
            }
            metadata.columns[k].uniqueValues.push(d[k])
        })
    })
    _.each(metadata.columns, function(v,k){
        metadata.columns[k].uniqueValues = _.unique(metadata.columns[k].uniqueValues)
    })

    return metadata
}

Api.prototype.setCache = function(endpoint, params, data){
    var cacheAddress = endpoint + JSON.stringify(params)
    this.cache[cacheAddress] = data
}

Api.prototype.getBaseAuth = function() {
    var tok = this.username + ':' + this.password
    var hash = btoa(tok)
    return "Basic " + hash
}

module.exports = Api
