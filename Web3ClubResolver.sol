// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Web3ClubNFT.sol";
import "./Web3ClubRegistry.sol";

/**
 * @title Web3ClubResolver
 * @dev Manages DNS resolution for Web3.club secondary domain names
 */
contract Web3ClubResolver is Ownable {
    // Contract dependencies
    Web3ClubNFT public nftContract;
    Web3ClubRegistry public registryContract;
    
    // Record type enumeration
    enum RecordType {
        A,      // IPv4 address
        AAAA,   // IPv6 address
        CNAME,  // Canonical name
        TXT,    // Text record
        MX,     // Mail exchange
        URL     // Redirect URL
    }
    
    // Resolution record structure
    struct DNSRecord {
        RecordType recordType;
        string value;
        uint256 lastUpdated;
    }
    
    // Mapping from domain to DNS records (domain => record type => record)
    mapping(string => mapping(RecordType => DNSRecord)) private _dnsRecords;
    
    // Event definitions
    event RecordUpdated(string indexed domain, RecordType recordType, string value);
    event RecordRemoved(string indexed domain, RecordType recordType);
    
    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {
        // NFT contract and Registry contract will be set after deployment
    }
    
    /**
     * @dev Set NFT contract address
     * @param _nftContract NFT contract address
     */
    function setNFTContract(address _nftContract) external onlyOwner {
        nftContract = Web3ClubNFT(_nftContract);
    }
    
    /**
     * @dev Set Registry contract address
     * @param _registryContract Registry contract address
     */
    function setRegistryContract(address payable _registryContract) external onlyOwner {
        registryContract = Web3ClubRegistry(_registryContract);
    }
    
    /**
     * @dev Check if caller is domain owner
     * @param domainName Domain name
     */
    modifier onlyDomainOwner(string memory domainName) {
        uint256 tokenId = nftContract.getTokenId(domainName);
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not domain owner");
        _;
    }
    
    /**
     * @dev Check if domain is active (not expired)
     * @param domainName Domain name
     */
    modifier domainActive(string memory domainName) {
        Web3ClubRegistry.DomainStatus status = registryContract.getDomainStatus(domainName);
        require(status == Web3ClubRegistry.DomainStatus.Active, "Domain not active");
        _;
    }
    
    /**
     * @dev Set domain resolution record
     * @param domainName Domain name
     * @param recordType Record type
     * @param value Record value
     */
    function setRecord(string memory domainName, RecordType recordType, string memory value) 
        external 
        onlyDomainOwner(domainName) 
        domainActive(domainName) 
    {
        require(bytes(value).length > 0, "Empty value not allowed");
        
        _dnsRecords[domainName][recordType] = DNSRecord({
            recordType: recordType,
            value: value,
            lastUpdated: block.timestamp
        });
        
        emit RecordUpdated(domainName, recordType, value);
    }
    
    /**
     * @dev Batch set domain resolution records
     * @param domainName Domain name
     * @param recordTypes Array of record types
     * @param values Array of record values
     */
    function setBatchRecords(string memory domainName, RecordType[] memory recordTypes, string[] memory values) 
        external 
        onlyDomainOwner(domainName) 
        domainActive(domainName) 
    {
        require(recordTypes.length == values.length, "Arrays length mismatch");
        
        for (uint i = 0; i < recordTypes.length; i++) {
            require(bytes(values[i]).length > 0, "Empty value not allowed");
            
            _dnsRecords[domainName][recordTypes[i]] = DNSRecord({
                recordType: recordTypes[i],
                value: values[i],
                lastUpdated: block.timestamp
            });
            
            emit RecordUpdated(domainName, recordTypes[i], values[i]);
        }
    }
    
    /**
     * @dev Remove domain resolution record
     * @param domainName Domain name
     * @param recordType Record type
     */
    function removeRecord(string memory domainName, RecordType recordType) 
        external 
        onlyDomainOwner(domainName) 
    {
        require(_recordExists(domainName, recordType), "Record does not exist");
        
        delete _dnsRecords[domainName][recordType];
        
        emit RecordRemoved(domainName, recordType);
    }
    
    /**
     * @dev Get domain resolution record
     * @param domainName Domain name
     * @param recordType Record type
     * @return Record value (returns empty string if domain is expired)
     */
    function getRecord(string memory domainName, RecordType recordType) 
        external 
        view 
        returns (string memory) 
    {
        // Check domain status, return empty value if not active
        Web3ClubRegistry.DomainStatus status = registryContract.getDomainStatus(domainName);
        if (status != Web3ClubRegistry.DomainStatus.Active) {
            return "";
        }
        
        // Return record value
        if (_recordExists(domainName, recordType)) {
            return _dnsRecords[domainName][recordType].value;
        }
        
        return "";
    }
    
    /**
     * @dev Get complete record information
     * @param domainName Domain name
     * @param recordType Record type
     * @return Record type, value and last update time
     */
    function getRecordDetails(string memory domainName, RecordType recordType) 
        external 
        view 
        returns (RecordType, string memory, uint256) 
    {
        require(_recordExists(domainName, recordType), "Record does not exist");
        
        DNSRecord memory record = _dnsRecords[domainName][recordType];
        return (record.recordType, record.value, record.lastUpdated);
    }
    
    /**
     * @dev Check if record exists
     * @param domainName Domain name
     * @param recordType Record type
     * @return Whether the record exists
     */
    function _recordExists(string memory domainName, RecordType recordType) 
        private 
        view 
        returns (bool) 
    {
        return bytes(_dnsRecords[domainName][recordType].value).length > 0;
    }
    
    /**
     * @dev Batch get all record types for a domain
     * @param domainName Domain name
     * @return Array of all existing record types
     */
    function getAllRecordTypes(string memory domainName) 
        external 
        view 
        returns (RecordType[] memory) 
    {
        // Count how many record types exist for the domain
        uint256 count = 0;
        for (uint i = 0; i <= uint(RecordType.URL); i++) {
            if (_recordExists(domainName, RecordType(i))) {
                count++;
            }
        }
        
        // Create and fill result array
        RecordType[] memory types = new RecordType[](count);
        uint256 index = 0;
        
        for (uint i = 0; i <= uint(RecordType.URL); i++) {
            if (_recordExists(domainName, RecordType(i))) {
                types[index] = RecordType(i);
                index++;
            }
        }
        
        return types;
    }
} 