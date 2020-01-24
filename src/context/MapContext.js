import React, { useState, createContext, Component } from 'react';

export const MapContext = createContext();

export class MapProvider extends Component {
    constructor(props) {
        super(props)
        this.state = {
            displayMap: false,
            onSingleView: true,
            hex_id: '8c81326dda43dff',
            isAuction: false
        }
        this.config = {
            lat: 46.0922495,
            lng: 13.2312417,
            zoom: 0,
            fillOpacity: 0.4,
            colorScale: ['#5F39BE', '#ffffff','#1a0731', '#EC663C', '#0081DD'],
        }
    }

    changeHexId = (hex_id) => {
        this.setState({ onSingleView: true, hex_id: hex_id, isAuction: true})
    }

    changeDisplayMap = (displayMap) => {
        this.setState({ displayMap: displayMap})
    }

    render() {
        return (
            <MapContext.Provider value={{ state: this.state, actions: { changeHexId: this.changeHexId, changeDisplayMap: this.changeDisplayMap }, config: this.config}}>
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