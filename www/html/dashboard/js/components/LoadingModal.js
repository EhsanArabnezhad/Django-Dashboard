var React      = require('react')
var ReactRedux = require('react-redux')
var Modal      = require('react-bootstrap/lib/Modal')

var LoadingModal = React.createClass({

    render: function(){

        var title = "Caricamento ..."
        var content = _.map(this.props.content, function(v,k){
            if(v){
                return ( <div key={k}><label>{k}:</label> <span>{v}</span></div> )
            }
        })

        return (

            <Modal
                show={this.props.on}
                backdrop={true} >

                <Modal.Header closeButton>
                    <h3>{title}</h3>
                </Modal.Header>
                <Modal.Body>
                    {content}
                </Modal.Body>
            </Modal>

        )
    }

})

var mapStateToProps = function(state){
    return state.loadingModal
}

module.exports = ReactRedux.connect(mapStateToProps)(LoadingModal)
