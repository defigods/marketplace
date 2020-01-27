import React from 'react';
import './App.scss';
import Home from './views/Home/Home';
import Discover from './views/Discover/Discover';
import Overview from './views/Overview/Overview';
import Land from './views/Land/Land'
import NavBar from './components/NavBar/NavBar';
import Map from './components/Map/Map';
import Footer from './components/Footer/Footer';
import ChangeHex from './components/ChangeHex/ChangeHex';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { MapProvider, MapContext } from './context/MapContext'

function App() {
  return (
    <MapProvider>

      <Router>
        <div className="App">
          <NavBar></NavBar>
          <div className="o-container">
            <MapContext.Consumer>
              {(mapValue) => { 
                return(
                  <Route path="/map/" component={Map}></Route>
                )
              }}
            </MapContext.Consumer>
            {/* <ChangeHex/> */}
          </div>
          <Switch>
            <Route path="/" exact component={Home}></Route>
            <Route path="/map/discover" component={Discover}></Route>
            <Route path="/map/overview" component={Overview}></Route>
            <Route path="/map/land/:id" component={Land}></Route>
          </Switch>
          <Footer></Footer>
        </div>
      </Router>
      
    </MapProvider>
  );
}

export default App;
