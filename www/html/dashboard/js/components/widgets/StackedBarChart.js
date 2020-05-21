var React          = require('react')
var reduxConnect   = require('react-redux').connect
var Panel          = require('./../Panel')
var Warning        = require('./../Warning.js')
var Button         = require('react-bootstrap/lib/Button')
var Col            = require('react-bootstrap/lib/Col')
var WidgetControls = require('./../WidgetControls')
var exportPNG      = require('../../utils/exportPNG')
var deepcopy       = require('deepcopy')
var utils          = require('../../utils/utility.js')

var StackedBarChart = React.createClass({

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
            component.buildChart()
            component.fetchAndPlotData()
        })
    },

    buildChart: function(){

        var chartHeight     = 400
        var chartLeftMargin = this.props.leftMargin || 250

        var chartElement = this.refs['stacked-bar-chart']
        $(chartElement).empty()
        var svg = dimple.newSvg(chartElement, '100%', chartHeight)
        var chart = new dimple.chart(svg, [])

        // X axis
        if(this.props.xPercent){
            var x = chart.addPctAxis("x", this.props.x)
        } else {
            var x = chart.addMeasureAxis("x", this.props.x)
        }

        if(this.props.xTitle){
            x.title = this.props.xTitle
        }

        // Y axis
        var y = chart.addCategoryAxis("y", this.props.y)
        y.addOrderRule(this.props.y, true)

        if(this.props.yTitle){
            y.title = this.props.yTitle
        }

        // series
        var series = chart.addSeries(this.props.groupBy, dimple.plot.bar)
        if(this.props.seriesOrderRule){
            series.addOrderRule(this.props.seriesOrderRule)
        } else {
            series.addOrderRule(this.props.groupBy[1])
        }

        //chart.addLegend(60, 10, 510, 20, "right")
        chart.draw()

        // legend and margins
        if(this.props.legend){
            var legendHeight = 100
            var legend = chart.addLegend(0, (chartHeight - legendHeight + 50), "100%", legendHeight, "center", series)
            chart.setMargins(chartLeftMargin, 30, 20, legendHeight)
        } else {
            chart.setMargins(chartLeftMargin, 30, 20, 30)
        }

        this.chart = chart
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

        // Apply query
        dashboard.API.get('rilevazioni', controlsQuery, function(response){

            var resData = deepcopy(response.data)

            // Change chart data and update
            if(component.props.dataPrep){
                component.chart.data = component.props.dataPrep(resData)
            } else {
                component.chart.data = resData
            }

            // group too little sub-bars into one group
            var nBars = component.props.collapseToNbars || 8
            component.chart.data = component.groupSmallestSubBars(component.chart.data, nBars)
            
            // draw chart or missing data alert
            if(component.chart.data.length > 0){
                //console.log(controlsQuery, response.data[0])
                component.chart.draw()

                // svg corrections
                component.chart.svg.selectAll("g.dimple-legend")
                    .attr("display", function(el, a, o){
                        if(a>=nBars){    // only print first 6 legend elements
                            return "none"
                        }
                    })

                // Update chart title
                var chartTitle = component.props.groupBy + ' - ' + utils.titlizeObject(controlsQuery)
                component.chart.svg.select(".chart-title").remove()
                component.chart.svg.append("text")
                    .attr("class", "chart-title")
                    .attr("x", component.chart._xPixels() + component.chart._widthPixels() / 2)
                    .attr("y", component.chart._yPixels() - 20)
                    .style("text-anchor", "middle")
                    .text(chartTitle)
            } else {
                alert(config.noDataWarning)
            }

        })
    },

    // group too little sub-bars into one group
    groupSmallestSubBars: function(data, nBars){
        
        var component = this
        var groupingVar = component.props.groupBy[1]
        
        var groupNumerosity = _.map(data, function(d){
            return [ d[groupingVar], d['COUNT(*)'] ]
        })
        groupNumerosity = _.sortBy(groupNumerosity, function(d){return -d[1]})
        var groupBigNames = _.map(groupNumerosity, function(d){return d[0]})
        var firstNuniqBigNames  = _.first(_.uniq(groupBigNames), nBars)

        _.each(data, function(d){
            if( ! _.contains(firstNuniqBigNames, d[groupingVar])){
                d[groupingVar] = 'Altro'
            }
        })

        return data
    },

    updateFromControls: function(formEvent){

        this.setState({
            'controls': formEvent.formData
        })
    },

    exportChartToPNG: function(){

        var $svg = $(this.refs['stacked-bar-chart']).find('svg')

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

        var widgetJSX = (
            <div>
                <Col xs={12} >
                    {controlsJSX}
                </Col>
                <div ref="stacked-bar-chart"></div>
                <Button onClick={this.exportChartToPNG}>Download</Button>
            </div>
        )

        return (
            <Panel collapsible defaultExpanded header={this.props.title} helpText={this.props.helpText}>
                {widgetJSX}
            </Panel>
        )
    }

})

var mapStateToProps = function(state, ownprops){
    return {
        pageControls : state.controls[ownprops.pageName]
    }
}
module.exports = reduxConnect(mapStateToProps)(StackedBarChart)
