var React   = require('react')
var ReactRedux = require('react-redux')


var Table = React.createClass({

    componentDidMount: function(){

        var component = this

        $('.fast-table').click(function(e){

            var clickedRecordId = $(e.target).parents('.record').attr('data-record');
            component.props.dispatch({
                type  : 'OPEN_PRODUCT_MODAL',
                record: +clickedRecordId
            })
        })
    },

    render: function(){

        var dataTable = ''
        _.each(dashboard.data, function(r,i){
            var record = '<div class="record" data-record="' + i + '">'
            _.map(r, function(v,k){
                record += '<span>' + v + '| </span>'
            })
            record += '</div>'
            dataTable += record
        })

        var dataTableHTML = {'__html': dataTable}

        return (
            <div className="fast-table" dangerouslySetInnerHTML={dataTableHTML}></div>
        )
    }

})

module.exports = ReactRedux.connect()(Table)
