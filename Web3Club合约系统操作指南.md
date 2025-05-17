# Web3Club 合约系统操作指南

本指南详细介绍了Web3Club合约系统的各个合约组件及其功能用法，包括实际操作示例。

## 目录

1. [ClubManager 合约](#1-clubmanager-合约)
2. [PermanentMembership 合约](#2-permanentmembership-合约)
3. [TemporaryMembership 合约](#3-temporarymembership-合约)
4. [TokenBasedAccess 合约](#4-tokenbasedaccess-合约)
5. [ClubMembershipQuery 合约](#5-clubmembershipquery-合约)
6. [常见操作流程](#6-常见操作流程)

## 1. ClubManager 合约

ClubManager是整个系统的核心控制中心，管理俱乐部、域名和会员资格。

### 1.1 域名和俱乐部管理

#### 创建俱乐部
```solidity
function createClub(string memory domainName) external whenNotPaused2 returns (bool)

// 示例：创建example.web3club.com的俱乐部
clubManager.createClub("example");
```

#### 转移俱乐部管理权
```solidity
function transferAdmin(string memory domainName, address newAdmin) external whenNotPaused2

// 示例：将example俱乐部管理权转给新地址
clubManager.transferAdmin("example", 0x123...);
```

#### 设置俱乐部活跃状态
```solidity
function setClubActive(string memory domainName, bool active) external onlyOwner

// 示例：暂停俱乐部活动
clubManager.setClubActive("example", false);
```

### 1.2 会员资格同步

#### 同步会员资格
```solidity
function syncMembership(address user, string memory domainName) external returns (bool)

// 示例：同步用户会员资格
bool isMember = clubManager.syncMembership(0x123..., "example");
```

#### 检查代币会员资格
```solidity
function checkTokenMembership(address user, string memory domainName) external returns (bool)

// 示例：检查并更新代币会员资格
bool hasTokenMembership = clubManager.checkTokenMembership(0x123..., "example");
```

#### 批量同步会员资格
```solidity
function syncAllMemberships(uint256 limit) external onlyOwner

// 示例：批量同步最多100个会员
clubManager.syncAllMemberships(100);
```

### 1.3 域名过期管理

#### 处理域名过期
```solidity
function handleDomainExpiry(string memory domainName) external

// 示例：处理过期域名
clubManager.handleDomainExpiry("expired-domain");
```

#### 处理域名重新注册
```solidity
function handleDomainReregistration(string memory domainName) external

// 示例：处理重新注册的域名
clubManager.handleDomainReregistration("renewed-domain");
```

#### 决定是否继承俱乐部会员
```solidity
function decideClubInheritance(string memory domainName, bool accept) external onlyDomainOwner(domainName)

// 示例：接受继承前任俱乐部会员
clubManager.decideClubInheritance("inherited-domain", true);
```

### 1.4 继承策略管理

#### 设置用户自动继承策略
```solidity
function setUserAutoInheritancePolicy(AutoInheritancePolicy policy) external

// 示例：设置自动继承策略为"总是继承"
clubManager.setUserAutoInheritancePolicy(AutoInheritancePolicy.Always);
```

#### 设置全局自动继承策略（仅管理员）
```solidity
function setAutoInheritancePolicy(AutoInheritancePolicy policy) external onlyOwner

// 示例：设置全局策略为"从不继承"
clubManager.setAutoInheritancePolicy(AutoInheritancePolicy.Never);
```

### 1.5 查询功能

#### 检查用户是否是俱乐部会员
```solidity
function isMember(string memory domainName, address user) public view returns (bool)

// 示例：检查地址是否是会员
bool isMember = clubManager.isMember("example", 0x123...);
```

#### 获取用户加入的所有俱乐部
```solidity
function getUserClubs(address user) public view returns (string[] memory)

// 示例：获取用户所有俱乐部
string[] memory clubs = clubManager.getUserClubs(0x123...);
```

#### 获取俱乐部管理员
```solidity
function getClubAdmin(string memory domainName) public view returns (address)

// 示例：获取管理员地址
address admin = clubManager.getClubAdmin("example");
```

#### 获取俱乐部的会员资格合约地址
```solidity
function getClubContracts(string memory domainName) public view returns (address perm, address temp, address token)

// 示例：获取各子合约地址
(address perm, address temp, address token) = clubManager.getClubContracts("example");
```

#### 安全获取域名元数据
```solidity
function safeGetDomainMetadata(string memory domainName) external view returns (bool success, address owner, uint256 registrationTime, uint256 expiryTime)

// 示例：获取域名元数据
(bool success, address owner, uint256 regTime, uint256 expTime) = clubManager.safeGetDomainMetadata("example");
```

### 1.6 管理员功能

#### 紧急暂停与恢复
```solidity
function emergencyPause() external onlyOwner
function emergencyUnpause() external onlyOwner

// 示例：暂停所有合约操作
clubManager.emergencyPause();
```

#### 更新会员资格合约地址
```solidity
function updateMembershipContracts(address perm, address temp, address token) external onlyOwner

// 示例：更新子合约地址
clubManager.updateMembershipContracts(newPermAddress, newTempAddress, newTokenAddress);
```

#### 从Registry同步合约
```solidity
function syncContractsFromRegistry() external onlyOwner

// 示例：从Registry同步合约地址
clubManager.syncContractsFromRegistry();
```

## 2. PermanentMembership 合约

管理永久会员资格的ERC1155代币，每个CLUB拥有独立的NFT合集。

### 2.1 俱乐部管理

#### 初始化俱乐部永久会员功能（完整版）
```solidity
function initializeClub(
    string memory domainName, 
    address admin, 
    string memory name,
    string memory symbol,
    string memory baseURI
) external onlyClubManagerOrOwner whenNotPaused2

// 示例：初始化俱乐部并设置NFT信息
permMembership.initializeClub(
    "example",
    0x123...,
    "Example Club Permanent",
    "ECP",
    "https://metadata.example.com/"
);
```

#### 初始化俱乐部永久会员功能（简化版）
```solidity
function initializeClub(string memory domainName, address admin) external onlyClubManagerOrOwner whenNotPaused2

// 示例：初始化俱乐部（使用默认命名）
permMembership.initializeClub("example", 0x123...);
```

#### 更新俱乐部管理员
```solidity
function updateClubAdmin(string memory domainName, address newAdmin) external onlyClubManagerOrOwner clubInitialized(domainName) whenNotPaused2

// 示例：更新管理员
permMembership.updateClubAdmin("example", 0x456...);
```

#### 取消俱乐部初始化
```solidity
function uninitializeClub(string memory domainName) external onlyClubManagerOrOwner

// 示例：取消俱乐部初始化
permMembership.uninitializeClub("example");
```

### 2.2 会员管理

#### 购买会员资格
```solidity
function purchaseMembership(string memory domainName) external payable clubInitialized(domainName) whenNotPaused2 returns (uint256)

// 示例：购买会员资格(发送适当的ETH)
uint256 tokenId = permMembership.purchaseMembership{value: 0.1 ether}("example");
```

#### 尝试授予会员资格（仅记录尝试，不执行实际操作）
```solidity
function grantMembership(string memory domainName, address to) external onlyClubAdmin(domainName) clubInitialized(domainName) whenNotPaused2 returns (uint256)

// 示例：尝试授予会员资格
uint256 tokenId = permMembership.grantMembership("example", 0x789...);
```

#### 尝试撤销会员资格（仅记录尝试，不执行实际操作）
```solidity
function revokeAccess(string memory domainName, address[] memory accounts) external clubInitialized(domainName) onlyClubManagerOrOwner

// 示例：尝试撤销会员资格
address[] memory accounts = new address[](1);
accounts[0] = 0x789...;
permMembership.revokeAccess("example", accounts);
```

### 2.3 NFT和元数据设置

#### 更新合集媒体资源和描述
```solidity
function updateCollectionMedia(
    string memory domainName, 
    string memory logoURI, 
    string memory bannerURI, 
    string memory description
) external onlyClubAdmin(domainName) clubInitialized(domainName) whenNotPaused2

// 示例：更新合集媒体资源
permMembership.updateCollectionMedia(
    "example", 
    "https://example.com/logo.png", 
    "https://example.com/banner.png", 
    "这是示例俱乐部的描述"
);
```

#### 更新合集信息
```solidity
function updateCollectionInfo(
    string memory domainName, 
    string memory name, 
    string memory symbol,
    string memory baseURI
) external onlyClubAdmin(domainName) clubInitialized(domainName) whenNotPaused2

// 示例：更新合集信息
permMembership.updateCollectionInfo(
    "example",
    "新示例俱乐部",
    "NSC",
    "https://metadata.example.com/new/"
);
```

#### 设置特定会员卡元数据
```solidity
function setMembershipMetadata(uint256 tokenId, string calldata metadataURI) external whenNotPaused2

// 示例：设置特定会员卡元数据
permMembership.setMembershipMetadata(123, "https://metadata.example.com/123");
```

### 2.4 会员转移控制

#### 配置转移策略
```solidity
function configureTransferPolicy(string memory domainName, Policy policy, address[] calldata whitelistAccounts, bool whitelistStatus) external onlyClubAdmin(domainName) clubInitialized(domainName) whenNotPaused2

// 示例：设置白名单模式并添加地址
address[] memory whitelist = new address[](2);
whitelist[0] = 0xabc...;
whitelist[1] = 0xdef...;
permMembership.configureTransferPolicy("example", Policy.WHITELIST, whitelist, true);
```

#### 更新支付设置
```solidity
function updatePaymentSettings(string memory domainName, uint256 price, address payable receiver) external onlyClubAdmin(domainName) clubInitialized(domainName) whenNotPaused2

// 示例：更新价格和接收地址
permMembership.updatePaymentSettings("example", 0.2 ether, 0xabc...);
```

### 2.5 兼容旧版接口

#### 设置合集媒体资源（兼容旧版）
```solidity
function setCollectionMedia(string memory domainName, string memory logoURI, string memory bannerURI, string memory description) external onlyClubAdmin(domainName) clubInitialized(domainName) whenNotPaused2

// 示例：设置媒体资源
permMembership.setCollectionMedia("example", "https://example.com/logo.png", "https://example.com/banner.png", "描述");
```

#### 设置俱乐部基础URI（兼容旧版）
```solidity
function setClubBaseURI(string memory domainName, string memory newBaseURI) external onlyClubAdmin(domainName) clubInitialized(domainName) whenNotPaused2

// 示例：设置元数据URI
permMembership.setClubBaseURI("example", "https://metadata.example.com/");
```

#### 设置转移策略（兼容旧版）
```solidity
function setPolicy(string memory domainName, Policy _policy) external onlyClubAdmin(domainName) clubInitialized(domainName) whenNotPaused2

// 示例：设置限制转移策略
permMembership.setPolicy("example", Policy.RESTRICT);
// 策略选项: ALLOW(允许自由转移), RESTRICT(限制转移), WHITELIST(白名单)
```

### 2.6 查询功能

#### 检查账户是否有会员资格
```solidity
function hasMembership(string memory domainName, address account) public view clubInitialized(domainName) returns (bool)

// 示例：检查会员资格
bool isMember = permMembership.hasMembership("example", 0x123...);
```

#### 获取会员的tokenId
```solidity
function getMemberTokenId(string memory domainName, address account) external view clubInitialized(domainName) returns (uint256)

// 示例：获取会员的Token ID
uint256 tokenId = permMembership.getMemberTokenId("example", 0x123...);
```

#### 获取会员数据
```solidity
function getMembershipData(uint256 tokenId) external view returns (MemberData memory)

// 示例：获取会员数据
MemberData memory data = permMembership.getMembershipData(tokenId);
```

#### 获取俱乐部NFT信息
```solidity
function getCollectionInfo(string memory domainName) external view clubInitialized(domainName) returns (
    string memory name,
    string memory symbol,
    string memory baseURI,
    string memory description,
    string memory logoURI,
    string memory bannerURI,
    uint256 memberCount,
    Policy policy
)

// 示例：获取NFT合集信息
(
    string memory name, 
    string memory symbol, 
    string memory baseURI,
    string memory description,
    string memory logoURI,
    string memory bannerURI,
    uint256 memberCount,
    Policy policy
) = permMembership.getCollectionInfo("example");
```

## 3. TemporaryMembership 合约

管理有时限的会员资格。

### 3.1 俱乐部管理

#### 初始化俱乐部临时会员功能（完整版）
```solidity
function initializeClub(
    string memory domainName,
    address admin, 
    string memory name,
    string memory symbol,
    string memory baseURI
) external onlyClubManagerOrOwner whenNotPaused2

// 示例：初始化俱乐部
tempMembership.initializeClub(
    "example",
    0x123...,
    "Example Club Temporary",
    "ECT",
    "https://metadata.example.com/temp/"
);
```

#### 初始化俱乐部临时会员功能（简化版）
```solidity
function initializeClub(string memory domainName, address admin) external onlyClubManagerOrOwner whenNotPaused2

// 示例：初始化俱乐部
tempMembership.initializeClub("example", 0x123...);
```

#### 取消初始化俱乐部
```solidity
function uninitializeClub(string memory domainName) external onlyClubManagerOrOwner

// 示例：取消俱乐部初始化
tempMembership.uninitializeClub("example");
```

### 3.2 会员价格设置

#### 设置月度会员价格
```solidity
function setPrice(string memory domainName, uint256 _price) external onlyClubAdmin(domainName) clubInitialized(domainName) whenNotPaused2

// 示例：设置月度会员价格
tempMembership.setPrice("example", 0.015 ether);
```

#### 设置季度会员价格
```solidity
function setQuarterPrice(string memory domainName, uint256 _price) external onlyClubAdmin(domainName) clubInitialized(domainName) whenNotPaused2

// 示例：设置季度会员价格
tempMembership.setQuarterPrice("example", 0.04 ether);
```

#### 设置年度会员价格
```solidity
function setYearPrice(string memory domainName, uint256 _price) external onlyClubAdmin(domainName) clubInitialized(domainName) whenNotPaused2

// 示例：设置年度会员价格
tempMembership.setYearPrice("example", 0.1 ether);
```

### 3.3 会员购买

#### 购买月度会员
```solidity
function purchaseMembership(string memory domainName) external payable clubInitialized(domainName) whenNotPaused2 nonReentrant returns (uint256)

// 示例：购买月度会员
uint256 tokenId = tempMembership.purchaseMembership{value: 0.01 ether}("example");
```

#### 购买季度会员
```solidity
function purchaseQuarterMembership(string memory domainName) external payable clubInitialized(domainName) whenNotPaused2 nonReentrant returns (uint256)

// 示例：购买季度会员
uint256 tokenId = tempMembership.purchaseQuarterMembership{value: 0.025 ether}("example");
```

#### 购买年度会员
```solidity
function purchaseYearMembership(string memory domainName) external payable clubInitialized(domainName) whenNotPaused2 nonReentrant returns (uint256)

// 示例：购买年度会员
uint256 tokenId = tempMembership.purchaseYearMembership{value: 0.08 ether}("example");
```

### 3.4 管理员会员管理

#### 授予会员资格
```solidity
function grantMembership(string memory domainName, address to, uint256 duration) external onlyClubAdmin(domainName) clubInitialized(domainName) whenNotPaused2 returns (uint256)

// 示例：授予60天会员资格
uint256 tokenId = tempMembership.grantMembership("example", 0x123..., 60 days);
```

#### 批量授予会员资格
```solidity
function grantMemberships(string memory domainName, address[] calldata recipients, uint256 duration) external onlyClubAdmin(domainName) clubInitialized(domainName) whenNotPaused2

// 示例：批量授予会员资格
address[] memory addresses = new address[](2);
addresses[0] = 0x123...;
addresses[1] = 0x456...;
tempMembership.grantMemberships("example", addresses, 30 days);
```

#### 续订会员资格
```solidity
function renewMembership(string memory domainName, address member, uint256 additionalDuration) external onlyClubAdmin(domainName) clubInitialized(domainName) whenNotPaused2

// 示例：续订会员30天
tempMembership.renewMembership("example", 0x123..., 30 days);
```

### 3.5 元数据设置

#### 设置俱乐部基础URI
```solidity
function setClubBaseURI(string memory domainName, string memory newBaseURI) external onlyClubAdmin(domainName) clubInitialized(domainName) whenNotPaused2

// 示例：设置基础URI
tempMembership.setClubBaseURI("example", "https://api.example.com/temp/");
```

#### 设置特定会员的元数据URI
```solidity
function setMembershipMetadata(string memory domainName, address member, string calldata metadataURI) external onlyClubAdmin(domainName) clubInitialized(domainName) whenNotPaused2

// 示例：设置会员元数据
tempMembership.setMembershipMetadata("example", 0x123..., "https://api.example.com/temp/special");
```

### 3.6 查询功能

#### 检查账户是否有有效会员资格
```solidity
function hasActiveMembership(string memory domainName, address account) public view clubInitialized(domainName) returns (bool)

// 示例：检查有效会员资格
bool isActive = tempMembership.hasActiveMembership("example", 0x123...);
```

#### 获取会员过期时间
```solidity
function getMembershipExpiry(string memory domainName, address account) external view clubInitialized(domainName) returns (uint256)

// 示例：获取会员过期时间
uint256 expiryTime = tempMembership.getMembershipExpiry("example", 0x123...);
```

#### 获取会员详细数据
```solidity
function getMembershipData(string memory domainName, address account) external view clubInitialized(domainName) returns (MemberData memory)

// 示例：获取会员数据
MemberData memory data = tempMembership.getMembershipData("example", 0x123...);
```

## 4. TokenBasedAccess 合约

基于代币持有量授予会员资格。

### 4.1 俱乐部管理

#### 初始化俱乐部Token门槛功能
```solidity
function initializeClub(string memory domainName, address admin) external whenNotPaused2 whenNotInitialized(domainName)

// 示例：初始化俱乐部
tokenAccess.initializeClub("example", 0x123...);
```

#### 兼容完整版初始化接口
```solidity
function initializeClub(
    string memory domainName, 
    address admin, 
    string memory name, 
    string memory symbol, 
    string memory baseURI
) external whenNotPaused2 whenNotInitialized(domainName)

// 示例：完整初始化（名称、符号、URI参数会被忽略）
tokenAccess.initializeClub("example", 0x123..., "", "", "");
```

#### 取消域名初始化
```solidity
function uninitializeClub(string memory domainName) external whenNotPaused2 whenInitialized(domainName)

// 示例：取消初始化
tokenAccess.uninitializeClub("example");
```

#### 更新管理员
```solidity
function updateClubAdmin(string memory domainName, address newAdmin) external whenNotPaused2 whenInitialized(domainName)

// 示例：更新管理员
tokenAccess.updateClubAdmin("example", 0x456...);
```

### 4.2 Token门槛设置

#### 添加Token门槛
```solidity
function addTokenGate(string memory domainName, address tokenAddress, uint256 threshold) external onlyClubAdmin(domainName) whenNotPaused returns (bool)

// 示例：设置需要持有100个某代币才能成为会员
tokenAccess.addTokenGate("example", 0xTOKEN_ADDRESS, 100 * 10**18);
```

#### 添加NFT门槛
```solidity
function addNFTGate(string memory domainName, address nftContract, uint256 requiredAmount) external onlyClubAdmin(domainName) whenNotPaused returns (bool)

// 示例：设置需要持有至少1个某NFT才能成为会员
tokenAccess.addNFTGate("example", 0xNFT_ADDRESS, 1);
```

#### 获取Token门槛
```solidity
function getTokenGate(string memory domainName) external view returns (address tokenAddress, uint256 threshold)

// 示例：获取Token门槛
(address token, uint256 threshold) = tokenAccess.getTokenGate("example");
```

#### 获取NFT门槛
```solidity
function getNFTGate(string memory domainName) external view returns (address tokenAddress, uint256 threshold)

// 示例：获取NFT门槛
(address nftAddress, uint256 required) = tokenAccess.getNFTGate("example");
```

### 4.3 跨链Token门槛管理

#### 添加跨链代币记录
```solidity
function addCrossChainTokenGate(
    string memory domainName,
    string memory chainName,
    string memory tokenAddress,
    string memory tokenSymbol,
    uint256 threshold
) external whenNotPaused2 onlyClubAdmin(domainName) whenInitialized(domainName)

// 示例：添加Polygon链上的代币要求
tokenAccess.addCrossChainTokenGate(
    "example",
    "polygon",
    "0xTOKEN_ON_POLYGON",
    "MATIC",
    50 * 10**18
);
```

#### 移除跨链代币记录
```solidity
function removeCrossChainTokenGate(string memory domainName, string memory chainName) external whenNotPaused2 onlyClubAdmin(domainName) whenInitialized(domainName)

// 示例：移除Polygon链上的代币要求
tokenAccess.removeCrossChainTokenGate("example", "polygon");
```

#### 获取跨链代币记录
```solidity
function getCrossChainTokenGate(string memory domainName, string memory chainName) external view returns (
    string memory tokenAddress,
    string memory tokenSymbol,
    uint256 threshold,
    uint256 timestamp
)

// 示例：获取Polygon链上的代币要求
(string memory addr, string memory symbol, uint256 amount, uint256 time) = 
    tokenAccess.getCrossChainTokenGate("example", "polygon");
```

### 4.4 会员资格检查和更新

#### 检查并更新访问状态
```solidity
function checkAndUpdateAccess(string memory domainName, address user) external whenNotPaused returns (bool)

// 示例：检查并更新用户访问状态
bool hasAccess = tokenAccess.checkAndUpdateAccess("example", 0x123...);
```

#### 检查账户是否有活跃会员资格
```solidity
function hasActiveMembership(string memory domainName, address account) external view returns (bool)

// 示例：检查是否有活跃会员资格
bool isActive = tokenAccess.hasActiveMembership("example", 0x123...);
```

#### 检查账户是否有访问权限
```solidity
function hasAccessByDomain(string memory domainName, address user) public view returns (bool)

// 示例：检查是否有访问权限
bool hasAccess = tokenAccess.hasAccessByDomain("example", 0x123...);
```

## 5. ClubMembershipQuery 合约

提供跨合约的会员查询功能。

### 5.1 基本查询

#### 检查用户是否是俱乐部会员
```solidity
function isMember(string memory domainName, address user) external view returns (bool memberStatus)

// 示例：检查用户是否是会员
bool isMember = membershipQuery.isMember("example", 0x123...);
```

#### 获取用户加入的所有俱乐部
```solidity
function getUserClubs(address user) external view returns (string[] memory userClubs)

// 示例：获取用户所有俱乐部
string[] memory clubs = membershipQuery.getUserClubs(0x123...);
```

### 5.2 详细查询

#### 获取用户所有会员资格及过期时间
```solidity
function getUserMemberships(address user) public view returns (string[] memory domainNames, MembershipStatus[] memory statuses)

// 示例：获取用户所有会员资格详情
(string[] memory clubs, MembershipStatus[] memory statuses) = membershipQuery.getUserMemberships(0x123...);
```

#### 检查用户在特定俱乐部的会员状态
```solidity
function checkUserMembership(address user, string memory domainName) public view returns (MembershipStatus memory status)

// 示例：检查用户在特定俱乐部的会员状态
MembershipStatus memory status = membershipQuery.checkUserMembership(0x123..., "example");
```

#### 获取俱乐部会员条件
```solidity
function getClubMembershipConditions(string memory domainName) public view returns (ClubMembershipConditions memory conditions)

// 示例：获取俱乐部的会员条件
ClubMembershipConditions memory conditions = membershipQuery.getClubMembershipConditions("example");
```

#### 检查详细会员类型
```solidity
function checkDetailedMembership(address user, string memory domainName) external view returns (
    bool isPermanent,
    bool isTemporary,
    bool isTokenBased
)

// 示例：获取详细会员类型
(bool isPerm, bool isTemp, bool isToken) = membershipQuery.checkDetailedMembership(0x123..., "example");
```

#### 获取会员卡消息数据
```solidity
function getMembershipMessage(address user, string memory domainName) external view returns (string memory message, bytes memory signature)

// 示例：获取会员卡消息
(string memory msg, bytes memory sig) = membershipQuery.getMembershipMessage(0x123..., "example");
```

## 6. 常见操作流程

### 6.1 创建俱乐部及配置会员资格

1. 域名所有者创建俱乐部
```solidity
// 假设用户已拥有example.web3club.com的NFT
clubManager.createClub("example");
```

2. 配置永久会员
```solidity
// 设置永久会员价格
permMembership.updatePaymentSettings("example", 0.05 ether, 0x123...);

// 配置转移策略为白名单模式
address[] memory whitelist = new address[](1);
whitelist[0] = 0x456...;
permMembership.configureTransferPolicy("example", Policy.WHITELIST, whitelist, true);

// 设置合集媒体资源
permMembership.updateCollectionMedia(
    "example",
    "https://example.com/logo.png",
    "https://example.com/banner.png",
    "这是示例俱乐部的永久会员合集"
);
```

3. 设置临时会员价格
```solidity
tempMembership.setPrice("example", 0.01 ether); // 月度
tempMembership.setQuarterPrice("example", 0.025 ether); // 季度
tempMembership.setYearPrice("example", 0.08 ether); // 年度
```

4. 设置代币门槛
```solidity
// 设置ERC20代币门槛
tokenAccess.addTokenGate("example", 0xTOKEN_ADDRESS, 100 * 10**18);

// 设置NFT持有要求
tokenAccess.addNFTGate("example", 0xNFT_ADDRESS, 1);

// 设置跨链代币要求
tokenAccess.addCrossChainTokenGate(
    "example",
    "polygon",
    "0xPOLYGON_TOKEN",
    "MATIC",
    50 * 10**18
);
```

### 6.2 用户获取会员资格

1. 购买永久会员
```solidity
// 用户支付ETH获取永久会员资格
permMembership.purchaseMembership{value: 0.05 ether}("example");
```

2. 购买临时会员
```solidity
// 用户购买年度会员
tempMembership.purchaseYearMembership{value: 0.08 ether}("example");
```

3. 通过持有代币成为会员
```solidity
// 用户持有足够代币后，更新访问状态
tokenAccess.checkAndUpdateAccess("example", userAddress);
```

4. 会员资格同步
```solidity
// 同步用户在所有系统中的会员状态
clubManager.syncMembership(userAddress, "example");
```

### 6.3 会员资格查询

1. 基本会员状态查询
```solidity
// 检查用户是否是会员
bool isMember = clubManager.isMember("example", userAddress);
```

2. 详细会员类型查询
```solidity
// 检查用户会员类型
(bool isPerm, bool isTemp, bool isToken) = membershipQuery.checkDetailedMembership(userAddress, "example");
```

3. 获取用户所有俱乐部
```solidity
// 获取用户所属的所有俱乐部
string[] memory clubs = membershipQuery.getUserClubs(userAddress);
```

4. 获取特定会员卡的信息
```solidity
// 获取永久会员卡ID
uint256 tokenId = permMembership.getMemberTokenId("example", userAddress);

// 获取会员卡数据
MemberData memory data = permMembership.getMembershipData(tokenId);
```

### 6.4 域名转移和继承处理

1. 处理域名过期
```solidity
// 当域名过期时，任何人都可以调用此函数
clubManager.handleDomainExpiry("expired-domain");
```

2. 新域名所有者处理重新注册
```solidity
// 新域名所有者调用此函数
clubManager.handleDomainReregistration("renewed-domain");
```

3. 决定是否继承会员
```solidity
// 新域名所有者决定是否保留原俱乐部会员
clubManager.decideClubInheritance("renewed-domain", true); // 接受继承
```

4. 设置自动继承策略
```solidity
// 用户可以设置自己的继承策略
clubManager.setUserAutoInheritancePolicy(AutoInheritancePolicy.Always);
```

### 6.5 会员资格更新和管理

1. 临时会员资格续期
```solidity
// 管理员为会员续期
tempMembership.renewMembership("example", userAddress, 30 days);
```

2. 批量授予临时会员资格
```solidity
// 管理员批量授予临时会员资格
address[] memory members = new address[](3);
members[0] = 0x111...;
members[1] = 0x222...;
members[2] = 0x333...;
tempMembership.grantMemberships("example", members, 60 days);
```

3. 设置特定会员卡的元数据
```solidity
// 为永久会员卡设置自定义元数据
uint256 tokenId = permMembership.getMemberTokenId("example", userAddress);
permMembership.setMembershipMetadata(tokenId, "https://example.com/special-metadata");
``` 