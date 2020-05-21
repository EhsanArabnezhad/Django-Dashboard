var React               = require('react')
var Login               = require('./Login')
var reduxConnect        = require('react-redux').connect
var Tab                 = require('react-bootstrap/lib/Tab')
var Tabs                = require('react-bootstrap/lib/Tabs')
var Button              = require('react-bootstrap/lib/Button')
var Nav                 = require('react-bootstrap/lib/Nav')
var Navbar              = require('react-bootstrap/lib/Navbar')
var NavItem             = require('react-bootstrap/lib/NavItem')
var Grid                = require('react-bootstrap/lib/Grid')
var Row                 = require('react-bootstrap/lib/Row')
var Col                 = require('react-bootstrap/lib/Col')
var Page                = require('./Page')
var WidgetPivotTable    = require('./widgets/WidgetPivotTable')
var Table               = require('./Table')
var Map                 = require('./charts/Map')
var StackedBarChart     = require('./widgets/StackedBarChart')
var MultiplePies        = require('./widgets/MultiplePies')
var ScatterChart        = require('./widgets/ScatterChart')
var SingleProduct       = require('./widgets/SingleProduct')
var NationalPerformance = require('./widgets/NationalPerformance')

var Content = React.createClass({

    getInitialState: function(){
        return {
            'activeTab': 0
        }
    },

    setActiveTab: function(e){

        // logout
        if(e==6){
            window.location.reload()
        }

        this.setState({
            'activeTab': e
        })
    },

    render: function(){

        var activeTab   = this.state.activeTab

        var tabs = [
            {
                'nav': 'Rapporto Principale',
                'tab' : (
                    <Page
                        name="mainReport"
                        filters={{
                            'Area Nielsen': {
                                type: 'array'
                            },
                            'Insegna': {
                                type: 'array'
                            },
                        }}
                        >
                        <Row>
                            <Col xs={12}>
                                <Map
                                    pageName="mainReport"
                                    helpText="Posizione e tipologia dei punti vendita."
                                />
                            </Col>
                        </Row>
                        {/*<Row>
                            <Col xs={12}>
                                <MultiplePies
                                    pageName="mainReport"
                                    helpText="Scopri da dove vengono i prodotti proposti dalle varie insegne."
                                    title={"Assortimento per provenienza nelle insegne"}
                                    p={"COUNT(*)"}
                                    y={"Insegna"}
                                    x={""}
                                    radius={70}
                                    groupBy={["Insegna" ,"Area provenienza"]}
                                    legend={true}
                                    filters={{
                                        'Reparto': {
                                            disableSelectAll: false
                                        },
                                        'Categoria Merceologica': {
                                            disableSelectAll: false,
                                            parent: 'Reparto'
                                        }
                                    }}
                                />
                            </Col>
                        </Row>*/}
                        <Row>
                            <Col xs={12}>
                                <StackedBarChart
                                    pageName="mainReport"
                                    helpText="Scopri da dove vengono i prodotti proposti dalle varie insegne."
                                    title="Assortimento per provenienza nelle insegne"
                                    x="COUNT(*)"
                                    xTitle="Distribuzione Percentuale"
                                    xPercent={true}
                                    y="Insegna"
                                    groupBy={["Insegna", "Area provenienza"]}
                                    legend={true}
                                    leftMargin={150}
                                    filters={{
                                        'Reparto': {
                                        },
                                        'Categoria Merceologica': {
                                            parent: 'Reparto'
                                        }
                                    }}
                                />
                            </Col>
                        </Row>
                        {/*<Row>
                            <Col xs={12}>
                                <StackedBarChart
                                    pageName="mainReport"
                                    helpText="Spazi espositivi che le varie insegne dedicano ai reparti."
                                    title={"Spazi espositivi per reparto"}
                                    x={"SUM(`Centimetri lineari`)"}
                                    xPercent={true}
                                    y={"Insegna"}
                                    groupBy={["Insegna", "Reparto"]}
                                    legend={true}
                                    leftMargin={150}
                                    filters={{
                                        'Promozione': {
                                            disableSelectAll: false
                                        },
                                    }}
                                />
                            </Col>
                        </Row>*/}
                        <Row>
                            <Col xs={12}>
                                <StackedBarChart
                                    pageName="mainReport"
                                    helpText="Incidenza dei prodotti promo per insegna."
                                    title={"Promozione nelle insegne"}
                                    x={"COUNT(*)"}
                                    xTitle="Distribuzione Percentuale"
                                    xPercent={true}
                                    y={"Insegna"}
                                    groupBy={["Insegna", "Promozione"]}
                                    legend={true}
                                    leftMargin={150}
                                    filters={{
                                        'Reparto': {
                                        },
                                    }}
                                />
                            </Col>
                        </Row>
                        {/*<Row>
                            <Col xs={12}>
                                <StackedBarChart
                                    pageName="mainReport"
                                    helpText="Assortimento che le varie insegne dedicano al biologico."
                                    title={"Assortimento nelle insegne per il biologico"}
                                    x={"COUNT(*)"}
                                    xTitle="Distribuzione Percentuale"
                                    xPercent={true}
                                    y={"Insegna"}
                                    groupBy={["Insegna", "Biologico"]}
                                    legend={true}
                                    leftMargin={150}
                                    filters={{
                                        'Reparto': {
                                            disableSelectAll: false
                                        },
                                    }}
                                />
                            </Col>
                        </Row>*/}
                        <Row>
                            <Col xs={12}>
                                <SingleProduct
                                    pageName="mainReport"
                                    helpText="Confronta il prezzo di un prodotto tra insegne, distinguendo quelli in promo."
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <NationalPerformance
                                    pageName="mainReport"
                                    helpText="Confronta la performance delle insegne su scala nazionale. Prezzi bassi ottengono un indice basso."
                                    filters={{
                                        'Reparto': {
                                        },
                                    }}
                                />
                            </Col>
                        </Row>
                        {/*<Row>
                            <Col xs={12}>
                                <ScatterChart
                                    pageName="mainReport"
                                    helpText="Prezzo al Kg medio di una categoria merceologica rispetto allo spazio espositivo dedicato."
                                    title={"Spazi e prezzi"}
                                    x={"Centimetri lineari"}
                                    y={"Prezzo al Kg"}
                                    series={["ID", "Descrizione", "Insegna"]}
                                    legend={true}
                                    filters={{
                                        'Reparto': {
                                            disableSelectAll: false
                                        },
                                        'Categoria Merceologica': {
                                            disableSelectAll: false,
                                            parent: 'Reparto'
                                        }
                                    }}
                                    preSelectedFilters={{
                                        'Reparto': 'Carne',
                                        'Categoria Merceologica': 'Suino'
                                    }}
                                />
                            </Col>
                        </Row>*/}
                        {/*<Row>
                            <Col xs={12}>
                                <MultiplePies
                                    pageName="mainReport"
                                    helpText="Scopri come il format del punto vendita impatta sull'assortimento"
                                    title="Assortimento per reparto in base al format del punto vendita"
                                    p="COUNT(*)"
                                    y="Tipo punto vendita"
                                    x=""
                                    radius={70}
                                    groupBy={["Tipo punto vendita" ,"Reparto"]}
                                    legend={true}
                                />
                            </Col>
                        </Row>*/}
                    </Page>
                )
            },
            {
                'nav': 'PF - Prodotti Freschi',
                'tab' : (
                    <Page
                        name="pivot"
                        filters={{
                            /*'Area Nielsen': {
                                disableSelectAll: false,
                                type: 'array'
                            },*/
                            'Regione': {
                                disableSelectAll: true,
                                //parent: 'Area Nielsen'
                            },
                            'Provincia': {
                                parent: 'Regione'
                            }
                        }}>
                        <WidgetPivotTable
                            pageName="pivot"
                            helpText="Costruisci il tuo report strategico spostando i pulsanti tratteggiati. Puoi confrontare prodotti, produttori, insegne e punti vendita secondo varie metriche."
                            draggableVars={["Insegna", "Promozione", "Categoria Merceologica",
                                "Reparto", "Biologico", "Tipo punto vendita"
                            ]}
                            draggableY={["Reparto"]}
                            draggableX={["Insegna"]}
                        />
                    </Page>
                )
            },
            {
                'nav': 'Ortofrutta',
                'tab' : (
                    <Page
                        name="pivot"

                        filters={{
                            'Regione': {
                                disableSelectAll: true
                            },
                            'Provincia': {
                                parent: 'Regione'
                            }
                        }}

                        defaultFilters={{
                            'Reparto':['Ortofrutta']
                        }}

                        >

                        <WidgetPivotTable
                            pageName="pivot"
                            helpText="Costruisci il tuo report strategico spostando i pulsanti tratteggiati. Puoi confrontare prodotti, produttori, insegne e punti vendita secondo varie metriche."
                            draggableVars={["Calibro", "Referenza", "Punto vendita",
                                "Promozione", "Grammatura", "Refrigerato", "Categoria Merceologica",
                                "Produttore", "Descrizione", "Provenienza", "Tipo punto vendita",
                                "Biologico", "Fascia grammatura", "Packaging", "Tipo packaging", "Insegna"
                            ]}
                            draggableY={["Descrizione", "Fascia grammatura", "Tipo packaging", "Biologico", "Provenienza", "Calibro"]}
                            draggableX={["Punto vendita"]}
                        />

                        {/*<StackedBarChart
                            pageName="pivot"
                            helpText="Scopri quanto spazio i punti vendita dedicano all'ortofrutta in base al biologico e al packaging."
                            title={"Spazi espositivi"}
                            x={"SUM(`Centimetri lineari`)"}
                            y={"Punto vendita"}
                            groupBy={["Punto vendita", "Tipo packaging"]}
                            legend={true}
                            filters={{
                                'Biologico': {}
                            }}
                        />*/}

                        <StackedBarChart
                            pageName="pivot"
                            helpText="Confronta assortimento e packaging dei prodotti ortofrutticoli proposti dalle insegne."
                            title={"Assortimento per tipo packaging"}
                            x={"COUNT(*)"}
                            xTitle="Distribuzione Percentuale"
                            y={"Insegna"}
                            xPercent={true}
                            groupBy={["Insegna" ,"Tipo packaging"]}
                            legend={true}
                            filters={{
                                'Biologico': {}
                            }}
                        />

                    </Page>
                )
            },
            {
                'nav': 'Carne',
                'tab' : (
                    <Page
                        name="pivot"
                        filters={{
                            'Regione': {
                                disableSelectAll: true
                            },
                            'Provincia': {
                                parent: 'Regione'
                            }
                        }}


                        defaultFilters={{
                            'Reparto':['Carne']
                        }}

                        >

                        <WidgetPivotTable
                            pageName="pivot"
                            helpText="Costruisci il tuo report strategico spostando i pulsanti tratteggiati. Puoi confrontare prodotti, produttori, insegne e punti vendita secondo varie metriche."
                            draggableVars={["Referenza", "Punto vendita", "Nato in", "Promozione",
                                "Grammatura", "Formato", "Produttore", "Descrizione", "Descrizione P.C.",
                                "Biologico", "Fascia grammatura", "Tipo produttore",
                                "Packaging", "Categoria Merceologica", "Insegna", "Tipo punto vendita"
                            ]}
                            draggableY={["Descrizione P.C.", "Fascia grammatura", "Tipo produttore", "Biologico", "Formato"]}
                            draggableX={["Punto vendita"]}
                        />

                        {/*<StackedBarChart
                            pageName="pivot"
                            helpText="Scopri quanto spazio i punti vendita dedicano alla carne in base a categoria merceologica e fascia di grammatura."
                            title={"Spazi espositivi"}
                            x={"SUM(`Centimetri lineari`)"}
                            y={"Punto vendita"}
                            groupBy={["Punto vendita", "Fascia grammatura"]}
                            legend={true}
                            filters={{
                                'Reparto': {
                                    disableSelectAll: false,
                                    hidden: true
                                },
                                'Categoria Merceologica': {
                                    disableSelectAll: false,
                                    parent: 'Reparto'
                                }
                            }}
                            preSelectedFilters={{
                                'Reparto': 'Carne'
                            }}
                        />*/}

                        {/*<StackedBarChart
                            pageName="pivot"
                            helpText="Confronta assortimento e tipo di produttore della carne."
                            title={"Assortimento per tipo produttore"}
                            x={"COUNT(*)"}
                            xTitle="Distribuzione Percentuale"
                            y={"Insegna"}
                            xPercent={true}
                            groupBy={["Insegna" ,"Tipo produttore"]}
                            legend={true}
                            filters={{
                                'Reparto': {
                                    hidden: true
                                },
                                'Categoria Merceologica': {
                                    parent: 'Reparto'
                                }
                            }}
                            preSelectedFilters={{
                                'Reparto': 'Carne'
                            }}
                        />*/}

                    </Page>
                )
            },
            {
                'nav': 'Pescheria',
                'tab' : (
                    <Page
                        name="pivot"
                        filters={{
                            'Regione': {
                                disableSelectAll: true
                            },
                            'Provincia': {
                                parent: 'Regione'
                            }
                        }}


                        defaultFilters={{
                            'Reparto':['Pesce']
                        }}
                        >

                        <WidgetPivotTable
                            pageName="pivot"
                            helpText="Costruisci il tuo report strategico spostando i pulsanti tratteggiati. Puoi confrontare prodotti, produttori, insegne e punti vendita secondo varie metriche."
                            draggableVars={["Referenza", "Punto vendita",
                                "Promozione", "Provenienza", "Area provenienza", "Provenienza FAO",
                                "Grammatura", "Descrizione", "Provenienza bis",
                                "Cattura", "Biologico", "Fascia grammatura", "Refrigerato",
                                "Packaging", "Categoria Merceologica", "Insegna",  "Tipo punto vendita"
                            ]}
                            draggableY={["Descrizione", "Cattura", "Refrigerato", "Biologico", "Provenienza bis"]}
                            draggableX={["Punto vendita"]}
                        />

                        {/*<StackedBarChart
                            pageName="pivot"
                            helpText="Scopri quanto spazio i punti vendita dedicano ai prodotti di pescheria in base a refrigerazione e allevatura."
                            title={"Spazi espositivi"}
                            x={"SUM(`Centimetri lineari`)"}
                            y={"Punto vendita"}
                            groupBy={["Punto vendita", "Cattura"]}
                            legend={true}
                            filters={{
                                'Refrigerato': {}
                            }}
                        />*/}

                        <StackedBarChart
                            pageName="pivot"
                            helpText="Confronta assortimento e provenienza della pescheria proposta dalle Insegne."
                            title={"Assortimento per provenienza"}
                            x={"COUNT(*)"}
                            xTitle="Distribuzione Percentuale"
                            y={"Insegna"}
                            xPercent={true}
                            groupBy={["Insegna" ,"Area provenienza"]}
                            legend={true}
                            filters={{
                                'Refrigerato': {}
                            }}
                        />

                    </Page>
                )
            },
            {
                'nav': 'Gastronomia',
                'tab' : (
                    <Page
                        name="pivot"
                        filters={{
                            'Regione': {
                                disableSelectAll: true
                            },
                            'Provincia': {
                                parent: 'Regione'
                            }
                        }}

                        defaultFilters={{
                            'Reparto':['Gastronomia']
                        }}
                        >

                        <WidgetPivotTable
                            pageName="pivot"
                            helpText="Costruisci il tuo report strategico spostando i pulsanti tratteggiati. Puoi confrontare prodotti, produttori, insegne e punti vendita secondo varie metriche."
                            draggableVars={["Referenza", "Punto vendita",
                                "Promozione", "Grammatura", "Tipo punto vendita",
                                "Produttore", "Descrizione", "Provenienza",
                                "Biologico", "Fascia grammatura",
                                "Packaging", "Stagionatura", "Categoria Merceologica", "Insegna", "Brand"
                            ]}
                            draggableY={["Descrizione", "Fascia grammatura", "Biologico", "Stagionatura"]}
                            draggableX={["Punto vendita"]}
                        />

                        {/*<StackedBarChart
                            pageName="pivot"
                            helpText="Scopri quanto spazio i punti vendita dedicano alla gastronomia in base alla categoria merceologica e alla fascia di grammatura."
                            title={"Spazi espositivi"}
                            x={"SUM(`Centimetri lineari`)"}
                            y={"Punto vendita"}
                            groupBy={["Punto vendita", "Fascia grammatura"]}
                            legend={true}
                            filters={{
                                'Reparto': {
                                    disableSelectAll: false,
                                    hidden: true
                                },
                                'Categoria Merceologica': {
                                    disableSelectAll: false,
                                    parent: 'Reparto'
                                }
                            }}
                            preSelectedFilters={{
                                'Reparto': 'Gastronomia'
                            }}
                        />*/}

                        <StackedBarChart
                            pageName="pivot"
                            helpText="Confronta assortimento e provenienza della gastronomia proposta dalle Insegne."
                            title={"Assortimento per Categoria Merceologica"}
                            x={"COUNT(*)"}
                            xTitle="Distribuzione Percentuale"
                            y={"Insegna"}
                            xPercent={true}
                            groupBy={["Insegna" ,"Categoria Merceologica"]}
                            legend={true}
                            filters={{
                                'Reparto': {
                                    hidden: true
                                }
                            }}
                            preSelectedFilters={{
                                'Reparto': 'Gastronomia'
                            }}
                        />

                    </Page>
                )
            },
            {
                'nav' : 'Logout',
                'tab' : (
                    <div>
                        Logging out ...
                    </div>
                )
            },
            {
                'nav' : (
                    <span style={{'color':'green'}}>
                        Help Desk
                    </span>),
                'tab' : (
                    <div>
                        <span><h3 className="help-green"><i className="fa fa-info-circle help-green"></i> Help Desk</h3></span>
                        <span></span>
                        <span><h2 className="help-green">393 84 48 121</h2></span>
                    </div>
                )
            }
        ]
        var navItems = []
        var tabPanes = []
        _.each(tabs, function(tb, i){
            navItems.push((
                <NavItem key={i} eventKey={i}>
                    {tb.nav}
                </NavItem>
            ))
            if(activeTab == i){ // only render active tab
                tabPanes.push((
                    <Tab.Pane key={i} eventKey={i}>
                        <Grid>
                            <Row>
                                <Col xs={12}>
                                    {tb.tab}
                                </Col>
                            </Row>
                        </Grid>
                    </Tab.Pane>
                ))
            }
        })

        if(this.props.userIsLogged){
            var mainContentJSX = (
                <Tab.Content>
                    {tabPanes}
                </Tab.Content>
            )
        } else {
            var mainContentJSX = (
                <Login/>
            )
        }

        return (
            <Tab.Container activeKey={activeTab} onSelect={this.setActiveTab} id="tab-container">
                <div>
                    <Navbar fixedTop={false}>
                        <Navbar.Header>
                            <Navbar.Brand>
                                <img id="logo" src="img/logo.png" />
                            </Navbar.Brand>
                            <Navbar.Toggle />
                        </Navbar.Header>

                        <Navbar.Collapse>
                            <Nav>
                                {navItems}
                            </Nav>
                        </Navbar.Collapse>

                    </Navbar>


                    {mainContentJSX}


                </div>
            </Tab.Container>

        )
    }

})

var mapStateToProps = function(state){
    return {
        userIsLogged : state.userIsLogged
    }
}
module.exports = reduxConnect(mapStateToProps)(Content)
