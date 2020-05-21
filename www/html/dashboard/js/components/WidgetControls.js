var React        = require('react')
var Row          = require('react-bootstrap/lib/Row')
var Col          = require('react-bootstrap/lib/Col')
var ControlLabel = require('react-bootstrap/lib/ControlLabel')
var FormControl  = require('react-bootstrap/lib/FormControl')
var FormGroup    = require('react-bootstrap/lib/FormGroup')
import Form      from 'react-jsonschema-form'

var WidgetControls = React.createClass({

    composeFiltersSchema: function(){

        var component  = this
        var allKeyword = config.allKeyword

        // these obj will host form structure
        var extendedControls = {
            "type"        : "object",
            "properties"  : {}
        }

        _.each(component.props.filters, function(filterProps, filterName){
            _.each(dashboard.metadata.uniqueValues, function(endPointUniqueValues, endpoint) {  // not elegant, searching in every endpoint for a variable values :(
                if(_.has(dashboard.metadata.uniqueValues[endpoint], filterName)){

                    // Options for this select
                    if(filterProps['parent']){  // has this variable a parent?
                        // filter by parent variable
                        var parentFilterName = filterProps['parent']
                        var allPossibleFilterOptions  = dashboard.metadata.uniqueValues[endpoint][parentFilterName][filterName]
                        var filterOptions = allPossibleFilterOptions[component.props.filtersState[parentFilterName]]

                    } else {
                        // just take distinct values
                        var filterOptions = dashboard.metadata.uniqueValues[endpoint][filterName]['values']
                    }

                    // Take away nulls
                    filterOptions = _.filter(filterOptions, function(f){
                        return f && (f !== null) && (f !== "")
                    })
                    filterOptions = _.sortBy(filterOptions)

                    //console.warn(filterName, filterProps)

                    var filterSchema = {
                        'type'  : filterProps.type || 'string',
                        'title' : filterName,
                        'hidden': filterProps.hidden,
                        'disableSelectAll': false || filterProps['disableSelectAll']
                    }   // TODO: leverage hidden form fields to apply tab filters!!!

                    // Assign <select> values
                    if(filterProps.type == 'string' || !filterProps.type){
                        filterSchema['enum'] = filterOptions
                    }

                    // Assign checkbox group values
                    if(filterProps.type == 'array'){
                        
                        // Add "Tutto" manually (with <select> it is done automatically)
                        if( ! filterProps['disableSelectAll']){
                            filterOptions = [config.allKeyword].concat(filterOptions)
                        }

                        filterSchema['items'] = {
                            'type': 'string',
                            'enum': filterOptions
                        }
                        filterSchema["uniqueItems"] = true
                    }

                    extendedControls.properties[filterName] = filterSchema
                }
            })
        })

        return extendedControls
    },

    getFilterChildren: function(filterParent){

        // search a filter having as parent the current filter
        var filterChildren = false
        _.each(this.props.filters, function(filterProps, filterName){
            if(_.has(filterProps, 'parent') && filterProps['parent']==filterParent){
                filterChildren = filterName
            }
        })

        return filterChildren
    },

    /**
     * Get values acceptable for any children having a certain parent filter selected
     */
    getAcceptableChildrenValues: function(parentName, parentValue) {
        var acceptableChildrenValues = {}
        _.each(dashboard.metadata.uniqueValues, function(endPointUniqueValues, endpoint) {  // not elegant, searching in every endpoint for a variable values :(
            if(_.has(dashboard.metadata.uniqueValues[endpoint], parentName)){
                var allPossibleChildrenFilterOptions  = dashboard.metadata.uniqueValues[endpoint][parentName]

                _.each(allPossibleChildrenFilterOptions, function(childPossibleValues, childName){
                    if(childPossibleValues[parentValue]){
                        acceptableChildrenValues[childName] = childPossibleValues[parentValue]
                    }
                })
            }
        })

        return acceptableChildrenValues
    },

    /**
     * Run sanity checks before sending updates to parent component
     */
    update: function(formEvent) {

        var component = this

        
        _.each(formEvent.formData, function(filterValue, filterName){

            // if a parent filter was changed, check that children has an acceptable value
            var filterProps = component.props.filters[filterName]
            if( _.has(filterProps, 'parent') ){ // has this filter a parent?
                var parentFilterName = filterProps['parent']
                var possibleChildrenFilterOptions  = component.getAcceptableChildrenValues(parentFilterName, formEvent.formData[parentFilterName])
                var currentChildrenOptions = possibleChildrenFilterOptions[filterName]

                // delete filter value if not coherent with parent
                if( !_.contains(currentChildrenOptions, filterValue) ){

                    if(component.props.preselectFirstChildren){
                        // preselect first available choice
                        formEvent.formData[filterName] = currentChildrenOptions[0]
                    } else {
                        // just cancel filter
                        delete formEvent.formData[filterName]
                    }
                }
            }

            // manage "Tutto" for checkbox groups
            if(_.contains(filterValue, config.allKeyword) ){
                formEvent.formData[filterName] = []
            }
        })

        component.props.update(formEvent)
    },

    // TODO: take away this and refactor the form
    componentDidMount: function(){
        this.deleteDefaultOptionForNonSelectableAllFormField()
    },
    // TODO: take away this and refactor the form
    componentDidUpdate: function(){
        this.deleteDefaultOptionForNonSelectableAllFormField()
    },
    // TODO: take away this and refactor the form
    deleteDefaultOptionForNonSelectableAllFormField: function(){
        $('option:contains("DELETEME")').remove()

    },

    render: function(){

        var component = this;

        var formSchema = this.composeFiltersSchema()

        var uiSchema = {}
        _.each(formSchema.properties, function(fSprops, fSname){
            uiSchema[fSname] = {}

            if(fSprops.type == 'array') {
                uiSchema[fSname]["ui:widget"] = "checkboxes"
            }
            if(fSprops.type == 'string') {
                if(fSprops['disableSelectAll']){
                    uiSchema[fSname]["ui:placeholder"] = "DELETEME"
                } else {
                    uiSchema[fSname]["ui:placeholder"] = config.allKeyword
                }
            }

            if(fSprops.hidden) {
                uiSchema[fSname]["ui:widget"] = "hidden"
            }
        })

        var formData = this.props.filtersState

        return (

            <Row>
                <Form
                    schema={formSchema}
                    uiSchema={uiSchema}
                    formData={formData}
                    onChange={this.update}
                >
                    <div></div>
                </Form>

            </Row>
        )
    }

})

module.exports = WidgetControls
