// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {ERC721, ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// Interface used to access functions from Vote Management Smart Contract
interface IVoteManagement {
    function initializeVoteProperties(
        uint256 _tokenId,
        string memory _voteName,
        string memory _voteDescription,
        uint256 _voteStartTime,
        uint256 _voteEndTime,
        string[] memory _choices
    ) external;

    function _getVoteWinner(
        uint256 _tokenId
    )
        external
        view
        returns (
            uint256 winningChoiceIndex,
            uint256 winningChoiceTotalVotes,
            bool doesWinnerExist
        );

    function _getVotingStatus(
        uint256 _tokenId
    ) external view returns (string memory);

    function getVoteName(
        uint256 _tokenId
    ) external view returns (string memory);

    function getVoteDescription(
        uint256 _tokenId
    ) external view returns (string memory);

    function getVoteStartTime(
        uint256 _tokenId
    ) external view returns (string memory);

    function getVoteEndTime(
        uint256 _tokenId
    ) external view returns (string memory);

    function getVoteChoices(
        uint256 _tokenId
    ) external view returns (string[] memory);
}

/**
 * @title VoteCreationNFT
 * @notice A contract for creating a new election in the form of an NFT.
 * @dev in this case, we are assuming msg.sender is trustworthy for the Owner of the contract. In a real world application we would use a DAO.
 */
contract VoteCreationNFT is ERC721URIStorage, Ownable {
    error VoteManagement__IVoteManagementAlreadyInitialized();
    error VoteCreationNFT__ZeroAddressNotAllowed();
    error VoteCreationNFT__VoteDurationNotValid();
    error VoteCreationNFT__UnableToOpenVoteUntilStartTime();
    error VoteCreationNFT__UnableToCloseVoteUntilEndTime();

    using Strings for uint256;

    IVoteManagement private s_iVoteManagement;
    bool private s_isIVoteManagementInitialized;
    uint256 private s_tokenCounter;

    constructor() ERC721("VoteCreationNFT", "VOTE") Ownable(msg.sender) {}

    /**
     * @notice function sets Vote Management Contract, which can be used to access the functions above in the IVoteManagement interface.
     */
    function setVoteManagementContract(
        address _voteManagementAddress
    ) external onlyOwner {
        if (s_isIVoteManagementInitialized) {
            revert VoteManagement__IVoteManagementAlreadyInitialized();
        }

        if (_voteManagementAddress == address(0)) {
            revert VoteCreationNFT__ZeroAddressNotAllowed();
        }

        s_isIVoteManagementInitialized = true;
        s_iVoteManagement = IVoteManagement(_voteManagementAddress);
    }

    /**
     * @notice function used to create an NFT for each election created.
     * @dev onlyOwner can create an election
     * @param _voteName - Name of the vote
     * @param _voteDescription - Description of the vote
     * @param _voteStartTime  - Start time of the vote in seconds
     * @param _voteEndTime - End time of the vote in seconds
     * @param _choices - choices for who users can vote for
     */
    function mintNft(
        string memory _voteName,
        string memory _voteDescription,
        uint256 _voteStartTime,
        uint256 _voteEndTime,
        string[] memory _choices
    ) external onlyOwner {
        if (
            block.timestamp + _voteStartTime > block.timestamp + _voteEndTime ||
            _voteStartTime == _voteEndTime
        ) {
            revert VoteCreationNFT__VoteDurationNotValid();
        }

        uint256 tokenId = s_tokenCounter;
        s_tokenCounter++;

        _safeMint(msg.sender, tokenId);
        s_iVoteManagement.initializeVoteProperties(
            tokenId,
            _voteName,
            _voteDescription,
            _voteStartTime,
            _voteEndTime,
            _choices
        );
        _setTokenURI(tokenId, getTokenURI(tokenId));
    }

    /**
     * @dev helper function to be used in the VoteManagement Contract to update NFT Metadata
     */
    function setTokenURI(uint256 _tokenId) external {
        _setTokenURI(_tokenId, getTokenURI(_tokenId));
    }

    /**
     * @notice - returns the token URI that stores all the NFT metadata/properties.
     * @param _tokenId - used to access specific election
     */
    function getTokenURI(uint256 _tokenId) public view returns (string memory) {
        bytes memory dataURI = abi.encodePacked(
            "{",
            '"name": "',
            s_iVoteManagement.getVoteName(_tokenId),
            '",',
            '"description": "',
            s_iVoteManagement.getVoteDescription(_tokenId),
            '",',
            '"vote_start_time": "',
            s_iVoteManagement.getVoteStartTime(_tokenId),
            '",',
            '"vote_end_time": "',
            s_iVoteManagement.getVoteEndTime(_tokenId),
            '",',
            '"image": "',
            getImageURI(_tokenId),
            '"',
            "}"
        );
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(dataURI)
                )
            );
    }

    /**
     * @notice - returns NFT image created on chain, image is created as an svg. NFT image is adapted depending on whether election status is `INPROGRESS` or `CLOSED`.
     * @param _tokenId - used to access specific election
     */
    function getImageURI(uint256 _tokenId) public view returns (string memory) {
        bytes memory svg;

        if (
            keccak256(
                abi.encodePacked(s_iVoteManagement._getVotingStatus(_tokenId))
            ) == keccak256(abi.encodePacked("CLOSED"))
        ) {
            (
                uint256 winningChoiceIndex,
                ,
                bool doesWinnerExist
            ) = s_iVoteManagement._getVoteWinner(_tokenId);

            string[] memory voteChoices = s_iVoteManagement.getVoteChoices(
                _tokenId
            );

            string memory winningVoteChoice = "NO WINNERS";
            if (doesWinnerExist) {
                winningVoteChoice = voteChoices[winningChoiceIndex];
            }

            svg = abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 200 200">',
                '<rect width="100%" height="100%" fill="black" />',
                '<text x="50%" y="40%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="white">',
                "Voting Status: ",
                s_iVoteManagement._getVotingStatus(_tokenId),
                "</text>",
                '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="white">',
                "Vote Name: ",
                s_iVoteManagement.getVoteName(_tokenId),
                "</text>",
                '<text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="white">',
                "Vote Winner: ",
                winningVoteChoice,
                "</text>",
                "</svg>"
            );
        } else {
            svg = abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 200 200">',
                '<rect width="100%" height="100%" fill="black" />',
                '<text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="white">',
                "Voting Status: ",
                s_iVoteManagement._getVotingStatus(_tokenId),
                "</text>",
                '<text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="white">',
                "Vote Name: ",
                s_iVoteManagement.getVoteName(_tokenId),
                "</text>",
                "</svg>"
            );
        }

        return
            string(
                abi.encodePacked(
                    "data:image/svg+xml;base64,",
                    Base64.encode(svg)
                )
            );
    }

    // helper function - checks to see if an NFT exists for specific tokenID
    function exists(uint256 tokenId) external view returns (bool) {
        address owner = ownerOf(tokenId);
        return owner != address(0);
    }

    // helper function - returns total amount of Election NFT's created
    function getTotalSupply() external view returns (uint256) {
        return s_tokenCounter;
    }

    // helper function - returns VoteManagementAddress Contract
    function getAddressOfVoteManagementContract()
        external
        view
        returns (address)
    {
        return address(s_iVoteManagement);
    }
}
