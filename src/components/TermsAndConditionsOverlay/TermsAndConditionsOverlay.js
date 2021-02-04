/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import { withMapContext } from 'context/MapContext';
import { withUserContext } from 'context/UserContext';
import { withWeb3Context } from 'context/Web3Context';
import ValueCounter from '../ValueCounter/ValueCounter';
import HexButton from '../HexButton/HexButton';
import config from 'lib/config';
import { warningNotification, dangerNotification } from 'lib/notifications';
import PropTypes from 'prop-types';
import { postAcceptIBCOTerms } from 'lib/api';

import Tooltip from '@material-ui/core/Tooltip';

import Help from '@material-ui/icons/Help';
import { useTranslation } from 'react-i18next';
import { parse } from 'date-fns';

const TermsAndConditionsOverlay = (props) => {
	const { t, i18n } = useTranslation();

	const userState = props.userProvider.state.user;
	const [showOverlay, setShowOverlay] = useState(props.showOverlay);
	const [classShowOverlay, setClassShowOverlay] = useState(false);
	const [hasReachedBottom, setHasReachedBottom] = useState(false);

	const anchorRef = React.useRef(null);
	const [open, setOpen] = React.useState(false);

	// Listener for fadein and fadeout animation of overlay
	useEffect(() => {
		if (props.showOverlay) {
			setShowOverlay(true);
			setTimeout(() => {
				setClassShowOverlay(true);
			}, 50);
		} else {
			setClassShowOverlay(false);
			setTimeout(() => {
				setShowOverlay(false);
			}, 500);
		}
	}, [props.showOverlay]);

	function acceptTerms(e) {
		e.preventDefault();
		postAcceptIBCOTerms().then((response) => {
			props.userProvider.actions.acceptIbcoTermsAndConditions();
			disablePanel();
		});
	}

	function disablePanel(e) {
		props.disableTermsAndConditionsOverlay();
	}

	function handleScroll(e) {
		const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
		if (bottom) {
			setHasReachedBottom(true);
		}
	}

	if (!showOverlay) return null;

	return (
		<div className={`OverlayContainer ${classShowOverlay ? '--js-show' : ''}`}>
			<div className="CenterOverlay__backpanel"> </div>
			<div key="bid-overlay-" to={props.url} className={`CenterOverlay NormalInputs`}>
				<div className="Overlay__cont">
					<div className="o-row">
						<h2>{t('IBCO.tec')}</h2>
					</div>
					<div className="o-row">
						<div className="c-terms-condition" onScroll={handleScroll}>
							OVR TOKEN - TERMS AND CONDITIONS OF TOKEN SALE AND USAGE
							<br></br>PLEASE READ THESE TERMS OF TOKEN SALE AND USAGE CAREFULLY. IF YOU DO NOT AGREE TO THESE TERMS (AS
							DEFINED HEREIN), DO NOT PURCHASE (WHETHER THROUGH AN INTERMEDIARY OR OTHERWISE) OR CONTINUE TO HOLD OR USE
							OVR (AS DEFINED BELOW). THESE TERMS DO NOT CONSTITUTE A PROSPECTUS OR OFFERING DOCUMENT, AND ARE NOT AN
							OFFER TO SELL, NOR THE SOLICITATION OF AN OFFER TO BUY ANY INVESTMENT OR FINANCIAL INSTRUMENT IN ANY
							JURISDICTION.
							<br></br>BY MAKING A CONTRIBUTION TO THE SELLER (AS DEFINED BELOW) OR ANY INTERMEDIARY FOR THE PURCHASE OF
							OVR, OR BY CONTINUING TO HOLD OR USE OVR WHICH YOU MAY HAVE OBTAINED BY ANY OTHER MEANS, YOU WILL BE BOUND
							BY THESE TERMS AND ALL TERMS INCORPORATED HEREIN BY REFERENCE. BY ACCEPTING THESE TERMS, YOU WILL BE
							ENTERING INTO A BINDING AGREEMENT WITH THE SELLER, WHICH TERMS CONTAIN PROVISIONS WHICH AFFECT YOUR LEGAL
							RIGHTS. THE PURCHASE, HOLDING AND USAGE OF DIGITAL TOKENS IS SUBJECT TO A NUMBER OF RISKS (INCLUDING
							FINANCIAL RISK), SOME OF WHICH THE SELLER HAS SET OUT IN THESE TERMS. IF YOU ARE IN ANY DOUBT AS TO THE
							SUITABILITY OR OTHERWISE OF PURCHASING, HOLDING OR USAGE OF THE DIGITAL TOKENS REFERRED TO IN THESE TERMS,
							YOU SHOULD SEEK APPROPRIATE PROFESSIONAL ADVICE. NOTHING IN THESE TERMS CONSTITUTES LEGAL, FINANCIAL,
							BUSINESS OR TAX ADVICE AND YOU SHOULD CONSULT YOUR OWN LEGAL, FINANCIAL, TAX OR OTHER PROFESSIONAL ADVISER
							BEFORE ENGAGING IN ANY ACTIVITY IN CONNECTION HEREWITH. Your purchase, whether through an intermediary or
							otherwise, of OVR tokens (OVR) from OVRGLOBAL OÜ , a company incorporated in Estonia, Tallin, Keslinna
							Linnaosa Roseni tn 12-45 Registry Code: 14721068 (the Seller, or us), as well as continued holding and/or
							usage of OVR is subject to these Terms and Conditions (the Terms). Each of you and the Seller is a
							“Party,” and together the “Parties.” Please read the below terms and conditions carefully before
							registering, accessing, browsing, downloading and/or using the website at http://www.ovr.ai (the Website).
							By accessing or using the Website, purchasing OVR (whether through an intermediary or otherwise), or
							continuing to hold or use OVR, you agree to be bound by these Terms (and all terms incorporated by
							reference). Before agreeing to the Terms, you must read this document in full. If at any time you do not
							agree to these terms and conditions or do not wish to be bound by these terms and conditions, you may not
							access or use the Website, and shall not be entitled to purchase OVR (whether through an intermediary or
							otherwise) or continue to hold or use OVR. The Seller shall be under no obligation to maintain a copy of
							these Terms on the Website after the sale of OVR, and you are advised to print or download and keep a copy
							of these Terms for your future reference (if required).
							<br></br>PURPOSE AND USAGE OF TOKENS
							<br></br>OVR is a cryptographic utility token. The purpose of OVR is to facilitate the participation in
							the "OVR Project" universe (the OVR Project ecosystem) which, when fully developed, is envisaged to be a
							platform for the issuance of non-fungible "OVRLand", NFTs representing geographic locations. The OVR
							Project ecosystem is not, and will in no case be, an enterprise, corporation, partnership or other entity
							or body corporate established under the laws of any jurisdiction, but a computerised consensus protocol
							based on which a public transaction ledger is generated.
							<br></br>OVR is designed to be the only mechanism by which a user may obtain access to certain products
							and services on the OVR Project ecosystem (when the same is completed and deployed). It is not intended to
							be a medium of exchange accepted by the public, or a section of the public, as payment for goods or
							services or for the discharge of a debt. For each exchange of services or products on the OVR Project
							ecosystem, the costs are to be quantified in OVR and paid to the OVR Project ecosystem and/or the other
							party providing the service. The goal of introducing OVR is to provide a convenient and secure mode of
							payment and settlement between participants who interact within the OVR Project ecosystem. Further, OVR is
							to be paid to users as incentives for participating in the OVR Project ecosystem. Users of the OVR Project
							ecosystem and/or holders of OVR which did not actively participate in the OVR Project ecosystem will not
							receive any OVR incentives.
							<br></br>The precise scope of the OVR Project ecosystem will be developed further and will be announced
							once finalised. The following features are planned for OVR: (a) OVR would be used as the base ecosystem
							currency for the purchase of various digital assets, such as OVR Project in-app purchases, virtual goods,
							staking, consumables and collectibles. For example, users would purchase and spend OVR in order to buy
							OVRLands, (b)as an indication of commitment to the ecosystem and safeguard against malicious behaviour,
							players are also required to stake OVR to elect IPFS nodes, (c) OVR is inherently transferable to other
							users, and also fully exchangeable with various supported ETH and ERC20 tokens, (d) a portion of the value
							generated from OVR sales would be utilised to continue funding development of the OVR Project ecosystem,
							(e) a portion of the value generated from OVR sales would be distributed as token incentives to reward
							wise governance of the OVR ProjectDAO, as well as for "rarity farming" rewards (i.e. mechanism designed to
							encourage and reward thoughtful gameplay and active participation from users), and (f) members of the
							community who hold OVR are entitled to make proposals and vote for improvements to the OVR Project
							ecosystem, which is subject only to final decision from the owner of the OVR Project ecosystem. For the
							avoidance of doubt, the community does not have legal control over any matters relating to the Seller (or
							any of its affiliates) or any of its assets, or any of its affiliated companies (including without
							limitation the selection of governing board of the relevant company, over corporate matters, development
							direction, specific projects, or deployment of that company's assets, which shall be the final
							responsibility of the governing board of the relevant company).
							<br></br>As development of the OVR Project ecosystem progresses further, the other features would be
							implemented incrementally and become available over time.
							<br></br>OVR is an integral and indispensable part of the OVR Project ecosystem because in the absence of
							OVR, there would be no common unit of exchange for goods and services or economic incentive to motivate
							users to contribute, thus rendering the ecosystem on the OVR Project ecosystem unsustainable. The
							ownership of OVR carries no rights, express or implied, in the Seller, its related entitles or its
							affiliates (each, a Group Entity) other than the right to use OVR as a means to enable usage of and
							interaction with the OVR Project ecosystem, upon the successful development and deployment of the OVR
							Project ecosystem. OVR is sold as a useable virtual good, and does not have any functionality or utility
							outside the ecosystem on the OVR Project ecosystem – accordingly it is not necessarily merchantable and
							does not necessarily have any other use or value. The ecosystem on the OVR Project ecosystem is structured
							as a "closed system" insofar as the usage of OVR is concerned. Further, OVR is not a consumer product and
							to the maximum extent permitted by law, its holders accept explicitly and agree that they are not covered
							by the consumer protection regulation of any jurisdiction.
							<br></br>You understand and accept that OVR:
							<br></br>may only be utilised on the OVR Project ecosystem, is non-refundable and cannot be exchanged for
							cash (or its equivalent value in any other virtual currency) or any payment obligation by any Group
							Entity;
							<br></br>does not represent or confer on you any ownership right, shareholding, participation, right,
							title, or interest of any form with respect to any Group Entity or any other company, enterprise or
							undertaking, or any of their revenues or assets, including without limitation any right to receive future
							revenue, dividends, shares, ownership right or stake, share or security, any voting, distribution,
							redemption, liquidation, proprietary (including all forms of intellectual property), right to receive
							accounts, financial statements or other financial data, the right to requisition or participate in
							shareholder meetings, the right to nominate a director or other financial or legal rights or equivalent
							rights, or intellectual property rights or any other form of participation in or relating to the OVR
							Project ecosystem, any Group Entity and/or any service provider of any Group Entity;
							<br></br>is not intended to be a representation of currency or money (whether fiat or virtual or any form
							of electronic money), security, commodity, bond, debt instrument, unit in a collective investment scheme
							or any other kind of financial instrument or investment;
							<br></br>is not intended to represent any rights under a contract for differences or under any other
							contract the purpose or pretended purpose of which is to secure a profit or avoid a loss;
							<br></br>is not a loan to any Group Entity and is not intended to represent a debt owed by any Group
							Entity, and there shall be no expectation of profit or interest income arising in connection therewith;
							<br></br>does not provide you with any ownership or other interest in any Group Entity;
							<br></br>is not any form of financial derivative;
							<br></br>is not any form of commercial paper or negotiable instrument;
							<br></br>will not entitle token holders to any promise of fees, dividends, revenue, profits or investment
							returns, nor should there be any such expectation;
							<br></br>is not any note, debenture, warrant or other certificate that entitles the holder to any
							interest, dividend or any kind of return from any Group Entity or any person;
							<br></br>is not any commodity or asset that any person is obliged to redeem or purchase;
							<br></br>is not for speculative investment;
							<br></br>is not intended to constitute securities in Estonia or any relevant jurisdiction;
							<br></br>does not result in any mutual covenants, or agreement to rights and obligations, being entered
							into between you and other holders of OVR inter se; and
							<br></br>is subject to limitations and conditions in these Terms and all applicable policies as may be
							published from time to time on the OVR Project ecosystem.
							<br></br>OVR does not have any tangible or physical manifestation, and does not have any intrinsic value
							(nor does any Group Entity or any other person make any representation or give any commitment as to its
							value).
							<br></br>You acknowledge and agree that no Group Entity is under any obligation to issue replacement OVR
							in the event any OVR or private key is lost, stolen, malfunctioning, destroyed or otherwise inaccessible
							or unusable for any reason.
							<br></br>IN PARTICULAR, PLEASE NOTE THAT THE SELLER IS IN THE PROCESS OF UNDERTAKING LEGAL AND REGULATORY
							ANALYSIS OF THE FUNCTIONALITY OF OVR. FOLLOWING THE CONCLUSION OF THIS ANALYSIS, THERE MAY BE CHANGES TO
							THE INTENDED FUNCTIONALITY OF OVR IN ORDER TO ENSURE COMPLIANCE WITH ANY LEGAL OR REGULATORY REQUIREMENTS
							TO WHICH THE SELLER OR OVR IS SUBJECT. IN THE EVENT OF ANY CHANGES TO THE INTENDED FUNCTIONALITY OF OVR,
							THE DETAILS OF THE CHANGES SHALL BE PUBLISHED ON THE WEBSITE. IT IS YOUR RESPONSIBILITY TO REGULARLY CHECK
							THE WEBSITE FOR ANY SUCH NOTICES.
							<br></br>SCOPE OF TERMS
							<br></br>Unless otherwise stated herein, your purchase of OVR (whether through an intermediary or
							otherwise), and continued holding and/or usage of OVR is governed solely by these Terms. New terms or
							policies may be published from time to time on the OVR Project ecosystem at our sole discretion.
							<br></br>The sale of OVR does not constitute the provision of any goods and/or services as at the date
							that these Terms form a binding agreement between the Parties. You acknowledge that upon completion of the
							sale, title to, and risk of loss of, OVR passes from us to you in Estonia.
							<br></br>The token sale will be conducted by way of the "bonding curve" token distribution smart contract
							at 0x8fcec74880b7c8ce2f81405a037baa7b28d7e1c6 (the Token Bonding Curve), which would require certain
							actions to be carried out on the part of the Buyer to interact with the Token Bonding Curve (including
							without limitation payment of the purchase price to the Token Bonding Curve). There is no minimum
							contribution to participate in the Token Bonding Curve, and all OVR purchased can be claimed and
							transferred to the Buyer's digital wallet/address immediately after purchasing from the Token Bonding
							Curve, and are not subject to any lock-up, vesting period or restriction on subsequent transfer. There is
							no maximum supply of OVR distributed via the Token Bonding Curve. As the amount of sold OVR increases, the
							price of subsequent amounts of OVR purchased from the Token Bonding Curve would increase as well,
							according to the mathematical function as indicated in the Token Bonding Curve. Likewise, when OVR is sold
							back into the Curve, the amount of "sold" OVR will be reduced, and the price of subsequent OVR tokens will
							be reduced.
							<br></br>The Seller shall procure the development of the OVR Project ecosystem in accordance with the
							roadmap as described in the Whitepaper, and shall maintain or otherwise ensure that the OVR Project
							ecosystem remains operational for a period of at least 4 years from the date hereof.
							<br></br>Any potential future usage of OVR in connection with providing or receiving services or the usage
							of the OVR Project ecosystem (when the same is completed and deployed) will be governed primarily by other
							applicable terms and policies (collectively, the Service Terms and Policies), which will be made available
							on the OVR Project ecosystem and/or Website, if the services and the OVR Project ecosystem is successfully
							completed and deployed. The Seller may update these Terms or the Service Terms and Policies in our sole
							and absolute discretion. It shall be your responsibility to regularly check the OVR Project ecosystem /
							Website for any such notices.
							<br></br>To the extent of any conflict with these Terms, the updated Terms and the Service Terms and
							Policies which may be published from time to time on the OVR Project ecosystem shall prevail with respect
							to any issues relating to the usage of OVR in connection with the OVR Project ecosystem.
							<br></br>The Seller reserves the right to require you to provide us with your personal details (including
							without limitation full legal name, address and details of the digital wallet from which you have sent the
							payment), and it is your responsibility to provide correct details. Failure to provide this information
							will prevent us from transferring OVR to your digital wallet.
							<br></br>CANCELLATION AND REFUSAL AT SELLER'S DISCRETION
							<br></br>Your purchase of OVR (whether through an intermediary or otherwise) from the Seller is final;
							there are no refunds or cancellations except as may be required by applicable law or regulation and you
							waive any rights to be refunded any amounts which you have paid to the Seller in exchange for OVR or to
							cancel any purchase.
							<br></br>Notwithstanding the foregoing, the Seller reserves the right to refuse or cancel any request(s)
							to purchase or purchases of OVR (as the case may be), at any time in its sole discretion without giving
							reasons, including without limitation the following:
							<br></br>in connection with any failure to complete know-your-customer, anti-money laundering and counter
							terrorist financing checks prescribed by the Seller;
							<br></br>in connection with a change of business or development plan of the Seller; or
							<br></br>in connection with an adverse change of the regulatory environment.
							<br></br>For the avoidance of doubt, the Seller shall not be required to notify you of the outcome of any
							of our customer identification, due diligence and/or anti-money laundering due diligence checks, or in any
							case provide reasons for unsatisfactory results of checks. In the event that the Seller refuses or cancels
							any request(s) to purchase OVR, the price paid by you shall be rejected or refunded (as applicable) in
							accordance with the Seller's internal policies and procedures, less fees and expenses incurred in
							connection with the marketing and/or development of the OVR Project ecosystem and the ecosystem thereon,
							or, if required by applicable law, confiscated. The Seller reserves the right to require you to provide
							the Seller with your personal details (including without limitation correct name, address and details of
							the digital wallet from which you have sent the payment), and it is your responsibility to provide correct
							details. Failure to provide this information will prevent the Seller from allocating the token to your
							digital wallet.
							<br></br>Any refund of the price under this Clause 3 shall be less network fees, calculated at the USD
							exchange rate of the relevant token which had been paid to the Seller, at the time of payment or refund,
							whichever would result in a lower fiat / USD value of the refund (as the same may be conclusively
							determined by the Seller). No interest will accrue on the value of any refund and the Seller shall be
							entitled to charge a processing fee not exceeding 15% of the refund amount.
							<br></br>At any time during the sale of OVR, the Seller may either temporarily suspend or permanently
							abort the token sale (whether relating to the private sale or public sale phase, or both) at its sole
							discretion without providing any reasons whatsoever. During any period of suspension or in the event that
							the token sale is aborted (whether relating to the private sale or public sale phase, or both), OVR will
							not be available for purchase.
							<br></br>ACKNOWLEDGMENT AND ASSUMPTION OF RISKS
							<br></br>You acknowledge and agree that there are numerous risks associated with purchasing OVR, holding
							OVR, and using OVR for participation in the OVR Project ecosystem. If you have any queries or require any
							clarification regarding these risks, please contact us at info@ovr.ai.
							<br></br>YOU CLEARLY UNDERSTAND THAT BLOCKCHAIN AND VIRTUAL CURRENCIES / TOKENS, INCLUDING WITHOUT
							LIMITATION ETHEREUM, BITCOIN, NEO AND QTUM, ARE NEW AND UNVERIFIED TECHNOLOGIES THAT ARE BEYOND CONTROL OF
							ANY GROUP ENTITY. IN PARTICULAR, AND IN ADDITION TO TERMS OF THIS DOCUMENT, YOU BEAR FULL RESPONSIBILITY
							FOR ANY RISKS DESIGNATED IN THE PROPOSED DOCUMENTATION. BY PURCHASING (WHETHER THROUGH AN INTERMEDIARY OR
							OTHERWISE), HOLDING AND/OR USING OVR, YOU EXPRESSLY ACKNOWLEDGE AND ASSUME THE FOLLOWING RISKS:
							<br></br>Risk of changes in functionality
							<br></br>OVR does not have any rights, uses, purpose, attributes, functionalities or features, express or
							implied, except for those which are specifically described in the White Paper and which may change from
							time to time.
							<br></br>OVR is non-refundable
							<br></br>The Seller is not obliged to provide OVR holders with a refund related to OVR for any reason, and
							OVR holders acknowledge and agree that they will not receive money or other compensation in lieu of a
							refund. No promises of future performance or price are or will be made in respect to OVR, including no
							promise of inherent value, no promise of continuing payments, and no guarantee that OVR will hold any
							particular value. Therefore, the recovery of spent resources may be impossible or may be subject to
							foreign laws or regulations, which may not be the same as the laws in the jurisdiction of OVR.
							<br></br>Uncertain Regulations and Enforcement Actions
							<br></br>The regulatory status of OVR and distributed ledger technology is unclear or unsettled in many
							jurisdictions, but numerous regulatory authorities across jurisdictions have been outspoken about
							considering the implementation of regulatory regimes which govern virtual currencies or virtual currency
							markets. It is impossible to predict how, when or whether regulatory agencies may apply existing
							regulations or create new regulations with respect to such technology and its applications, including OVR
							and/or the OVR Project ecosystem. Regulatory actions could negatively impact OVR and/or the OVR Project
							ecosystem in various ways. The Seller or any Group Entity may cease operations in a jurisdiction in the
							event that regulatory actions, or changes to law or regulation, make it illegal to operate in such
							jurisdiction, or commercially undesirable to obtain the necessary regulatory approval(s) to operate in
							such jurisdiction.
							<br></br>Risks associated with the Blockchain Protocol
							<br></br>Given that OVR and the OVR Project ecosystem are based on blockchain protocol and architecture,
							any malfunction, breakdown or abandonment of the relevant blockchain protocol or architecture may have a
							material adverse effect on OVR and/or the OVR Project ecosystem. Moreover, advances in cryptography, or
							technical advances (including without limitation development of quantum computing), could present unknown
							risks to OVR and/or the OVR Project ecosystem by rendering ineffective the cryptographic consensus
							mechanism that underpins that blockchain protocol. The future of cryptography and security innovations are
							highly unpredictable.
							<br></br>Security
							<br></br>You are responsible for implementing reasonable measures for securing the digital wallet, vault
							or other storage mechanism you use to receive and hold OVR which you have purchased, including any
							requisite passwords, tokens, private key(s) or other credentials necessary to access such storage
							mechanism(s). If your passwords, tokens, private key(s) or other access credentials are lost, you may lose
							access to your OVR. The Seller cannot be responsible for, and is technologically unable to recover, any
							such losses.
							<br></br>Insufficient Information
							<br></br>The OVR Project ecosystem is at the stage of development as of the date of these Terms and its
							algorithm, code, consensus mechanism and/or various other technical specifications and parameters could be
							updated and changed frequently and constantly. While the marketing materials and Whitepaper released
							relating to the development of the OVR Project ecosystem has been prepared with the then up-to-date key
							information of the OVR Project ecosystem, it is not absolutely complete and is subject to adjustments and
							updates from time to time for optimal development and growth of the OVR Project ecosystem and/or ecosystem
							on the OVR Project ecosystem. The Seller is neither able, nor obliged, to keep you closely posted on every
							detail of the development of the OVR Project ecosystem (including its progress and expected milestones no
							matter whether rescheduled or not) and therefore will not necessarily provide you with timely and full
							access to all the information relating to the OVR Project ecosystem that may emerge from time to time. Due
							to the nature of the project to develop the OVR Project ecosystem, you accept that such insufficiency of
							information disclosure is inevitable and reasonable.
							<br></br>Security weaknesses.
							<br></br>Hackers or other malicious groups or organisations may attempt to interfere with OVR and/or the
							OVR Project ecosystem in a variety of ways, including, but not limited to, malware attacks, denial of
							service attacks, consensus-based attacks, Sybil attacks, smurfing and spoofing. Furthermore, there is a
							risk that a third party or a member of any Group Entity may intentionally or unintentionally introduce
							weaknesses into the core infrastructure of OVR and/or the OVR Project ecosystem, which could negatively
							affect OVR and/or the OVR Project ecosystem.
							<br></br>Risks associated with markets for OVR
							<br></br>There is no prior market for OVR and the OVR token sale may not result in an active or liquid
							market for OVR. OVR is intended to be used solely within the network for the OVR Project ecosystem, hence
							there may be illiquidity risk with respect to any OVR you hold.
							<br></br>OVR is not a currency issued by any central bank or national, supra-national or quasi-national
							organisation, nor is it backed by any hard assets or other credit nor is it a "commodity" in the usual and
							traditional sense of that word. The Seller cannot be responsible for, nor does the Seller pursue, the
							circulation and trading of OVR on any market. Trading of OVR will merely depend on the consensus on its
							value between the relevant market participants. No one is obliged to purchase any OVR from any holder of
							OVR, including the purchasers, nor does anyone guarantee the liquidity or market price of OVR to any
							extent at any time. Furthermore, OVR may not be resold to a purchaser who is a citizen, national, resident
							(tax or otherwise), domiciliary or green card holder of a Restricted Country or to purchasers where the
							purchase of OVR may be in violation of applicable laws. Accordingly, the Seller cannot ensure that there
							will be any demand or market for OVR, or that the price you pay for OVR is indicative of any market
							valuation or market price for OVR. Any secondary market or exchange for trading OVR would be run and
							operated wholly independently of the Group Entities, the sale of OVR and the OVR Project ecosystem. No
							Group Entity will create such secondary markets nor will it act as an exchange for OVR. Even if secondary
							trading of OVR is facilitated by third party exchanges, such exchanges may be relatively new and subject
							to little or no regulatory oversight, making them more susceptible to fraud or manipulation. Furthermore,
							to the extent that third parties do ascribe an external exchange value to OVR (e.g., as denominated in a
							virtual or fiat currency), such value may be extremely volatile, decline below the price which you have
							paid for OVR, and/or diminish to zero.
							<br></br>Risk of Uninsured Losses
							<br></br>OVR is uninsured unless you specifically obtain private insurance to insure them. In the event of
							loss or loss of utility value, there is no public insurer or private insurance arranged by us, to offer
							recourse to you.
							<br></br>Taxation risks
							<br></br>The tax characterisation of OVR is uncertain. The tax characterisation of OVR and these Terms is
							uncertain. The Seller intends to treat OVR and these Terms neither as an equity interest nor as a debt
							interest in the Seller for tax purposes. It is possible that the Seller’s intended treatment of OVR and
							these Terms may be challenged, so that the tax consequences to a purchaser and the Seller relating to OVR
							and these Terms could differ from those described above. You must seek your own tax advice in connection
							with the purchase, holding and/or usage of OVR, which may result in adverse tax consequences to you,
							including withholding taxes, income taxes and tax reporting requirements.
							<br></br>Competitors
							<br></br>It is possible that alternative networks could be established that utilise the same or similar
							code and protocol underlying OVR and/or the OVR Project ecosystem and attempt to re-create similar
							facilities. The OVR Project ecosystem may be required to compete with these alternative networks, which
							could negatively impact OVR and/or the OVR Project ecosystem.
							<br></br>Insufficient Interest
							<br></br>It is possible that the OVR Project ecosystem will not be used by a large number of individuals,
							companies and other entities or that there will be limited public interest in the creation and development
							of distributed ecosystems (such as the OVR Project ecosystem). Such a lack of use or interest could
							negatively impact the development of the OVR Project ecosystem and therefore the potential utility of OVR.
							<br></br>Risk of Dissolution of the Seller, any Group Entity or the OVR Project ecosystem
							<br></br>Start-up companies such as the Seller involve a high degree of risk. Financial and operating
							risks confronting start-up companies are significant, and the Seller is not immune to these. Start-up
							companies often experience unexpected problems in the areas of product development, marketing, financing,
							and general management, among others, which frequently cannot be solved.
							<br></br>It is possible that, due to any number of reasons, including, but not limited to, an unfavourable
							fluctuation in the value of virtual and/or fiat currencies, decrease in the utility of OVR due to negative
							adoption of the OVR Project ecosystem, the failure of commercial relationships, or intellectual property
							ownership challenges, the OVR Project ecosystem may no longer be viable to operate and the Seller or any
							Group Entity may be dissolved.
							<br></br>Risks Arising from Lack of Governance Rights
							<br></br>Because OVR confers no governance rights of any kind with respect to the OVR Project ecosystem or
							any Group Entity, all decisions involving the OVR Project ecosystem or any Group Entity will be made by
							the relevant Group Entity at its sole and absolute discretion, including, but not limited to, decisions to
							discontinue the services and/or ecosystem on the OVR Project ecosystem, to create and sell more OVR for
							use in the ecosystem on the OVR Project ecosystem, or to sell or liquidate any Group Entity. These
							decisions could adversely affect the OVR Project ecosystem and OVR you hold.
							<br></br>Loss of Talent
							<br></br>The development of the OVR Project ecosystem depends on the continued co-operation of the
							existing technical team and expert consultants, who are highly knowledgeable and experienced in their
							respective sectors. The loss of any member may adversely affect the OVR Project ecosystem or its future
							development. Further, stability and cohesion within the team is critical to the overall development of the
							OVR Project ecosystem. There is the possibility that conflict within the team and/or departure of core
							personnel may occur, resulting in negative influence on the project in the future.
							<br></br>Failure to develop
							<br></br>There is the risk that the development of the OVR Project ecosystem will not be executed or
							implemented as planned, for a variety of reasons, including without limitation the event of a decline in
							the prices of any digital asset, virtual currency or OVR, unforeseen technical difficulties, and shortage
							of development funds for activities.
							<br></br>Risks Involving Cloud Storage
							<br></br>As the OVR Project ecosystem may provide a decentralised cloud storage service to individual and
							institutional clients, including users and applications, the OVR Project ecosystem (and services thereon)
							are susceptible to a number of risks related to the storage of data in the cloud. The OVR Project
							ecosystem (and services thereon) may involve the storage of large amounts of sensitive and/or proprietary
							information, which may be compromised in the event of a cyberattack or other malicious activity.
							Similarly, the OVR Project ecosystem and/or services thereon may be interrupted and files may become
							temporarily unavailable in the event of such an attack or malicious activity. Because users can use a
							variety of hardware and software that may interface with the OVR Project ecosystem, there is the risk that
							the OVR Project ecosystem and/or services thereon may become unavailable or interrupted based on a failure
							of interoperability or an inability to integrate these third-party systems and devices that the Group
							Entities do not control. The risk that the OVR Project ecosystem and/or services thereon may face
							increasing interruptions and the ecosystem on the OVR Project ecosystem may face additional security
							vulnerabilities could adversely affect the OVR Project ecosystem and ecosystem thereon, and therefore the
							future utility of any OVR that you hold.
							<br></br>Other risks
							<br></br>In addition to the aforementioned risks, there are other risks associated with your purchase,
							holding and usage of OVR, including those that the Seller cannot anticipate. Such risks may further
							materialise as unanticipated variations or combinations of the aforementioned risks.
							<br></br>KNOW YOUR CLIENT REGULATIONS AND PERSONAL DATA
							<br></br>Know your client regulations
							<br></br>You hereby acknowledge and accept that:
							<br></br>The Seller may be required to conduct customer identification, due diligence and anti-money
							laundering due diligence on all purchasers of OVR in compliance with all applicable laws and legislations.
							The Seller may determine, in its sole discretion, that it is necessary to obtain certain information about
							you in order to comply with these laws and legislations. You agree to provide such information to the
							Seller promptly upon request, and you acknowledge that the Seller may refuse to sell OVR to you until you
							provide such requested information and the Seller has determined that it is permissible to sell you OVR
							under applicable law or regulation.
							<br></br>The Seller may at any point in time request information and/or documentation to establish that
							its identification records, as well as the information that form your profile, remain completely updated.
							In this respect, the Seller reserves the right to examine and check on a regular basis the validity and
							adequacy of your identification data and information maintained. For the avoidance of doubt, the Seller
							shall not be required to notify you of the outcome of any of its customer identification, due diligence
							and/or anti-money laundering due diligence checks, or in any case provide reasons for unsatisfactory
							results of checks.
							<br></br>If at any time the Seller becomes aware that reliable or adequate data and information are
							missing from your identity, the Seller reserves the right to take all necessary actions to collect the
							missing data and information (whether from you or from third parties) so as to update and complete your
							profile as necessary.
							<br></br>If you fail or refuse to submit, within a reasonable timeframe, the required data and
							identification information for the updating of your identity and, as a consequence, the Seller is unable
							to comply with any laws, legislations regulations or directives relating to customer identification
							requirements, the Seller will not be able to sell OVR and/or continue its relationship with you, and the
							Seller may be required to submit a report of suspicious transactions/activities to the relevant
							authorities.
							<br></br>Personal Data
							<br></br>The Seller (and its affiliates) will collect, use, process and disclose your information and
							personal data for providing its services and discharging of its legal duties and responsibilities,
							administration, customer services, crime (including tax evasion) prevention and detection, anti-money
							laundering, due diligence and verification of identity purposes (collectively, the Purposes). The Seller
							may disclose your information to its service providers, agents, relevant custodians or similar third
							parties for these Purposes. The Seller may keep your information for such period as it may determine
							(which shall be no shorter than any mandatory period prescribed by law) to contact you about the OVR
							Project ecosystem. You hereby consent to the Seller transferring your personal data to its affiliates or
							service providers for processing, and to recipients in countries which do not provide the same level of
							data protection as your jurisdiction if necessary for the Purposes.
							<br></br>If you withdraw your consent to any or all use of your personal data, depending on the nature of
							your request, this may limit the scope of our services which the Seller is able to provide to you. Please
							contact us at info@ovr.ai. The Seller will endeavour to respond to your query / request within 30 days,
							and if that is not possible, the Seller will inform you of the time by which it will respond to you.
							<br></br>You hereby warrant, represent and confirm to us and shall procure that with respect to any
							personal data of any individual (including, where applicable, your directors, partners, office holders,
							officers, employees, agents, shareholders and beneficial owners) (each, an Individual) disclosed to us in
							connection with these Terms, the Service Terms and Policies and/or the OVR token sale or otherwise
							collected by us in the course of your relationship with us or any of our affiliates:
							<br></br>each Individual to whom the personal data relates has, prior to such disclosure or collection,
							agreed and consented to, and permitted you on its behalf to consent to, such disclosure as well as the
							collection, processing, use and disclosure of the Individual’s personal data by us for all purposes
							required by us in connection with these Terms and/or the OVR token sale;
							<br></br>that each Individual has read and consented to the collection, processing, use and disclosure of
							the Individual’s personal data by us in accordance with the Purpose; and
							<br></br>any consent given pursuant to these Terms in relation to each Individual’s personal data shall
							survive death, incapacity, bankruptcy or insolvency of that Individual and the termination or expiration
							of these Terms and the Service Terms and Policies.
							<br></br>If any Individual should withdraw his/her consent to any or all use of his/her personal data,
							then depending on the nature of the withdrawal request, the Seller may not be in a position to continue
							its relationship with you and/or sell OVR, and the Seller shall be entitled to its rights under these
							Terms and the Service Terms and Policies (without prejudice to our other rights and remedies at law
							against you).
							<br></br>TAXES
							<br></br>The price that you pay for OVR is exclusive of all applicable taxes (including without limitation
							obligations to pay value added, sales, use, offerings, withholding taxes, income or similar taxes)
							(Taxes). The onus for determining the Taxes applicable to your purchase, holding and/or usage of OVR lies
							solely with you. It is also your sole responsibility to comply with all relevant tax reporting
							requirements arising out of or in connection with your purchase, holding and/or usage of OVR. The Seller
							is not responsible for withholding, collecting, reporting, or remitting any Taxes arising from your
							purchase, holding and/or usage of OVR. The Seller cannot and does not provide any tax advice and it
							recommends that you seek appropriate professional advice in this area if required.
							<br></br>REPRESENTATIONS AND WARRANTIES
							<br></br>By purchasing (whether through an intermediary or otherwise), holding and/or using OVR, you
							represent and warrant that:
							<br></br>You have read and understand these Terms and the Whitepaper, and you have all requisite power and
							authority to execute and deliver these Terms, to participate in the OVR token sale, to purchase, hold
							and/or use OVR, and to carry out and perform your obligations under these terms.
							<br></br>If you are an individual, you are at least 21 years old and in any case of sufficient legal age
							and capacity to purchase, hold and/or use OVR. If you are a legal person, you are duly organised, validly
							existing and in good standing under the laws of your domicile and each jurisdiction where you conduct
							business or where your assets are located. You are not purchasing, holding and/or using OVR on behalf of
							any other entity or person.
							<br></br>The execution, delivery and performance of these Terms will not result in any violation of, be in
							conflict with, or constitute a default under, with or without the passage of time or the giving of notice:
							(i) any provision of your constitutional documents (if applicable), (ii) any provision of any judgment,
							decree or order, or any agreement, obligation, duty or commitment to which you are a party, or by which
							you are bound, or to which any of its material assets are subject, (iii) any laws, regulations or rules
							applicable to you, (iv) any foreign exchange or regulatory restrictions applicable to such purchase,
							holding and/or usage of OVR, or (v) any governmental or other consents that may need to be obtained.
							<br></br>The execution and delivery of, and performance under, these Terms require no approval or other
							action from any governmental authority or person. You will and shall at your own expense ensure compliance
							with all laws, regulatory requirements and restrictions applicable to you (as the case may be).
							<br></br>Your purchase of OVR shall be made in full compliance with any applicable tax obligations to
							which you may be subject in any relevant jurisdiction. You understand that you bear the sole
							responsibility to determine if your use of the OVR Project ecosystem, the transfer of any virtual currency
							to the Seller, the creation, ownership or use of OVR, the potential appreciation or depreciation in the
							value of OVR over time, the sale and purchase of OVR and/or any other action or transaction related to the
							Seller or the OVR Project ecosystem have tax implications (including determining what taxes may apply to
							the acquisition, possession, storage, sale or other use of OVR including, for example, sales, use,
							value-added and similar taxes and for complying with any obligations to withhold, collect, report and
							remit the correct taxes to the appropriate tax authorities in relation to its acquisition, possession,
							storage, sale or other use of OVR); by creating, holding or using OVR, and to the extent permitted by law,
							you agree not to hold any third party (including developers, auditors, contractors or founders) liable for
							any tax liability associated with or arising from the creation, ownership or use of OVR or any other
							action or transaction related to the Seller (or any Group Entity) or the OVR Project ecosystem.
							<br></br>You have good and sufficient understanding in business and financial matters, including a good
							and sufficient understanding of the functionality, usage, storage, transmission mechanisms and other
							material characteristics of blockchain technology, blockchain-like technology, blockchain-based software
							systems as well as other similar technologies and systems, cryptographic tokens, and token storage
							mechanisms (such as digital token wallets) to understand these Terms and to appreciate the risks and
							implications of purchasing, holding and/or usage of OVR.
							<br></br>You have obtained sufficient information about OVR to make an informed decision to purchase, hold
							and/or use OVR. Additionally, you are aware of the Seller’s business affairs and financial condition and
							have obtained sufficient information about the Seller to reach an informed decision to purchase OVR.
							<br></br>The currency (including any fiat, digital currency, virtual currency or cryptocurrency) used to
							purchase OVR are obtained through “mining” activities or other lawful means, and are not derived from or
							related to any unlawful activities, including but not limited to money laundering or terrorist financing
							and all applicable statutes of all jurisdictions in which you are located, resident, organised or
							operating, and/or to which it may otherwise be subject and the rules and regulations thereunder
							(collectively, the Compliance Regulations), and you will not use OVR to finance, engage in, or otherwise
							support any unlawful activities or in a manner which aids or facilitates another party in the same. To the
							extent required by applicable laws and regulations, you shall fully comply with all Compliance Regulations
							and no action, suit or proceeding by or before any court or governmental agency, authority or body or any
							arbitrator involving it or any of your affiliates with respect to the Compliance Regulations is pending
							or, to the best of your knowledge (after due and careful enquiry), threatened.
							<br></br>Neither you (nor any of your subsidiaries, any director or officer, or any employee, agent, or
							your affiliate) nor any person having a direct or indirect beneficial interest in you or OVR being
							acquired by you, or any person for whom you are acting as agent or nominee in connection with OVR: (i) is
							the subject of any sanctions administered or enforced by any country or government or international
							authority, including the US Department of the Treasury’s Office of Foreign Assets Control ("OFAC"), the US
							Department of State, the United Nations Security Council, the European Union, Her Majesty's Treasury, the
							Hong Kong Monetary Authority or the Monetary Authority of Singapore (collectively, "Sanctions"); (ii) is
							located, organised, citizen or resident in a country or territory that is, or whose government is, the
							subject of Sanctions; (iii) is listed in any list of sanctioned persons including those maintained under
							the Sanctions including the List of Specially Designated Nationals and Blocked Persons or the Foreign
							Sanctions Evaders List maintained by OFAC; or (iv) is directly or indirectly owned or controlled by any
							person subject to sub-clauses (i), (ii) and (iii) above.
							<br></br>Neither you (nor any of your subsidiaries, any director or officer, or any employee, agent, or
							your affiliate) nor any person having a direct or indirect beneficial interest in you or OVR being
							acquired by you, or any person for whom you are acting as agent or nominee in connection with OVR is: (i)
							a citizen or resident of, or located in, a geographic area or country designated as "High-risk and other
							monitored jurisdictions" (or such other similar classification) by the Financial Action Task Force; or
							(ii) a Politically Exposed Person (defined as a current or former senior official in the executive,
							legislative, administrative, military, or judicial branch of a government (elected or not), a senior
							official of a major political party, a senior executive of a government owned commercial enterprise,
							and/or being a corporation, business or other entity formed by or for the benefit of any such individual,
							any individual publicly known (or actually known) to be a close personal or professional associate, or an
							immediate family member of such individual, meaning spouse, parents, siblings, children, and spouse’s
							parents or siblings).
							<br></br>You are not (i) a citizen, national, resident (tax or otherwise), domiciliary or green card
							holder of a geographic area or country (A) where participation in token sales is prohibited, restricted or
							unauthorised by applicable law, decree, regulation, treaty, or administrative act or (B) where it is
							likely that the sale of OVR would be construed as the sale of a security (howsoever named), financial
							service or investment product (including without limitation the United States of America, People's
							Republic of China (but not including the special administrative regions of Hong Kong and Macau, and the
							territory of Taiwan) (the Restricted Countries).
							<br></br>You acknowledge and agree that: (i) you are familiar with all related regulations in the specific
							jurisdiction in which you are based and that acquiring OVR (through purchase or otherwise) in that
							jurisdiction is not prohibited, restricted or subject to additional conditions of any kind, (ii) no
							regulatory authority has examined or approved of the information set out in the Whitepaper or any other
							material in connection with OVR, (iii) you will not use OVR if such use would constitute a public offering
							of OVR in any country or jurisdiction where action for that purpose is required, (iv) the distribution or
							dissemination of the Whitepaper, any part thereof or any copy thereof, or any use of OVR by you, is not
							prohibited or restricted by the applicable laws, regulations, or rules in your jurisdiction, and where any
							restrictions in relation to possession are applicable, you will observe and comply with all such
							restrictions at your own expense and risk without liability to the Seller, (v) you shall ensure that no
							obligations are imposed on the Seller in any such jurisdiction as a result of any of the actions taken by
							you in the preceding sub-clause, and (vi) the Seller will have no responsibility for and it will not
							obtain any consent, approval or permission required by you for, the acquisition, offer, sale or delivery
							by it of OVR under the laws and regulations in force in any jurisdiction to which you may be subject or in
							or from which you use OVR.
							<br></br>The currency (whether fiat or virtual) used in the purchase of OVR will be made only in your
							name, from a digital wallet not located in a country or territory that has been designated as a
							“non-cooperative country or territory” by the Financial Action Task Force or any similar legislation.
							<br></br>You are purchasing, holding and/or using OVR to participate in the OVR Project ecosystem, as well
							as to support the advancement, promotion, research, design and development of, and advocacy for the OVR
							Project ecosystem, as well as potentially receiving services on the OVR Project ecosystem (when the same
							is completed and deployed). You are not purchasing, holding or using OVR for any other uses or purposes,
							including, but not limited to, any investment, speculative or other financial purposes.
							<br></br>You acknowledge that: (i) OVR does not have any intrinsic value and that it may never recover any
							cash, cryptocurrency or other assets which are used directly or indirectly to acquire OVR; (ii) there is
							no market-standard valuation process to determine the value of OVR at any given time; and (iii) the Seller
							gives no guarantees whatsoever on the value of OVR which may be highly volatile and could reduce to zero.
							<br></br>You acknowledge and agree that the Seller may impose eligibility criteria to access certain
							functionality in respect of OVR which may require it to incur additional time and money costs.
							<br></br>You shall not sell or transfer or agree to sell to transfer (whether pursuant to any public pool
							or private agreement with a subsequent purchaser or otherwise) any OVR prior to the completion of the
							public sale of OVR.
							<br></br>You shall not sell or transfer any OVR prior to procuring the purchaser's or transferee's
							agreement to these Terms.
							<br></br>You acknowledge that the currency (whether fiat or virtual) paid to us for the purchase of OVR
							will be held by us (or our affiliate) after the token sale, and you will have no economic or legal right
							over or beneficial interest in these contributions or the assets of that entity after the token sale.
							<br></br>You acknowledge and undertake that you shall provide the Seller with such information as the
							Seller may deem necessary or appropriate in order to maintain compliance with applicable law including:
							(i) compliance with the representations set out in this Clause 7, and (ii) to address any actual inquiries
							or inquiries that the Seller may (at its sole discretion) expect from regulatory authorities, courts or
							arbitral authorities in any jurisdiction.
							<br></br>You hereby acknowledge and agree that the Seller may have to procure an amendment to the
							functionality of OVR at any time in order to facilitate compliance with any legal or regulatory issues
							which may arise or shall be anticipated, including: (i) any actual action taken, or potential action that
							the Seller (in its sole discretion) expects to be taken, by a court or regulatory authority in any
							jurisdiction in relation to the use of OVR and all related matters, and (ii) any additional legal or
							regulatory risk mitigation in respect of the functionality of OVR that the Seller decides to undertake at
							any time.
							<br></br>You hereby acknowledge that the Seller has entered into these Terms in reliance upon your
							representations and warranties being true, accurate, complete and non-misleading. The Seller does not and
							does not purport to make, and hereby disclaims, all representations, warranties or undertaking to you in
							in relation to the sale of OVR or otherwise. Prospective purchasers of OVR should carefully consider and
							evaluate all risks and uncertainties (including financial and legal risks and uncertainties) associated
							with the OVR token sale, the Seller, and any relevant Group Entity.
							<br></br>INTELLECTUAL PROPERTY
							<br></br>The Seller (or the relevant Group Entity, as the case may be) retains all right, title and
							interest in all of that entity's intellectual property, including, without limitation, ideas, concepts,
							discoveries, processes, code, compositions, formulae, methods, techniques, information, data, patents,
							models, rights to inventions, copyright and neighbouring and related rights, moral rights, trademarks and
							service marks, business names and domain names, rights in get-up and trade dress, goodwill and the right
							to sue for passing off or unfair competition, rights in designs, rights in computer software, database
							rights, rights to use, and protect the confidentiality of, confidential information (including know-how
							and trade secrets), and all other intellectual property rights, in each case whether patentable,
							copyrightable or protectable in trademark, registered or unregistered, and including all applications and
							rights to apply for and be granted, renewals or extensions of, and rights to claim priority from, such
							rights and all similar or equivalent rights or forms of protection which subsist or will subsist now or in
							the future in any part of the world. You may not use any of the Seller’s (or the relevant Group Entity's)
							intellectual property for any reason whatsoever.
							<br></br>INDEMNITY
							<br></br>To the fullest extent permitted by applicable law, you will indemnify, defend and hold harmless
							the Seller, each Group Entity, and their respective past, present and future employees, officers,
							directors, contractors, consultants, equity holders, suppliers, vendors, service providers, related
							companies, affiliates, agents, representatives, predecessors, successors and assigns (the Indemnified
							Parties) from and against all claims, demands, actions, damages, losses, costs and expenses (including
							legal fees on an indemnity basis) arising from or relating to:
							<br></br>your purchase (whether through an intermediary or otherwise), holding or usage of OVR; your
							responsibilities or obligations under these Terms; your violation of these Terms; your violation of any
							rights of any other person or entity; or your subsequent transfer of OVR to any individuals or entities.
							<br></br>RELEASE
							<br></br>To the fullest extent permitted by applicable law, you release the Seller and the other
							Indemnified Parties from responsibility, liability, claims, demands and/or damages (actual and
							consequential) of every kind and nature, known and unknown (including, but not limited to, claims of
							negligence), arising out of or related to disputes between users and the acts or omissions of third
							parties. You expressly waive any rights you may have under any statute or common law principles that would
							otherwise limit the coverage of this release to include only those claims which you may know or suspect to
							exist in your favour at the time of agreeing to this release.
							<br></br>GOVERNING LAW AND DISPUTE RESOLUTION
							<br></br>These Terms will be governed by and construed and enforced in accordance with the laws of
							Estonia, without regard to conflict of law rules or principles (whether of Estonia or any other
							jurisdiction) that would cause the application of the laws of any other jurisdiction. Any dispute arising
							out of or in connection with these Terms (including without limitation the enforceability of this
							arbitration Clause, any question regarding existence, validity or termination) shall be referred to and
							finally resolved by Estonian court. The language of the dispute shall be English.
							<br></br>PARTIAL INVALIDITY
							<br></br>If, at any time, any provision of these Terms is or becomes illegal, invalid or unenforceable in
							any respect under any law of any jurisdiction, neither the legality, validity or enforceability of the
							remaining provisions nor the legality, validity or enforceability of such provision under the law of any
							other jurisdiction will in any way be affected or impaired.
							<br></br>TERMINATION
							<br></br>The agreement set out in these Terms will terminate upon the completion of all sales of OVR. The
							Seller reserves the right to terminate the agreement set out in these Terms, in its sole discretion, in
							the event of a breach by you of these Terms. Upon termination of these Terms:
							<br></br>all of your rights under these Terms immediately terminate; you are not entitled to any refund of
							any amount paid whatsoever, save in the case where these Terms are terminated by the Seller without any
							breach by you of these Terms; and Clauses 3, 4, 6, 9, 10, 17, 18 and 19 will continue to apply in
							accordance with their terms to you in respect of any OVR held.
							<br></br>ENTIRE AGREEMENT
							<br></br>These Terms, including the documents and material incorporated by reference, constitute the
							entire agreement between you and the Seller and supersedes all prior or contemporaneous agreements and
							understandings (including without limitation the Whitepaper or any other marketing material), both written
							and oral, between you and the Seller with respect to the subject matters. The Seller may make changes to
							these Terms from time to time as reasonably required to comply with applicable law or regulation. If the
							Seller makes changes, it will as soon as practicable post the amended Terms at the Website. The amended
							Terms will be effective immediately. It is your responsibility to regularly check the Website for any such
							amendments.
							<br></br>ASSIGNMENT
							<br></br>You shall under no circumstances be entitled to assign or novate your rights and obligations
							under these Terms (including without limitation the right to claim any OVR purchased). The Seller may
							assign or novate its rights and obligations under these Terms without your consent, and you agree to, at
							your own expense, take whatever action or execute any document which the Seller may require for the
							purpose of effecting any such assignment or novation by the Seller.
							<br></br>REMEDIES AND WAIVERS
							<br></br>No failure to exercise, nor any delay in exercising, on our part, any right or remedy under these
							Terms Documents shall operate as a waiver, of any such right or remedy or constitute an election to affirm
							these Terms. No election to affirm these Terms on our part shall be effective unless it is in writing. No
							single or partial exercise of any right or remedy prevents any further or other exercise or the exercise
							of any other right or remedy. The rights and remedies provided in these Terms are cumulative and not
							exclusive of any rights or remedies provided by law.
							<br></br>DISCLAIMERS
							<br></br>You expressly acknowledge, understand and agree that you are purchasing (whether through an
							intermediary or otherwise), holding and/or using OVR at your sole risk and discretion, and that OVR is
							provided, used and purchased on an “AS IS” and on an “AS AVAILABLE” basis without any representations,
							warranties, promises or guarantees whatsoever of any kind by the Seller or any Group Entity. Prior to
							making any decision to purchase (whether through an intermediary or otherwise), hold and/or use OVR, you
							shall conduct your own due diligence and rely only on your own examination and investigation thereof.
							<br></br>Changes in relevant laws and regulations in any jurisdictions which the Seller is operating shall
							constitute a force majeure and the Seller will not be responsible for any result arising out of such
							changes in relevant laws and regulations.
							<br></br>The Seller does not make and expressly disclaims all representations and warranties, express,
							implied or statutory; and with respect to OVR, the Seller specifically does not represent and warrant and
							expressly disclaims any representation or warranty, express, implied or statutory, including without
							limitation, any representations or warranties of title, non-infringement, merchantability, usage,
							suitability or fitness for any particular purpose, or as to the workmanship or technical coding thereof,
							or the absence of any defects therein, whether latent or patent. In addition, the Seller cannot and does
							not represent or warrant that OVR or the delivery mechanism for OVR are free of viruses or other harmful
							components.
							<br></br>The Seller assumes that you have already read these Terms, especially the risks and disclaimer
							stated herein and hereunder, and you shall automatically be regarded agree to take all risks (including
							but not limited to the risks stated herein) in relation to purchasing (whether through an intermediary or
							otherwise), holding and/or using OVR.
							<br></br>SELLER NOT LIABLE
							<br></br>OVR is not being structured or sold as securities or any other form of investment product.
							Accordingly, none of the information presented in these Terms is intended to form the basis for any
							investment decision, and no specific recommendations are intended. Save in the case of fraud or gross
							negligence, the Seller expressly disclaims any and all responsibility for any direct, indirect, special,
							incidental, consequential or exemplary loss or damage of any kind whatsoever arising directly or
							indirectly (including without limitation, those relating to loss of revenue, income or profits, loss of
							use or data, or damages for business interruption) in connection with:
							<br></br>reliance on any information contained in these terms; any error, omission or inaccuracy in any
							such information; any action resulting from such information; or the sale or usage of OVR.
							<br></br>In no event will the aggregate liability of the Seller and the Indemnified Parties (jointly),
							whether in contract, warranty, tort, or other theory, arising out of or relating to these terms or the
							usage of or inability to use OVR, exceed the amount you pay to us for OVR.
							<br></br>CLAIMS
							<br></br>The Seller shall not be liable in any way or in any event in respect of any claim under these
							Terms if such claim was not made within the 6-month period commencing from the date that you receive OVR
							(the Claim Period). Any claim which has been made before the expiration of the Claim Period shall, if it
							has not been previously satisfied in full, settled or withdrawn, be deemed to have been withdrawn and
							shall become fully barred and unenforceable on the expiry of the period of six (6) months commencing from
							the date on which such claim was made, unless proceedings in respect thereof shall have been commenced
							against the Seller and for this purpose proceedings shall not be deemed to have been commenced unless they
							shall have been issued and served upon the Seller.
							<br></br>For the avoidance of doubt, nothing in these Terms shall limit your obligation (at law or
							otherwise) to mitigate your loss in respect of any claim under these Terms, and you shall not be entitled
							to recover damages in respect of any claim (as the case may be) if, and to the extent that, you have
							already recovered damages in respect of the same fact or subject matter.
							<br></br>PARTNERSHIP
							<br></br>Purchasing (whether through an intermediary or otherwise), holding and/or using OVR does not
							create any form of partnership, joint venture or any other similar relationship between you and us, nor
							cause the Parties to be deemed acting in concert in any respect.
							<br></br>CONFIDENTIALITY
							<br></br>You shall hold, and shall cause your affiliates, officers, directors, employees, accountants,
							counsel, consultants, advisors and agents to hold, in confidence all documents, information and
							correspondence concerning OVR or any Group Entity furnished to you or your affiliates in connection with
							the transactions contemplated by these Terms or any pre-contractual or post-contractual negotiations in
							connection therewith (including without limitation all commercial information such as sale price, number
							of tokens sold, discount (if any), as well as schedule for delivery of tokens), except to the extent that
							such information can be shown to have been (a) previously known on a non-confidential basis by you, (b) in
							the public domain disclosed without any fault on your part or (c) later lawfully acquired by you from
							sources other than any Group Entity. If these Terms are terminated, you shall, and shall cause your
							affiliates, officers, directors, employees, accountants, counsel, consultants, advisors and agents to,
							destroy or deliver to the Seller, upon request, all documents and other materials, and all copies thereof,
							obtained by you or your affiliates in connection with these Terms that are subject to such confidence.
							<br></br>RIGHTS OF THIRD PARTIES
							<br></br>Except as otherwise provided in herein, these Terms are intended solely for the benefit of you
							and us and are not intended to confer third-party beneficiary rights upon any other person or entity.
							Notwithstanding the foregoing, any Group entity shall be entitled to enforce or to enjoy the benefit of
							any term of these Terms.
							<br></br>LANGUAGE
							<br></br>You acknowledge that, solely for convenience, these Terms may be translated into a language other
							than English, and that a copy of the English language version of these Terms has been provided to you
							(which have read and understand). In the event of conflict or ambiguity between the English language
							version and translated versions of these Terms, the English language version shall prevail.
							<br></br>SEVERABILITY
							<br></br>If any provision or part-provision of these Terms is or becomes invalid, illegal or unenforceable
							in any respect under any law of any jurisdiction, it shall be deemed modified to the minimum extent
							necessary to make it valid, legal and enforceable. If such modification is not possible, the relevant
							provision or part-provision shall be deemed deleted. Any modification to or deletion of a provision or
							part-provision pursuant to this Clause 24 shall not affect or impair the validity and enforceability of
							the rest of these Terms, nor the validity and enforceability of such provision or part-provision under the
							law of any other jurisdiction.
							<br></br>NOTICES
							<br></br>You agree and acknowledge that all agreements, notices, disclosures, and other communications
							that the Seller provides to you, including these Terms, will be provided in electronic form. These Terms
							have been entered into for and on behalf of the Seller. If you have any questions regarding these Terms,
							please contact us at info@ovr.ai.
						</div>
						<div className="Buttons__section">
							<HexButton
								url="#"
								text={t('IBCO.tec.agree')}
								target="_blank"
								onClick={acceptTerms}
								className={`--orange`} //${hasReachedBottom ? '' : '--disabled'}
							></HexButton>
							<HexButton
								url="#"
								text={t('IBCO.tec.cancel')}
								onClick={disablePanel}
								className={'--transparent --decline-terms'}
							></HexButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// TermsAndConditionsOverlay.propTypes = {
// 	reloadLandStatefromApi: PropTypes.func,
// 	userProvider: PropTypes.object,
// 	mapProvider: PropTypes.object,
// 	web3Provider: PropTypes.object,
// 	land: PropTypes.object,
// 	className: PropTypes.string,
// 	url: PropTypes.string,
// };

export default withUserContext(withWeb3Context(TermsAndConditionsOverlay));
