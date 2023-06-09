### v0.1.23

- When user starts the Sumsub process of KYC it is set on status STARTED
- All Sumsub status change are now live reloaded in the interface
- Change the interface of currency selection during bidding and minting
- Now the backend is connected to the Postgres DB, same of OVR's mobile app

### v0.1.22

- Fixed conversion fares
- Fixed indacoin webservice helper
- Changed Sumsub integration to new WebSDK
- Added control of KYC before buying OVR Token - PRODUCTION only
- Fixed 3 word bugs, enhanced word list, and activated browse of land via 3 words name in URL
- If I was watching a single land page before login, after login I'll be redirect to that same land
- There is now a projection of the expense of a bid in all the available currencies - logged user only
- There is a silent fetch and save in our db of KYC's userdata when they passed the verification from Sumsub

### v0.1.21

- Fixed centralized connection to start of an auction
- Added a "View transaction status" link that opens etherscan on a new tab after bidding and in Activity page
- Fixed bug about the show of Redeem land button on not owned land
- Fixed decentralized bugs on bidding and decimals
- Moved the infura backend service in a standalone Node webservice
- Migrated the centralized db to postgres, fixed all problems related ( Land UUID and Sockets )
- Minor fixes in bidding interface

### v0.1.2

- Refractored UserContext and separated web3 functionality in Web3Context
- Added [CentralizedAPI] call before and after starting and bidding auction, this call will start a cron on the centralized service that will check infura and update the state. We will call this function [InfuraTie].
- Added Activity page, where there is an history of the user activity
- Added Logout functionality
- Added Sub menu when clicking on user icon or name, this sub menu can let the user go to Profile, Activity, Logout
- Completely redesigned all the auctions and market overlays
- Fixed different bugs about the notification center

# State of art

- Starting auction [Redesign✅] [NotificationCenter✅] [Activity✅] [CentralizedAPI✅] [InfuraTie✅]
- Bidding auction [Redesign✅] [NotificationCenter✅] [Activity✅] [CentralizedAPI✅] [InfuraTie✅]
  - Outbidded User [NotificationCenter✅] [Activity✅]
  - Best bidder User [NotificationCenter✅] [Activity✅]
- Selling land [Redesign✅] [NotificationCenter🚧] [Activity⛔] [CentralizedAPI⛔] [InfuraTie⛔]
- Buying land [Redesign✅] [NotificationCenter⛔] [Activity⛔] [CentralizedAPI⛔] [InfuraTie⛔]
- Buying offer [Redesign✅] [NotificationCenter⛔] [Activity⛔] [CentralizedAPI⛔] [InfuraTie⛔]
- Accepting buy offer [Redesign⛔] [NotificationCenter⛔] [Activity⛔] [CentralizedAPI⛔] [InfuraTie⛔]
