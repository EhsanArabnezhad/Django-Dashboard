var React              = require('react')
var reduxConnect       = require('react-redux').connect
var FormControl        = require('react-bootstrap/lib/FormControl')
var FormGroup          = require('react-bootstrap/lib/FormGroup')
var ControlLabel       = require('react-bootstrap/lib/ControlLabel')
var Panel              = require('./Panel')
var Button             = require('react-bootstrap/lib/Button')
var exportExcel        = require('../utils/exportExcel')
var utils              = require('./../utils/utility')
var performanceMetrics = require('./../utils/performanceMetrics')
var deepCopy           = require('deepcopy')

var PivotTable = React.createClass({

    getInitialState: function(){
        // component state is initially empty
        return {}
    },

    fetchAndPrepareData: function(callback){

        // Merge local and page controls
        var query = _.extend({}, this.props.pageControls, this.props.filter)
        //console.log('pivot query', query)
        var component = this

        // get data (from network or cache)
        dashboard.API.get('rilevazioni', query, function(response){
            // filter and return data
            component.localData = response.data
            callback()
        })
    },

    componentDidMount: function(){
        this.buildPivot()
    },

    componentDidUpdate: function(){
        this.buildPivot()
    },

    buildPivot: function(){

        var component = this

        var teamA = []
        var teamB = []

        // run AJAX
        this.fetchAndPrepareData(function(){

            if(component.localData.length == 0){
                $(component.refs['pivot-element']).empty()
                return  // exit from function
            }

            var excludedVariables  = _.difference( _.keys(component.localData[0]), component.props.draggableVars )

            $(component.refs['pivot-element'])
                .empty()
                .pivotUI(
                    component.localData,
                    {
                        rows      : component.props.draggableY,
                        cols      : component.props.draggableX,
                        menuLimit : 5000,
                        unusedAttrsVertical: true,

                        // hook after table rendering
                        onRefresh: function(pivot){

                            ///////////////////////////////
                            // Assortimento %
                            if( pivot.aggregatorName == 'Assortimento %'){
                                var tableValues = []
                                var rowSpans     = []
                                var rowSkip      = 0    // to keep track of rowspan
                                // get numbers from the table, and the row spans for the first column
                                $('.pvtTable tbody tr').each(function(i,e){
                                    if(rowSkip==0){
                                        var rowSpan = $(e).find('th').first().attr('rowspan')
                                        if(rowSpan){
                                            rowSpans.push(+rowSpan)
                                            rowSkip += rowSpan
                                        }
                                    }
                                    rowSkip--

                                    var rowValues = $(e).find('td').map(function(){
                                        if(this.innerText == ''){
                                            return 0.0
                                        } else {
                                            return +this.innerText
                                        }
                                    }).toArray()
                                    tableValues.push(rowValues)
                                })

                                // group by span and compute percentages
                                var rowIndex = 0
                                var percentageValues = []
                                _.each(rowSpans, function(rSpan){
                                    // group rows by span
                                    var group = []
                                    for(var rs=0; rs<rSpan; rs++){
                                        group.push(tableValues[rowIndex])
                                        rowIndex++
                                    }
                                    // percentages
                                    var groupTotals = []
                                    _.each(group[0], function(gCell, gc){
                                        groupTotals.push(0.0)
                                        _.each(group, function(gGroup){
                                            groupTotals[gc] += gGroup[gc]
                                        })
                                    })
                                    _.each(group, function(gRow, gr){
                                        _.each(gRow, function(gCell, gc){
                                            var percentage = group[gr][gc] / groupTotals[gc]
                                            if(!_.isNaN(percentage)){
                                                group[gr][gc] = '' + Math.round(percentage*100) + '%'
                                            } else {
                                                group[gr][gc] = ''
                                            }
                                        })
                                    })
                                    percentageValues.push(group)
                                })

                                // put numbers back into table
                                var flatValues = _.flatten(percentageValues)
                                $('.pvtTable tbody td').each(function(i,e){
                                    $(e).text(flatValues[i])
                                })
                            }

                            //////////////////////////////////
                            // Indici
                            $('.pvtTeamSelector').remove()
                            var competitionVariable = pivot.cols[0]
                            // if Indice a squadre, we need to show the widget
                            $('.pvtTeamSelector').remove()
                            if( pivot.aggregatorName == 'Indice a squadre' || pivot.aggregatorName == 'Indice 1 vs competitor'){

                                var htmlTemplate = ''
                                var allPuntiVendita = _.unique(_.map(component.localData, function(d){
                                    return d[competitionVariable]
                                }))

                                _.each(allPuntiVendita, function(pv){
                                    var isTeamA = ''
                                    var isTeamB = ''
                                    if(_.contains(teamA, pv)){
                                        isTeamA = 'checked'
                                    }
                                    if(_.contains(teamB, pv)){
                                        isTeamB = 'checked'
                                    }

                                    if(pivot.aggregatorName == 'Indice a squadre'){
                                        htmlTemplate += '<input class="teamA" type="checkbox" name="' + pv + '" ' + isTeamA +'></input>'
                                    }

                                    htmlTemplate += '<div class="teamEl">' + pv + '</div>'
                                        + '<input class="teamB" type="checkbox" name="' + pv + '"' + isTeamB +' ></input>'

                                    htmlTemplate += '<br/>'
                                })

                                $('<div>')
                                    .addClass('pvtTeamSelector')
                                    .html(htmlTemplate)
                                    .click(function(){
                                        teamA = []
                                        teamB = []
                                        $('.pvtTeamSelector input[type="checkbox"]:checked').each(function(i, el){
                                            var pvName  = $(el).attr('name')
                                            var isTeamA = $(el).hasClass('teamA')
                                            if(isTeamA){
                                                teamA.push(pvName)
                                            } else {
                                                teamB.push(pvName)
                                            }
                                        })

                                        // refresh pivot
                                        $(component.refs['pivot-element'])
                                            .empty()
                                            .pivotUI(
                                                component.localData,
                                                pivot
                                            )
                                    })
                                    .appendTo('.pvtVals')

                            } else {
                                $('.pvtTeamSelector').remove()
                            }

                            /////////////////////
                            // Totals
                            // move totals up
                            var colTotals = $('.pvtTable tr').last()
                            colTotals.find('td').css({
                                'text-align' : 'center',
                                'background-color': '#fafafa',
                                'border': '1px solid #CDCDCD'
                            })
                            colTotals.insertBefore( $('.pvtTable tr').first())

                            if( pivot.aggregatorName.indexOf("Indice ") != -1 ){

                                // delete row totals
                                $('.rowTotal').text("")
                                $('.pvtGrandTotal').text("")

                                // compute totals after table rendering, otherwise it would be a nightmare.
                                var numCols = colTotals.find('td').length
                                colTotals.find('td').each(function(i, el){
                                    if(i < numCols-1) {
                                        var colValues = []
                                        $('.pvtTable .pvtVal.col' + i).each(function(c, cell){
                                            var cellText = $(cell).text()
                                            if(cellText != ""){
                                                colValues.push( +cellText )
                                            }
                                        })

                                        var avg = utils.average(colValues)
                                        avg     = Math.round(avg)
                                        avg     = utils.format2Decimals(avg)
                                        $(el).text(avg)
                                    }
                                })
                            }
                        },

                        //////////////////////
                        // Aggregators (aka metrics)
                        aggregators: {

                            'Prezzo/Kg': function(attributes){
                                return function(data, rowKey, colKey){

                                    return {
                                        sum  : 0.0,
                                        count: 0.0,
                                        push : function(record) {
                                            if(record['Prezzo al Kg']){
                                                this.sum      += record['Prezzo al Kg']
                                                this.count    += 1
                                            }

                                        },
                                        value: function() {
                                            return this.sum / this.count
                                        },
                                        format: function(x) {
                                            //console.log(x, rowKey, colKey)
                                            return utils.format2Decimals(x)
                                        },
                                        numInputs: 0
                                    }
                                }
                            },

                            /*'Count': function(attributes){
                                return function(data, rowKey, colKey){
                                    if( colKey && (colKey.length == 0) && rowKey && (rowKey.length == 0) ){
                                        return {
                                            count: 0.0,
                                            push : function(record) {
                                                this.count++
                                            },
                                            value: function() {
                                                return this.count / data.rowKeys.length
                                            },
                                            format: function(x) {
                                                return utils.format2Decimals(x)
                                            },
                                            numInputs: 0
                                        }
                                    } else {
                                        return {
                                            count: 0.0,
                                            push : function(record) {
                                                this.count += 1
                                            },
                                            value: function() {
                                                return this.count
                                            },
                                            format: function(x) {
                                                return x
                                            },
                                            numInputs: 0
                                        }
                                    }
                                }
                            },*/

                            'Assortimento %': function(attributes){
                                return function(data, rowKey, colKey){
                                    if( colKey && (colKey.length == 0) && rowKey && (rowKey.length == 0) ){
                                        return {
                                            count: 0.0,
                                            push : function(record) {
                                                this.count++
                                            },
                                            value: function() {
                                                return this.count / data.rowKeys.length
                                            },
                                            format: function(x) {
                                                return utils.format2Decimals(x)
                                            },
                                            numInputs: 0
                                        }
                                    } else {
                                        return {
                                            count: 0.0,
                                            push : function(record) {
                                                this.count += 1
                                            },
                                            value: function() {
                                                return this.count
                                            },
                                            format: function(x) {
                                                return x
                                            },
                                            numInputs: 0
                                        }
                                    }
                                }
                            },

                            'Centimetri lineari': function(attributes){
                                return function(data, rowKey, colKey){

                                    return {
                                        sum: 0.0,
                                        push: function(record) {
                                            if(record['Centimetri lineari']){
                                                this.sum += record['Centimetri lineari']
                                            }
                                        },
                                        value: function() {
                                            return this.sum
                                        },
                                        format: function(x) {
                                            if(x > 0){
                                                return utils.format2Decimals(x)
                                            } else {
                                                return '-'
                                            }
                                        },
                                        numInputs: 0
                                    }
                                }
                            },

                            'Indice 1 vs competitor': function(attributes){

                                // this will serve to store tmp data
                                //  it is reset every time the user changes something in the pivot UI
                                var cache = undefined
                                var countime = 0

                                return function(data, rowKey, colKey){

                                    if( !colKey || !rowKey || (colKey && colKey.length == 0) || (rowKey && rowKey.length == 0) ){
                                        return {
                                            push : function(record) {},
                                            value: function() {
                                                return ""
                                            },
                                            format: function(x) {
                                                return Math.round(x)
                                            },
                                            numInputs: 0
                                        }
                                    } else {

                                        var competitionVariable = data.colAttrs[0]

                                        return {
                                            staticReferencesPerCell: [],
                                            getCache: function(){
                                                if(!cache) {  // a global variable declared in this aggregator
                                                    // cache is populated here
                                                    //console.warn('recomputing pivot cache')

                                                    var competitors      = _.keys(data['colTotals'])
                                                    var dynamicReference = _.contains(data.rowAttrs, "Descrizione")
                                                                        || _.contains(data.rowAttrs, "Descrizione P.C.")
                                                                        || _.contains(data.rowAttrs, "Referenza")
                                                    var competingReferences = []

                                                    // which are the references?
                                                    if(dynamicReference){

                                                        // Do nothing. Performance indexes will be computed later

                                                    } else {

                                                        // Precompute performance indexes for static references
                                                        competingReferences = _.groupBy(component.localData, 'Referenza')

                                                        // Assign indexes to every reference
                                                        _.each(competingReferences, function(refGroup, ref){
                                                            var indexedPrices = performanceMetrics.oneVsTeam(competitors, refGroup, teamB, competitionVariable)

                                                            // store indexes in the references
                                                            _.each(refGroup, function(r){
                                                                var comp = r[competitionVariable]
                                                                r["Performance"] = indexedPrices[comp]
                                                            })
                                                        })

                                                        // regroup by competitor (so performance indexes can be aggregated)
                                                        competingReferences = _.groupBy(component.localData, competitionVariable)
                                                    }

                                                    // overwrite cache
                                                    cache = {
                                                        competitors         : competitors,
                                                        dynamicReference    : dynamicReference,
                                                        competingReferences : competingReferences
                                                    }
                                                }

                                                return cache
                                            },
                                            push : function(record) {
                                                this.pdv    = record[competitionVariable]
                                                this.staticReferencesPerCell.push( record )
                                            },
                                            value: function() {

                                                var cache = this.getCache()
                                                //console.log('CACHE', cache)

                                                if(cache.dynamicReference){

                                                    // compute references on the fly
                                                    var reference        = undefined
                                                    var referenceKeys    = data.rowAttrs
                                                    var referenceValues  = rowKey

                                                    // reference is created dynamically
                                                    reference = _.zip(referenceKeys, referenceValues)
                                                    reference = _.reduce(reference, function(memo, v){
                                                        if(v[1] != undefined){   // avoid undefined (i.e. for row and col totals)
                                                            memo[v[0]] = v[1]
                                                        }
                                                        return memo
                                                    }, {})

                                                    var competingReferences = _.where(component.localData, reference)

                                                    var indexedPrices = performanceMetrics.oneVsTeam(cache.competitors, competingReferences, teamB, competitionVariable)

                                                    return indexedPrices[this.pdv]

                                                } else {

                                                    // use precomputed references
                                                    var performancesInCell = _.pluck(this.staticReferencesPerCell, "Performance")
                                                    return utils.average(performancesInCell)
                                                }
                                            },
                                            format: function(x) {
                                                if( _.isNaN(x) ){
                                                    return '-'
                                                } else {
                                                    return Math.round(x)
                                                }
                                            },
                                            numInputs: 0
                                        }


                                    }
                                }
                            },


                            /*'Indice a squadre': function(attributes){

                                // this will serve to store tmp data
                                //  it is reset every time the user changes something in the pivot UI
                                var cache = undefined
                                var countime = 0

                                return function(data, rowKey, colKey){

                                    if( !colKey || !rowKey || (colKey && colKey.length == 0) || (rowKey && rowKey.length == 0) ){
                                        return {
                                            push : function(record) {},
                                            value: function() {
                                                return ""
                                            },
                                            format: function(x) {
                                                return Math.round(x)
                                            },
                                            numInputs: 0
                                        }
                                    } else {

                                        var competitionVariable = data.colAttrs[0]

                                        return {
                                            staticReferencesPerCell: [],
                                            getCache: function(){
                                                if(!cache) {  // a global variable declared in this aggregator
                                                    // cache is populated here
                                                    //console.warn('recomputing pivot cache')

                                                    var competitors      = _.keys(data['colTotals'])
                                                    var dynamicReference = _.contains(data.rowAttrs, "Descrizione")
                                                                        || _.contains(data.rowAttrs, "Descrizione P.C.")
                                                                        || _.contains(data.rowAttrs, "Referenza")
                                                    var competingReferences = []

                                                    // which are the references?
                                                    if(dynamicReference){

                                                        // Do nothing. Performance indexes will be computed later

                                                    } else {

                                                        // Precompute performance indexes for static references
                                                        competingReferences = _.groupBy(component.localData, 'Referenza')

                                                        // Assign indexes to every reference
                                                        _.each(competingReferences, function(refGroup, ref){

                                                            var indexedPrices = performanceMetrics.teamVsTeam(competitors, refGroup, teamA, teamB, competitionVariable)

                                                            // store indexes in the references
                                                            _.each(refGroup, function(r){
                                                                var comp = r[competitionVariable]
                                                                r["Performance"] = indexedPrices[comp]
                                                            })
                                                        })

                                                        // regroup by competitor (so performance indexes can be aggregated)
                                                        competingReferences = _.groupBy(component.localData, competitionVariable)
                                                    }

                                                    // overwrite cache
                                                    cache = {
                                                        competitors         : competitors,
                                                        dynamicReference    : dynamicReference,
                                                        competingReferences : competingReferences
                                                    }
                                                }

                                                return cache
                                            },
                                            push : function(record) {
                                                this.pdv    = record[competitionVariable]
                                                this.staticReferencesPerCell.push( record )
                                            },
                                            value: function() {

                                                var cache = this.getCache()
                                                //console.log('CACHE', cache)

                                                if(cache.dynamicReference){

                                                    // compute references on the fly
                                                    var reference        = undefined
                                                    var referenceKeys    = data.rowAttrs
                                                    var referenceValues  = rowKey

                                                    // reference is created dynamically
                                                    reference = _.zip(referenceKeys, referenceValues)
                                                    reference = _.reduce(reference, function(memo, v){
                                                        if(v[1] != undefined){   // avoid undefined (i.e. for row and col totals)
                                                            memo[v[0]] = v[1]
                                                        }
                                                        return memo
                                                    }, {})

                                                    var competingReferences = _.where(component.localData, reference)

                                                    var indexedPrices = performanceMetrics.teamVsTeam(cache.competitors, competingReferences, teamA, teamB, competitionVariable)

                                                    return indexedPrices[this.pdv]

                                                } else {

                                                    // use precomputed references
                                                    var performancesInCell = _.pluck(this.staticReferencesPerCell, "Performance")
                                                    return utils.average(performancesInCell)
                                                }
                                            },
                                            format: function(x) {
                                                if( _.isNaN(x) ){
                                                    return '-'
                                                } else {
                                                    return Math.round(x)
                                                }
                                            },
                                            numInputs: 0
                                        }


                                    }
                                }
                            },*/


                            'Indice su media piazza': function(attributes){

                                // this will serve to store tmp data
                                //  it is reset every time the user changes something in the pivot UI
                                var cache = undefined
                                var countime = 0

                                return function(data, rowKey, colKey){

                                    if( !colKey || !rowKey || (colKey && colKey.length == 0) || (rowKey && rowKey.length == 0) ){
                                        return {
                                            push : function(record) {},
                                            value: function() {
                                                return ""
                                            },
                                            format: function(x) {
                                                return Math.round(x)
                                            },
                                            numInputs: 0
                                        }
                                    } else {

                                        var competitionVariable = data.colAttrs[0]

                                        return {
                                            staticReferencesPerCell: [],
                                            getCache: function(){
                                                if(!cache) {  // a global variable declared in this aggregator
                                                    // cache is populated here
                                                    //console.warn('recomputing pivot cache')

                                                    var competitors      = _.keys(data['colTotals'])
                                                    var dynamicReference = _.contains(data.rowAttrs, "Descrizione")
                                                                        || _.contains(data.rowAttrs, "Descrizione P.C.")
                                                                        || _.contains(data.rowAttrs, "Referenza")
                                                    var competingReferences = []

                                                    // which are the references?
                                                    if(dynamicReference){

                                                        // Do nothing. Performance indexes will be computed later

                                                    } else {

                                                        // Precompute performance indexes for static references
                                                        competingReferences = _.groupBy(component.localData, 'Referenza')

                                                        // Assign indexes to every reference
                                                        _.each(competingReferences, function(refGroup, ref){

                                                            var indexedPrices = performanceMetrics.basic(competitors, refGroup, competitionVariable)

                                                            // store indexes in the references
                                                            _.each(refGroup, function(r){
                                                                var comp = r[competitionVariable]
                                                                r["Performance"] = indexedPrices[comp]
                                                            })
                                                        })

                                                        // regroup by competitor (so performance indexes can be aggregated)
                                                        competingReferences = _.groupBy(component.localData, competitionVariable)
                                                    }

                                                    // overwrite cache
                                                    cache = {
                                                        competitors         : competitors,
                                                        dynamicReference    : dynamicReference,
                                                        competingReferences : competingReferences
                                                    }
                                                }

                                                return cache
                                            },
                                            push : function(record) {
                                                this.pdv    = record[competitionVariable]
                                                this.staticReferencesPerCell.push( record )
                                            },
                                            value: function() {

                                                var cache = this.getCache()
                                                //console.log('CACHE', cache)

                                                if(cache.dynamicReference){

                                                    // compute references on the fly
                                                    var reference        = undefined
                                                    var referenceKeys    = data.rowAttrs
                                                    var referenceValues  = rowKey

                                                    // reference is created dynamically
                                                    reference = _.zip(referenceKeys, referenceValues)
                                                    reference = _.reduce(reference, function(memo, v){
                                                        if(v[1] != undefined){   // avoid undefined (i.e. for row and col totals)
                                                            memo[v[0]] = v[1]
                                                        }
                                                        return memo
                                                    }, {})

                                                    var competingReferences = _.where(component.localData, reference)
                                                    var indexedPrices = performanceMetrics.basic(cache.competitors, competingReferences, competitionVariable)

                                                    return indexedPrices[this.pdv]

                                                } else {

                                                    // use precomputed references
                                                    var performancesInCell = _.pluck(this.staticReferencesPerCell, "Performance")
                                                    return utils.average(performancesInCell)
                                                }
                                            },
                                            format: function(x) {
                                                if( _.isNaN(x) ){
                                                    return '-'
                                                } else {
                                                    return Math.round(x)
                                                }
                                            },
                                            numInputs: 0
                                        }


                                    }
                                }
                            },
                        },

                        hiddenAttributes: excludedVariables
                    },
                    true    // !!! IMPORTANT!! Overwrites pivot state when resetting table
                )
        })
    },

    exportTableToExcel: function(){

        // clone table element
        var tableElement = $(this.refs['pivot-element']).find('table.pvtTable').parent().clone()

        // get HTML
        var tableHTML = tableElement.html()

        // pass HTML to excel export routine
        exportExcel(tableHTML)

    },

    resetTable: function(){
        this.buildPivot()
    },

    render: function(){

        // ref will make React store a reference to the DOM element
        return (
            <div>
                <Button className="pivotButton" onClick={this.exportTableToExcel} download="file.xls">Download Excel</Button>
                <Button className="pivotButton" onClick={this.resetTable}>Reset</Button>

                <div ref="pivot-element"></div>
            </div>
        )
    }

})

var mapStateToProps = function(state, ownprops){
    return {
        pageControls : state.controls[ownprops.pageName]
    }
}

module.exports = reduxConnect(mapStateToProps)(PivotTable)
