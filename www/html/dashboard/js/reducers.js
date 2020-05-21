var deepcopy = require('deepcopy')

module.exports = function(state, action){

    var newState = deepcopy(state);

    console.log('ACTION', action.type, 'WITH PAYLOAD', action.payload)

    if(action.type == 'LOGIN'){
        newState.userIsLogged = true
    } else if(action.type == 'OPEN_PRODUCT_MODAL'){
        newState.productModal = {
            on: true,
            content: {
                'Descrizione': "TODO"
            }
        }
    } else if(action.type == 'CLOSE_PRODUCT_MODAL'){
        newState.productModal.on = false
    } else if(action.type == 'OPEN_LOADING_MODAL'){
        newState.loadingModal.on = true
    } else if(action.type == 'CLOSE_LOADING_MODAL'){
        newState.loadingModal.on = false
    } else if(action.type == 'PAGE_FILTERS_CHANGE'){
        var pageName    = action.payload['pageName']
        var payloadCopy = deepcopy(action.payload)
        delete payloadCopy.pageName
        newState.controls[pageName] = payloadCopy
    }

    console.log('NEW STATE', newState, '\n\n')

    return newState
}
