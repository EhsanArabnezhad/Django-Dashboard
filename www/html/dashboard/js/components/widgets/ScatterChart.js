var React          = require('react')
var reduxConnect   = require('react-redux').connect
var Panel          = require('./../Panel')
var Button         = require('react-bootstrap/lib/Button')
var Col            = require('react-bootstrap/lib/Col')
var WidgetControls = require('./../WidgetControls')
var exportPNG      = require('../../utils/exportPNG')
var utils          = require('../../utils/utility.js')

var ScatterChart = React.createClass({

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
        window.requestAnimationFrame(function(){        // http://stackoverflow.com/a/28748160
            component.buildChart()
            component.fetchAndPlotData()
        })
    },

    buildChart: function(){
        var chartElement = this.refs['scatter-chart']
        $(chartElement).empty()
        var svg = dimple.newSvg(chartElement, '100%', 400)
        var chart = new dimple.chart(svg, [])

        var x = chart.addMeasureAxis("x", this.props.x)
        var y = chart.addMeasureAxis("y", this.props.y)
        var series = chart.addSeries(this.props.series, dimple.plot.bubble)
        series.aggregate = dimple.aggregateMethod.avg

        chart.draw()

        var legendHeight = 0
        if(this.props.legend){
            legendHeight = 100
            chart.addLegend(0, "90%", "100%", legendHeight, "center", series)
            chart.setMargins(100, 80, 30, legendHeight)
        } else {
            chart.setMargins(250, 80, 30, 50)
        }

        this.chart = chart
    },

    fetchAndPlotData: function(){

        var component = this

        // Merge local and page controls
        var controlsQuery = _.extend({}, this.state.controls, this.props.pageControls)

        // ask the server for alreay grouped data
        if(component.props.groupBy){
            controlsQuery['groupby'] = this.props.groupBy
        }

        // Apply query
        dashboard.API.get('rilevazioni', controlsQuery, function(response){

            // Change chart data and update
            component.chart.data = _.filter(response.data, function(d){
                // throw away NaNs from the scatter
                var x = component.props.x
                var y = component.props.y
                return utils.isNumber(d[x]) && utils.isNumber(d[y])
            })
            component.chart.draw()

            // Update chart title
            var chartTitle = component.props.groupBy + ' - ' + utils.titlizeObject(controlsQuery)
            component.chart.svg.select(".chart-title").remove()
            component.chart.svg.append("text")
                .attr("class", "chart-title")
                .attr("x", component.chart._xPixels() + component.chart._widthPixels() / 2)
                .attr("y", component.chart._yPixels() - 20)
                .style("text-anchor", "middle")
                .text(chartTitle)
        })
    },

    updateFromControls: function(formEvent){

        this.setState({
            'controls': formEvent.formData
        })
    },

    exportChartToPNG: function(){

        var $svg = $(this.refs['scatter-chart']).find('svg')

        var svgString = $svg.parent().html()
        exportPNG(svgString)
    },

    render: function(){

        var controlsJSX = undefined
        if(this.props.filters){
            controlsJSX = (
                <WidgetControls
                    filters={this.props.filters}
                    filtersState={this.state.controls}
                    update={this.updateFromControls}
                    preselectFirstChildren={true}
                />
            )
        }

        return (
            <Panel collapsible defaultExpanded header={this.props.title} helpText={this.props.helpText}>
                <Col xs={12} >
                    {controlsJSX}
                </Col>
                <div ref="scatter-chart"></div>
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
module.exports = reduxConnect(mapStateToProps)(ScatterChart)
