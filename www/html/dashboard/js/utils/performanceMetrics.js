var utils = require('./utility')

var collectAveragePricePerCompetitor = function(competitors, competingReferences, competitorsVariableName){

    var piazzaPrices = {}

    // collect prices
    _.each(competitors, function(c){
        var competitorReferences = _.filter(competingReferences, function(r){
            return r[competitorsVariableName] == c
        })

        if(competitorReferences.length > 0){
            var competitorAveragePrice = 0.0
            _.each(competitorReferences, function(cr){
                competitorAveragePrice += cr["Prezzo al Kg"]
            })

            piazzaPrices[c] = competitorAveragePrice/competitorReferences.length
        }
    })

    return piazzaPrices
}

var geniusFormula = function(home, away){
    var mediaPiazza = (home+away)/2
    var genius = ( 200 * (home/mediaPiazza) ) - 100
    return Math.round(genius)
}

var easyFormula = function(home, away){
    return Math.round( away / home * 100)
}

module.exports = {

    basic: function(competitors, competingReferences, competitorsVariableName){

        var piazzaPrices = collectAveragePricePerCompetitor(competitors, competingReferences, competitorsVariableName)

        // get average price over competing references
        var priceValues = _.values(piazzaPrices)
        var priceAverage = utils.average(priceValues)

        // compute indexes
        var indexedPrices = {}
        _.each(piazzaPrices, function(p, c){
            var ip = (p/priceAverage) * 100
            indexedPrices[c] = Math.round(ip)
        })

        return indexedPrices

    },

    teamVsTeam: function(competitors, competingReferences, teamA, teamB, competitorsVariableName){

        var piazzaPrices = collectAveragePricePerCompetitor(competitors, competingReferences, competitorsVariableName)

        // get average price for team A
        var teamAprices = _.filter(piazzaPrices, function(p,c){
            return _.contains(teamA, c)
        })
        var teamAprices  = _.values(teamAprices)
        var teamAaverage = utils.average(teamAprices)

        // get average price for team B
        var teamBprices = _.filter(piazzaPrices, function(p,c){
            return _.contains(teamB, c)
        })
        var teamBprices  = _.values(teamBprices)
        var teamBaverage = utils.average(teamBprices)

        // compute indexes
        var indexes = {}
        _.each(piazzaPrices, function(p, c){
            if(_.contains(teamA, c)){
                indexes[c] = geniusFormula(teamAaverage, teamBaverage)
            } else {
                indexes[c] = geniusFormula(teamBaverage, teamAaverage)
            }
        })

        return indexes
    },

    oneVsTeam: function(competitors, competingReferences, team, competitorsVariableName){

        var piazzaPrices = collectAveragePricePerCompetitor(competitors, competingReferences, competitorsVariableName)

        // get average price for team
        var teamPrices = _.filter(piazzaPrices, function(p,c){
            return _.contains(team, c)
        })
        var teamPrices  = _.values(teamPrices)
        var teamAverage = utils.average(teamPrices)

        // compute indexes
        var indexes = {}
        _.each(piazzaPrices, function(p, c){
            //indexes[c] = geniusFormula(p, teamAverage)
            indexes[c] = easyFormula(p, teamAverage)
        })

        return indexes
    }

}
