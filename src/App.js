import React from 'react';
import './App.scss';
import Home from './views/Home/Home';
import Discover from './views/Discover/Discover';
import Overview from './views/Overview/Overview';
import NavBar from './components/NavBar/NavBar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';


function App() {
  return (
    <Router>
      <div className="App">
        <NavBar></NavBar>
        <Switch>
          <Route path="/" exact component={Home}></Route>
          <Route path="/discover" component={Discover}></Route>
          <Route path="/overview" component={Overview}></Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
