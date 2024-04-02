// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VoterRegistration
 * @notice A contract for registering elgibile voters.
 * @dev in this case, we are assuming msg.sender is trustworthy for the Owner of the contract. In a real world application we would use a DAO.
 */
contract VoterRegistration is Ownable {
    error VoterRegistration__VoterAlreadyRegistered();
    error VoterRegistration__VoterNotRegistered();

    mapping(address => bool) private s_registeredVoters;

    constructor() Ownable(msg.sender) {}

    function registerVoter(address _voter) external onlyOwner {
        if (s_registeredVoters[_voter]) {
            revert VoterRegistration__VoterAlreadyRegistered();
        }

        s_registeredVoters[_voter] = true;
    }

    /**
     * @dev in the case a voter no longer has access/loses access to their account, this can be used to unregister them from the election app to prevent any malicious activities in the case their account is compromised in any way.
     */
    function unregisterVoter(address _voter) external onlyOwner {
        if (!s_registeredVoters[_voter]) {
            revert VoterRegistration__VoterNotRegistered();
        }
        s_registeredVoters[_voter] = false;
    }

    function isRegisteredVoter(address _voter) external view returns (bool) {
        return s_registeredVoters[_voter];
    }
}
