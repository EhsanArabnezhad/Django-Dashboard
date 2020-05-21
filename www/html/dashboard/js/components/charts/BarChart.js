var React      = require('react')

var BarChart = React.createClass({

    componentDidMount: function(){

        // build chart
        var chartElement = this.refs['chart']
        $(chartElement).empty()
        var svg = dimple.newSvg(chartElement, '100%', 500)
        var chart = new dimple.chart(svg, this.props.localData)

        var x = chart.addCategoryAxis("x", this.props.x)
        x.addOrderRule(this.props.x, true)

        var y = chart.addMeasureAxis("y", this.props.y)

        var colorField = null
        if(this.props.color){
            colorField = this.props.color.field
        }
        var series = chart.addSeries(colorField, dimple.plot.bar)

        if(this.props.getTooltipText) {
            series.getTooltipText = this.props.getTooltipText
        }

        if(this.props.color && this.props.color.value2Color){
            _.each(this.props.color.value2Color, function(v,k){
                chart.assignColor(k, v)
            })
        }

        /*if(this.props.legend){
            chart.addLegend(0, 10, "100%", "100px", "center", series)
        }*/
        var legendHeight = 0
        if(this.props.legend){
            legendHeight = 50
            chart.addLegend(0, "90%", "100%", legendHeight, "center", series)
            chart.setMargins(100, 30, 30, 250 + legendHeight)
        } else {
            chart.setMargins(100, 30, 30, 250)
        }

        this.chart = chart
    },

    componentDidUpdate: function(){

        var chart = this.chart

        // Change chart data and update
        chart.data = this.props.localData
        chart.draw()
    },

    render: function(){

        return (
            <div ref="chart"></div>
        )
    }

})

module.exports = BarChart
