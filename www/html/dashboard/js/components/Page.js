var React          = require('react')
var reduxConnect   = require('react-redux').connect
var Grid           = require('react-bootstrap/lib/Grid')
var Row            = require('react-bootstrap/lib/Row')
var Col            = require('react-bootstrap/lib/Col')
var WidgetControls = require('./WidgetControls')
var deepcopy       = require('deepcopy')
var utils          = require('./../utils/utility')


var Page = React.createClass({

    updateFromControls: function(formEvent){

        //var name      = event.target.name
        //var value     = event.target.value
        var component = this
        //var controls  = this.props.pageControls

/*
        // deepcopy filters state
        var updatedPageControls = deepcopy(component.props.pageControls)
        if(value == config.allKeyword){
            // leave empty if selected "All"
            delete updatedPageControls[name]
        } else {
            // update selected filter value
            updatedPageControls[name] = [value] // array because in future could be a multiselect
        }

        // TODO: reset children filter if not coherent with parent
        // if the changed filter has a children, reset it!
        var childrenFilterName = component.getFilterChildren(name)
        if(childrenFilterName){
            // select a default ("All" or just the first option if "All" is not allowed)
            if( component.props.filters[childrenFilterName]['disableSelectAll'] ) {
                // "All" is not allowed, get first option coherently with distinct combinations
                var endpoint = 'puntivendita'   // TODO: this should be abstracted away
                var firstAvailableOption = dashboard.metadata.uniqueValues[endpoint][name][childrenFilterName][value][0]
                updatedPageControls[childrenFilterName] = [firstAvailableOption]
            } else {
                // "All", just leave empty
                delete updatedPageControls[childrenFilterName]
            }
        }
*/

        // payload contains page name (so we can remember filters across pages with the same name)
        formEvent.formData["pageName"] = component.props.name

        // send action to redux in order to update page widgets and the filters themselves
        dashboard.store.dispatch({
            'type'    : 'PAGE_FILTERS_CHANGE',
            'payload' : formEvent.formData
        })
    },

    render: function(){

        var component = this

        var controlsJSX = (
            <WidgetControls
                filters={this.props.filters}
                filtersState={this.props.pageControls}
                update={this.updateFromControls}
                preselectFirstChildren={false}
                onePerLine={true}
            />
        )

        var childrenJSX = React.Children.map(this.props.children, function(child){
            return React.cloneElement(child, {
                defaultFilters: component.props.defaultFilters
            })
        })

        return (
            <Grid>
                <Row>
                    <Col xs={3} className="variables-filter">
                        <h5>Filtri</h5>
                        {/* TODO take away this handcoded filter */}
                        <div style={{marginLeft:"-15px", marginBottom:"15px", marginTop:"20px"}}>
                            <div style={{marginBottom:"15px"}}>
                                Periodo di rilevazione:
                            </div>
                            <input type="checkbox" checked />
                            <label>Settimana {utils.getLatestTwoWeeksNumbers()}</label>
                        </div>
                        {controlsJSX}
                    </Col>
                    <Col xs={9}>
                        {childrenJSX}
                    </Col>
                </Row>
            </Grid>
        )
    }

})

var mapStateToProps = function(state, ownprops){
    var pageName = ownprops.name
    return {
        pageControls : state.controls[pageName]
    }
}
module.exports = reduxConnect(mapStateToProps)(Page)
