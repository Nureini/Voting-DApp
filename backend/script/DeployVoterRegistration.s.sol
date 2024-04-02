// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {VoterRegistration} from "../src/VoterRegistration.sol";
import {Script} from "forge-std/Script.sol";

contract DeployVoterRegistration is Script {
    function run() public returns (VoterRegistration) {
        vm.startBroadcast();
        VoterRegistration voterRegistration = new VoterRegistration();
        vm.stopBroadcast();
        return voterRegistration;
    }
}
