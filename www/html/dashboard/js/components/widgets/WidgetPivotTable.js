var React          = require('react')
var Panel          = require('./../Panel')
var Button         = require('react-bootstrap/lib/Button')
var PivotTable     = require('./../PivotTable')
var WidgetControls = require('./../WidgetControls')

var WidgetPivotTable = React.createClass({

    render: function(){

        return (
            <Panel collapsible header={"Tabella pivot"} helpText={this.props.helpText}>
                <PivotTable
                    filter={this.props.defaultFilters}
                    pageName={this.props.pageName}
                    draggableVars={this.props.draggableVars}
                    draggableY={this.props.draggableY}
                    draggableX={this.props.draggableX}
                />
            </Panel>
        )
    }

})

module.exports = WidgetPivotTable
