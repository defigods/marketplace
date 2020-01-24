import React from 'react';
import './App.scss';
import Home from './views/Home/Home';
import Discover from './views/Discover/Discover';
import Overview from './views/Overview/Overview';
import NavBar from './components/NavBar/NavBar';
import Map from './components/Map/Map';
import ChangeHex from './components/ChangeHex/ChangeHex';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { MapProvider } from './context/MapContext'

function App() {
  return (
    <MapProvider>
      <Router>
        <div className="App">
          <NavBar></NavBar>
          <div className="o-container">
            <Map></Map>
            <ChangeHex/>
          </div>
          <Switch>
            <Route path="/" exact component={Home}></Route>
            <Route path="/discover" component={Discover}></Route>
            <Route path="/overview" component={Overview}></Route>
          </Switch>
          
        </div>
      </Router>
    </MapProvider>
  );
}

export default App;
