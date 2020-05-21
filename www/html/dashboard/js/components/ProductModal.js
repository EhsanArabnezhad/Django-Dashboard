var React      = require('react')
var ReactRedux = require('react-redux')
var Modal      = require('react-bootstrap/lib/Modal')

var ProductModal = React.createClass({

    close: function(){
        this.props.dispatch({
            type:'CLOSE_PRODUCT_MODAL'
        })
    },

    render: function(){

        var title = "TODO"
        var content = _.map(this.props.content, function(v,k){
            if(v){
                return ( <div key={k}><label>{k}:</label> <span>{v}</span></div> )
            }
        })

        return (

            <Modal
                show={this.props.on}
                backdrop={true}
                onHide={this.close} >

                <Modal.Header closeButton>
                    <h2>{title}</h2>
                </Modal.Header>
                <Modal.Body>
                    {content}
                </Modal.Body>
            </Modal>

        )
    }

})

var mapStateToProps = function(state){
    return state.productModal
}

module.exports = ReactRedux.connect(mapStateToProps)(ProductModal)
