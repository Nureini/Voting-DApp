export const VoteManagementAddress =
  '0x3E38b041BFADbAa2151899fBEF8ac8b0084c25D6'

export const VoteManagementABI = [
  {
      "type": "constructor",
      "inputs": [
          {
              "name": "_voterRegistrationAddress",
              "type": "address",
              "internalType": "address"
          }
      ],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "_getVoteWinner",
      "inputs": [
          {
              "name": "_tokenId",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "winningChoiceIndex",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "winningChoiceTotalVotes",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "doesWinnerExist",
              "type": "bool",
              "internalType": "bool"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "_getVotingStatus",
      "inputs": [
          {
              "name": "_tokenId",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "string",
              "internalType": "string"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "changeVote",
      "inputs": [
          {
              "name": "_user",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "_tokenId",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "_choiceIndex",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "checkUpkeep",
      "inputs": [
          {
              "name": "checkData",
              "type": "bytes",
              "internalType": "bytes"
          }
      ],
      "outputs": [
          {
              "name": "upkeepNeeded",
              "type": "bool",
              "internalType": "bool"
          },
          {
              "name": "performData",
              "type": "bytes",
              "internalType": "bytes"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getAddressOfVoteCreationNFTContract",
      "inputs": [],
      "outputs": [
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getAllVoteNames",
      "inputs": [],
      "outputs": [
          {
              "name": "",
              "type": "string[]",
              "internalType": "string[]"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getDelegateToVoter",
      "inputs": [
          {
              "name": "_tokenId",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "_delegate",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getHasVoted",
      "inputs": [
          {
              "name": "_tokenId",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "_voter",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "bool",
              "internalType": "bool"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getIsChangeVoteLimitReached",
      "inputs": [
          {
              "name": "_tokenId",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "_voter",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "bool",
              "internalType": "bool"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getIsVotePropertiesSet",
      "inputs": [
          {
              "name": "_tokenId",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "bool",
              "internalType": "bool"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getTotalVotes",
      "inputs": [
          {
              "name": "_tokenId",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getTotalVotesForEachChoice",
      "inputs": [
          {
              "name": "_tokenId",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "_choiceIndex",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getVoteChoices",
      "inputs": [
          {
              "name": "_tokenId",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "string[]",
              "internalType": "string[]"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getVoteCreationNFTAddress",
      "inputs": [],
      "outputs": [
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getVoteDescription",
      "inputs": [
          {
              "name": "_tokenId",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "string",
              "internalType": "string"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getVoteEndTime",
      "inputs": [
          {
              "name": "_tokenId",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "string",
              "internalType": "string"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getVoteName",
      "inputs": [
          {
              "name": "_tokenId",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "string",
              "internalType": "string"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getVoteStartTime",
      "inputs": [
          {
              "name": "_tokenId",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "string",
              "internalType": "string"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getVotersChoice",
      "inputs": [
          {
              "name": "_tokenId",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "_voter",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "string",
              "internalType": "string"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getVotersDelegate",
      "inputs": [
          {
              "name": "_tokenId",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "_voter",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "getVotingStatus",
      "inputs": [
          {
              "name": "_tokenId",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [
          {
              "name": "",
              "type": "uint8",
              "internalType": "enum VoteManagement.VotingStatus"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "initializeVoteProperties",
      "inputs": [
          {
              "name": "_tokenId",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "_voteName",
              "type": "string",
              "internalType": "string"
          },
          {
              "name": "_voteDescription",
              "type": "string",
              "internalType": "string"
          },
          {
              "name": "_voteStartTime",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "_voteEndTime",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "_choices",
              "type": "string[]",
              "internalType": "string[]"
          }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "openVote",
      "inputs": [
          {
              "name": "_tokenId",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "owner",
      "inputs": [],
      "outputs": [
          {
              "name": "",
              "type": "address",
              "internalType": "address"
          }
      ],
      "stateMutability": "view"
  },
  {
      "type": "function",
      "name": "performUpkeep",
      "inputs": [
          {
              "name": "performData",
              "type": "bytes",
              "internalType": "bytes"
          }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "renounceOwnership",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "setDelegateVoter",
      "inputs": [
          {
              "name": "_tokenId",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "_voter",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "_delegateVoter",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "setVoteCreationNFTContract",
      "inputs": [
          {
              "name": "_VoteCreationNFTAddress",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [
          {
              "name": "newOwner",
              "type": "address",
              "internalType": "address"
          }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
  },
  {
      "type": "function",
      "name": "updateVoteCount",
      "inputs": [
          {
              "name": "_user",
              "type": "address",
              "internalType": "address"
          },
          {
              "name": "_tokenId",
              "type": "uint256",
              "internalType": "uint256"
          },
          {
              "name": "_choiceIndex",
              "type": "uint256",
              "internalType": "uint256"
          }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
  },
  {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
          {
              "name": "previousOwner",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          },
          {
              "name": "newOwner",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "UserVoteCasted",
      "inputs": [
          {
              "name": "_voter",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          },
          {
              "name": "_tokenId",
              "type": "uint256",
              "indexed": true,
              "internalType": "uint256"
          },
          {
              "name": "_votersChoiceIndex",
              "type": "uint256",
              "indexed": true,
              "internalType": "uint256"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "UserVoteChanged",
      "inputs": [
          {
              "name": "_voter",
              "type": "address",
              "indexed": true,
              "internalType": "address"
          },
          {
              "name": "_tokenId",
              "type": "uint256",
              "indexed": true,
              "internalType": "uint256"
          },
          {
              "name": "_votersChoiceIndex",
              "type": "uint256",
              "indexed": true,
              "internalType": "uint256"
          }
      ],
      "anonymous": false
  },
  {
      "type": "event",
      "name": "VoteClosed",
      "inputs": [
          {
              "name": "_winningChoiceIndex",
              "type": "uint256",
              "indexed": true,
              "internalType": "uint256"
          },
          {
              "name": "_winningChoiceTotalVotes",
              "type": "uint256",
              "indexed": true,
              "internalType": "uint256"
          },
          {
              "name": "doesWinnerExist",
              "type": "bool",
              "indexed": false,
              "internalType": "bool"
          },
          {
              "name": "_tokenId",
              "type": "uint256",
              "indexed": true,
              "internalType": "uint256"
          },
          {
              "name": "_totalVotes",
              "type": "uint256",
              "indexed": false,
              "internalType": "uint256"
          }
      ],
      "anonymous": false
  },
  {
      "type": "error",
      "name": "OwnableInvalidOwner",
      "inputs": [
          {
              "name": "owner",
              "type": "address",
              "internalType": "address"
          }
      ]
  },
  {
      "type": "error",
      "name": "OwnableUnauthorizedAccount",
      "inputs": [
          {
              "name": "account",
              "type": "address",
              "internalType": "address"
          }
      ]
  },
  {
      "type": "error",
      "name": "VoteManagement__AddressToVoteInvalid",
      "inputs": []
  },
  {
      "type": "error",
      "name": "VoteManagement__AlreadyVoted",
      "inputs": []
  },
  {
      "type": "error",
      "name": "VoteManagement__CanOnlyBeCalledByVoteCreationNft",
      "inputs": []
  },
  {
      "type": "error",
      "name": "VoteManagement__ChangeVoteLimitReached",
      "inputs": []
  },
  {
      "type": "error",
      "name": "VoteManagement__DelegateVoterAlreadyBeingUsedBySomeoneElse",
      "inputs": []
  },
  {
      "type": "error",
      "name": "VoteManagement__DelegateVoterIsntARegisteredVoter",
      "inputs": []
  },
  {
      "type": "error",
      "name": "VoteManagement__IVoteCreationNFTAlreadyInitialized",
      "inputs": []
  },
  {
      "type": "error",
      "name": "VoteManagement__InvalidChoiceIndex",
      "inputs": []
  },
  {
      "type": "error",
      "name": "VoteManagement__MustVoteInOrderToChangeVote",
      "inputs": []
  },
  {
      "type": "error",
      "name": "VoteManagement__NotRegisteredVoter",
      "inputs": []
  },
  {
      "type": "error",
      "name": "VoteManagement__TokenIdSpecifiedDoesNotExist",
      "inputs": []
  },
  {
      "type": "error",
      "name": "VoteManagement__UnableToCloseVoteUntilEndTime",
      "inputs": []
  },
  {
      "type": "error",
      "name": "VoteManagement__UnableToOpenVoteUntilStartTime",
      "inputs": []
  },
  {
      "type": "error",
      "name": "VoteManagement__UnableToSetYourselfAsADelegateVoter",
      "inputs": []
  },
  {
      "type": "error",
      "name": "VoteManagement__VoteDurationNotValid",
      "inputs": []
  },
  {
      "type": "error",
      "name": "VoteManagement__VoteEndTimeReached",
      "inputs": []
  },
  {
      "type": "error",
      "name": "VoteManagement__VoteHasAlreadyBeenClosed",
      "inputs": []
  },
  {
      "type": "error",
      "name": "VoteManagement__VoteHasNotBeenClosed",
      "inputs": []
  },
  {
      "type": "error",
      "name": "VoteManagement__VoteIsAlreadyOpen",
      "inputs": []
  },
  {
      "type": "error",
      "name": "VoteManagement__VoteNotOpen",
      "inputs": []
  },
  {
      "type": "error",
      "name": "VoteManagement__VotePropertiesHaveAlreadyBeenInitialized",
      "inputs": []
  },
  {
      "type": "error",
      "name": "VoteManagement__ZeroAddressNotAllowed",
      "inputs": []
  }
]