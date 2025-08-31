// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title Web3ClubNFT
 * @dev NFT contract for managing Web3.club secondary domain names
 */
contract Web3ClubNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;
    
    Counters.Counter private _tokenIds;
    
    // Mapping from domain ID to domain name string
    mapping(uint256 => string) private _domainNames;
    
    // Mapping from domain name string to domain ID
    mapping(string => uint256) private _domainIds;

    // Domain registration information
    struct DomainInfo {
        uint256 registrationTime;
        uint256 expiryTime;
        address registrant;
    }
    
    // Store registration information for all domains
    mapping(uint256 => DomainInfo) private _domainInfo;
    
    // Restrict certain functions to be called only by Registry contract
    address private _registryContract;
    
    // Constructor
    constructor() ERC721("Web3.club Domain", "WEB3CLUB") Ownable(msg.sender) {}
    
    /**
     * @dev Set Registry contract address
     * @param registryContract_ Registry contract address
     */
    function setRegistryContract(address registryContract_) external onlyOwner {
        _registryContract = registryContract_;
    }
    
    /**
     * @dev Check if caller is Registry contract
     */
    modifier onlyRegistry() {
        require(_msgSender() == _registryContract, "Caller is not the registry contract");
        _;
    }
    
    /**
     * @dev Mint new domain name NFT
     * @param to Address to receive the NFT
     * @param domainName Domain name string
     * @param expiryTime Domain expiration time
     * @return tokenId ID of the newly minted NFT
     */
    function mint(address to, string memory domainName, uint256 expiryTime) external onlyRegistry returns (uint256) {
    _tokenIds.increment();
    uint256 tokenId = _tokenIds.current();
    
    _mint(to, tokenId);
    
    // 
    _domainNames[tokenId] = domainName;
    _domainIds[domainName] = tokenId;
    
    // 
    _domainInfo[tokenId] = DomainInfo({
        registrationTime: block.timestamp,
        expiryTime: expiryTime,
        registrant: to
    });
    
    // “.web3.club”
    string memory fullDomainName = string(abi.encodePacked(domainName, ".web3.club"));
    
    // JSON
    string memory json = string(
        abi.encodePacked(
            '{"name":"', 
            fullDomainName,
            '", "description":"Web3Club Domain NFT", "image":"https://web3.club/nft/image/', 
            domainName, 
            '.png"}'
        )
    );
    
    // Base64编码并添加data URI前缀
    string memory encodedJson = Base64.encode(bytes(json));
    string memory tokenUri = string(abi.encodePacked("data:application/json;base64,", encodedJson));
    
    // Token URI
    _setTokenURI(tokenId, tokenUri);
    
    return tokenId;
}

    
    /**
     * @dev Update domain expiration time
     * @param domainName Domain name string
     * @param newExpiryTime New expiration time
     */
    function updateExpiryTime(string memory domainName, uint256 newExpiryTime) external onlyRegistry {
        uint256 tokenId = _domainIds[domainName];
        require(tokenId != 0, "Domain not registered");
        
        _domainInfo[tokenId].expiryTime = newExpiryTime;
    }
    
    /**
     * @dev Burn domain NFT (domain recycling)
     * @param domainName Domain name string
     */
    function burn(string memory domainName) external onlyRegistry {
        uint256 tokenId = _domainIds[domainName];
        require(tokenId != 0, "Domain not registered");
        
        // Clear domain mappings
        string memory name = _domainNames[tokenId];
        delete _domainIds[name];
        delete _domainNames[tokenId];
        delete _domainInfo[tokenId];
        
        // Burn NFT
        _burn(tokenId);
    }
    
    /**
     * @dev Get domain information
     * @param domainName Domain name string
     * @return Domain registration information
     */
    function getDomainInfo(string memory domainName) external view returns (DomainInfo memory) {
        uint256 tokenId = _domainIds[domainName];
        require(tokenId != 0, "Domain not registered");
        return _domainInfo[tokenId];
    }
    
    /**
     * @dev Get domain name from tokenId
     * @param tokenId NFT ID
     * @return Domain name string
     */
    function getDomainName(uint256 tokenId) external view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _domainNames[tokenId];
    }
    
    /**
     * @dev Get tokenId from domain name
     * @param domainName Domain name string
     * @return NFT ID
     */
    function getTokenId(string memory domainName) external view returns (uint256) {
        uint256 tokenId = _domainIds[domainName];
        require(tokenId != 0, "Domain not registered");
        return tokenId;
    }
    
    /**
     * @dev Get full domain name with .web3.club suffix for specific tokenId
     * @param tokenId NFT ID
     * @return Full domain name (with suffix)
     */
    function getFullDomainName(uint256 tokenId) external view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return string(abi.encodePacked(_domainNames[tokenId], ".web3.club"));
    }
    
    /**
     * @dev Override transferFrom to ensure domain owner information is updated when NFT is transferred
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        
        // Update owner if not a minting operation
        if (from != address(0)) {
            _domainInfo[tokenId].registrant = to;
        }
        
        return from;
    }
} 
