// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./Web3ClubNFT.sol";
import "./Web3ClubGovernance.sol";

/**
 * @title Web3ClubRegistry
 * @dev Main Web3.club domain name registration management contract
 */
contract Web3ClubRegistry is Ownable, ReentrancyGuard {
    using Strings for string;
    using ECDSA for bytes32;
    
    // Domain status enumeration
    enum DomainStatus {
        Available,  // Available for registration
        Active,     // Registered and valid
        Frozen,     // Expired but in grace period (30 days)
        Reclaimed   // Reclaimed, waiting for release
    }
    
    // Contract dependencies
    Web3ClubNFT public nftContract;
    Web3ClubGovernance public governanceContract;
    
    // Domain registration commitment information
    struct CommitmentInfo {
        bytes32 commitment;   // Commitment hash
        uint256 timestamp;    // Commitment timestamp
        uint256 deposit;      // Deposit amount
    }
    
    // User deposit balance
    mapping(address => uint256) public userDeposits;
    
    // User domain commitment information
    mapping(bytes32 => CommitmentInfo) public commitments;
    
    // Domain auto-renewal funds
    mapping(string => uint256) public autoRenewalFunds;
    
    // Domain pre-registration lock
    mapping(string => bool) public domainLocks;
    
    // Minimum commitment time (blocks)
    uint256 public minCommitmentAge = 2;
    
    // Maximum commitment validity period (seconds)
    uint256 public maxCommitmentAge = 86400; // 24 hours
    
    // Minimum domain length
    uint256 public minDomainLength = 1;
    
    // Maximum domain length
    uint256 public maxDomainLength = 64;
    
    // Maximum renewal years
    uint256 public maxRegistrationYears = 10;
    
    // Domain grace period (seconds)
    uint256 public gracePeriod = 30 days;
    
    // Domain recycling period (seconds)
    uint256 public recyclePeriod = 90 days;
    
    // Event definitions
    event NameCommitted(bytes32 indexed commitment, address indexed committer, uint256 deposit);
    event NameRegistered(string name, address indexed owner, uint256 expiryTime);
    event NameRenewed(string name, uint256 newExpiryTime);
    event NameReclaimed(string name);
    event DepositReceived(address indexed user, uint256 amount);
    event DepositWithdrawn(address indexed user, uint256 amount);
    event AutoRenewalFunded(string name, address indexed funder, uint256 amount);
    event DomainStatusChanged(string name, DomainStatus status);
    
    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {
        // NFT contract and governance contract will be set after deployment
    }
    
    /**
     * @dev Set NFT contract address
     * @param _nftContract NFT contract address
     */
    function setNFTContract(address _nftContract) external onlyOwner {
        nftContract = Web3ClubNFT(_nftContract);
    }
    
    /**
     * @dev Set governance contract address
     * @param _governanceContract Governance contract address
     */
    function setGovernanceContract(address _governanceContract) external onlyOwner {
        governanceContract = Web3ClubGovernance(_governanceContract);
    }
    
    /**
     * @dev Check if domain name is valid
     * @param name Domain name
     * @return Whether the domain name is valid
     */
    function isValidDomainName(string memory name) public view returns (bool) {
        bytes memory nameBytes = bytes(name);
        uint256 length = nameBytes.length;
        
        // Check if length is within allowed range
        if (length < minDomainLength || length > maxDomainLength) {
            return false;
        }
        
        // Check if it's a reserved name
        if (governanceContract.isReserved(name)) {
            return false;
        }
        
        // Check if it's all numbers
        bool onlyNumbers = true;
        for (uint i = 0; i < length; i++) {
            bytes1 b = nameBytes[i];
            
            // Check if character is valid (a-z, 0-9, _)
            if (!(
                (b >= 0x61 && b <= 0x7A) || // a-z
                (b >= 0x30 && b <= 0x39) || // 0-9
                b == 0x5F                    // _
            )) {
                return false;
            }
            
            // Check if it's a number
            if (b < 0x30 || b > 0x39) {
                onlyNumbers = false;
            }
        }
        
        // Pure numeric domain names are not allowed
        if (onlyNumbers) {
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Generate domain commitment hash
     * @param name Domain name
     * @param owner Owner address
     * @param secret Secret string
     * @return Commitment hash
     */
    function makeCommitment(string memory name, address owner, string memory secret) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(name, owner, secret));
    }
    
    /**
     * @dev Submit domain registration commitment
     * @param commitment Commitment hash
     */
    function commit(bytes32 commitment) external payable {
        require(commitments[commitment].timestamp == 0, "Commitment already exists");
        
        // Ensure deposit amount is correct
        uint256 depositAmount = governanceContract.depositAmount();
        require(msg.value >= depositAmount, "Insufficient deposit");
        
        // Store commitment information
        commitments[commitment] = CommitmentInfo({
            commitment: commitment,
            timestamp: block.timestamp,
            deposit: depositAmount
        });
        
        // Record user's remaining deposit
        uint256 excessAmount = msg.value - depositAmount;
        if (excessAmount > 0) {
            userDeposits[msg.sender] += excessAmount;
        }
        
        emit NameCommitted(commitment, msg.sender, depositAmount);
    }
    
    /**
     * @dev Register domain name
     * @param name Domain name
     * @param owner Owner address
     * @param secret Secret string
     * @param duration Registration duration (years)
     */
    function register(string memory name, address owner, string memory secret, uint256 duration) external payable nonReentrant {
        // Check if domain name is valid
        require(isValidDomainName(name), "Invalid domain name");
        require(!domainLocks[name], "Domain is locked");
        require(duration > 0 && duration <= maxRegistrationYears, "Invalid registration duration");
        
        // Generate commitment hash
        bytes32 commitment = makeCommitment(name, owner, secret);
        
        // Get commitment information
        CommitmentInfo memory info = commitments[commitment];
        require(info.timestamp > 0, "Commitment not found");
        
        // Check if commitment time is valid
        require(block.timestamp >= info.timestamp + minCommitmentAge * 13, "Commitment too new");
        require(block.timestamp <= info.timestamp + maxCommitmentAge, "Commitment expired");
        
        // Calculate registration fee
        uint256 yearlyFee = governanceContract.calculateYearlyFee(name);
        uint256 totalFee = yearlyFee * duration;
        
        // Verify payment amount
        uint256 availableBalance = userDeposits[msg.sender] + msg.value;
        require(availableBalance >= totalFee, "Insufficient funds");
        
        // Calculate remaining balance
        uint256 remainingBalance = availableBalance - totalFee;
        
        // Update user deposit
        userDeposits[msg.sender] = remainingBalance;
        
        // Lock domain
        domainLocks[name] = true;
        
        // Calculate expiration time
        uint256 expiryTime = block.timestamp + (duration * 365 days);
        
        // Mint NFT
        nftContract.mint(owner, name, expiryTime);
        
        // Clear commitment information and refund deposit
        userDeposits[msg.sender] += info.deposit;
        delete commitments[commitment];
        
        emit NameRegistered(name, owner, expiryTime);
        emit DomainStatusChanged(name, DomainStatus.Active);
    }
    
    /**
     * @dev Renew domain name
     * @param name Domain name
     * @param duration Renewal duration (years)
     */
    function renew(string memory name, uint256 duration) external payable nonReentrant {
        require(duration > 0 && duration <= maxRegistrationYears, "Invalid renewal duration");
        
        // Get domain status
        DomainStatus status = getDomainStatus(name);
        require(status == DomainStatus.Active || status == DomainStatus.Frozen, "Domain not eligible for renewal");
        
        // Get domain information
        Web3ClubNFT.DomainInfo memory info = nftContract.getDomainInfo(name);
        uint256 tokenId = nftContract.getTokenId(name);
        
        // Verify ownership
        address owner = nftContract.ownerOf(tokenId);
        require(msg.sender == owner, "Only domain owner can renew");
        
        // Calculate renewal fee
        uint256 yearlyFee = governanceContract.calculateYearlyFee(name);
        uint256 totalFee = yearlyFee * duration;
        
        // If it's late renewal (in frozen period), an additional penalty is charged
        if (status == DomainStatus.Frozen && block.timestamp > info.expiryTime + 30 days) {
            uint256 penaltyMultiplier = governanceContract.lateRenewalPenalty();
            totalFee = (totalFee * penaltyMultiplier) / 1000;
        }
        
        // Verify payment amount
        uint256 availableBalance = userDeposits[msg.sender] + msg.value;
        require(availableBalance >= totalFee, "Insufficient funds");
        
        // Calculate remaining balance
        uint256 remainingBalance = availableBalance - totalFee;
        
        // Update user deposit
        userDeposits[msg.sender] = remainingBalance;
        
        // Calculate new expiration time
        uint256 newExpiryTime;
        if (block.timestamp > info.expiryTime) {
            // If expired, calculate from current time
            newExpiryTime = block.timestamp + (duration * 365 days);
        } else {
            // If not expired, calculate from original expiration time
            newExpiryTime = info.expiryTime + (duration * 365 days);
        }
        
        // Update NFT expiration time
        nftContract.updateExpiryTime(name, newExpiryTime);
        
        // Update domain status
        if (status == DomainStatus.Frozen) {
            emit DomainStatusChanged(name, DomainStatus.Active);
        }
        
        emit NameRenewed(name, newExpiryTime);
    }
    
    /**
     * @dev Add auto-renewal funds
     * @param name Domain name
     */
    function addRenewalFunds(string memory name) external payable {
        // Get domain status
        DomainStatus status = getDomainStatus(name);
        require(status == DomainStatus.Active || status == DomainStatus.Frozen, "Domain not eligible for funding");
        
        require(msg.value > 0, "Must send some ETH");
        
        // Add funds to auto-renewal balance
        autoRenewalFunds[name] += msg.value;
        
        emit AutoRenewalFunded(name, msg.sender, msg.value);
    }
    
    /**
     * @dev Get domain status
     * @param name Domain name
     * @return Domain status
     */
    function getDomainStatus(string memory name) public view returns (DomainStatus) {
        try nftContract.getTokenId(name) returns (uint256 /* tokenId */) {
            // Domain is registered, check if expired
            Web3ClubNFT.DomainInfo memory info = nftContract.getDomainInfo(name);
            
            if (block.timestamp <= info.expiryTime) {
                return DomainStatus.Active;
            } else if (block.timestamp <= info.expiryTime + gracePeriod) {
                return DomainStatus.Frozen;
            } else if (block.timestamp <= info.expiryTime + recyclePeriod) {
                return DomainStatus.Reclaimed;
            } else {
                // Expired but not yet reclaimed by system
                return DomainStatus.Reclaimed;
            }
        } catch {
            // Domain not registered
            return DomainStatus.Available;
        }
    }
    
    /**
     * @dev Reclaim expired domain name
     * @param name Domain name
     */
    function reclaimExpiredDomain(string memory name) external {
        DomainStatus status = getDomainStatus(name);
        require(status == DomainStatus.Reclaimed, "Domain not eligible for reclamation");
        
        // Burn NFT
        nftContract.burn(name);
        
        // Unlock domain
        domainLocks[name] = false;
        
        emit NameReclaimed(name);
        emit DomainStatusChanged(name, DomainStatus.Available);
    }
    
    /**
     * @dev Execute auto-renewal
     * @param name Domain name
     * @param duration Renewal duration (years)
     */
    function executeAutoRenewal(string memory name, uint256 duration) external {
        require(duration > 0 && duration <= maxRegistrationYears, "Invalid renewal duration");
        
        // Get domain status
        DomainStatus status = getDomainStatus(name);
        require(status == DomainStatus.Active || status == DomainStatus.Frozen, "Domain not eligible for renewal");
        
        // Get domain information
        Web3ClubNFT.DomainInfo memory info = nftContract.getDomainInfo(name);
        
        // Calculate renewal fee
        uint256 yearlyFee = governanceContract.calculateYearlyFee(name);
        uint256 totalFee = yearlyFee * duration;
        
        // If it's late renewal (in frozen period), an additional penalty is charged
        if (status == DomainStatus.Frozen && block.timestamp > info.expiryTime + 30 days) {
            uint256 penaltyMultiplier = governanceContract.lateRenewalPenalty();
            totalFee = (totalFee * penaltyMultiplier) / 1000;
        }
        
        // Check if auto-renewal funds are sufficient
        require(autoRenewalFunds[name] >= totalFee, "Insufficient auto-renewal funds");
        
        // Deduct fees from auto-renewal funds
        autoRenewalFunds[name] -= totalFee;
        
        // Calculate new expiration time
        uint256 newExpiryTime;
        if (block.timestamp > info.expiryTime) {
            // If expired, calculate from current time
            newExpiryTime = block.timestamp + (duration * 365 days);
        } else {
            // If not expired, calculate from original expiration time
            newExpiryTime = info.expiryTime + (duration * 365 days);
        }
        
        // Update NFT expiration time
        nftContract.updateExpiryTime(name, newExpiryTime);
        
        // Update domain status
        if (status == DomainStatus.Frozen) {
            emit DomainStatusChanged(name, DomainStatus.Active);
        }
        
        emit NameRenewed(name, newExpiryTime);
    }
    
    /**
     * @dev Deposit ETH
     */
    function deposit() external payable {
        require(msg.value > 0, "Must send some ETH");
        userDeposits[msg.sender] += msg.value;
        emit DepositReceived(msg.sender, msg.value);
    }
    
    /**
     * @dev Withdraw deposit
     * @param amount Withdrawal amount
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(userDeposits[msg.sender] >= amount, "Insufficient deposit");
        
        userDeposits[msg.sender] -= amount;
        
        // Transfer
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "ETH transfer failed");
        
        emit DepositWithdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Withdraw contract income (only callable by owner)
     */
    function withdrawContractBalance() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        // Deduct user deposits and auto-renewal funds
        uint256 totalUserDeposits = 0;
        address[] memory users = new address[](0); // Actual application should implement user tracking
        for (uint256 i = 0; i < users.length; i++) {
            totalUserDeposits += userDeposits[users[i]];
        }
        
        // Withdrawable amount = Total balance - User deposits - Auto-renewal funds (Simplified calculation)
        uint256 withdrawableAmount = balance - totalUserDeposits;
        require(withdrawableAmount > 0, "No withdrawable amount");
        
        // Transfer
        (bool success, ) = owner().call{value: withdrawableAmount}("");
        require(success, "ETH transfer failed");
    }
    
    /**
     * @dev Receive ETH fallback function
     */
    receive() external payable {
        // Default, count received ETH as deposit
        userDeposits[msg.sender] += msg.value;
        emit DepositReceived(msg.sender, msg.value);
    }
} 