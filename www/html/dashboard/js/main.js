var React        = require('react')
var ReactDOM     = require('react-dom')
var Redux        = require('redux')
var ReactRedux   = require('react-redux')
var reducer      = require('./reducers')
var Content      = require('./components/Content')
var ProductModal = require('./components/ProductModal')
var LoadingModal = require('./components/LoadingModal')

var launchApp = function(){
  
    var initialState = {     // state for the Redux store
        userIsLogged: false,
        controls: {
            'mainReport': {},
            'pivot': {
                'Regione': ['Lazio']
            }
        },
        productModal : {
            on     : false,
            content: {}
        },
        loadingModal : {
            on : false
        },
    }

    dashboard.store = Redux.createStore(reducer, initialState)

    ReactDOM.render(
        <ReactRedux.Provider store={dashboard.store}>
            <div>
                <Content />
                <ProductModal />
                <LoadingModal />
            </div>
        </ReactRedux.Provider>,
        document.getElementById('dashboard')
    )
}


/**
 * START HERE!
 */
window.dashboard     = {}
launchApp()
