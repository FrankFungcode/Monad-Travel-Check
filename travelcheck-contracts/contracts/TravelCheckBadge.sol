// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TravelCheckBadge
 * @dev Soulbound NFT badges for TravelCheck achievements
 * Badges cannot be transferred once minted (soulbound)
 */
contract TravelCheckBadge is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Badge type definitions
    mapping(uint256 => string) public badgeTypes;
    mapping(address => mapping(string => bool)) public userBadges;

    // Soulbound: prevent transfers after minting
    bool private _mintingInProgress;

    event BadgeMinted(
        address indexed user,
        uint256 indexed tokenId,
        string badgeType
    );

    /**
     * @dev Constructor
     * @param initialOwner Address to receive ownership
     */
    constructor(
        address initialOwner
    ) ERC721("TravelCheck Badge", "TCKBADGE") Ownable(initialOwner) {
        // Define badge types
        badgeTypes[1] = "FIRST_CHECKIN";
        badgeTypes[2] = "STREAK_7";
        badgeTypes[3] = "STREAK_30";
        badgeTypes[4] = "STREAK_100";
        badgeTypes[5] = "PERFECT_MONTH";
        badgeTypes[6] = "WORLD_EXPLORER";
    }

    /**
     * @dev Mint a badge to user (only owner/platform)
     * @param to Address to receive the badge
     * @param badgeType Type of badge to mint
     * @param uri Metadata URI for the badge
     * @return tokenId of minted badge
     */
    function mintBadge(
        address to,
        string memory badgeType,
        string memory uri
    ) external onlyOwner returns (uint256) {
        require(!userBadges[to][badgeType], "Badge already earned");

        _mintingInProgress = true;
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _mintingInProgress = false;

        userBadges[to][badgeType] = true;

        emit BadgeMinted(to, tokenId, badgeType);
        return tokenId;
    }

    /**
     * @dev Check if user has a specific badge
     * @param user User address
     * @param badgeType Badge type to check
     * @return bool indicating if user has the badge
     */
    function hasBadge(
        address user,
        string memory badgeType
    ) external view returns (bool) {
        return userBadges[user][badgeType];
    }

    /**
     * @dev Override transfer functions to make badges soulbound
     * Transfers are only allowed during minting
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);

        // Allow minting (from == address(0))
        // Block all transfers after minting
        require(
            from == address(0) || _mintingInProgress,
            "Soulbound: badge cannot be transferred"
        );

        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Override approve to prevent approvals (soulbound)
     */
    function approve(
        address,
        uint256
    ) public virtual override(ERC721, IERC721) {
        revert("Soulbound: badge cannot be approved");
    }

    /**
     * @dev Override setApprovalForAll to prevent approvals (soulbound)
     */
    function setApprovalForAll(
        address,
        bool
    ) public virtual override(ERC721, IERC721) {
        revert("Soulbound: badge cannot be approved");
    }

    // Required overrides
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
