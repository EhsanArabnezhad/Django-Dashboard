var deepcopy = require('deepcopy')
var moment   = require('moment')

module.exports = {

    simplifyWidgetControls: function(widgetControls){

        var simplifiedControls = {}
        _.each(widgetControls, function(ctrl){
            var variable = ctrl.label
            _.each(ctrl.options, function(opt){
                if(opt.selected && opt.optionLabel != config.allKeyword){
                    simplifiedControls[variable] = [opt.optionLabel]
                }
            })
        })

        return simplifiedControls
    },

    transformControlsInApiQuery: function(controls){

        var query = {}
        _.each(controls, function(v,k){
            if( v && (v[0] !== config.allKeyword) ){
                query[k] = v[0]
            }
        })

        return query
    },

    format2Decimals: function(v){
        var formatter = d3.format(".2f")
        return formatter(v)
    },

    average: function(list){
        if(!list || list.length < 1){
            //console.warn("Warning: cannot average a null or empty array")
            return undefined
        }

        var count = 0.0
        var sum = _.reduce(list, function(memo, x){
            if( x && (!_.isNaN(x)) ){
                count++
                return memo + x
            } else {
                return memo
            }
        }, 0.0)

        return sum/count
    },

    averageDuplicates: function(objs, groupingField, averagingField){
        var utils       = this
        var groupedObjs = _.groupBy(objs, groupingField)
        return _.reduce(groupedObjs, function(memo, group){
            if(group.length == 1){
                memo.push(group[0])
            } else {
                var valuesToBeAveraged = _.pluck(group, averagingField)
                var averagedGroup  = deepcopy(group[0])
                averagedGroup[averagingField] = utils.average(valuesToBeAveraged)
                memo.push(averagedGroup)
            }
            return memo
        }, [])
    },

    getRandomColor: function(){
        return '#'+Math.floor(Math.random()*16777215).toString(16)
    },

    getColorFromPalette: function(n){
        var scale = d3.scale.category10().range()
        return scale[n]
    },

    getNominalVariables: function(data){

        var utils = this

        if(!data || data.length < 1){
            return []
        }

        var sample          = _.sample( data, Math.sqrt(data.length) )  // gather a sample of objects
        var stringsForVariable = {}  // we're gonna counting how mant strings there are in each attribute
        _.each(sample[0], function(v,k){
            stringsForVariable[k] = 0
        })

        _.each(sample, function(s){
            _.each(s, function(v,k){
                if( ! utils.isNumber(v)){
                    stringsForVariable[k]++
                }
            })
        })

        stringsForVariable = _.map(stringsForVariable, function(v,k){
            if( v > (sample.length*0.9) ){   // numbers must be at least 90% of values
                return k
            }
        })

        return _.filter(stringsForVariable, function(v){
            return v !== undefined
        })
    },

    isNumber: function(x){

        // take away empty spaces
        if( _.contains(x, " ") ){
            x = x.replace(/ /g, "")
        }

        // preliminary checks
        if( _.contains(["", null, undefined, NaN, Infinity, -Infinity], x) ){
            return false
        }

        // force conversion
        x = +x

        // forced conversion on letters leads to NaN
        if(_.isNaN(x)){
            return false
        }

        // final test
        return _.isNumber( +x )
    },

    titlizeObject: function(obj){
        var titlePieces = _.values(obj)
        return titlePieces.join(' - ')
    },

    getLatestTwoWeeksNumbers: function(){
        
        // now
        var today = moment()
        
        // find last friday
        if(today.weekday() >= 5) {
            var lastFriday = today.day(5)
        } else {
            var lastFriday = today.day(-2)
        }
        
        //console.log('last friday', lastFriday.format('DD-MM'), 'week', lastFriday.week() )
        
        if(lastFriday.week() % 2 == 1){
            lastFriday.subtract(1, 'week')
        }

        //console.log('last even friday', lastFriday.format('DD-MM'), 'week', lastFriday.week() )

        var startWeek = lastFriday.clone().subtract(2, 'weeks').week()
        var endWeek   = lastFriday.clone().subtract(1, 'weeks').week()

        //console.log('relevation weeks', startWeek, '-', endWeek)

        return startWeek + '-' + endWeek
    },

}
