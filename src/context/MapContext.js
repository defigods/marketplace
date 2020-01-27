import React, { createContext, Component } from 'react';

export const MapContext = createContext();

export class MapProvider extends Component {
    constructor(props) {
        super(props)

        this.state = {
            onSingleView: false,
            hex_id: '8c81326dda43dff',
            isAuction: false,
        }
        
        this.overviewList = [
            {
                key: "8cbcc350c0ab5ff",
                value:"300",
                background_image:"url(https://www.ovr.ai/wp-content/uploads/static/auction-map.png)",
                name:{sentence:"director.connect.overflow", hex: "8cbcc350c0ab5ff"},
                location:"Venice, Italy",
                bid_status:{className: "--best", sentence:"BEST BID"},
                date_end:"2020-01-17T15:44-0000",
            },
            {
                key: "8c81326dda43dff",
                value:"300",
                background_image:"url(https://www.ovr.ai/wp-content/uploads/static/auction-map.png)",
                name: { sentence: "director.connect.overflow", hex: "8c81326dda43dff"},
                location:"Venice, Italy",
                bid_status:{className: "--out", sentence:"BEST BID"},
                date_end:"2020-01-17T15:44-0000"
            },
            {
                key: "8cbcc350c0ab5ff",
                value:"300",
                background_image:"url(https://www.ovr.ai/wp-content/uploads/static/auction-map.png)",
                name:{sentence:"director.connect.overflow", hex: "8cbcc350c0ab5ff"},
                location:"Venice, Italy",
                bid_status:{className: "--best", sentence:"BEST BID"},
                date_end:"2020-01-17T15:44-0000",
            },
            {
                key: "8c81326dda43dff",
                value:"300",
                background_image:"url(https://www.ovr.ai/wp-content/uploads/static/auction-map.png)",
                name: { sentence: "director.connect.overflow", hex: "8c81326dda43dff"},
                location:"Venice, Italy",
                bid_status:{className: "--out", sentence:"BEST BID"},
                date_end:"2020-01-17T15:44-0000"
            },
            {
                key: "8cbcc350c0ab5ff",
                value:"300",
                background_image:"url(https://www.ovr.ai/wp-content/uploads/static/auction-map.png)",
                name:{sentence:"director.connect.overflow", hex: "8cbcc350c0ab5ff"},
                location:"Venice, Italy",
                bid_status:{className: "--best", sentence:"BEST BID"},
                date_end:"2020-01-17T15:44-0000",
            },
            {
                key: "8c81326dda43dff",
                value:"300",
                background_image:"url(https://www.ovr.ai/wp-content/uploads/static/auction-map.png)",
                name: { sentence: "director.connect.overflow", hex: "8c81326dda43dff"},
                location:"Venice, Italy",
                bid_status:{className: "--out", sentence:"BEST BID"},
                date_end:"2020-01-17T15:44-0000"
            }
        ]
    }

    changeHexId = (hex_id) => {
        this.setState({ onSingleView: true, hex_id: hex_id, isAuction: true})
    }

    render() {
        return (
            <MapContext.Provider value={{ state: this.state, actions: { changeHexId: this.changeHexId }, overviewList: this.overviewList}}>
                {this.props.children}
            </MapContext.Provider>
        )
    }
}

export function withMapContext(Component) {
    class ComponentWithContext extends React.Component {
        render() {
            return (
                <MapContext.Consumer>
                    {(value) => <Component {...this.props} mapProvider={value} />}
                </MapContext.Consumer>
            )
        }
    }

    return ComponentWithContext
}