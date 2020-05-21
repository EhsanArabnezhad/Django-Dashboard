$ = django.jQuery

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function askPermissionSchemaAndBuildAccessDetailForm(datasetName) {
    var csrftoken             = getCookie('csrftoken')
    var locationTruncateIndex = window.location.href.indexOf('accessprofile')
    var endpoint    = window.location.href.substring(0,locationTruncateIndex).replace('/admin/', '/')
    
    $.ajax({
        url: endpoint,
        type: 'GET',
        data: {
            csrfmiddlewaretoken : csrftoken,
            datasetName         : datasetName
        },
        success: function(res){
            populateAccessDetailForm(res[0])   // one dataset is returned in an array
        },
        error: function(res){
            console.error(res)
        }
    })
}

function populateAccessDetailForm(datasetSchema){

    // select part of the page where access details (permissions) are controlled
    $mainDiv = $('.field-access_detail')

    // hide textarea form the user, but we will store there the access detail JSON that will be saved by django.
    $mainDiv.find('textarea').hide()
    $mainDiv.find('p.help').hide()

    // fix django CSS to make widget fit better
    $mainDiv.css('overflow', 'visible')
    $mainDiv.find('label').css('float', 'none')

    // parse permission JSON stored in the textarea
    accessDetail = $mainDiv.find('textarea').val()
    accessDetail = JSON.parse(accessDetail)

    // build form
    $mainDiv.append('<form id="access_detail-editor">')
    $form = $mainDiv.find('form')

    // form update event (what happens when form values change)
    $form.submit(function(event){
        event.preventDefault()

        // gather selected values and build a permission JSON
        var formState = {}
        $(this).children('select').each(function(i, el){
            var table        = 'boh'
            var column       = $(el).data('column')
            var chosenValues = $(el).val()

            if(chosenValues && chosenValues.length > 0){
                formState[column] = chosenValues
            }
        })

        // store permission JSON in "Access detail" hidden textarea (so django will suck it up and save to DB)
        formStateAsString = JSON.stringify(formState)
        $mainDiv.find('textarea').val(formStateAsString)
    })

    // build selects
    _.each(datasetSchema['permission_schema_values'], function(columns, table){
        _.each(columns, function(valuesObj, column){
            // build options
            $select = $('<select multiple data-column="' + column + '">')
            _.each(valuesObj.values, function(value){

                var selected = ''
                // if this value is already selected in saved access details...
                if(accessDetail && accessDetail[column] && (accessDetail[column].indexOf(value) != -1) ){
                    // turn the option on
                    selected = 'selected'
                }

                $select.append('<option ' + selected + '>' + value + '</option>')
            })
            $form.append('<div>').append($select)

            // launch the "chosen" jQuery plugin to make the multiple select COOOOL
            $select.chosen({
                'width': '50%',
                'placeholder_text_multiple': "Scegli " + column,
                'search_contains': true,
            })

            // whenever the <select> is touched, update the json in the hidden field field-access_detail
            $select.on('change', function(e, params){
                $form.submit()
            })
        })
    })

}

$(document).ready(function(){

    // are we in admin edit page for a single object?
    if( $('.field-dataset option[selected]').length > 0 ){

        // find dataset field and get field name
        var datasetName = $('.field-dataset option[selected]').text()
        if(datasetName){
            askPermissionSchemaAndBuildAccessDetailForm(datasetName)
        }
    }
})
