var React        = require('react')
var reduxConnect = require('react-redux').connect
var Alert        = require('react-bootstrap/lib/Alert')
var Glyphicon    = require('react-bootstrap/lib/Alert')

var Warning = React.createClass({

    render: function(){

        return (
            <Alert bsStyle="warning">
                {config.noDataWarning}
            </Alert>
        )
    }
})

module.exports = Warning
