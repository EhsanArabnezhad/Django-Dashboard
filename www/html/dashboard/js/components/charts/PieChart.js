var React      = require('react')

var PieChart = React.createClass({

    componentDidMount: function(){

        var component = this

        // build chart
        var chartElement = component.refs['chart']
        $(chartElement).empty()
        var svg = dimple.newSvg(chartElement, '100%', 500)
        var chart = new dimple.chart(svg, component.props.localData)

        var p = chart.addMeasureAxis("p", component.props.p)
        p.addOrderRule(component.props.p, true)

        var series = chart.addSeries(component.props.slice, dimple.plot.pie)

        if(this.props.assignColors){
            this.props.assignColors(chart)
        }

        var legendHeight = 0
        if(component.props.legend){
            legendHeight = 50
            chart.addLegend(0, "90%", "100%", legendHeight, "center", series)
            chart.setMargins(20, 20, 20, 20 + legendHeight)
        } else {
            chart.setMargins(20, 20, 20, 30)
        }

        component.chart = chart
    },

    componentDidUpdate: function(){

        var component = this
        var chart = component.chart

        // Change chart data and update
        chart.data = component.props.localData
        chart.draw()
    },

    render: function(){

        return (
            <div>
                <h6>{this.props.title}</h6>
                <div ref="chart"></div>
            </div>
        )
    }

})

module.exports = PieChart
