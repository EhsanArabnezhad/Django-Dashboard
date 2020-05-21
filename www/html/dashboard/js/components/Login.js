var React        = require('react')
var reduxConnect = require('react-redux').connect
var Button       = require('react-bootstrap/lib/Button')
var Grid         = require('react-bootstrap/lib/Grid')
var Row          = require('react-bootstrap/lib/Row')
var Col          = require('react-bootstrap/lib/Col')
var Form         = require('react-bootstrap/lib/Form')
var FormGroup    = require('react-bootstrap/lib/FormGroup')
var FormControl  = require('react-bootstrap/lib/FormControl')
var ControlLabel = require('react-bootstrap/lib/ControlLabel')
var Alert        = require('react-bootstrap/lib/Alert')
var Glyphicon    = require('react-bootstrap/lib/Alert')
var Api          = require('./../api/api.js')

var Login = React.createClass({

    getInitialState: function(){

        var username = ''
        var password = ''

        // In development you can define auth in the config file.
        if(config.auth && config.auth.username && config.auth.password) {
            username = config.auth.username
            password = config.auth.password
        }

        return {
            username   : username,
            password   : password,
            isLoading  : false,
            loginError : false
        }
    },

    componentDidMount: function() {
        if(this.state.username && this.state.password){
            this.loginRequest()
        }
    },

    loginRequest: function(){

        var component = this

        // build API object. It will manage all network requests
        dashboard.API = new Api(config.serverURL, component.state.username, component.state.password)

        // we require the server to give us unique values for a set of variables.
        // we will use them to populate filters
        dashboard.API.get('uniquevalues', config.uniqueValuesRequested, function(uniqValuesResponse){

            if(uniqValuesResponse.status == 200){

                dashboard.metadata = {
                    'uniqueValues': uniqValuesResponse.data
                }

                component.props.dispatch({
                    'type'    : 'LOGIN'
                })
            } else {
                component.setState({
                    loginError: true,
                    isLoading : false
                })
            }
        })

        component.setState({
            isLoading: true
        })
    },

    onSubmit: function(event){
        event.preventDefault()
        this.loginRequest()
    },

    onUserChange: function(event){
        this.setState({username: event.target.value})
    },

    onPassChange: function(event){
        this.setState({password: event.target.value})
    },

    render: function(){

        var alertJSX = undefined
        if(this.state.loginError){
            alertJSX = (
                <Alert bsStyle="danger">
                    Credenziali non valide.
                </Alert>
            )
        }

        var enterButtonJSX = (
            <Button type="submit">
                Entra
            </Button>
        )
        if(this.state.isLoading){
            enterButtonJSX = (
                <i className="fa fa-circle-o-notch fa-spin fa-fw fa-2x"></i>
            )
        }

        return (

            <Grid>
                <Row>
                    <Col xs={12} md={6} mdOffset={3}>
                        <div id="login">
                            <h4>Market View</h4>
                            <h4>Dashboard di Business Intelligence</h4>
                            <br/>
                            <h6>Analisi di Mercato GDO Categoria FRESCHI</h6>
                            <h6>
                                <strong>
                                    Strumento dinamico per la comprensione, analisi ed esplorazione del mercato GDO per la categoria Freschi
                                </strong>
                            </h6>
                            <p>
                                Le informazioni danno modo di confrontare, le Insegne , Format , PDV, in funzione del territorio e dati relativi a:
                                <ul>
                                    <li>Price per Prodotto e Referenza</li>
                                    <li>Provenienze Prodotti e categorie merceologiche</li>
                                    <li>Dinamiche di assortimento</li>
                                    <li>Spazi espositivi per Reparto e Insegne</li>
                                </ul>
                                Con la possibilità di accedere ad una serie di informazioni a livello nazionale, regionale e provinciale per Insegna e Format e singolo PDV.
                            </p>

                            <Row>
                                <Col xs={12} md={9}>

                                    <br/>
                                        {alertJSX}
                                    <br/>

                                    <form onSubmit={this.onSubmit}>
                                        <Form>
                                            <FormGroup controlId="username">
                                                <ControlLabel>User</ControlLabel>
                                                <FormControl name={this.state["username"]} type="text" placeholder="Username" onChange={this.onUserChange} />
                                            </FormGroup>
                                            <FormGroup controlId="password">
                                                <ControlLabel>Password</ControlLabel>
                                                <FormControl name={this.state["password"]} type="password" placeholder="Password" onChange={this.onPassChange} />
                                            </FormGroup>

                                            {enterButtonJSX}

                                        </Form>
                                        
                                        <br/>
                                        <p style={{fontSize:'70%', lineHeight:'12px'}}>
                                            Questo sito fa uso di cookie (tecnici e di terze parti) per migliorare l’esperienza di navigazione degli utenti e per raccogliere informazioni sull’utilizzo del sito stesso. Proseguendo nella navigazione si accetta l’uso dei cookie; in caso contrario è possibile abbandonare il sito.
                                        </p>
                                    </form>
                                </Col>
                                <Col xs={12} md={3}>
                                    <img src="img/gdo.png" />
                                </Col>
                            </Row>

                        </div>

                    </Col>
                </Row>
            </Grid>

        )
    }

})

module.exports = reduxConnect()(Login)
