var React        = require('react')
var reduxConnect = require('react-redux').connect
var Panel        = require('./../Panel')
var utils        = require('./../../utils/utility')

var Map = React.createClass({

    putPoisOnMap: function(){

        var component = this

        // filter pois
        var localFilters = {} // TODO: give local filters to the map}
        var query = _.extend({}, localFilters, component.props.pageControls)

        // load data and draw pois
        dashboard.API.get('puntivendita', query, function(pois){

            var pois = pois.data

            if(pois.length == 0){
                return
            }

            // tipi di punto vendita
            var tipoPuntoVendita = _.map(pois, function(p){
                return p["Tipo punto vendita"]
            })
            tipoPuntoVendita = _.unique(tipoPuntoVendita)
            var count = 0
            var coloriTipoPuntoVendita = _.reduce(tipoPuntoVendita, function(memo, ins){
                if(ins !== ""){
                    memo[ins] = utils.getColorFromPalette(count)
                    count++
                }
                return memo
            }, {})

            // add legend
            component.addLegend(coloriTipoPuntoVendita)

            var latitudes        = []
            var longitudes       = []
            component.placedPois = []
            _.each(pois, function(poi){

                var coords = [ +poi["Lat"], +poi["Lon"] ]
                latitudes.push( +poi["Lat"] )
                longitudes.push( +poi["Lon"] )
                var color  = coloriTipoPuntoVendita[ poi["Tipo punto vendita"] ]
                var marker = L.circleMarker(
                    coords,
                    {
                        //color      : 'red',
                        stroke      : false,
                        fillColor   : color,
                        fillOpacity : 0.5,
                        radius      : 20
                    }
                )

                marker.addTo(component.map)
                    .bindPopup('<div>' + poi["Insegna"] + '</div>' +
                                '<h6>' + poi["Nome"] + '</h6>' +
                                '<div>' + poi["Tipo punto vendita"] + '</div>' +
                                '<div>' + poi["Indirizzo"] + '</div>')

                component.placedPois.push(marker)
            })

            var bounds = [
                [ _.min(latitudes), _.min(longitudes) ],
                [ _.max(latitudes), _.max(longitudes) ]
            ]
            component.map.fitBounds(bounds, {
                padding: [20,20]
            })
        })
    },

    addLegend: function(colorLegend){

        // if there is already a legend, remove it
        if(this.legend){
            this.map.removeControl(this.legend)
        }

        var legend = L.control({position:'topright'})
        legend.onAdd = function(map){
            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 10, 20, 50, 100, 200, 500, 1000],
                labels = []

            // loop through our density intervals and generate a label with a colored square for each interval
            _.each(colorLegend, function(v,k){
                div.innerHTML +=
                    '<i style="background:' + v + '"></i> ' + k + '<br>'
            })

            return div
        }

        // add legend to both map and component
        legend.addTo(this.map)
        this.legend = legend
    },

    deletePoisFromMap: function(){
        var component = this
        _.each(component.placedPois, function(poi){
            component.map.removeLayer(poi)
        })
    },

    componentDidMount: function(){

        var component = this

        window.requestAnimationFrame(function(){     // http://stackoverflow.com/a/28748160

            var center = [41.9, 12.5]   // caput mundi
            component.map = L.map('map').setView(center, 6)

            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(component.map)

            // force tile refresh
            component.map._onResize()

            component.putPoisOnMap()
        })
    },

    componentDidUpdate: function(){
        this.deletePoisFromMap()
        this.putPoisOnMap()
    },

    render: function(){

        var mapStyle = {
            width:'100%',
            height:'300px',
        }

        return (
            <Panel collapsible defaultExpanded header="Mappa PdV" helpText={this.props.helpText}>
                <div id="map" style={mapStyle}></div>
            </Panel>
        )
    }

})


var mapStateToProps = function(state, ownprops){
    return {
        pageControls : state.controls[ownprops.pageName]
    }
}
module.exports = reduxConnect(mapStateToProps)(Map)
