import React, { Suspense } from 'react';
import './App.scss';
import './i18n';
import 'react-notifications-component/dist/theme.css';

// import Home from './views/Home/Home';
import Discover from './views/Discover/Discover';
import Overview from './views/Overview/Overview';
import Land from './views/Land/Land';
import Lands from './views/Lands/Lands';
import Profile from './views/Profile/Profile';
import Activity from './views/Activity/Activity';
import Login from './views/Login/Login';
import LoginHelper from './views/LoginHelper/LoginHelper';
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

import ReactGA from 'react-ga';
import { createBrowserHistory } from 'history';

//TODO
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { Translation } from 'react-i18next';

const supportedLangs = ['en', 'zh'];
const fallbackLang = 'en';

function App() {

	i18next.use(LanguageDetector).init({
		// order and from where user language should be detected
		order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],

		// keys or params to lookup language from
		lookupQuerystring: 'lng',
		lookupCookie: 'i18next',
		lookupLocalStorage: 'i18nextLng',
		lookupSessionStorage: 'i18nextLng',
		lookupFromPathIndex: 0,
		lookupFromSubdomainIndex: 0,
		lng: navigator.language || navigator.userLanguage,
	  
		// cache user language on
		caches: ['localStorage', 'cookie'],
		excludeCacheFor: ['cimode'], // languages to not persist (cookie, localStorage)
	});

	if(!supportedLangs.includes(i18next.language)){
		localStorage.removeItem('i18nextLng');
		i18next.changeLanguage(fallbackLang)
	}

	const history = createBrowserHistory();
	
	// Initialize google analytics page view tracking
	history.listen(location => {
		ReactGA.initialize('UA-128415861-1');
		ReactGA.set({ page: location.pathname }); // Update the user's current page
		ReactGA.pageview(location.pathname); // Record a pageview for the given page
	});

	return (
		<Suspense fallback="loading">
			<Translation>
				{(t, { i18n }) =>
				<UserProvider t={t} i18n={i18n}>
					<Web3Provider t={t} i18n={i18n}>
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
																<Router history={history}>
																	<div className="App">
																		<ReactNotification />
																		<NavBar></NavBar>
																		<BannerNotification></BannerNotification>
																		<div className="o-container">
																			{/* <Route path="/map/" component={Map}></Route>  TODO: KYC - Remove comment */}
																		</div>
																		<Switch>
																			{/* <Route path="/" exact component={Home}></Route> */}
																			<Route exact path="/">
																				{userValue.state.isLoggedIn ? (
																					<Redirect to="/profile" />
																				) : (
																					<Redirect to="/login" />
																				)}
																				{/* TODO: KYC - Redirect to Redirect to="/map/discover" */}
																			</Route>
																			{/* <Route path="/map/discover" component={Discover}></Route>
																			<Route path="/map/overview" component={Overview}></Route>
																			<Route path="/map/lands" component={Lands}></Route>
																			<Route path="/map/land/:id" component={Land}></Route>  TODO: KYC - Remove comment */}
																			<Route path="/profile" component={Profile}></Route>
																			{/* <Route path="/activity" component={Activity}></Route>  TODO: KYC - Remove comment */}
																			<Route path="/login" component={Login}></Route>
																			<Route path="/signup" component={Signup}></Route>
																			<Route path="/login-helper" component={LoginHelper}></Route>
																			{/* <Route path="/buy-tokens" component={BuyTokens}></Route>
																			<Route path="/indacoin-response" component={IndacoinResponse}></Route>  TODO: KYC - Remove comment */}
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
				</UserProvider> }
			</Translation>
		</Suspense>
	);
}

export default App;
