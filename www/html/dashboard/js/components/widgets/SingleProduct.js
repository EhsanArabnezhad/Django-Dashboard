var utils          = require('./../../utils/utility')
var React          = require('react')
var reduxConnect   = require('react-redux').connect
var Panel          = require('./../Panel')
var Row            = require('react-bootstrap/lib/Row')
var Col            = require('react-bootstrap/lib/Col')
var SearchControl  = require('./../controls/SearchControl')
var BarChart       = require('./../charts/BarChart')
var deepCopy       = require('deepcopy')

var SingleProduct = React.createClass({

    getInitialState: function(){
        return {
            'search'      : '',
            'productData' : [],
            'average'     : '',
            'lowest'      : {
                'Prezzo al Kg'  : '',
                'Punto vendita' : ''
            }
        }
    },

    getSearchPossibilities: function(){
        var sorted = _.sortBy(dashboard.metadata.uniqueValues['rilevazioni']["Descrizione"]["values"])
        return _.filter(sorted, function(d){
            return d    // exclude null values
        })
    },

    getProductStats: function(){

        var component     = this

        var productData = _.filter(component.state['productData'], function(d){
            var searchMatches = ( d["Descrizione"].toLowerCase() == component.state['search'].toLowerCase() )
            var priceIsNotNaN = !_.isNaN(d["Prezzo al Kg"])
            return searchMatches && priceIsNotNaN
        })

        // work on the copy, not on original data
        productData = deepCopy(productData)

        _.each(productData, function(d){
            d['Insegna e Promo'] = d['Insegna'] + ' ' + d['Promozione']
        })

        // Data prep (should be a hook)
        productData = utils.averageDuplicates(productData, "Insegna e Promo", "Prezzo al Kg")

        // Data prep (should be a hook)
        if(productData.length > 0){

            var productDataNotPromo = _.filter(productData, function(pd){
                return pd['Promozione'] == 'non in promo'
            })
            var lowest = productDataNotPromo[0]
            var average = 0.0
            var values = _.each(productDataNotPromo, function(d){
                average += d["Prezzo al Kg"]
                if(lowest["Prezzo al Kg"] > d["Prezzo al Kg"]){
                    lowest = d
                }
            })
            average /= productDataNotPromo.length
            average                = utils.format2Decimals(average)
            lowest["Prezzo al Kg"] = utils.format2Decimals(lowest["Prezzo al Kg"])

            _.each(productData, function(d){
                d['Variazione percentuale'] = ( d['Prezzo al Kg'] / average * 100 ) - 100
            })

            return {
                'lowest'   : lowest,
                'average'  : average,
                'productData': productData
            }

        } else {
            var defaultState = this.getInitialState()
            return defaultState
        }
    },

    updateFromControls: function(event){
        this.setState({
            'search': event.target.value
        })
    },

    componentDidUpdate(){

        var component = this

        // Merge local and page controls
        var widgetQuery   = {
            'Descrizione': [this.state.search]
        }
        var controlsQuery = _.extend({}, this.props.pageControls, widgetQuery)

        if(
            // query did not change
            ( component.latestQuery && _.isEqual(component.latestQuery, controlsQuery) )
                ||
            // there is no search query
            (this.state.search == "")
        ) {
            // do nothing ...
        } else {
            component.latestQuery = deepCopy(controlsQuery)
            dashboard.API.get('rilevazioni', controlsQuery, function(res){
                component.setState({
                    'productData': res.data
                })
            })
        }
    },

    render: function(){

        var productStats        = this.getProductStats()
        var searchPossibilities = this.getSearchPossibilities()

        return (
            <Panel collapsible defaultExpanded header="Dinamiche di prezzo"  helpText={this.props.helpText}>
                <Row>
                    <Col xs={12}>
                        <SearchControl
                            searchField={"Descrizione"}
                            onChange={this.updateFromControls}
                            placeholder="Cerca prodotto..."
                            searchPossibilities={searchPossibilities}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs={6}>
                        <div style={{textAlign:"center"}}>
                            <br/>
                            <div>Prezzo più basso (esclusi promo)</div>
                            <h2>{productStats.lowest["Prezzo al Kg"]} €/Kg</h2>
                            <h6>{productStats.lowest["Punto vendita"]}</h6>
                        </div>
                    </Col>
                    <Col xs={6}>
                        <div style={{textAlign:"center"}}>
                            <br/>
                            <div>Prezzo medio (esclusi promo)</div>
                            <h2>{productStats.average} €/Kg</h2>
                        </div>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col xs={6}>
                        <BarChart localData={productStats.productData}
                            x={"Insegna e Promo"}
                            y={"Prezzo al Kg"}
                            color={{
                                "field": "Promozione",
                                "value2Color": {
                                    'promo': 'red'
                                }
                            }}
                            legend={true}
                            getTooltipText={function(e){
                                return [ e['x'], 'Prezzo al Kg: ' + utils.format2Decimals(e['y']) ]
                            }}
                        />
                    </Col>
                    <Col xs={6}>
                        <BarChart localData={productStats.productData}
                            x={"Insegna e Promo"}
                            y={"Variazione percentuale"}
                            color={{
                                "field": "Promozione",
                                "value2Color": {
                                    'promo': 'red'
                                }
                            }}
                            legend={true}
                        />
                    </Col>
                </Row>
            </Panel>
        )
    }

})

/*
// Dimplejs color rule
dimpleAssignColor: function(variableName, chart, config){
    _.each(chart.data, function(d){
        var labelName = d[variableName];
        if( config.labels[labelName] && config.labels[labelName].color ) {
            chart.assignColor(labelName, config.labels[labelName].color);
        }
    });
}
 */

var mapStateToProps = function(state, ownprops){
    return {
        pageControls : state.controls[ownprops.pageName]
    }
}
module.exports = reduxConnect(mapStateToProps)(SingleProduct)
