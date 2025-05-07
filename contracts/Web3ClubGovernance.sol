// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Web3ClubGovernance
 * @dev Manages configuration parameters for Web3.club domain name system
 */
contract Web3ClubGovernance is Ownable {
    // Base yearly fee (ETH, in wei)
    uint256 public baseYearlyFee = 0.01 ether;
    
    // Deposit amount (ETH, in wei)
    uint256 public depositAmount = 0.001 ether;
    
    // Late renewal penalty ratio (base 1000, e.g. 1500 means 1.5x)
    uint256 public lateRenewalPenalty = 1500;
    
    // Reserved names list
    mapping(string => bool) public reservedNames;
    
    // Administrator addresses list
    mapping(address => bool) public administrators;
    
    // Special pricing for short names (3-5 characters)
    uint256 public shortNamePremiumFee = 0.05 ether;
    
    // Event definitions
    event BaseYearlyFeeChanged(uint256 oldFee, uint256 newFee);
    event DepositAmountChanged(uint256 oldAmount, uint256 newAmount);
    event LateRenewalPenaltyChanged(uint256 oldPenalty, uint256 newPenalty);
    event ReservedNameAdded(string name);
    event ReservedNameRemoved(string name);
    event AdministratorAdded(address admin);
    event AdministratorRemoved(address admin);
    event ShortNamePremiumChanged(uint256 oldFee, uint256 newFee);
    
    // Constructor, add initial reserved names
    constructor() Ownable(msg.sender) {
        // Add some default reserved names
        reservedNames["admin"] = true;
        reservedNames["www"] = true;
        reservedNames["mail"] = true;
        reservedNames["smtp"] = true;
        reservedNames["webmaster"] = true;
        reservedNames["system"] = true;
        
        // Add contract creator as administrator
        administrators[msg.sender] = true;
    }
    
    /**
     * @dev Modifier that only allows administrators to call
     */
    modifier onlyAdmin() {
        require(administrators[msg.sender] || msg.sender == owner(), "Not an administrator");
        _;
    }
    
    /**
     * @dev Change base yearly fee
     * @param newFee New base yearly fee (in wei)
     */
    function setBaseYearlyFee(uint256 newFee) external onlyAdmin {
        emit BaseYearlyFeeChanged(baseYearlyFee, newFee);
        baseYearlyFee = newFee;
    }
    
    /**
     * @dev Change deposit amount
     * @param newAmount New deposit amount (in wei)
     */
    function setDepositAmount(uint256 newAmount) external onlyAdmin {
        emit DepositAmountChanged(depositAmount, newAmount);
        depositAmount = newAmount;
    }
    
    /**
     * @dev Change late renewal penalty ratio
     * @param newPenalty New penalty ratio (base 1000)
     */
    function setLateRenewalPenalty(uint256 newPenalty) external onlyAdmin {
        require(newPenalty >= 1000, "Penalty must be at least 1000 (1x)");
        emit LateRenewalPenaltyChanged(lateRenewalPenalty, newPenalty);
        lateRenewalPenalty = newPenalty;
    }
    
    /**
     * @dev Add reserved name
     * @param name Name to reserve
     */
    function addReservedName(string memory name) external onlyAdmin {
        reservedNames[name] = true;
        emit ReservedNameAdded(name);
    }
    
    /**
     * @dev Batch add reserved names
     * @param names Array of names to reserve
     */
    function addReservedNames(string[] memory names) external onlyAdmin {
        for (uint256 i = 0; i < names.length; i++) {
            reservedNames[names[i]] = true;
            emit ReservedNameAdded(names[i]);
        }
    }
    
    /**
     * @dev Remove reserved name
     * @param name Reserved name to remove
     */
    function removeReservedName(string memory name) external onlyAdmin {
        delete reservedNames[name];
        emit ReservedNameRemoved(name);
    }
    
    /**
     * @dev Add administrator
     * @param admin New administrator address
     */
    function addAdministrator(address admin) external onlyOwner {
        administrators[admin] = true;
        emit AdministratorAdded(admin);
    }
    
    /**
     * @dev Remove administrator
     * @param admin Administrator address to remove
     */
    function removeAdministrator(address admin) external onlyOwner {
        delete administrators[admin];
        emit AdministratorRemoved(admin);
    }
    
    /**
     * @dev Change short name premium fee
     * @param newFee New short name premium fee (in wei)
     */
    function setShortNamePremiumFee(uint256 newFee) external onlyAdmin {
        emit ShortNamePremiumChanged(shortNamePremiumFee, newFee);
        shortNamePremiumFee = newFee;
    }
    
    /**
     * @dev Check if name is reserved
     * @param name Name to check
     * @return Whether the name is reserved
     */
    function isReserved(string memory name) external view returns (bool) {
        return reservedNames[name];
    }
    
    /**
     * @dev Calculate yearly fee for a domain
     * @param name Domain name
     * @return Yearly fee amount (in wei)
     */
    function calculateYearlyFee(string memory name) external view returns (uint256) {
        // Get domain length
        bytes memory nameBytes = bytes(name);
        uint256 length = nameBytes.length;
        
        // If it's a short name (3-5 characters), use premium fee
        if (length >= 3 && length <= 5) {
            return shortNamePremiumFee;
        }
        
        // Otherwise use base yearly fee
        return baseYearlyFee;
    }
} 