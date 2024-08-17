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

/**
 * Integration test that is used to simulate the whole election process.
 */
contract VoteManagementTest is Test {
    using Strings for uint256;

    VoteManagement private s_voteManagement;
    VoteCreationNFT private s_voteCreationNFT;
    VoterRegistration s_voterRegistration;

    address private s_voter = makeAddr("VOTER");

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
    uint256 private constant NEW_VOTE_CHOICE_INDEX = 1;
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

    function testElectionProcessIsSucessfulFromStartToFinish() external {
        vm.prank(msg.sender);
        s_voterRegistration.registerVoter(s_voter);

        vm.startPrank(s_voter);
        vm.expectEmit();
        emit UserVoteCasted(s_voter, TOKEN_ID, VOTE_CHOICE_INDEX);
        s_voteManagement.updateVoteCount(s_voter, TOKEN_ID, VOTE_CHOICE_INDEX);

        vm.expectEmit();
        emit UserVoteChanged(s_voter, TOKEN_ID, NEW_VOTE_CHOICE_INDEX);
        s_voteManagement.changeVote(s_voter, TOKEN_ID, NEW_VOTE_CHOICE_INDEX);

        vm.warp(block.timestamp + VOTE_END_TIME);
        vm.expectEmit();
        emit VoteClosed(NEW_VOTE_CHOICE_INDEX, 1, true, TOKEN_ID, 1);
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
                NEW_VOTE_CHOICE_INDEX
            ),
            1
        );

        (
            uint256 winningChoiceIndex,
            uint256 winningChoiceTotalVotes,
            bool doesWinnerExist
        ) = s_voteManagement._getVoteWinner(TOKEN_ID);

        assertEq(winningChoiceIndex, NEW_VOTE_CHOICE_INDEX);
        assertEq(winningChoiceTotalVotes, 1);
        assertEq(doesWinnerExist, true);
    }
}
