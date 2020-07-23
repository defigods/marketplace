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

- Starting auction          [Redesign✅] [NotificationCenter✅] [Activity✅] [CentralizedAPI✅] [InfuraTie✅] 
- Bidding auction           [Redesign✅] [NotificationCenter✅] [Activity✅] [CentralizedAPI✅] [InfuraTie✅] 
  - Outbidded User          [NotificationCenter✅] [Activity✅]
  - Best bidder User        [NotificationCenter✅] [Activity✅]
- Selling land              [Redesign✅] [NotificationCenter🚧] [Activity⛔] [CentralizedAPI⛔] [InfuraTie⛔]
- Buying land               [Redesign✅] [NotificationCenter⛔] [Activity⛔] [CentralizedAPI⛔] [InfuraTie⛔]
- Buying offer              [Redesign✅] [NotificationCenter⛔] [Activity⛔] [CentralizedAPI⛔] [InfuraTie⛔]
- Accepting buy offer       [Redesign⛔] [NotificationCenter⛔] [Activity⛔] [CentralizedAPI⛔] [InfuraTie⛔]
