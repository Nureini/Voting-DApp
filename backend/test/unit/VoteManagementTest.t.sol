// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {VoteManagement} from "../../src/VoteManagement.sol";
import {DeployVoteManagement} from "../../script/DeployVoteManagement.s.sol";
import {VoteCreationNFT} from "../../src/VoteCreationNFT.sol";
import {DeployVoteCreationNFT} from "../../script/DeployVoteCreationNFT.s.sol";
import {VoterRegistration} from "../../src/VoterRegistration.sol";
import {DeployVoterRegistration} from "../../script/DeployVoterRegistration.s.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IERC721Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

/**
 * VoteManagement Unit Tests used to break down and test each function of the VoteManagement smart contract.
 */
contract VoteManagementTest is Test {
    using Strings for uint256;

    VoteManagement private s_voteManagement;
    VoteCreationNFT private s_voteCreationNFT;
    VoterRegistration s_voterRegistration;

    address private s_voter = makeAddr("VOTER");
    address private s_anotherVoter = makeAddr("ANOTHERVOTER");

    uint256 private constant TOKEN_ID = 0;

    bytes private constant PERFORM_DATA = abi.encodePacked(TOKEN_ID);
    bytes private constant INVALID_PERFORM_DATA =
        abi.encodePacked(INVALID_TOKEN_ID);

    string private constant VOTE_NAME = "Test Vote";
    string private constant VOTE_DESCRIPTION = "This is a test vote";
    uint256 private constant VOTE_START_TIME = 0;
    uint256 private constant VOTE_END_TIME = 60;
    string[] private s_choices = ["A", "B", "C"];

    uint256 private constant VOTE_CHOICE_INDEX = 0;
    uint256 private constant INVALID_VOTE_CHOICE_INDEX = 3;
    uint256 private constant CHANGE_VOTE_CHOICE_INDEX = 1;
    uint256 private constant INVALID_TOKEN_ID = 1;
    uint256 private constant INVALID_VOTE_START_TIME = 3600;
    uint256 private constant INVALID_VOTE_END_TIME = 0;
    uint256 private constant LATE_VOTE_START_TIME = 1;
    address private s_delegateVoter = makeAddr("DELEGATE_VOTER");

    event UserVoteCasted(
        address indexed s_voter,
        uint256 indexed tokenId,
        uint256 indexed s_votersChoiceIndex
    );
    event UserVoteChanged(
        address indexed s_voter,
        uint256 indexed tokenId,
        uint256 indexed s_votersChoiceIndex
    );
    event VoteClosed(
        uint256 indexed _winningChoiceIndex,
        uint256 indexed _winningChoiceTotalVotes,
        bool doesWinnerExist,
        uint256 indexed _tokenId,
        uint256 _totalVotes
    );

    modifier mintNewNft() {
        vm.prank(s_voteCreationNFT.owner());
        s_voteCreationNFT.mintNft(
            VOTE_NAME,
            VOTE_DESCRIPTION,
            LATE_VOTE_START_TIME,
            VOTE_END_TIME,
            s_choices
        );
        _;
    }

    function setUp() external {
        DeployVoterRegistration deployVoterRegistration = new DeployVoterRegistration();
        s_voterRegistration = deployVoterRegistration.run();

        DeployVoteManagement deployVoteManagement = new DeployVoteManagement();
        s_voteManagement = deployVoteManagement.run(
            address(s_voterRegistration)
        );

        DeployVoteCreationNFT deployVoteCreationNFT = new DeployVoteCreationNFT();
        s_voteCreationNFT = deployVoteCreationNFT.run();

        vm.prank(s_voteManagement.owner());
        s_voteManagement.setVoteCreationNFTContract(address(s_voteCreationNFT));
        vm.prank(s_voteCreationNFT.owner());
        s_voteCreationNFT.setVoteManagementContract(address(s_voteManagement));

        vm.prank(s_voteCreationNFT.owner());
        s_voteCreationNFT.mintNft(
            VOTE_NAME,
            VOTE_DESCRIPTION,
            VOTE_START_TIME,
            VOTE_END_TIME,
            s_choices
        );
    }

    // setVoteCreationNFT Function Tests

    function testRevertsIfVoteCreationNFTAlreadyInitialized() external {
        vm.startPrank(s_voteManagement.owner());

        vm.expectRevert(
            VoteManagement
                .VoteManagement__IVoteCreationNFTAlreadyInitialized
                .selector
        );
        s_voteManagement.setVoteCreationNFTContract(address(s_voteCreationNFT));
        vm.stopPrank();
    }

    function testRevertsIfNotOwnerCallsVoteCreationNFT() external {
        vm.expectRevert();
        s_voteManagement.setVoteCreationNFTContract(address(s_voteCreationNFT));
    }

    function testVoteCreationNftContractIsSetCorrectly() external {
        assertEq(
            s_voteManagement.getAddressOfVoteCreationNFTContract(),
            address(s_voteCreationNFT)
        );
    }

    // initializeVoteProperties Function Tests

    function testRevertsIfNotVoteCreationNftAddressAttemptsToInitializeNft()
        external
    {
        vm.expectRevert(
            VoteManagement
                .VoteManagement__CanOnlyBeCalledByVoteCreationNft
                .selector
        );
        s_voteManagement.initializeVoteProperties(
            TOKEN_ID,
            VOTE_NAME,
            VOTE_DESCRIPTION,
            VOTE_START_TIME,
            VOTE_END_TIME,
            s_choices
        );
    }

    function testRevertsIfTokenIdDoesntExistToInitializeNft() external {
        vm.prank(address(s_voteCreationNFT));
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721NonexistentToken.selector,
                INVALID_TOKEN_ID
            )
        );
        s_voteManagement.initializeVoteProperties(
            INVALID_TOKEN_ID,
            VOTE_NAME,
            VOTE_DESCRIPTION,
            VOTE_START_TIME,
            VOTE_END_TIME,
            s_choices
        );
    }

    function testRevertsIfVoteDurationGivenIsInvalid() external {
        vm.prank(address(s_voteCreationNFT));
        vm.expectRevert(
            VoteManagement.VoteManagement__VoteDurationNotValid.selector
        );
        s_voteManagement.initializeVoteProperties(
            TOKEN_ID,
            VOTE_NAME,
            VOTE_DESCRIPTION,
            INVALID_VOTE_START_TIME,
            INVALID_VOTE_END_TIME,
            s_choices
        );
    }

    function testRevertsIfPropertiesIsAlreadySet() external {
        vm.prank(address(s_voteCreationNFT));
        vm.expectRevert(
            VoteManagement
                .VoteManagement__VotePropertiesHaveAlreadyBeenInitialized
                .selector
        );
        s_voteManagement.initializeVoteProperties(
            TOKEN_ID,
            VOTE_NAME,
            VOTE_DESCRIPTION,
            VOTE_START_TIME,
            VOTE_END_TIME,
            s_choices
        );
    }

    // openVote Function Tests

    function testRevertsOpenVoteIfInvalidTokenId() external {
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721NonexistentToken.selector,
                INVALID_TOKEN_ID
            )
        );
        s_voteManagement.openVote(INVALID_TOKEN_ID);
    }

    function testOpenVoterevertsIfVoteStartTimeIsntReached()
        external
        mintNewNft
    {
        vm.expectRevert(
            VoteManagement
                .VoteManagement__UnableToOpenVoteUntilStartTime
                .selector
        );
        s_voteManagement.openVote(TOKEN_ID + 1);
    }

    function testOpenVoteRevertsIfVoteHasAlreadyBeenOpened()
        external
        mintNewNft
    {
        vm.warp(block.timestamp + LATE_VOTE_START_TIME);
        s_voteManagement.openVote(TOKEN_ID + 1);
        vm.expectRevert(
            VoteManagement.VoteManagement__VoteIsAlreadyOpen.selector
        );
        s_voteManagement.openVote(TOKEN_ID + 1);
    }

    function testOpenVoteRevertsIfVoteHasAlreadyBeenClosed()
        external
        mintNewNft
    {
        vm.warp(block.timestamp + VOTE_END_TIME);
        s_voteManagement.performUpkeep(PERFORM_DATA);
        vm.expectRevert(
            VoteManagement.VoteManagement__VoteHasAlreadyBeenClosed.selector
        );
        s_voteManagement.openVote(TOKEN_ID + 1);
    }

    function testSuccesfullyOpensVote() external mintNewNft {
        vm.warp(block.timestamp + LATE_VOTE_START_TIME);
        s_voteManagement.openVote(TOKEN_ID + 1);
        assert(
            s_voteManagement.getVotingStatus(TOKEN_ID + 1) ==
                VoteManagement.VotingStatus.INPROGRESS
        );
        assertEq(s_voteManagement._getVotingStatus(TOKEN_ID + 1), "INPROGRESS");
    }

    // updateVoteCount Function Tests

    function testRevertsUpdateVoteIfInvalidTokenId() external {
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721NonexistentToken.selector,
                INVALID_TOKEN_ID
            )
        );
        s_voteManagement.updateVoteCount(
            s_voter,
            INVALID_TOKEN_ID,
            VOTE_CHOICE_INDEX
        );
    }

    function testRevertsIfAddressToUpdateVoteCountGivenIsZero() external {
        vm.expectRevert(
            VoteManagement.VoteManagement__ZeroAddressNotAllowed.selector
        );
        s_voteManagement.updateVoteCount(
            address(0),
            TOKEN_ID,
            VOTE_CHOICE_INDEX
        );
    }

    function testRevertsIfNotARegisteredVoterForUpdateVoteCount() external {
        vm.expectRevert(
            VoteManagement.VoteManagement__NotRegisteredVoter.selector
        );
        s_voteManagement.updateVoteCount(s_voter, TOKEN_ID, VOTE_CHOICE_INDEX);
    }

    function testRevertsIfAddressToUpdateVoteCountGivenIsNotMsgSenderOrADelegate()
        external
    {
        vm.startPrank(msg.sender);
        s_voterRegistration.registerVoter(s_voter);

        vm.expectRevert(
            VoteManagement.VoteManagement__AddressToVoteInvalid.selector
        );
        s_voteManagement.updateVoteCount(s_voter, TOKEN_ID, VOTE_CHOICE_INDEX);

        vm.stopPrank();
    }

    function testRevertsIfUpdateVoteCountIsCalledWhenVoteIsntSetToOpen()
        external
        mintNewNft
    {
        vm.startPrank(msg.sender);
        s_voterRegistration.registerVoter(msg.sender);

        vm.expectRevert(VoteManagement.VoteManagement__VoteNotOpen.selector);
        s_voteManagement.updateVoteCount(
            msg.sender,
            TOKEN_ID + 1,
            VOTE_CHOICE_INDEX
        );

        vm.stopPrank();
    }

    function testRevertsIfVoteEndTimeReachedWhenAttemptingToUpdateVoteCount()
        external
    {
        vm.startPrank(msg.sender);
        s_voterRegistration.registerVoter(msg.sender);

        vm.warp(block.timestamp + VOTE_END_TIME);

        vm.expectRevert(
            VoteManagement.VoteManagement__VoteEndTimeReached.selector
        );
        s_voteManagement.updateVoteCount(
            msg.sender,
            TOKEN_ID,
            VOTE_CHOICE_INDEX
        );

        vm.stopPrank();
    }

    function testVoteIsSetToOpenIfVoteStartTimeIsReachedWhenAttemptingToUpdateVoteCount()
        external
        mintNewNft
    {
        vm.startPrank(msg.sender);
        s_voterRegistration.registerVoter(msg.sender);

        vm.warp(block.timestamp + LATE_VOTE_START_TIME);

        s_voteManagement.updateVoteCount(
            msg.sender,
            TOKEN_ID + 1,
            VOTE_CHOICE_INDEX
        );

        vm.stopPrank();

        assert(
            s_voteManagement.getVotingStatus(TOKEN_ID + 1) ==
                VoteManagement.VotingStatus.INPROGRESS
        );
        assertEq(s_voteManagement._getVotingStatus(TOKEN_ID + 1), "INPROGRESS");
    }

    function testRevertsIfVoteEndTimeHasBeenReachedWhenTryingToUpdateVoteCount()
        external
    {
        vm.startPrank(msg.sender);
        s_voterRegistration.registerVoter(msg.sender);

        vm.warp(block.timestamp + VOTE_END_TIME);

        vm.expectRevert(
            VoteManagement.VoteManagement__VoteEndTimeReached.selector
        );
        s_voteManagement.updateVoteCount(
            msg.sender,
            TOKEN_ID,
            VOTE_CHOICE_INDEX
        );

        vm.stopPrank();
    }

    function testRevertsIfUserHasAlreadyVoted() external {
        vm.startPrank(msg.sender);
        s_voterRegistration.registerVoter(msg.sender);

        vm.warp(block.timestamp + LATE_VOTE_START_TIME);

        s_voteManagement.updateVoteCount(
            msg.sender,
            TOKEN_ID,
            VOTE_CHOICE_INDEX
        );
        vm.expectRevert(VoteManagement.VoteManagement__AlreadyVoted.selector);
        s_voteManagement.updateVoteCount(
            msg.sender,
            TOKEN_ID,
            VOTE_CHOICE_INDEX
        );

        vm.stopPrank();
    }

    function testRevertsIfChoiceIndexGivenDoesntExistForUpdateVote() external {
        vm.prank(msg.sender);
        s_voterRegistration.registerVoter(s_voter);

        vm.startPrank(s_voter);
        vm.expectRevert(
            VoteManagement.VoteManagement__InvalidChoiceIndex.selector
        );
        s_voteManagement.updateVoteCount(
            s_voter,
            TOKEN_ID,
            INVALID_VOTE_CHOICE_INDEX
        );
        vm.stopPrank();
    }

    function testSuccesfullyAddsUsersVoteAndEmitsAnEvent() external {
        vm.prank(msg.sender);
        s_voterRegistration.registerVoter(s_voter);

        vm.startPrank(s_voter);
        vm.expectEmit();
        emit UserVoteCasted(s_voter, TOKEN_ID, VOTE_CHOICE_INDEX);
        s_voteManagement.updateVoteCount(s_voter, TOKEN_ID, VOTE_CHOICE_INDEX);
        vm.stopPrank();

        assertEq(
            s_voteManagement.getTotalVotesForEachChoice(
                TOKEN_ID,
                VOTE_CHOICE_INDEX
            ),
            1
        );
        assertEq(s_voteManagement.getHasVoted(TOKEN_ID, s_voter), true);
        assertEq(
            s_voteManagement.getVotersChoice(TOKEN_ID, s_voter),
            s_choices[0]
        );
        assertEq(s_voteManagement.getTotalVotes(TOKEN_ID), 1);
    }

    function testAllowsDelegateVoterToUpdateVoteCount() external {
        vm.startPrank(msg.sender);
        s_voterRegistration.registerVoter(s_voter);
        s_voterRegistration.registerVoter(s_delegateVoter);
        vm.stopPrank();

        vm.startPrank(s_voter);
        s_voteManagement.setDelegateVoter(TOKEN_ID, s_voter, s_delegateVoter);
        vm.stopPrank();

        vm.startPrank(s_delegateVoter);

        vm.expectEmit();
        emit UserVoteCasted(s_voter, TOKEN_ID, VOTE_CHOICE_INDEX);
        s_voteManagement.updateVoteCount(s_voter, TOKEN_ID, VOTE_CHOICE_INDEX);

        vm.stopPrank();

        assertEq(
            s_voteManagement.getTotalVotesForEachChoice(
                TOKEN_ID,
                VOTE_CHOICE_INDEX
            ),
            1
        );
        assertEq(s_voteManagement.getHasVoted(TOKEN_ID, s_voter), true);
        assertEq(
            s_voteManagement.getVotersChoice(TOKEN_ID, s_voter),
            s_choices[0]
        );
        assertEq(s_voteManagement.getTotalVotes(TOKEN_ID), 1);
    }

    // changeVote Function Tests

    function testRevertsChangeVoteIfInvalidTokenId() external {
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721NonexistentToken.selector,
                INVALID_TOKEN_ID
            )
        );
        s_voteManagement.changeVote(
            s_voter,
            INVALID_TOKEN_ID,
            VOTE_CHOICE_INDEX
        );
    }

    function testRevertsIfAddressToChangeVoteGivenIsZero() external {
        vm.expectRevert(
            VoteManagement.VoteManagement__ZeroAddressNotAllowed.selector
        );
        s_voteManagement.changeVote(
            address(0),
            TOKEN_ID,
            CHANGE_VOTE_CHOICE_INDEX
        );
    }

    function testRevertsIfVoterIsNotARegisteredVoterForChangeVote() external {
        vm.expectRevert(
            VoteManagement.VoteManagement__NotRegisteredVoter.selector
        );
        s_voteManagement.changeVote(s_voter, TOKEN_ID, VOTE_CHOICE_INDEX);
    }

    function testRevertsIfAddressToChangeVoteGivenIsNotMsgSenderOrADelegate()
        external
    {
        vm.startPrank(msg.sender);
        s_voterRegistration.registerVoter(s_voter);

        vm.expectRevert(
            VoteManagement.VoteManagement__AddressToVoteInvalid.selector
        );
        s_voteManagement.changeVote(s_voter, TOKEN_ID, VOTE_CHOICE_INDEX);

        vm.stopPrank();
    }

    function testRevertsIfChangeVoteCalledWhenVoteIsntSetToOpen()
        external
        mintNewNft
    {
        vm.startPrank(msg.sender);
        s_voterRegistration.registerVoter(msg.sender);

        vm.expectRevert(VoteManagement.VoteManagement__VoteNotOpen.selector);
        s_voteManagement.changeVote(
            msg.sender,
            TOKEN_ID + 1,
            VOTE_CHOICE_INDEX
        );

        vm.stopPrank();
    }

    function testRevertsIfVoteEndTimeReachedWhenAttemptingToChangeVote()
        external
    {
        vm.startPrank(msg.sender);
        s_voterRegistration.registerVoter(msg.sender);

        vm.warp(block.timestamp + VOTE_END_TIME);

        vm.expectRevert(
            VoteManagement.VoteManagement__VoteEndTimeReached.selector
        );
        s_voteManagement.changeVote(msg.sender, TOKEN_ID, VOTE_CHOICE_INDEX);

        vm.stopPrank();
    }

    function testRevertsIfNoVoteWasCastedOriginally() external {
        vm.prank(msg.sender);
        s_voterRegistration.registerVoter(s_voter);

        vm.startPrank(s_voter);
        vm.expectRevert(
            VoteManagement.VoteManagement__MustVoteInOrderToChangeVote.selector
        );
        s_voteManagement.changeVote(
            s_voter,
            TOKEN_ID,
            CHANGE_VOTE_CHOICE_INDEX
        );
        vm.stopPrank();
    }

    function testRevertsIfChangeVoteLimitIsReached() external {
        vm.prank(msg.sender);
        s_voterRegistration.registerVoter(s_voter);

        vm.startPrank(s_voter);
        s_voteManagement.updateVoteCount(s_voter, TOKEN_ID, VOTE_CHOICE_INDEX);
        s_voteManagement.changeVote(
            s_voter,
            TOKEN_ID,
            CHANGE_VOTE_CHOICE_INDEX
        );
        vm.expectRevert(
            VoteManagement.VoteManagement__ChangeVoteLimitReached.selector
        );
        s_voteManagement.changeVote(
            s_voter,
            TOKEN_ID,
            CHANGE_VOTE_CHOICE_INDEX
        );
        vm.stopPrank();
    }

    function testRevertsIfChoiceIndexGivenDoesntExistForChangeVote() external {
        vm.startPrank(msg.sender);
        s_voterRegistration.registerVoter(s_voter);

        vm.startPrank(s_voter);
        s_voteManagement.updateVoteCount(s_voter, TOKEN_ID, VOTE_CHOICE_INDEX);
        assertEq(
            s_voteManagement.getTotalVotesForEachChoice(
                TOKEN_ID,
                VOTE_CHOICE_INDEX
            ),
            1
        );

        vm.expectRevert(
            VoteManagement.VoteManagement__InvalidChoiceIndex.selector
        );
        s_voteManagement.changeVote(
            s_voter,
            TOKEN_ID,
            INVALID_VOTE_CHOICE_INDEX
        );
        vm.stopPrank();
    }

    function testSuccesfullyChangesUsersVoteAndEmitsAnEvent() external {
        vm.prank(msg.sender);
        s_voterRegistration.registerVoter(s_voter);

        vm.startPrank(s_voter);
        s_voteManagement.updateVoteCount(s_voter, TOKEN_ID, VOTE_CHOICE_INDEX);
        assertEq(
            s_voteManagement.getTotalVotesForEachChoice(
                TOKEN_ID,
                VOTE_CHOICE_INDEX
            ),
            1
        );
        vm.expectEmit();
        emit UserVoteChanged(s_voter, TOKEN_ID, CHANGE_VOTE_CHOICE_INDEX);
        s_voteManagement.changeVote(
            s_voter,
            TOKEN_ID,
            CHANGE_VOTE_CHOICE_INDEX
        );
        vm.stopPrank();

        assertEq(
            s_voteManagement.getTotalVotesForEachChoice(
                TOKEN_ID,
                VOTE_CHOICE_INDEX
            ),
            0
        );
        assertEq(
            s_voteManagement.getTotalVotesForEachChoice(
                TOKEN_ID,
                CHANGE_VOTE_CHOICE_INDEX
            ),
            1
        );
        assertEq(s_voteManagement.getHasVoted(TOKEN_ID, s_voter), true);
        assertEq(
            s_voteManagement.getVotersChoice(TOKEN_ID, s_voter),
            s_choices[1]
        );
        assertEq(s_voteManagement.getTotalVotes(TOKEN_ID), 1);
        assertEq(
            s_voteManagement.getIsChangeVoteLimitReached(TOKEN_ID, s_voter),
            true
        );
    }

    // checkUpkeep Function Tests
    function testUpkeepRevertsIfTokenIdGivenInCheckDataIsInvalid() external {
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721NonexistentToken.selector,
                INVALID_TOKEN_ID
            )
        );
        s_voteManagement.checkUpkeep(INVALID_PERFORM_DATA);
    }

    function testUpkeepReturnsFalseIfVoteEndTimeIsntReached() external {
        (bool upkeepNeeded, ) = s_voteManagement.checkUpkeep(PERFORM_DATA);
        assertEq(upkeepNeeded, false);
    }

    function testUpkeepReturnsTrueIfAllConditionsAreReached() external {
        vm.warp(block.timestamp + VOTE_END_TIME);

        (bool upkeepNeeded, bytes memory returnedPerformData) = s_voteManagement
            .checkUpkeep(PERFORM_DATA);
        assertEq(upkeepNeeded, true);
        assertEq(abi.decode(returnedPerformData, (uint256)), TOKEN_ID);
    }

    // closeVote/performUpkeep Function Tests
    function testRevertsCloseVoteIfInvalidTokenId() external {
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721NonexistentToken.selector,
                INVALID_TOKEN_ID
            )
        );
        s_voteManagement.performUpkeep(INVALID_PERFORM_DATA);
    }

    function testRevertsIfEndTimeIsntReached() external {
        vm.expectRevert(
            VoteManagement
                .VoteManagement__UnableToCloseVoteUntilEndTime
                .selector
        );
        s_voteManagement.performUpkeep(PERFORM_DATA);
    }

    function testRevertsIfVoteIsAlreadyClosed() external {
        vm.warp(block.timestamp + VOTE_END_TIME);
        s_voteManagement.performUpkeep(PERFORM_DATA);
        vm.expectRevert(
            VoteManagement.VoteManagement__VoteHasAlreadyBeenClosed.selector
        );
        s_voteManagement.performUpkeep(PERFORM_DATA);
    }

    function testSuccesfullyClosesVoteAndEmitsAnEvent() external {
        vm.prank(msg.sender);
        s_voterRegistration.registerVoter(s_voter);

        vm.startPrank(s_voter);
        s_voteManagement.updateVoteCount(s_voter, TOKEN_ID, VOTE_CHOICE_INDEX);

        vm.warp(block.timestamp + VOTE_END_TIME);
        vm.expectEmit();
        emit VoteClosed(VOTE_CHOICE_INDEX, 1, true, TOKEN_ID, 1);
        s_voteManagement.performUpkeep(PERFORM_DATA);

        assert(
            s_voteManagement.getVotingStatus(TOKEN_ID) ==
                VoteManagement.VotingStatus.CLOSED
        );
        assertEq(s_voteManagement._getVotingStatus(TOKEN_ID), "CLOSED");
        assertEq(s_voteManagement.getTotalVotes(TOKEN_ID), 1);
        assertEq(
            s_voteManagement.getTotalVotesForEachChoice(
                TOKEN_ID,
                VOTE_CHOICE_INDEX
            ),
            1
        );

        (
            uint256 winningChoiceIndex,
            uint256 winningChoiceTotalVotes,
            bool doesWinnerExist
        ) = s_voteManagement._getVoteWinner(TOKEN_ID);

        assertEq(winningChoiceIndex, VOTE_CHOICE_INDEX);
        assertEq(winningChoiceTotalVotes, 1);
        assertEq(doesWinnerExist, true);
    }

    // setDelegateVoter Function Test
    function testRevertsSetDelegateVoterIfInvalidTokenId() external {
        vm.startPrank(msg.sender);
        s_voterRegistration.registerVoter(s_voter);
        s_voterRegistration.registerVoter(s_delegateVoter);
        vm.stopPrank();

        vm.prank(s_voter);
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721NonexistentToken.selector,
                INVALID_TOKEN_ID
            )
        );
        s_voteManagement.setDelegateVoter(
            INVALID_TOKEN_ID,
            s_voter,
            s_delegateVoter
        );
    }

    function testRevertsIfAttemptingToSetDelegateVoterForSomeoneElse()
        external
    {
        vm.startPrank(msg.sender);
        s_voterRegistration.registerVoter(s_voter);
        s_voterRegistration.registerVoter(s_delegateVoter);
        vm.stopPrank();

        vm.expectRevert(
            VoteManagement.VoteManagement__AddressToVoteInvalid.selector
        );
        s_voteManagement.setDelegateVoter(TOKEN_ID, s_voter, s_delegateVoter);
    }

    function testRevertsIfAddressToDelegateVoteGivenIsZeroAddress() external {
        vm.startPrank(msg.sender);
        s_voterRegistration.registerVoter(s_voter);
        s_voterRegistration.registerVoter(s_delegateVoter);
        vm.stopPrank();

        vm.expectRevert(
            VoteManagement.VoteManagement__ZeroAddressNotAllowed.selector
        );
        vm.prank(s_voter);
        s_voteManagement.setDelegateVoter(TOKEN_ID, s_voter, address(0));
    }

    function testRevertsIfDelegateVoterIsntARegisteredVoter() external {
        vm.startPrank(msg.sender);
        s_voterRegistration.registerVoter(s_voter);
        vm.stopPrank();

        vm.prank(s_voter);
        vm.expectRevert(
            VoteManagement
                .VoteManagement__DelegateVoterIsntARegisteredVoter
                .selector
        );
        s_voteManagement.setDelegateVoter(TOKEN_ID, s_voter, s_delegateVoter);
    }

    function testRevertsIfDelegateVoterToBeSetForASpecificElectionIsInUseBySomeoneElse()
        external
    {
        vm.startPrank(msg.sender);
        s_voterRegistration.registerVoter(s_voter);
        s_voterRegistration.registerVoter(s_delegateVoter);
        vm.stopPrank();

        vm.prank(s_voter);
        s_voteManagement.setDelegateVoter(TOKEN_ID, s_voter, s_delegateVoter);

        assertEq(
            s_voteManagement.getVotersDelegate(TOKEN_ID, s_voter),
            s_delegateVoter
        );

        vm.startPrank(msg.sender);
        s_voterRegistration.registerVoter(s_anotherVoter);
        vm.stopPrank();

        vm.prank(s_anotherVoter);
        vm.expectRevert(
            VoteManagement
                .VoteManagement__DelegateVoterAlreadyBeingUsedBySomeoneElse
                .selector
        );
        s_voteManagement.setDelegateVoter(
            TOKEN_ID,
            s_anotherVoter,
            s_delegateVoter
        );
    }

    function testSuccesfullySetsDelegateVoter() external {
        vm.startPrank(msg.sender);
        s_voterRegistration.registerVoter(s_voter);
        s_voterRegistration.registerVoter(s_delegateVoter);
        vm.stopPrank();

        vm.prank(s_voter);
        s_voteManagement.setDelegateVoter(TOKEN_ID, s_voter, s_delegateVoter);

        assertEq(
            s_voteManagement.getVotersDelegate(TOKEN_ID, s_voter),
            s_delegateVoter
        );
    }

    // _getVoteWinner Function Test
    function testRevertsGetVoteWinnerIfInvalidTokenId() external {
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721NonexistentToken.selector,
                INVALID_TOKEN_ID
            )
        );
        s_voteManagement._getVoteWinner(INVALID_TOKEN_ID);
    }

    function testRevertsGetVoteWinnerIfVoteEndTimeIsNotReached() external {
        vm.expectRevert(
            VoteManagement.VoteManagement__VoteHasNotBeenClosed.selector
        );
        s_voteManagement._getVoteWinner(TOKEN_ID);
    }

    // Ensure All Properties initialized correctly

    function testRevertsGetPropertiesFunctionsIfInvalidTokenIds() external {
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721NonexistentToken.selector,
                INVALID_TOKEN_ID
            )
        );
        s_voteManagement.getVotingStatus(INVALID_TOKEN_ID);

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721NonexistentToken.selector,
                INVALID_TOKEN_ID
            )
        );
        s_voteManagement._getVotingStatus(INVALID_TOKEN_ID);

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721NonexistentToken.selector,
                INVALID_TOKEN_ID
            )
        );
        s_voteManagement.getVoteName(INVALID_TOKEN_ID);

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721NonexistentToken.selector,
                INVALID_TOKEN_ID
            )
        );
        s_voteManagement.getVoteDescription(INVALID_TOKEN_ID);

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721NonexistentToken.selector,
                INVALID_TOKEN_ID
            )
        );
        s_voteManagement.getVoteStartTime(INVALID_TOKEN_ID);

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721NonexistentToken.selector,
                INVALID_TOKEN_ID
            )
        );
        s_voteManagement.getVoteEndTime(INVALID_TOKEN_ID);

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721NonexistentToken.selector,
                INVALID_TOKEN_ID
            )
        );
        s_voteManagement.getVoteChoices(INVALID_TOKEN_ID);

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721NonexistentToken.selector,
                INVALID_TOKEN_ID
            )
        );
        s_voteManagement.getTotalVotes(INVALID_TOKEN_ID);

        vm.expectRevert(
            abi.encodeWithSelector(
                IERC721Errors.ERC721NonexistentToken.selector,
                INVALID_TOKEN_ID
            )
        );
        s_voteManagement.getIsVotePropertiesSet(INVALID_TOKEN_ID);
    }

    function testAllPropertiesAreInitializedCorrectly() external {
        assertEq(
            s_voteManagement.getVoteCreationNFTAddress(),
            address(s_voteCreationNFT)
        );
        assert(
            s_voteManagement.getVotingStatus(TOKEN_ID) ==
                VoteManagement.VotingStatus.INPROGRESS
        );
        assertEq(s_voteManagement._getVotingStatus(TOKEN_ID), "INPROGRESS");
        assertEq(s_voteManagement.getAllVoteNames().length, 1);
        assertEq(s_voteManagement.getVoteName(TOKEN_ID), VOTE_NAME);
        assertEq(
            s_voteManagement.getVoteDescription(TOKEN_ID),
            VOTE_DESCRIPTION
        );
        assertEq(
            s_voteManagement.getVoteStartTime(TOKEN_ID),
            (block.timestamp + VOTE_START_TIME).toString()
        );
        assertEq(
            s_voteManagement.getVoteEndTime(TOKEN_ID),
            (block.timestamp + VOTE_END_TIME).toString()
        );
        assertEq(
            s_voteManagement.getVoteChoices(TOKEN_ID).length,
            s_choices.length
        );
        assertEq(s_voteManagement.getTotalVotes(TOKEN_ID), 0);
        assertEq(s_voteManagement.getIsVotePropertiesSet(TOKEN_ID), true);
        assertEq(
            s_voteManagement.getAddressOfVoteCreationNFTContract(),
            address(s_voteCreationNFT)
        );
    }

    function testStatusIsPendingWhenVoteIsntOpen() external mintNewNft {
        assertEq(s_voteManagement._getVotingStatus(TOKEN_ID + 1), "PENDING");
    }
}
