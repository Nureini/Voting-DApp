// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {VoteCreationNFT} from "../../src/VoteCreationNFT.sol";
import {DeployVoteCreationNFT} from "../../script/DeployVoteCreationNFT.s.sol";
import {VoteManagement} from "../../src/VoteManagement.sol";
import {DeployVoteManagement} from "../../script/DeployVoteManagement.s.sol";
import {VoterRegistration} from "../../src/VoterRegistration.sol";
import {DeployVoterRegistration} from "../../script/DeployVoterRegistration.s.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * VoteCreationNFT Unit Tests used to break down and test each function of the VoteCreationNFT smart contract.
 */
contract VoteCreationNFTTest is Test {
    using Strings for uint256;

    VoteCreationNFT private s_voteCreationNFT;
    address private s_voteCreationNFTOwner;
    address private s_voteCreationNFTNotOwner = makeAddr("NOTOWNER");

    VoteManagement private s_voteManagement;
    address private s_voteManagementOwner;

    VoterRegistration private s_voterRegistration;

    address private s_voter = makeAddr("VOTER");

    uint256 private constant TOKEN_ID = 0;
    string private constant VOTE_NAME = "Test Vote";
    string private constant VOTE_DESCRIPTION = "This is a test vote";
    uint256 private constant VOTE_START_TIME = 0;
    uint256 private constant VOTE_END_TIME = 60;
    string[] private s_choices = ["A", "B", "C"];

    uint256 private constant INVALID_VOTE_START_TIME = 3600;
    uint256 private constant INVALID_VOTE_END_TIME = 0;
    uint256 private constant LATE_VOTE_START_TIME = 1;

    string private s_tokenURI =
        "data:application/json;base64,eyJuYW1lIjogIlRlc3QgVm90ZSIsImRlc2NyaXB0aW9uIjogIlRoaXMgaXMgYSB0ZXN0IHZvdGUiLCJ2b3RlX3N0YXJ0X3RpbWUiOiAiMSIsInZvdGVfZW5kX3RpbWUiOiAiNjEiLCJpbWFnZSI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBITjJaeUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSGRwWkhSb1BTSXhNREFsSWlCb1pXbG5hSFE5SWpFd01DVWlJSFpwWlhkQ2IzZzlJakFnTUNBeU1EQWdNakF3SWo0OGNtVmpkQ0IzYVdSMGFEMGlNVEF3SlNJZ2FHVnBaMmgwUFNJeE1EQWxJaUJtYVd4c1BTSmliR0ZqYXlJZ0x6NDhkR1Y0ZENCNFBTSTFNQ1VpSUhrOUlqUTFKU0lnWkc5dGFXNWhiblF0WW1GelpXeHBibVU5SW0xcFpHUnNaU0lnZEdWNGRDMWhibU5vYjNJOUltMXBaR1JzWlNJZ1ptOXVkQzF6YVhwbFBTSXhOQ0lnWm1sc2JEMGlkMmhwZEdVaVBsWnZkR2x1WnlCVGRHRjBkWE02SUVsT1VGSlBSMUpGVTFNOEwzUmxlSFErUEhSbGVIUWdlRDBpTlRBbElpQjVQU0kxTlNVaUlHUnZiV2x1WVc1MExXSmhjMlZzYVc1bFBTSnRhV1JrYkdVaUlIUmxlSFF0WVc1amFHOXlQU0p0YVdSa2JHVWlJR1p2Ym5RdGMybDZaVDBpTVRRaUlHWnBiR3c5SW5kb2FYUmxJajVXYjNSbElFNWhiV1U2SUZSbGMzUWdWbTkwWlR3dmRHVjRkRDQ4TDNOMlp6ND0ifQ==";
    string private s_imageURI =
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJibGFjayIgLz48dGV4dCB4PSI1MCUiIHk9IjQ1JSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiPlZvdGluZyBTdGF0dXM6IElOUFJPR1JFU1M8L3RleHQ+PHRleHQgeD0iNTAlIiB5PSI1NSUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIj5Wb3RlIE5hbWU6IFRlc3QgVm90ZTwvdGV4dD48L3N2Zz4=";
    string private s_updatedTokenURI =
        "data:application/json;base64,eyJuYW1lIjogIlRlc3QgVm90ZSIsImRlc2NyaXB0aW9uIjogIlRoaXMgaXMgYSB0ZXN0IHZvdGUiLCJ2b3RlX3N0YXJ0X3RpbWUiOiAiMSIsInZvdGVfZW5kX3RpbWUiOiAiNjEiLCJpbWFnZSI6ICJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBITjJaeUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSGRwWkhSb1BTSXhNREFsSWlCb1pXbG5hSFE5SWpFd01DVWlJSFpwWlhkQ2IzZzlJakFnTUNBeU1EQWdNakF3SWo0OGNtVmpkQ0IzYVdSMGFEMGlNVEF3SlNJZ2FHVnBaMmgwUFNJeE1EQWxJaUJtYVd4c1BTSmliR0ZqYXlJZ0x6NDhkR1Y0ZENCNFBTSTFNQ1VpSUhrOUlqUXdKU0lnWkc5dGFXNWhiblF0WW1GelpXeHBibVU5SW0xcFpHUnNaU0lnZEdWNGRDMWhibU5vYjNJOUltMXBaR1JzWlNJZ1ptOXVkQzF6YVhwbFBTSXhOQ0lnWm1sc2JEMGlkMmhwZEdVaVBsWnZkR2x1WnlCVGRHRjBkWE02SUVOTVQxTkZSRHd2ZEdWNGRENDhkR1Y0ZENCNFBTSTFNQ1VpSUhrOUlqVXdKU0lnWkc5dGFXNWhiblF0WW1GelpXeHBibVU5SW0xcFpHUnNaU0lnZEdWNGRDMWhibU5vYjNJOUltMXBaR1JzWlNJZ1ptOXVkQzF6YVhwbFBTSXhOQ0lnWm1sc2JEMGlkMmhwZEdVaVBsWnZkR1VnVG1GdFpUb2dWR1Z6ZENCV2IzUmxQQzkwWlhoMFBqeDBaWGgwSUhnOUlqVXdKU0lnZVQwaU5qQWxJaUJrYjIxcGJtRnVkQzFpWVhObGJHbHVaVDBpYldsa1pHeGxJaUIwWlhoMExXRnVZMmh2Y2owaWJXbGtaR3hsSWlCbWIyNTBMWE5wZW1VOUlqRTBJaUJtYVd4c1BTSjNhR2wwWlNJK1ZtOTBaU0JYYVc1dVpYSTZJRUU4TDNSbGVIUStQQzl6ZG1jKyJ9";
    string private s_updatedimageURI =
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJibGFjayIgLz48dGV4dCB4PSI1MCUiIHk9IjQwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiPlZvdGluZyBTdGF0dXM6IENMT1NFRDwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiPlZvdGUgTmFtZTogVGVzdCBWb3RlPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNjAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSI+Vm90ZSBXaW5uZXI6IEE8L3RleHQ+PC9zdmc+";

    function setUp() public {
        DeployVoteCreationNFT deployVoteCreationNFT = new DeployVoteCreationNFT();
        s_voteCreationNFT = deployVoteCreationNFT.run();
        s_voteCreationNFTOwner = s_voteCreationNFT.owner();

        DeployVoterRegistration deployVoterRegistration = new DeployVoterRegistration();
        s_voterRegistration = deployVoterRegistration.run();

        DeployVoteManagement deployVoteManagement = new DeployVoteManagement();
        s_voteManagement = deployVoteManagement.run(
            address(s_voterRegistration)
        );
        s_voteManagementOwner = s_voteManagement.owner();

        vm.prank(s_voteCreationNFTOwner);
        s_voteCreationNFT.setVoteManagementContract(address(s_voteManagement));
        vm.prank(s_voteManagementOwner);
        s_voteManagement.setVoteCreationNFTContract(address(s_voteCreationNFT));
    }

    // setVoteManagementContract function test

    function testRevertsIfSetVoteManagementAlreadyInitialized() external {
        vm.startPrank(s_voteManagementOwner);

        vm.expectRevert(
            VoteCreationNFT
                .VoteManagement__IVoteManagementAlreadyInitialized
                .selector
        );
        s_voteCreationNFT.setVoteManagementContract(address(s_voteManagement));

        vm.stopPrank();
    }

    function testVoteManagementContractIsSetCorrectly() external {
        assertEq(
            s_voteCreationNFT.getAddressOfVoteManagementContract(),
            address(s_voteManagement)
        );
    }

    // mintNft function test

    function testRevertsIfNotOwnerAttemptsToMintNft() external {
        vm.startPrank(s_voteCreationNFTNotOwner);
        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                s_voteCreationNFTNotOwner
            )
        );
        s_voteCreationNFT.mintNft(
            VOTE_NAME,
            VOTE_DESCRIPTION,
            VOTE_START_TIME,
            VOTE_END_TIME,
            s_choices
        );
        vm.stopPrank();
    }

    function testRevertsIfVoteDurationGivenIsntValid() external {
        vm.startPrank(s_voteCreationNFTOwner);
        vm.expectRevert(
            VoteCreationNFT.VoteCreationNFT__VoteDurationNotValid.selector
        );
        s_voteCreationNFT.mintNft(
            VOTE_NAME,
            VOTE_DESCRIPTION,
            INVALID_VOTE_START_TIME,
            INVALID_VOTE_END_TIME,
            s_choices
        );
        vm.stopPrank();
    }

    function testSuccesfullyMintsNft() external {
        vm.startPrank(s_voteCreationNFTOwner);
        s_voteCreationNFT.mintNft(
            VOTE_NAME,
            VOTE_DESCRIPTION,
            VOTE_START_TIME,
            VOTE_END_TIME,
            s_choices
        );
        vm.stopPrank();

        assert(s_voteCreationNFT.exists(TOKEN_ID) == true);
        assertEq(s_voteCreationNFT.getTokenURI(TOKEN_ID), s_tokenURI);
        assertEq(s_voteCreationNFT.getImageURI(TOKEN_ID), s_imageURI);
    }

    function testNewImageUriIsGeneratedWhenElectionHasEnded() external {
        vm.startPrank(s_voteCreationNFTOwner);
        s_voteCreationNFT.mintNft(
            VOTE_NAME,
            VOTE_DESCRIPTION,
            VOTE_START_TIME,
            VOTE_END_TIME,
            s_choices
        );
        vm.stopPrank();

        vm.startPrank(s_voterRegistration.owner());
        s_voterRegistration.registerVoter(s_voter);
        vm.stopPrank();

        vm.startPrank(s_voter);
        s_voteManagement.updateVoteCount(s_voter, TOKEN_ID, 0);

        vm.warp(block.timestamp + VOTE_END_TIME);
        bytes memory performData = abi.encodePacked(TOKEN_ID);
        s_voteManagement.performUpkeep(performData);
        vm.stopPrank();

        assertEq(s_voteCreationNFT.getTokenURI(TOKEN_ID), s_updatedTokenURI);
        assertEq(s_voteCreationNFT.getImageURI(TOKEN_ID), s_updatedimageURI);
    }
}
