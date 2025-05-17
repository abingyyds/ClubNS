# Web3.club 二级域名管理系统

这是一个类似ENS的二级域名（`xxx.web3.club`）注册与续费系统，通过ERC721 NFT管理域名所有权。系统允许用户注册、续费、转让域名，并实现了域名的到期回收机制。

## 合约组成

该系统由四个主要合约组成：

1. **Web3ClubNFT**: 管理域名NFT的所有权、发行和销毁
2. **Web3ClubRegistry**: 处理域名注册、续费和过期回收的主合约
3. **Web3ClubGovernance**: 负责参数配置和治理的合约
4. **Web3ClubResolver**: 管理域名解析记录，与Cloudflare等DNS服务集成

## 功能特点

- **域名注册**：使用两步提交机制防止抢注
- **域名续费**：支持按年续费，最长可续费10年
- **NFT管理**：每个域名对应一个唯一的ERC721 NFT
- **自动续费**：用户可预存资金实现自动续费
- **灵活定价**：短域名（3-5字符）支持特殊定价
- **生命周期管理**：实现域名的注册、冻结、回收等完整生命周期
- **DNS解析支持**：域名可以解析到实际服务器
- **与Cloudflare集成**：实现链上和链下的域名解析同步

## 合约架构

系统由三个主要合约组成：

1. **Web3ClubRegistry**：主要的域名注册管理合约，处理域名注册、续费和回收等核心业务逻辑
2. **Web3ClubNFT**：域名NFT管理合约，实现ERC721标准，管理域名的NFT化
3. **Web3ClubGovernance**：治理合约，负责系统配置参数的管理

## 域名状态生命周期

域名在系统中具有以下状态：

- **Available**：未注册，可供注册
- **Active**：已注册且有效
- **Frozen**：已过期但在宽限期内（30天内），可原价续费
- **Reclaimed**：超过宽限期，进入回收期（30-90天），需支付罚金续费或等待域名释放

## 技术要求

- Solidity >= 0.8.17
- Node.js >= 14
- Hardhat框架

## 部署步骤

1. 安装依赖：

```bash
npm install
```

2. 编译合约：

```bash
npx hardhat compile
```

3. 部署合约：

```bash
npx hardhat run scripts/deploy.js --network <网络名称>
```

4. 部署解析器合约
```bash
npx hardhat run scripts/deploy-resolver.js --network <网络名称>
```

## 配置合约

部署完成后，需要进行合约之间的关联配置：

```bash
npx hardhat run scripts/configure-resolver.js --network <网络名称>
```

## 解析系统

解析系统由以下部分组成：
- `Web3ClubResolver`智能合约：管理链上解析记录
- Cloudflare同步服务：将链上解析记录同步到DNS

详细配置说明请参考 [解析系统文档](./scripts/cloudflare-sync/README.md)

## 测试

```bash
npx hardhat test
```

## 主网合约地址

- NFT合约: `0x...`
- Registry合约: `0x...`
- Governance合约: `0x...`
- Resolver合约: `0x...`

## 使用示例

### 域名注册过程

1. 用户提交域名哈希和押金：

```javascript
// 1. 生成域名提交哈希
const name = "myname";  // 域名名称
const owner = "0x...";  // 所有者地址
const secret = "mysecret";  // 秘密字符串
const commitment = await registryContract.makeCommitment(name, owner, secret);

// 2. 提交域名哈希和押金
await registryContract.commit(commitment, { value: ethers.utils.parseEther("0.001") });

// 3. 等待至少2个区块后，提交明文域名完成注册
// ... 等待至少2个区块 ...
await registryContract.register(
    name, 
    owner, 
    secret, 
    1,  // 注册1年
    { value: ethers.utils.parseEther("0.01") }  // 支付首年费用
);
```

### 域名续费

```javascript
await registryContract.renew(
    "myname",  // 域名名称
    2,         // 续费2年
    { value: ethers.utils.parseEther("0.02") }  // 支付续费费用
);
```

## 治理参数

以下参数可由管理员修改：

- 基础年费价格
- 押金金额
- 续费罚金比例
- 保留名称列表
- 短域名溢价

## 安全考虑

- 使用防重入锁（ReentrancyGuard）保护关键函数
- 实现两步提交机制防止域名抢注
- 使用CEI模式（Checks-Effects-Interactions）
- 合约间权限控制，只允许注册合约调用NFT合约的关键功能

项目包含三个主要合约：
1. Web3ClubNFT.sol
2. Web3ClubGovernance.sol
3. Web3ClubRegistry.sol

根据deploy.js脚本可以看出部署顺序，以及如何设置它们之间的关系：

部署顺序：
1. 先部署NFT合约 (Web3ClubNFT)
2. 再部署治理合约 (Web3ClubGovernance)
3. 最后部署注册管理合约 (Web3ClubRegistry)
4. 设置合约间的关系：
   - 设置NFT合约的Registry地址
   - 设置Registry合约的NFT地址和Governance地址

各合约功能：
1. Web3ClubNFT：
   - 管理域名的NFT表示
   - 实现ERC721标准
   - 跟踪域名的所有权和过期时间
   - 提供铸造、更新和销毁域名NFT的功能

2. Web3ClubGovernance：
   - 管理系统参数，如费用、押金、罚金比例等
   - 维护保留名称列表
   - 管理管理员权限
   - 计算域名年费

3. Web3ClubRegistry：
   - 主要的域名注册和管理合约
   - 处理域名注册、续费、回收流程
   - 管理域名状态
   - 处理用户押金和自动续费资金

我需要完善README来详细说明这些内容。

## 手动部署顺序

在手动部署Web3.club二级域名系统时，需要按照以下顺序部署三个核心合约，并正确设置它们之间的关系：

### 1. 首先部署 Web3ClubNFT 合约
这是域名NFT的基础合约，需要最先部署。

### 2. 其次部署 Web3ClubGovernance 合约
治理合约负责系统参数管理，不依赖其他合约，可以第二个部署。

### 3. 最后部署 Web3ClubRegistry 合约
注册管理合约需要与前两个合约交互，因此最后部署。

### 4. 设置合约之间的关系
部署完三个合约后，需要进行以下设置：
- 调用 `nftContract.setRegistryContract(registryContract.address)` 设置NFT合约的Registry地址
- 调用 `registryContract.setNFTContract(nftContract.address)` 设置Registry合约的NFT合约地址
- 调用 `registryContract.setGovernanceContract(governanceContract.address)` 设置Registry合约的治理合约地址

## 各合约功能详解

### Web3ClubNFT 合约
**主要功能**：
- 实现ERC721标准，将域名表示为NFT代币
- 管理域名ID和字符串之间的映射关系
- 存储域名注册信息，包括注册时间、过期时间和所有者
- 提供域名NFT的铸造、更新过期时间和销毁功能
- 确保NFT转移时同步更新域名所有者信息

**关键函数**：
- `mint`: 铸造新的域名NFT
- `updateExpiryTime`: 更新域名过期时间
- `burn`: 销毁过期域名的NFT
- `getDomainInfo`: 获取域名信息
- `getTokenId`/`getDomainName`: 域名与TokenID互相查询

### Web3ClubGovernance 合约
**主要功能**：
- 管理系统全局参数，如基础年费、押金金额、罚金比例等
- 维护保留域名列表（如admin, www等）
- 管理系统管理员权限
- 实现域名定价策略，包括对短域名的特殊定价

**关键函数**：
- `setBaseYearlyFee`: 设置基础年费
- `setDepositAmount`: 设置押金金额
- `setLateRenewalPenalty`: 设置逾期续费罚金比例
- `addReservedName`/`removeReservedName`: 管理保留域名
- `addAdministrator`/`removeAdministrator`: 管理系统管理员
- `calculateYearlyFee`: 计算域名年费（考虑长度因素）

### Web3ClubRegistry 合约
**主要功能**：
- 实现域名注册的两步提交机制，防止抢注
- 处理域名的完整生命周期管理（注册、续费、过期、回收）
- 管理用户押金和自动续费资金
- 验证域名合法性，包括命名规则检查
- 处理域名状态转换和相应的事件通知

**关键函数**：
- `commit`: 提交域名注册申请（第一步）
- `register`: 完成域名注册（第二步）
- `renew`: 域名续费
- `reclaimExpiredDomain`: 回收过期域名
- `executeAutoRenewal`: 执行自动续费
- `getDomainStatus`: 获取域名当前状态
- `isValidDomainName`: 验证域名是否合法

## 合约协作方式

这三个合约通过以下方式协同工作：

1. **Registry合约作为中心**：
   - 用户与Registry合约交互，进行注册、续费和回收等操作
   - Registry调用Governance获取配置参数和规则
   - Registry调用NFT合约管理域名的NFT表示

2. **权限与安全控制**：
   - 只有Registry合约可以调用NFT合约的关键函数（通过`onlyRegistry`修饰器）
   - Governance合约实现管理员权限控制（通过`onlyAdmin`修饰器）

3. **数据流转**：
   - 用户提交域名注册 → Registry验证并收取费用 → NFT合约铸造代币 → 域名激活
   - 用户申请续费 → Registry验证并收取费用 → NFT合约更新过期时间
   - 域名过期回收 → Registry请求 → NFT合约销毁代币

## 部署后的验证步骤

成功部署所有合约并设置关系后，建议执行以下验证步骤：

1. 验证合约关系设置是否正确：
   - 确认NFT合约的Registry地址已正确设置
   - 确认Registry合约的NFT和Governance地址已正确设置

2. 测试基本功能：
   - 注册一个测试域名（经过两步提交流程）
   - 验证域名NFT是否成功铸造
   - 执行域名续费并验证过期时间是否正确更新

3. 测试管理功能：
   - 添加/移除保留域名
   - 调整费用参数
   - 尝试注册保留域名（应失败）

这样的部署和验证流程可确保Web3.club二级域名系统的安全和正确运行。

## 许可证

MIT 

## Remix中测试Web3.club域名系统的精确操作流程

根据您提供的ABI检查，以下是完善后的测试流程，确保与合约定义完全匹配：

## 合约初始化

1. **设置NFT合约地址**
   - 函数: `setNFTContract(address _nftContract)`
   - 输入: Web3ClubNFT合约地址
   - 执行: 点击"transact"

2. **设置治理合约地址**
   - 函数: `setGovernanceContract(address _governanceContract)`
   - 输入: Web3ClubGovernance合约地址
   - 执行: 点击"transact"

3. **在NFT合约中设置Registry地址**
   - 切换到Web3ClubNFT合约
   - 函数: `setRegistryContract(address registryContract_)`
   - 输入: Web3ClubRegistry合约地址
   - 执行: 点击"transact"

## 域名注册测试流程

1. **查询域名是否有效**
   - 函数: `isValidDomainName(string name)`
   - 输入: 域名名称，如"abingyyds"
   - 执行: 点击"call"，确认返回`true`

2. **生成承诺哈希**
   - 函数: `makeCommitment(string name, address owner, string secret)`
   - 输入:
     - name: 域名名称，如"abingyyds"
     - owner: 您的钱包地址，如"0xba03CD7d4b6ACdaC86e3591f4C8EFD8fFB93a340"
     - secret: 秘密字符串，如"mysecret123"
   - 执行: 点击"call"，复制返回的bytes32哈希值

0xc61c1eac3c5244f532ea633fb0c441b7b1ef6e6d3a972e07eedba46fcb0e718f

3. **查询押金金额**
   - 切换到Web3ClubGovernance合约
   - 函数: `depositAmount()`
   - 执行: 点击"call"，记下押金金额

1000000000000000

4. **提交承诺**
   - 切换回Web3ClubRegistry合约
   - 函数: `commit(bytes32 commitment)`
   - 输入: 第2步生成的哈希值
   - Value: 至少等于步骤3中查询的押金金额
   - 执行: 点击"transact"

0xc61c1eac3c5244f532ea633fb0c441b7b1ef6e6d3a972e07eedba46fcb0e718f

5. **查询年度费用**
   - 切换到Web3ClubGovernance合约
   - 函数: `calculateYearlyFee(string name)`
   - 输入: 域名名称，如"abingyyds"
   - 执行: 点击"call"，记下年度费用

1000000000000000

6. **等待最小提交时间**
   - 查询最小提交时间: 在Registry合约中调用`minCommitmentAge()`
   - 等待相应的区块数，在Remix中可以多点几次其他交易来推进区块

7. **注册域名**
   - 切换回Web3ClubRegistry合约
   - 函数: `register(string name, address owner, string secret, uint256 duration)`
   - 输入:
     - name: 与步骤2相同的域名名称
     - owner: 与步骤2相同的钱包地址
     - secret: 与步骤2相同的秘密字符串
     - duration: 注册年限，如"1"
   - Value: 至少等于(年度费用 × 年限)
   - 执行: 点击"transact"

## 查询域名信息

1. **查询域名状态**
   - 函数: `getDomainStatus(string name)`
   - 输入: 域名名称
   - 执行: 点击"call"
   - 解读返回值: 0=Available, 1=Active, 2=Frozen, 3=Reclaimed

2. **查询域名NFT的TokenID**
   - 切换到Web3ClubNFT合约
   - 函数: `getTokenId(string domainName)`
   - 输入: 域名名称
   - 执行: 点击"call"

3. **查询域名详细信息**
   - 仍在Web3ClubNFT合约
   - 函数: `getDomainInfo(string domainName)`
   - 输入: 域名名称
   - 执行: 点击"call"
   - 返回: 包含registrationTime、expiryTime和registrant的结构体

## 域名续费测试

1. **手动续费**
   - 切换回Web3ClubRegistry合约
   - 函数: `renew(string name, uint256 duration)`
   - 输入:
     - name: 域名名称
     - duration: 续费年限，如"2"
   - Value: 至少等于(年度费用 × 年限)
   - 执行: 点击"transact"

Value没有填写也直接成功了交易

2. **添加自动续费资金**
   - 函数: `addRenewalFunds(string name)`
   - 输入: 域名名称
   - Value: 您想添加的金额
   - 执行: 点击"transact"

3. **查询自动续费资金余额**
   - 函数: `autoRenewalFunds(string)`
   - 输入: 域名名称
   - 执行: 点击"call"

4. **执行自动续费**
   - 函数: `executeAutoRenewal(string name, uint256 duration)`
   - 输入:
     - name: 域名名称
     - duration: 续费年限
   - 执行: 点击"transact"

## 押金管理测试

1. **存入押金**
   - 函数: `deposit()`
   - Value: 您想存入的金额
   - 执行: 点击"transact"

2. **查询押金余额**
   - 函数: `userDeposits(address)`
   - 输入: 您的钱包地址
   - 执行: 点击"call"

3. **提取押金**
   - 函数: `withdraw(uint256 amount)`
   - 输入: 您想提取的金额
   - 执行: 点击"transact"

## 域名回收测试

1. **查询域名状态确认是否可回收**
   - 函数: `getDomainStatus(string name)`
   - 输入: 域名名称
   - 执行: 点击"call"，确认返回值为3(Reclaimed)

2. **回收过期域名**
   - 函数: `reclaimExpiredDomain(string name)`
   - 输入: 域名名称
   - 执行: 点击"transact"

## 重要提示

1. **精确匹配参数类型**
   - bytes32类型参数必须传入正确格式的哈希值，而不是字符串
   - 地址类型参数必须格式正确，包含"0x"前缀

2. **Value字段使用**
   - 对于payable函数，确保Value字段输入的金额足够
   - 金额单位默认为wei，可以从下拉菜单选择其他单位如ether

3. **交易顺序**
   - 严格按照顺序执行：先makeCommitment → 再commit → 等待 → 最后register
   - 在每个步骤确认交易成功后再进行下一步

4. **调试技巧**
   - 如果交易失败，查看Remix控制台的错误信息
   - 使用`call`代替`transact`来模拟交易并查看潜在错误（适用于非mutating函数）

按照这个精确流程测试，应该可以完整验证Web3.club域名系统的所有功能。每个步骤都严格匹配ABI中定义的函数签名和参数类型。

## 合约函数调用权限

### Web3ClubNFT 合约函数权限

| 函数 | 权限 | 说明 |
| --- | --- | --- |
| `setRegistryContract` | onlyOwner | 只有合约所有者可以设置Registry合约地址 |
| `mint` | onlyRegistry | 只有Registry合约可以铸造新的域名NFT |
| `updateExpiryTime` | onlyRegistry | 只有Registry合约可以更新域名过期时间 |
| `burn` | onlyRegistry | 只有Registry合约可以销毁域名NFT |
| `getDomainInfo` | 公开 | 任何人可以查询域名信息 |
| `getDomainName` | 公开 | 任何人可以通过tokenId查询域名 |
| `getTokenId` | 公开 | 任何人可以通过域名查询tokenId |
| `getFullDomainName` | 公开 | 任何人可以查询完整域名（带.web3.club后缀） |

### Web3ClubGovernance 合约函数权限

| 函数 | 权限 | 说明 |
| --- | --- | --- |
| `setBaseYearlyFee` | onlyAdmin | 只有管理员可以设置基础年费 |
| `setDepositAmount` | onlyAdmin | 只有管理员可以设置押金金额 |
| `setLateRenewalPenalty` | onlyAdmin | 只有管理员可以设置逾期续费罚金比例 |
| `addReservedName` | onlyAdmin | 只有管理员可以添加保留名称 |
| `addReservedNames` | onlyAdmin | 只有管理员可以批量添加保留名称 |
| `removeReservedName` | onlyAdmin | 只有管理员可以移除保留名称 |
| `addAdministrator` | onlyOwner | 只有合约所有者可以添加管理员 |
| `removeAdministrator` | onlyOwner | 只有合约所有者可以移除管理员 |
| `setShortNamePremiumFee` | onlyAdmin | 只有管理员可以设置短域名溢价 |
| `isReserved` | 公开 | 任何人可以查询名称是否被保留 |
| `calculateYearlyFee` | 公开 | 任何人可以计算域名年费 |

### Web3ClubRegistry 合约函数权限

| 函数 | 权限 | 说明 |
| --- | --- | --- |
| `setNFTContract` | onlyOwner | 只有合约所有者可以设置NFT合约地址 |
| `setGovernanceContract` | onlyOwner | 只有合约所有者可以设置治理合约地址 |
| `isValidDomainName` | 公开 | 任何人可以验证域名是否合法 |
| `makeCommitment` | 公开 | 任何人可以生成域名提交哈希 |
| `commit` | 公开 | 任何人可以提交域名注册申请 |
| `register` | 公开 | 任何人可以注册域名（需先commit） |
| `renew` | 公开 | 只有域名所有者可以续费（内部验证） |
| `addRenewalFunds` | 公开 | 任何人可以为域名添加自动续费资金 |
| `getDomainStatus` | 公开 | 任何人可以查询域名状态 |
| `reclaimExpiredDomain` | 公开 | 任何人可以回收过期域名 |
| `executeAutoRenewal` | 公开 | 任何人可以执行自动续费 |
| `deposit` | 公开 | 任何人可以存入押金 |
| `withdraw` | 公开 | 任何人可以提取自己的押金 |
| `withdrawContractBalance` | onlyOwner | 只有合约所有者可以提取合约收入 |

### Web3ClubResolver 合约函数权限

| 函数 | 权限 | 说明 |
| --- | --- | --- |
| `setNFTContract` | onlyOwner | 只有合约所有者可以设置NFT合约地址 |
| `setRegistryContract` | onlyOwner | 只有合约所有者可以设置Registry合约地址 |
| `setRecord` | onlyDomainOwner + domainActive | 只有活跃域名的所有者可以设置解析记录 |
| `setBatchRecords` | onlyDomainOwner + domainActive | 只有活跃域名的所有者可以批量设置解析记录 |
| `removeRecord` | onlyDomainOwner | 只有域名所有者可以移除解析记录 |
| `getRecord` | 公开 | 任何人可以查询域名解析记录 |
| `getRecordDetails` | 公开 | 任何人可以查询域名解析记录详情 |
| `getAllRecordTypes` | 公开 | 任何人可以查询域名所有解析记录类型 |

## 安全审计结果

经过审计，以下是对合约可能存在的安全风险和建议：

### 主要风险点：

1. **费用计算与处理**：
   - **风险**：`register`和`renew`函数中的费用计算可能受到治理合约参数变化的影响
   - **建议**：考虑添加费用上限保护，防止管理员过度提高费用

2. **两步提交机制时间窗口**：
   - **风险**：`minCommitmentAge`和`maxCommitmentAge`参数控制着注册时间窗口
   - **建议**：确保这些参数设置合理，既能防止抢注又不会给正常用户带来不便

3. **域名回收机制**：
   - **风险**：`reclaimExpiredDomain`可被任何人调用，可能导致在回收期内的域名被非原所有者回收
   - **建议**：考虑添加原所有者优先回收期

4. **自动续费机制**：
   - **风险**：`executeAutoRenewal`函数可被任何人调用，可能在不理想的时间点触发续费
   - **建议**：考虑增加续费策略控制，如最低续费年限等

5. **合约间依赖**：
   - **风险**：三个合约之间存在紧密依赖，一个合约的问题可能影响整个系统
   - **建议**：考虑实现合约升级机制，以应对潜在问题

### 已有的安全措施：

1. **使用OpenZeppelin库**：合约使用了OpenZeppelin的标准库，如Ownable和ReentrancyGuard，提高了安全性

2. **权限控制**：各合约实现了严格的权限控制，关键操作只能由特定角色执行

3. **防重入保护**：关键资金操作函数使用了nonReentrant修饰器，防止重入攻击

4. **检查-效果-交互模式**：合约遵循CEI模式，先进行检查，然后修改状态，最后进行外部交互

5. **域名验证**：实现了完善的域名验证规则，包括长度检查、字符检查和保留名称检查

### 改进建议：

1. **价格预言机**：考虑使用Chainlink等预言机服务获取ETH价格，实现法币定价稳定性

2. **时间锁机制**：对关键参数修改添加时间锁，防止突然的参数变更

3. **紧急暂停**：添加紧急暂停功能，以应对潜在的安全事件

4. **事件监控**：为更多关键操作添加事件，便于监控和审计

5. **单元测试完善**：编写更全面的单元测试，特别是边界条件测试

这些安全审计结果仅作参考，建议在主网部署前进行专业的第三方安全审计。
