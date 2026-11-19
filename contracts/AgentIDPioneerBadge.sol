// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Agent ID Pioneer Badge
/// @notice A free, soulbound NFT badge claimable once by any Binance Agent ID holder.
/// @dev Agent ID is the on-chain name of a Binance Agentic Wallet (name.ai).
///      Holding is checked against the SPACE ID Agent ID registry on BNB Chain.
///      The badge is soulbound: it can be minted but never transferred, so it
///      stays bound to the Agent ID holder who claimed it.
interface IAgentIDRegistry {
    function balanceOf(address owner) external view returns (uint256);
}

contract AgentIDPioneerBadge is ERC721, Ownable {
    /// @notice SPACE ID Agent ID registry (ERC-721, non-transferable) on BNB Chain.
    IAgentIDRegistry public constant AGENT_ID_REGISTRY =
        IAgentIDRegistry(0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F);

    /// @notice Maximum number of badges that can ever be claimed.
    uint256 public constant MAX_SUPPLY = 10000;

    /// @notice Number of badges minted so far. Token IDs are 1..totalMinted.
    uint256 public totalMinted;

    /// @notice True once an address has claimed its badge (one per wallet).
    mapping(address => bool) public hasClaimed;

    string private _baseTokenURI;

    event BadgeClaimed(address indexed claimer, uint256 indexed tokenId);
    event BaseURIUpdated(string baseURI);

    /// @notice Deployed via the canonical CREATE2 factory, so the constructor
    ///         takes the owner explicitly: msg.sender at deploy time is the
    ///         factory, not the project owner.
    constructor(string memory baseURI_, address owner_) ERC721("Agent ID Pioneer Badge", "AIDP") Ownable(owner_) {
        _baseTokenURI = baseURI_;
    }

    /// @notice Claim one free badge. Caller must hold an Agent ID and not have claimed yet.
    function claim() external {
        require(totalMinted < MAX_SUPPLY, "Max supply reached");
        require(!hasClaimed[msg.sender], "Already claimed");
        require(AGENT_ID_REGISTRY.balanceOf(msg.sender) > 0, "Must hold an Agent ID");

        hasClaimed[msg.sender] = true;
        uint256 tokenId = totalMinted + 1;
        totalMinted = tokenId;
        _safeMint(msg.sender, tokenId);
        emit BadgeClaimed(msg.sender, tokenId);
    }

    /// @notice Check whether an address can claim right now.
    function isEligible(address user) external view returns (bool) {
        return
            AGENT_ID_REGISTRY.balanceOf(user) > 0 &&
            !hasClaimed[user] &&
            totalMinted < MAX_SUPPLY;
    }

    /// @notice All badges share one metadata document (same artwork and
    ///         attributes for every holder), so tokenURI returns the base URI
    ///         directly instead of appending the token id.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _baseTokenURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /// @notice Update the metadata base URI (owner only).
    function setBaseURI(string memory baseURI_) external onlyOwner {
        _baseTokenURI = baseURI_;
        emit BaseURIUpdated(baseURI_);
    }

    /// @dev Soulbound: allow minting (from == address(0)) and burning
    ///      (to == address(0)), block every transfer between two live addresses.
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "Soulbound: badge is non-transferable");
        return super._update(to, tokenId, auth);
    }
}
