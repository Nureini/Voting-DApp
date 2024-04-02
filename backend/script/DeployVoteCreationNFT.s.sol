// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {VoteCreationNFT} from "../src/VoteCreationNFT.sol";
import {Script} from "forge-std/Script.sol";

contract DeployVoteCreationNFT is Script {
    function run() public returns (VoteCreationNFT) {
        vm.startBroadcast();
        VoteCreationNFT voteCreationNFT = new VoteCreationNFT();
        vm.stopBroadcast();
        return voteCreationNFT;
    }
}
