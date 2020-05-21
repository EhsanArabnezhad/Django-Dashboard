var React          = require('react')
var reduxConnect   = require('react-redux').connect
var Panel          = require('./../Panel')
var Button         = require('react-bootstrap/lib/Button')
var Col            = require('react-bootstrap/lib/Col')
var Row            = require('react-bootstrap/lib/Row')
var WidgetControls = require('./../WidgetControls')
var PieChart       = require('./../charts/PieChart')
var exportPNG      = require('../../utils/exportPNG')
var utils          = require('../../utils/utility.js')
//var deepcopy       = require('deepcopy')

var MultiplePies = React.createClass({

    getInitialState: function(){

        return {
            'controls': this.props.preSelectedFilters || {}
        }
    },

    componentDidMount: function(){
        this.fetchAndBuild()
    },

    componentDidUpdate: function(){
        this.fetchAndBuild()
    },

    fetchAndBuild: function(){
        var component = this
        window.requestAnimationFrame(function(){    // http://stackoverflow.com/a/28748160
            component.fetchAndPlotData()
        })
    },

    fetchAndPlotData: function(){

        var component = this

        // Merge local and page controls
        var controlsQuery = _.extend({}, this.state.controls, this.props.pageControls, this.props.defaultFilters)
        // TODO: every widget should reply to defaultFilters

        // ask the server for alreay grouped data
        if(component.props.groupBy){
            controlsQuery['groupby'] = this.props.groupBy
        }


        dashboard.API.get('rilevazioni', controlsQuery, function(response){

            // Change chart data and update
            if(component.props.dataPrep){
                var data = component.props.dataPrep(response.data)
            } else {
                var data = response.data
            }

            var pieRadius   = component.props.radius || 50
            var chartHeight = _.uniq(data, component.props.y).length * pieRadius * Math.PI

            var chartElement = component.refs['multiple-pie-chart']
            $(chartElement).empty()
            var svg = dimple.newSvg(chartElement, '100%', chartHeight)
            var chart = new dimple.chart(svg, [])

            var x = chart.addCategoryAxis("x", component.props.x)
            x.addOrderRule(component.props.x, true)

            var y = chart.addCategoryAxis("y", component.props.y)
            y.addOrderRule(component.props.y, true)

            var p = chart.addMeasureAxis("p", component.props.p)

            var series = chart.addSeries(component.props.groupBy, dimple.plot.pie)
            series.radius = pieRadius

            if(component.props.legend){
                var legendHeight = 100
                var legend = chart.addLegend(0, (chartHeight - legendHeight + 50), "100%", legendHeight, "center", series)
                chart.setMargins(150, 30, 20, legendHeight)
            } else {
                chart.setMargins(150, 30, 20, 30)
            }

            // Change chart data and update
            chart.data = response.data
            chart.draw()

            // svg corrections
            chart.svg.selectAll("g.dimple-legend")
                .attr("display", function(el, a, o){
                    if(a>=8){    // only print first 6 legend elements
                        return "none"
                    }
                })

            component.chart = chart
        })
    },

    updateFromControls: function(formEvent){

        this.setState({
            'controls': formEvent.formData
        })
    },

    exportChartToPNG: function(){

        // TODO: export html and svg
        var $svg = $(this.refs['multiple-pie-chart']).find('svg')

        var svgString = $svg.parent().html()
        exportPNG(svgString)
    },

    render: function(){

        var controlsJSX = undefined
        if( this.props.filters ){
            controlsJSX = (
                <WidgetControls
                    filters={this.props.filters}
                    filtersState={this.state.controls}
                    update={this.updateFromControls}
                />
            )
        }

        return (
            <Panel collapsible defaultExpanded header={this.props.title} helpText={this.props.helpText}>
                <Col xs={12} >
                    {controlsJSX}
                </Col>
                <Row>
                    <div ref="multiple-pie-chart"></div>
                </Row>
                <Button onClick={this.exportChartToPNG}>Download</Button>
            </Panel>
        )
    }

})

var mapStateToProps = function(state, ownprops){
    return {
        pageControls : state.controls[ownprops.pageName]
    }
}
module.exports = reduxConnect(mapStateToProps)(MultiplePies)
