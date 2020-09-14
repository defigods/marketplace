import React from 'react';
import './App.scss';
import 'react-notifications-component/dist/theme.css';

// import Home from './views/Home/Home';
import Discover from './views/Discover/Discover';
import Overview from './views/Overview/Overview';
import Land from './views/Land/Land';
import Lands from './views/Lands/Lands';
import Profile from './views/Profile/Profile';
import Activity from './views/Activity/Activity';
import Login from './views/Login/Login';
import Signup from './views/Signup/Signup';
import BuyTokens from './views/BuyTokens/BuyTokens';
import IndacoinResponse from './views/IndacoinResponse/IndacoinResponse';

import NavBar from './components/NavBar/NavBar';
import Map from './components/Map/Map';
import Footer from './components/Footer/Footer';
import BannerNotification from './components/BannerNotification/BannerNotification';

import ReactNotification from 'react-notifications-component';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { MapProvider, MapContext } from './context/MapContext';
import { UserProvider, UserContext } from './context/UserContext';
import { Web3Provider, Web3Context } from './context/Web3Context';

function App() {
	return (
		<UserProvider>
			<Web3Provider>
				<MapProvider>
					<UserContext.Consumer>
						{(userValue) => {
							return (
								<Web3Context.Consumer>
									{(web3Value) => {
										return (
											<MapContext.Consumer>
												{(mapValue) => {
													return (
														<Router>
															<div className="App">
																<ReactNotification />
																<NavBar></NavBar>
																<BannerNotification></BannerNotification>
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
																	<Route path="/map/lands" component={Lands}></Route>
																	<Route path="/map/land/:id" component={Land}></Route>
																	<Route path="/profile" component={Profile}></Route>
																	<Route path="/activity" component={Activity}></Route>
																	<Route path="/login" component={Login}></Route>
																	<Route path="/signup" component={Signup}></Route>
																	<Route path="/buy-tokens" component={BuyTokens}></Route>
																	<Route path="/indacoin-response" component={IndacoinResponse}></Route>
																</Switch>
																<Footer></Footer>
															</div>
														</Router>
													);
												}}
											</MapContext.Consumer>
										);
									}}
								</Web3Context.Consumer>
							);
						}}
					</UserContext.Consumer>
				</MapProvider>
			</Web3Provider>
		</UserProvider>
	);
}

export default App;
