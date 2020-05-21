var React              = require('react')
var reduxConnect       = require('react-redux').connect
var Panel              = require('./../Panel')
var Row                = require('react-bootstrap/lib/Row')
var Col                = require('react-bootstrap/lib/Col')
var Button             = require('react-bootstrap/lib/Button')
var BarChart           = require('./../charts/BarChart')
var WidgetControls     = require('./../WidgetControls')
var deepCopy           = require('deepcopy')
var utils              = require('./../../utils/utility')
var exportPNG          = require('./../../utils/exportPNG')
var performanceMetrics = require('./../../utils/performanceMetrics')

var NationalPerformance = React.createClass({

    getInitialState: function(){
        return {
            'localFilter' : {},
            'localData'   : []
        }
    },

    dataPrep: function(data) {

        _.each(data, function(d){
            d["Prezzo al Kg"] = d["AVG(`Prezzo al Kg`)"]
        })
        var groupedData = _.groupBy(data, "Categoria Merceologica")
        
        var performances = []
        _.each(groupedData, function(g, gName){
            var competitors = _.uniq(_.pluck(g, "Insegna"))
            var p = performanceMetrics.basic(competitors, g, "Insegna")
            performances.push(p)
        })

        var performancesAveraged = {}
        _.each(performances, function(p){
            _.each(p, function(v,k){
                if(! performancesAveraged[k]){
                    performancesAveraged[k] = []
                }
                performancesAveraged[k].push(v)
            })
        })
        
        var performanceAveragedList = []
        _.each(performancesAveraged, function(v,k){
            performanceAveragedList.push({
                "Insegna"     : k,
                "Performance" : Math.round(utils.average(v))
            })
        })

        return performanceAveragedList
    },

    updateFromControls: function(ctrl) {
        this.setState({
            'localFilter': ctrl.formData
        })
    },

    componentDidMount: function(){
        this.fetchDataAndUpdateChart()
    },

    componentDidUpdate: function(){
        this.fetchDataAndUpdateChart()
    },

    fetchDataAndUpdateChart: function(){

        var component = this

        // Merge local and page controls
        var widgetQuery   = {
            'groupby': ["Insegna", "Categoria Merceologica"]
        }
        var controlsQuery = _.extend(this.state.localFilter, this.props.pageControls, widgetQuery)

        if( component.latestQuery && _.isEqual(component.latestQuery, controlsQuery) ) {
            // query did not change, do nothing ...
        } else {
            component.latestQuery = deepCopy(controlsQuery)
            dashboard.API.get('rilevazioni', controlsQuery, function(res){

                var localData = component.dataPrep(res.data)
                component.setState({
                    'localData': localData
                })
            })
        }
    },

    exportChartToPNG: function(){

        var $svg = $(this.refs['bchart']).find('svg')

        var svgString = $svg.parent().html()
        exportPNG(svgString)
    },

    render: function(){

        var controlsJSX = undefined
        if( this.props.filters ){
            controlsJSX = (
                <WidgetControls
                    filters={this.props.filters}
                    filtersState={this.state.localFilter}
                    update={this.updateFromControls}
                />
            )
        }

        return (
            <Panel collapsible defaultExpanded header="Competitività delle Insegne"  helpText={this.props.helpText}>
                <Col xs={12} >
                    {controlsJSX}
                </Col>
                <Col xs={12}>
                    <div ref="bchart">
                        <BarChart localData={this.state.localData}
                            y={"Performance"}
                            x={"Insegna"}
                        />
                        <Button onClick={this.exportChartToPNG}>Download</Button>
                    </div>
                </Col>
            </Panel>
        )
    }

})

var mapStateToProps = function(state, ownprops){
    return {
        pageControls : state.controls[ownprops.pageName]
    }
}
module.exports = reduxConnect(mapStateToProps)(NationalPerformance)
