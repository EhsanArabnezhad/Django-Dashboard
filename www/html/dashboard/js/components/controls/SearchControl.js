var React        = require('react')
var Typeahead = require('react-bootstrap-typeahead').default
var FormControl  = require('react-bootstrap/lib/FormControl')
var FormGroup    = require('react-bootstrap/lib/FormGroup')

var SearchControl = React.createClass({

    onChange: function(value){

        if(value && value.length>0){
            // notify parent
            this.props.onChange({
                target: {
                    'value': value[0]
                }
            })
        }
    },

    render: function(){

        return (
            <Typeahead
                options={this.props.searchPossibilities}
                onChange={this.onChange}
                placeholder={this.props.placeholder}
            />
        )
    }

})

module.exports = SearchControl
