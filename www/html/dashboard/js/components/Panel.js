var React          = require('react')
var Tooltip        = require('react-bootstrap/lib/Tooltip')
var OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger')
var BootstrapPanel = require('react-bootstrap/lib/Panel')

var Panel = React.createClass({

    render: function(){

        var style = {
            "margin-bottom" : "25px",
            "text-align"    : "right",
            "margin-top"    : "-45",
            "cursor"        : "pointer"
        }

        var tooltip = (
            <Tooltip id="tooltip">{this.props.helpText}</Tooltip>
        )

        return (
            <BootstrapPanel {...this.props}>
                <div className="panel-help" style={style}>
                    <OverlayTrigger placement="left" overlay={tooltip}>
                        <span>?</span>
                    </OverlayTrigger>
                </div>
                {this.props.children}
            </BootstrapPanel>
        )
    }

})

module.exports = Panel
