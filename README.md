# Getting Started

## Deployed App URL
- [0xDemocracy - (CLICK HERE)](https://0xdemocracy.vercel.app/)

## Quickstart
- To run the app locally

### Quickstart requirement
- install [nodejs](https://nodejs.org/en)
- create and setup .env file in frontend directory -> use .env.example file in the frontend directory  to help.
  
```
cd frontend
npm install
npm run dev
```
  
## Backend Scope
```
├── backend
│   ├── script
│       ├── DeployVoteCreationNFT.s.sol
│       ├── DeployVoteManagement.s.sol
│       ├── DeployVoterRegistration.s.sol
│   ├── src
│       ├── VoteCreationNFT.sol
│       ├── VoteManagement.sol
│       ├── VoterRegistration.sol
│   ├── test
│       ├── integration
│           ├── VoteProcessTest.t.sol
│       ├── unit
│           ├── VoteCreationNftTest.t.sol
│           ├── VoteManagementTest.t.sol
│           ├── VoterRegistrationTest.t.sol
```

## Frontend Scope
- (* - includes all files & directories within)

```
├── frontend
│   ├── app*
│   ├── components* 
│   ├── constants* 
│   ├── context*
│   ├── contracts*
│   ├── lib*
```

## Smart Contract Tests
- To run the tests currently written for the smart contracts locally

### Quickstart requirement
- install [foundry](https://getfoundry.sh/)

### Testing
```
cd backend
forge test
```