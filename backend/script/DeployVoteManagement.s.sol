// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {VoteManagement} from "../src/VoteManagement.sol";
import {Script} from "forge-std/Script.sol";

contract DeployVoteManagement is Script {
    function run(
        address _voterRegistrationAddress
    ) public returns (VoteManagement) {
        vm.startBroadcast();
        VoteManagement voteManagement = new VoteManagement(
            _voterRegistrationAddress
        );
        vm.stopBroadcast();
        return voteManagement;
    }
}
