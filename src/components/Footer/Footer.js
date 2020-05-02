import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Footer extends Component {
	render() {
		return (
			<div className="Footer">
				<div className="o-fourth">
					<div className="Footer__container">
						<Link to="/" className="Logo__footer_link">
							<div className="Footer__logo Icon">
								<svg
									width="234px"
									height="260px"
									viewBox="0 0 234 260"
									version="1.1"
									xmlns="http://www.w3.org/2000/svg"
									xmlnsXlink="http://www.w3.org/1999/xlink"
								>
									<title>Group</title>
									<desc>Created with Sketch.</desc>
									<defs>
										<linearGradient
											x1="25.3511512%"
											y1="49.9738242%"
											x2="107.245785%"
											y2="49.9738242%"
											id="linearGradient-1"
										>
											<stop stopColor="#6B32C1" offset="0%"></stop>
											<stop stopColor="#C81D5E" offset="99.6%"></stop>
										</linearGradient>
										<linearGradient x1="0%" y1="49.997576%" x2="100.032735%" y2="49.997576%" id="linearGradient-2">
											<stop stopColor="#EC663C" offset="0%"></stop>
											<stop stopColor="#F9B426" offset="100%"></stop>
										</linearGradient>
										<linearGradient
											x1="52.9498211%"
											y1="9.77958549%"
											x2="46.413551%"
											y2="97.6215544%"
											id="linearGradient-3"
										>
											<stop stopColor="#0081DD" offset="0%"></stop>
											<stop stopColor="#0589E0" offset="18.55%"></stop>
											<stop stopColor="#11A0E9" offset="47.85%"></stop>
											<stop stopColor="#25C5F8" offset="84.03%"></stop>
											<stop stopColor="#2FD7FF" offset="99.72%"></stop>
										</linearGradient>
										<linearGradient
											x1="50.0693857%"
											y1="83.9637181%"
											x2="50.0693857%"
											y2="-0.0504747626%"
											id="linearGradient-4"
										>
											<stop stopColor="#4E4D4C" offset="0%"></stop>
											<stop stopColor="#5A5858" offset="12.43%"></stop>
											<stop stopColor="#747273" offset="46.61%"></stop>
											<stop stopColor="#848183" offset="76.91%"></stop>
											<stop stopColor="#8A8789" offset="100%"></stop>
										</linearGradient>
										<radialGradient
											cx="35.4086957%"
											cy="34.4852355%"
											fx="35.4086957%"
											fy="34.4852355%"
											r="66.2842391%"
											id="radialGradient-5"
										>
											<stop stopColor="#FFFFFF" offset="0%"></stop>
											<stop stopColor="#FDFDFC" stopOpacity="0.8589" offset="35.27%"></stop>
											<stop stopColor="#F6F6F2" stopOpacity="0.7424" offset="64.4%"></stop>
											<stop stopColor="#EAEBE0" stopOpacity="0.635" offset="91.26%"></stop>
											<stop stopColor="#E5E6D9" stopOpacity="0.6" offset="100%"></stop>
										</radialGradient>
										<linearGradient
											x1="21.2472955%"
											y1="18.1560041%"
											x2="81.1871703%"
											y2="81.6403727%"
											id="linearGradient-6"
										>
											<stop stopColor="#FFFFFF" offset="0%"></stop>
											<stop stopColor="#FFFFFF" stopOpacity="0.5" offset="99.99%"></stop>
										</linearGradient>
										<linearGradient
											x1="37.2050099%"
											y1="17.2946945%"
											x2="63.1259484%"
											y2="89.469351%"
											id="linearGradient-7"
										>
											<stop stopColor="#FFFFFF" offset="0%"></stop>
											<stop stopColor="#FFFFFF" stopOpacity="0.3" offset="99.99%"></stop>
										</linearGradient>
									</defs>
									<g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
										<g id="logo_ovr">
											<g id="Group">
												<path
													d="M228.9,48.9 C226,44.9 222,41.6 217.3,39.7 L182.3,25 L127.6,2.1 C124.2,0.7 120.6,0 117,0 L117,96.6 L117,163.6 L228.9,210.5 C232.2,205.9 234,200.4 234,194.5 L234,64.9 C234.1,59.1 232.2,53.5 228.9,48.9 Z"
													id="h_viola_1_"
													fill={`url(${window.location}#linearGradient-1`}
												></path>
												<path
													d="M106.5,2.1 L19.8,38.4 L16.8,39.7 C12,41.7 8.1,44.9 5.2,48.9 C1.9,53.5 0,59.1 0,64.9 L0,194.4 C0,200.3 1.9,205.8 5.1,210.4 L117,163.5 L117,96.5 L117,0 C113.4,0 109.8,0.7 106.5,2.1 Z"
													id="h_org_1_"
													fill={`url(${window.location}#linearGradient-2`}
												></path>
												<path
													d="M117,163.5 L5.1,210.4 C8,214.4 11.9,217.6 16.6,219.6 L88.7,250.3 L106.2,257.8 C109.6,259.3 113.3,260 116.9,260 C120.6,260 124.2,259.3 127.6,257.8 L139.8,252.6 L217.2,219.6 C221.9,217.6 225.9,214.4 228.7,210.4 L117,163.5 Z"
													id="h_blu_1_"
													fill={`url(${window.location}#linearGradient-3`}
												></path>
												<path
													d="M198.7,67.6 C196.6,64.5 193.7,62 190.2,60.5 L164.7,49.2 L124.8,31.6 C122.3,30.5 119.7,30 117.1,30 C114.5,30 111.8,30.5 109.4,31.6 L46.1,59.5 L43.9,60.5 C40.4,62 37.5,64.5 35.4,67.6 C33,71.1 31.6,75.4 31.6,79.9 L31.6,179.6 C31.6,184.1 33,188.4 35.3,191.9 C37.4,195 40.3,197.5 43.7,199 L96.3,222.6 L109.1,228.4 C111.6,229.5 114.3,230.1 116.9,230.1 C119.5,230.1 122.2,229.5 124.7,228.4 L133.6,224.4 L190.1,199 C193.5,197.5 196.4,195 198.5,191.9 C200.9,188.4 202.2,184.1 202.2,179.6 L202.2,79.9 C202.5,75.4 201.1,71.1 198.7,67.6 Z"
													id="h_hex-trasp_1_"
													fill={`url(${window.location}#linearGradient-4`}
													opacity="0.45"
													style={{ mixBlendMode: 'color-burn' }}
												></path>
												<circle
													id="h_sphere_1_"
													fill={`url(${window.location}#radialGradient-5)`}
													cx="117"
													cy="129.6"
													r="55.2"
												></circle>
												<path
													d="M217.3,39.7 L182.3,25 L127.6,2.1 C124.2,0.7 120.6,0 117,0 C113.4,0 109.8,0.7 106.4,2.1 L19.8,38.4 L16.8,39.7 C12,41.7 8.1,44.9 5.2,48.9 L117,96.6 L228.9,49 C226,44.9 222,41.7 217.3,39.7 Z"
													id="h_top_1_"
													fill={`url(${window.location}#linearGradient-6`}
													opacity="0.76"
													style={{ mixBlendMode: 'soft-light' }}
												></path>
												<path
													d="M228.9,48.9 L117,96.6 L117,163.6 L117,260 C120.7,260 124.3,259.3 127.7,257.8 L139.9,252.6 L217.3,219.6 C222,217.6 226,214.4 228.8,210.4 C232.1,205.8 233.9,200.3 233.9,194.4 L233.9,64.9 C234.1,59.1 232.2,53.5 228.9,48.9 Z"
													id="h_left_1_"
													fill={`url(${window.location}#linearGradient-7`}
													style={{ mixBlendMode: 'soft-light' }}
												></path>
											</g>
										</g>
									</g>
								</svg>
							</div>
						</Link>
						<div className="Footer__copyright">Over Holding Srl © 2020</div>
					</div>
				</div>
				<div className="o-fourth">
					<div className="Footer__container --large">
						Over Holding Srl <br></br>
						Viale Tricesimo n. 200<br></br>
						33100 Udine - Italy<br></br>
						Vat no. IT02945890305
					</div>
				</div>
				<div className="o-fourth">
					<div className="Footer__container">
						<div className="Footer__title">Legal</div>
						<Link to="/" className="Footer__link">
							Terms of Service
						</Link>
						<Link to="/" className="Footer__link">
							Privacy
						</Link>
					</div>
				</div>
				<div className="o-fourth">
					<div className="Footer__container">
						<div className="Footer__title">Community</div>
						<Link to="/" className="Footer__link">
							Telegram
						</Link>
						<Link to="/" className="Footer__link">
							Medium
						</Link>
						<Link to="/" className="Footer__link">
							Facebook
						</Link>
					</div>
				</div>
			</div>
		);
	}
}

export default Footer;
