// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";

// Interface used to access function from Voter Registration Smart Contract
interface IVoterRegistration {
    function isRegisteredVoter(address _voter) external view returns (bool);
}

// Interface used to access functions from Vote Creation NFT Smart Contract
interface IVoteCreationNFT {
    function setTokenURI(uint256 _tokenId) external;

    function exists(uint256 tokenId) external view returns (bool);

    function ownerOf(uint256 tokenId) external view returns (address);

    function getTotalSupply() external view returns (uint256);
}

/**
 * @title VoteManagement
 * @notice A contract which handles the whole logic of an election.
 * @dev in this case, we are assuming msg.sender is trustworthy for the Owner of the contract. In a real world application we would use a DAO.
 */
contract VoteManagement is Ownable, AutomationCompatibleInterface {
    error VoteManagement__CanOnlyBeCalledByVoteCreationNft();
    error VoteManagement__TokenIdSpecifiedDoesNotExist();
    error VoteManagement__VoteDurationNotValid();
    error VoteManagement__UnableToOpenVoteUntilStartTime();
    error VoteManagement__VotePropertiesHaveAlreadyBeenInitialized();
    error VoteManagement__VoteIsAlreadyOpen();
    error VoteManagement__IVoteCreationNFTAlreadyInitialized();
    error VoteManagement__ZeroAddressNotAllowed();
    error VoteManagement__NotRegisteredVoter();
    error VoteManagement__AddressToVoteInvalid();
    error VoteManagement__VoteEndTimeReached();
    error VoteManagement__VoteNotOpen();
    error VoteManagement__AlreadyVoted();
    error VoteManagement__InvalidChoiceIndex();
    error VoteManagement__MustVoteInOrderToChangeVote();
    error VoteManagement__ChangeVoteLimitReached();
    error VoteManagement__UnableToCloseVoteUntilEndTime();
    error VoteManagement__VoteHasAlreadyBeenClosed();
    error VoteManagement__DelegateVoterIsntARegisteredVoter();
    error VoteManagement__UnableToSetYourselfAsADelegateVoter();
    error VoteManagement__DelegateVoterAlreadyBeingUsedBySomeoneElse();
    error VoteManagement__VoteHasNotBeenClosed();

    using Strings for uint256;

    enum VotingStatus {
        PENDING,
        INPROGRESS,
        CLOSED
    }

    struct VoteProperties {
        VotingStatus votingStatus;
        string voteName;
        string voteDescription;
        uint256 voteStartTime;
        uint256 voteEndTime;
        uint256 totalVotes;
        string[] choices;
        mapping(string => uint256) eachChoicesVotes;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) votersChoiceIndex;
        mapping(address => bool) changeVoteLimitReached;
        mapping(address => address) voterToDelegate;
        mapping(address => address) delegateToVoter;
        bool isSet;
    }

    IVoterRegistration private immutable i_iVoterRegistration;
    IVoteCreationNFT private s_iVoteCreationNFT;
    bool private s_isIVoteCreationNFTInitialized;
    mapping(uint256 => VoteProperties) private s_tokenIdToVoteProperties;

    event UserVoteCasted(
        address indexed _voter,
        uint256 indexed _tokenId,
        uint256 indexed _votersChoiceIndex
    );
    event UserVoteChanged(
        address indexed _voter,
        uint256 indexed _tokenId,
        uint256 indexed _votersChoiceIndex
    );
    event VoteClosed(
        uint256 indexed _winningChoiceIndex,
        uint256 indexed _winningChoiceTotalVotes,
        bool doesWinnerExist,
        uint256 indexed _tokenId,
        uint256 _totalVotes
    );

    // used to access whether or not token ID provided for an NFT exists.
    modifier isTokenIdValid(uint256 _tokenId) {
        if (!s_iVoteCreationNFT.exists(_tokenId)) {
            revert VoteManagement__TokenIdSpecifiedDoesNotExist();
        }
        _;
    }

    // ensures that address provided is valid
    // user has to be a registered voter or a delegate voter
    modifier isAddressToVoteValid(uint256 _tokenId, address _user) {
        if (_user == address(0)) {
            revert VoteManagement__ZeroAddressNotAllowed();
        } else if (!i_iVoterRegistration.isRegisteredVoter(_user)) {
            revert VoteManagement__NotRegisteredVoter();
        } else if (
            _user != msg.sender &&
            getVotersDelegate(_tokenId, _user) != msg.sender
        ) {
            revert VoteManagement__AddressToVoteInvalid();
        }
        _;
    }

    // if vote start time is reached this modifier ensures openVote() function is called if not already
    // else if vote start time not reached a revert error will occur if openVote() function is called.
    modifier voteNotCurrentlyOpen(uint256 _tokenId) {
        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];

        if (
            properties.votingStatus == VotingStatus.PENDING &&
            properties.voteStartTime <= block.timestamp &&
            properties.voteEndTime > block.timestamp
        ) {
            openVote(_tokenId);
        } else if (
            properties.votingStatus == VotingStatus.PENDING ||
            properties.voteStartTime > block.timestamp
        ) {
            revert VoteManagement__VoteNotOpen();
        }
        _;
    }

    // if vote end time is reached this modifier ensures a revert error occurs in the case someone attempts to call any functions that would alter any election results.
    modifier voteEndTimeReached(uint256 _tokenId) {
        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];

        if (properties.voteEndTime <= block.timestamp) {
            revert VoteManagement__VoteEndTimeReached();
        }
        _;
    }

    constructor(address _voterRegistrationAddress) Ownable(msg.sender) {
        // function sets Voter Registration Contract, which can be used to access the function above in the IVoterRegistration interface.
        i_iVoterRegistration = IVoterRegistration(_voterRegistrationAddress);
    }

    function setVoteCreationNFTContract(
        address _VoteCreationNFTAddress
    ) external onlyOwner {
        if (s_isIVoteCreationNFTInitialized) {
            revert VoteManagement__IVoteCreationNFTAlreadyInitialized();
        }

        if (_VoteCreationNFTAddress == address(0)) {
            revert VoteManagement__ZeroAddressNotAllowed();
        }

        s_isIVoteCreationNFTInitialized = true;
        s_iVoteCreationNFT = IVoteCreationNFT(_VoteCreationNFTAddress);
    }

    /**
     * @notice the properties.isSet is used to ensure that this function can only be called once for each election that is created.
     * @dev this function is called inside of s_iVoteCreationNFT::mintNft() and can only be called by s_iVoteCreationNFT::mintNft().
     * @param _voteStartTime - in seconds
     * @param _voteEndTime - in seconds
     */
    function initializeVoteProperties(
        uint256 _tokenId,
        string memory _voteName,
        string memory _voteDescription,
        uint256 _voteStartTime,
        uint256 _voteEndTime,
        string[] memory _choices
    ) external isTokenIdValid(_tokenId) {
        if (msg.sender != address(s_iVoteCreationNFT)) {
            revert VoteManagement__CanOnlyBeCalledByVoteCreationNft();
        }

        if (
            block.timestamp + _voteStartTime > block.timestamp + _voteEndTime ||
            _voteStartTime == _voteEndTime
        ) {
            revert VoteManagement__VoteDurationNotValid();
        }

        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];

        if (properties.isSet) {
            revert VoteManagement__VotePropertiesHaveAlreadyBeenInitialized();
        }

        if (block.timestamp >= block.timestamp + _voteStartTime) {
            properties.votingStatus = VotingStatus.INPROGRESS;
        } else {
            properties.votingStatus = VotingStatus.PENDING;
        }

        properties.voteName = _voteName;
        properties.voteDescription = _voteDescription;
        properties.voteStartTime = block.timestamp + _voteStartTime;
        properties.voteEndTime = block.timestamp + _voteEndTime;
        properties.choices = _choices;
        properties.isSet = true;
    }

    function openVote(uint256 _tokenId) public isTokenIdValid(_tokenId) {
        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];

        if (block.timestamp < properties.voteStartTime) {
            revert VoteManagement__UnableToOpenVoteUntilStartTime();
        }

        if (properties.votingStatus == VotingStatus.INPROGRESS) {
            revert VoteManagement__VoteIsAlreadyOpen();
        }

        if (properties.voteEndTime <= block.timestamp) {
            revert VoteManagement__VoteHasAlreadyBeenClosed();
        }

        properties.votingStatus = VotingStatus.INPROGRESS;
    }

    /**
     * @dev if vote start time is reached and openVote has not been called, upon calling updateVoteCount() - it will trigger the call for openVote()
     * @param _user - Address of the voter
     * @param _tokenId - Token ID of the NFT they want to vote on
     * @param _choiceIndex - Index of the Choice of the voter
     */
    function updateVoteCount(
        address _user,
        uint256 _tokenId,
        uint256 _choiceIndex
    )
        external
        isTokenIdValid(_tokenId)
        isAddressToVoteValid(_tokenId, _user)
        voteNotCurrentlyOpen(_tokenId)
        voteEndTimeReached(_tokenId)
    {
        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];

        // if user has already voted a revert error occurs.
        if (properties.hasVoted[_user]) {
            revert VoteManagement__AlreadyVoted();
        }

        // if vote choice provided is invalid a revert error occurs.
        if (_choiceIndex >= properties.choices.length) {
            revert VoteManagement__InvalidChoiceIndex();
        }

        // sets the index of the selected vote choice
        properties.votersChoiceIndex[_user] = _choiceIndex;

        // adds a vote to the choice that was selected
        string memory selectedChoice = properties.choices[_choiceIndex];

        // updates what each choice in the elections score is, which would ultimately determine how many votes each choice gets.
        properties.eachChoicesVotes[selectedChoice] += 1;

        // used to set that the user has voted.
        properties.hasVoted[_user] = true;

        properties.totalVotes++;

        emit UserVoteCasted(
            _user,
            _tokenId,
            properties.votersChoiceIndex[_user]
        );
    }

    /**
     * @notice in the case that a user has made a mistake with their choice or maybe they just want to adjust their vote, this function will allow them to do so but they will only be limited to do this 1 time per election.
     */
    function changeVote(
        address _user,
        uint256 _tokenId,
        uint256 _choiceIndex
    )
        external
        isTokenIdValid(_tokenId)
        isAddressToVoteValid(_tokenId, _user)
        voteNotCurrentlyOpen(_tokenId)
        voteEndTimeReached(_tokenId)
    {
        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];

        // if user hasn't already voted a revert error occurs because a user has to have initially casted a vote to have the option to alter their vote choice.
        if (!properties.hasVoted[_user]) {
            revert VoteManagement__MustVoteInOrderToChangeVote();
        }

        // if user has reached their change vote limit which is a single instance a revert error occurs
        if (properties.changeVoteLimitReached[_user]) {
            revert VoteManagement__ChangeVoteLimitReached();
        }

        // process to remove a vote from the choice the user previously selected.
        string memory choiceOfVoteToRemove = properties.choices[
            properties.votersChoiceIndex[_user]
        ];
        properties.eachChoicesVotes[choiceOfVoteToRemove] -= 1;
        properties.totalVotes--;

        // if vote choice provided is invalid a revert error occurs.
        if (_choiceIndex >= properties.choices.length) {
            revert VoteManagement__InvalidChoiceIndex();
        }

        // sets the index of the selected vote choice
        properties.votersChoiceIndex[_user] = _choiceIndex;

        // adds a vote to the choice that was selected
        string memory selectedChoice = properties.choices[_choiceIndex];

        // updates what each choice in the elections score is, which would ultimately determine how many votes each choice gets.
        properties.eachChoicesVotes[selectedChoice] += 1;

        // used to set that user's change vote limit is reached here.
        properties.changeVoteLimitReached[_user] = true;

        properties.totalVotes++;

        emit UserVoteChanged(
            _user,
            _tokenId,
            properties.votersChoiceIndex[_user]
        );
    }

    /**
     * @dev used by Chainlink Keepers, function is just used to check whether vote end time is reached which will trigger the performUpkeep function to close the vote and reveal election winner
     */
    function checkUpkeep(
        bytes calldata checkData
    )
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        uint256 tokenId = abi.decode(checkData, (uint256));
        if (!s_iVoteCreationNFT.exists(tokenId)) {
            revert VoteManagement__TokenIdSpecifiedDoesNotExist();
        }

        VoteProperties storage properties = s_tokenIdToVoteProperties[tokenId];
        upkeepNeeded =
            block.timestamp >= properties.voteEndTime &&
            properties.votingStatus != VotingStatus.CLOSED;
        performData = abi.encodePacked(tokenId);
    }

    /**
     * @dev if checkUpkeep returns true then this function is triggered to reveal the election winner.
     */
    function performUpkeep(bytes calldata performData) public override {
        uint256 tokenId = abi.decode(performData, (uint256));
        if (!s_iVoteCreationNFT.exists(tokenId)) {
            revert VoteManagement__TokenIdSpecifiedDoesNotExist();
        }

        VoteProperties storage properties = s_tokenIdToVoteProperties[tokenId];

        if (block.timestamp < properties.voteEndTime) {
            revert VoteManagement__UnableToCloseVoteUntilEndTime();
        }

        if (properties.votingStatus == VotingStatus.CLOSED) {
            revert VoteManagement__VoteHasAlreadyBeenClosed();
        }

        properties.votingStatus = VotingStatus.CLOSED;

        (
            uint256 winningChoiceIndex,
            uint256 winningChoiceTotalVotes,
            bool doesWinnerExist
        ) = getVoteWinner(tokenId);

        uint256 totalVotes = getTotalVotes(tokenId);

        s_iVoteCreationNFT.setTokenURI(tokenId);

        emit VoteClosed(
            winningChoiceIndex,
            winningChoiceTotalVotes,
            doesWinnerExist,
            tokenId,
            totalVotes
        );
    }

    /**
     * @notice _delegateVoter must be a registred voter in order to be able to be a delegate for someone else.
     * @dev _delegateVoter is only allowed to vote for the election they have been given permission to vote for.
     */
    function setDelegateVoter(
        uint256 _tokenId,
        address _voter,
        address _delegateVoter
    ) external isAddressToVoteValid(_tokenId, _voter) isTokenIdValid(_tokenId) {
        if (_delegateVoter == address(0)) {
            revert VoteManagement__ZeroAddressNotAllowed();
        }

        if (!i_iVoterRegistration.isRegisteredVoter(_delegateVoter)) {
            revert VoteManagement__DelegateVoterIsntARegisteredVoter();
        }

        if (_delegateVoter == msg.sender) {
            revert VoteManagement__UnableToSetYourselfAsADelegateVoter();
        }

        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];

        // if a delegate voter is already in use by someone else, a user will not be allowed to set this delegate voter for themselves.
        if (properties.delegateToVoter[_delegateVoter] != address(0)) {
            revert VoteManagement__DelegateVoterAlreadyBeingUsedBySomeoneElse();
        }

        // sets users delegate voter
        properties.voterToDelegate[_voter] = _delegateVoter;

        // set as a helper to know what user a delegate voter is associated with
        properties.delegateToVoter[_delegateVoter] = _voter;
    }

    function getVoteWinner(
        uint256 _tokenId
    )
        internal
        view
        isTokenIdValid(_tokenId)
        returns (
            uint256 winningChoiceIndex,
            uint256 winningChoiceTotalVotes,
            bool doesWinnerExist
        )
    {
        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];

        // ensures that vote winner isn't returned until election has been closed otherwise a revert error will occur
        if (
            properties.voteEndTime >= block.timestamp &&
            properties.votingStatus != VotingStatus.CLOSED
        ) {
            revert VoteManagement__VoteHasNotBeenClosed();
        }

        winningChoiceIndex = type(uint256).max;
        winningChoiceTotalVotes = 0;

        // initally set to false in the case there aren't any winners
        doesWinnerExist = false;

        // for loop iterates through all the choices available within an election and tallys up the total votes for each choice and returns the vote winner
        for (uint256 i = 0; i < properties.choices.length; i++) {
            uint256 totalVotesForSpecificChoice = getTotalVotesForEachChoice(
                _tokenId,
                i
            );

            if (totalVotesForSpecificChoice > winningChoiceTotalVotes) {
                winningChoiceTotalVotes = totalVotesForSpecificChoice;
                winningChoiceIndex = i;
                doesWinnerExist = true;
            }
        }

        return (winningChoiceIndex, winningChoiceTotalVotes, doesWinnerExist);
    }

    function _getVoteWinner(
        uint256 _tokenId
    )
        external
        view
        isTokenIdValid(_tokenId)
        returns (
            uint256 winningChoiceIndex,
            uint256 winningChoiceTotalVotes,
            bool doesWinnerExist
        )
    {
        (
            winningChoiceIndex,
            winningChoiceTotalVotes,
            doesWinnerExist
        ) = getVoteWinner(_tokenId);

        return (winningChoiceIndex, winningChoiceTotalVotes, doesWinnerExist);
    }

    function getVoteCreationNFTAddress() external view returns (address) {
        return address(s_iVoteCreationNFT);
    }

    function getVotingStatus(
        uint256 _tokenId
    ) external view isTokenIdValid(_tokenId) returns (VotingStatus) {
        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];
        return properties.votingStatus;
    }

    function _getVotingStatus(
        uint256 _tokenId
    ) external view isTokenIdValid(_tokenId) returns (string memory) {
        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];
        if (properties.votingStatus == VotingStatus.PENDING) {
            return "PENDING";
        } else if (properties.votingStatus == VotingStatus.INPROGRESS) {
            return "INPROGRESS";
        } else if (properties.votingStatus == VotingStatus.CLOSED) {
            return "CLOSED";
        }
        return "UNAVAILABLE";
    }

    /**
     * @dev This is a helper function specifically used for the frontend.
     */
    function getAllVoteNames() external view returns (string[] memory) {
        uint256 totalSupply_tokenIds = s_iVoteCreationNFT.getTotalSupply();

        string[] memory allVoteNames = new string[](totalSupply_tokenIds);
        for (uint256 i = 0; i < totalSupply_tokenIds; i++) {
            // accesses election properties for a specific election with identifier _tokenID
            VoteProperties storage properties = s_tokenIdToVoteProperties[i];
            allVoteNames[i] = properties.voteName;
        }

        return allVoteNames;
    }

    function getVoteName(
        uint256 _tokenId
    ) external view isTokenIdValid(_tokenId) returns (string memory) {
        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];
        return properties.voteName;
    }

    function getVoteDescription(
        uint256 _tokenId
    ) external view isTokenIdValid(_tokenId) returns (string memory) {
        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];
        return properties.voteDescription;
    }

    function getVoteStartTime(
        uint256 _tokenId
    ) external view isTokenIdValid(_tokenId) returns (string memory) {
        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];
        return properties.voteStartTime.toString();
    }

    function getVoteEndTime(
        uint256 _tokenId
    ) external view isTokenIdValid(_tokenId) returns (string memory) {
        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];
        return properties.voteEndTime.toString();
    }

    function getTotalVotes(
        uint256 _tokenId
    ) public view isTokenIdValid(_tokenId) returns (uint256) {
        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];
        return properties.totalVotes;
    }

    function getVoteChoices(
        uint256 _tokenId
    ) external view isTokenIdValid(_tokenId) returns (string[] memory) {
        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];
        return properties.choices;
    }

    function getTotalVotesForEachChoice(
        uint256 _tokenId,
        uint256 _choiceIndex
    ) public view isTokenIdValid(_tokenId) returns (uint256) {
        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];
        string memory choice = properties.choices[_choiceIndex];
        return properties.eachChoicesVotes[choice];
    }

    function getHasVoted(
        uint256 _tokenId,
        address _voter
    ) external view isTokenIdValid(_tokenId) returns (bool) {
        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];
        return properties.hasVoted[_voter];
    }

    function getVotersChoice(
        uint256 _tokenId,
        address _voter
    ) external view isTokenIdValid(_tokenId) returns (string memory) {
        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];

        if (properties.hasVoted[_voter]) {
            uint256 votersChoiceIndex = properties.votersChoiceIndex[_voter];
            string memory votersChoice = properties.choices[votersChoiceIndex];
            return votersChoice;
        }

        return "";
    }

    function getIsChangeVoteLimitReached(
        uint256 _tokenId,
        address _voter
    ) external view isTokenIdValid(_tokenId) returns (bool) {
        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];
        return properties.changeVoteLimitReached[_voter];
    }

    function getVotersDelegate(
        uint256 _tokenId,
        address _voter
    ) public view isTokenIdValid(_tokenId) returns (address) {
        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];
        return properties.voterToDelegate[_voter];
    }

    function getDelegateToVoter(
        uint256 _tokenId,
        address _delegate
    ) public view isTokenIdValid(_tokenId) returns (address) {
        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];
        return properties.delegateToVoter[_delegate];
    }

    function getIsVotePropertiesSet(
        uint256 _tokenId
    ) external view isTokenIdValid(_tokenId) returns (bool) {
        // accesses election properties for a specific election with identifier _tokenID
        VoteProperties storage properties = s_tokenIdToVoteProperties[_tokenId];
        return properties.isSet;
    }

    function getAddressOfVoteCreationNFTContract()
        external
        view
        returns (address)
    {
        return address(s_iVoteCreationNFT);
    }
}
