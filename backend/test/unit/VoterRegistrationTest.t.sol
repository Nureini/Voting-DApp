// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {DeployVoterRegistration} from "../../script/DeployVoterRegistration.s.sol";
import {VoterRegistration} from "../../src/VoterRegistration.sol";
import {Test, console} from "forge-std/Test.sol";

/**
 * VoterRegistration Unit Tests used to break down and test each function of the VoterRegistration smart contract.
 */
contract VoterRegistrationTest is Test {
    VoterRegistration voterRegistration;

    function setUp() public {
        DeployVoterRegistration deployVoterRegistration = new DeployVoterRegistration();
        voterRegistration = deployVoterRegistration.run();
    }

    function testRegisterVoter() public {
        vm.prank(voterRegistration.owner());
        voterRegistration.registerVoter(address(this));
        assert(voterRegistration.isRegisteredVoter(address(this)) == true);
    }

    function testRevertsIfAlreadyRegistered() public {
        vm.startPrank(voterRegistration.owner());
        voterRegistration.registerVoter(address(this));
        vm.expectRevert(
            VoterRegistration.VoterRegistration__VoterAlreadyRegistered.selector
        );
        voterRegistration.registerVoter(address(this));
        vm.stopPrank();
    }

    function testRevertsIfNotAlreadyRegistered() public {
        vm.startPrank(voterRegistration.owner());
        vm.expectRevert(
            VoterRegistration.VoterRegistration__VoterNotRegistered.selector
        );
        voterRegistration.unregisterVoter(address(this));
        vm.stopPrank();
    }

    function testRevertsIfNotOwner() public {
        vm.expectRevert();
        voterRegistration.registerVoter(address(this));
    }

    function testUnregisterVoter() public {
        vm.startPrank(voterRegistration.owner());
        voterRegistration.registerVoter(address(this));
        assert(voterRegistration.isRegisteredVoter(address(this)) == true);
        voterRegistration.unregisterVoter(address(this));
        assert(voterRegistration.isRegisteredVoter(address(this)) == false);
        vm.stopPrank();
    }
}
