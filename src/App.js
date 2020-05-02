import React from 'react';
import './App.scss';
import 'react-notifications-component/dist/theme.css';

import Home from './views/Home/Home';
import Discover from './views/Discover/Discover';
import Overview from './views/Overview/Overview';
import Land from './views/Land/Land';
import Profile from './views/Profile/Profile';
import Login from './views/Login/Login';
import Signup from './views/Signup/Signup';

import NavBar from './components/NavBar/NavBar';
import Map from './components/Map/Map';
import Footer from './components/Footer/Footer';

import ReactNotification from 'react-notifications-component';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { MapProvider, MapContext } from './context/MapContext';
import { UserProvider, UserContext } from './context/UserContext';

function App() {
	return (
		<UserProvider>
			<MapProvider>
				<UserContext.Consumer>
					{(userValue) => {
						return (
							<MapContext.Consumer>
								{(mapValue) => {
									return (
										<Router>
											<div className="App">
												<ReactNotification />
												<NavBar></NavBar>
												<div className="o-container">
													<Route path="/map/" component={Map}></Route>
												</div>
												<Switch>
													{/* <Route path="/" exact component={Home}></Route> */}
													<Route exact path="/">
														<Redirect to="/map/discover" />
													</Route>
													<Route path="/map/discover" component={Discover}></Route>
													<Route path="/map/overview" component={Overview}></Route>
													<Route path="/profile" component={Profile}></Route>
													<Route path="/map/land/:id" component={Land}></Route>
													<Route path="/login" component={Login}></Route>
													<Route path="/signup" component={Signup}></Route>
												</Switch>
												<Footer></Footer>
											</div>
										</Router>
									);
								}}
							</MapContext.Consumer>
						);
					}}
				</UserContext.Consumer>
			</MapProvider>
		</UserProvider>
	);
}

export default App;
