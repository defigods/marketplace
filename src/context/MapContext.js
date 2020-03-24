import React, { createContext, Component } from 'react';

export const MapContext = createContext();

export class MapProvider extends Component {
    constructor(props) {
        super(props)

        this.state = {
            onSingleView: false,
            hex_id: '8c81326dda43dff',
            isAuction: false,
            activeBidOverlay: false,
            activeMintOverlay: false,
            activeSellOverlay: false,
            auctionList: []
        }
    }

    changeHexId = (hex_id) => {
        this.setState({ onSingleView: true, hex_id: hex_id, isAuction: true})
    }
    disableSingleView = () => {
        this.setState({ onSingleView: false })
    }
    changeAuctionList = (list) => {
      this.setState({ auctionList: list })
    }
    changeActiveBidOverlay = (activeVal) =>{
        this.setState({ activeBidOverlay: activeVal })
    }
    changeActiveMintOverlay = (activeVal) =>{
        this.setState({ activeMintOverlay: activeVal })
    }
    changeActiveSellOverlay = (activeVal) =>{
        this.setState({ activeSellOverlay: activeVal })
    }

    render() {
        return (
          <MapContext.Provider value={
            { state: this.state, 
              actions: { 
                  changeHexId: this.changeHexId, 
                  changeActiveBidOverlay: this.changeActiveBidOverlay, 
                  changeActiveMintOverlay: this.changeActiveMintOverlay, 
                  changeAuctionList: this.changeAuctionList, 
                  disableSingleView: this.disableSingleView,
                  changeActiveSellOverlay: this.changeActiveSellOverlay
              }, 
              overviewList: this.overviewList
              }}>
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
                    {(value) => <Component {...this.props} mapProvider={{...value}} />}
                </MapContext.Consumer>
            )
        }
    }

    return ComponentWithContext
}