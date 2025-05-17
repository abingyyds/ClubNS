document.addEventListener('DOMContentLoaded', function() {
    // 初始化
    checkWalletConnection();
    
    // 直接模拟钱包已连接状态，确保数据显示
    if (!localStorage.getItem('walletConnected')) {
        console.log('强制设置钱包连接状态以显示数据');
        // 生成随机钱包地址并保存
        const randomAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', randomAddress);
        // 刷新页面
        window.location.reload();
    }
    
    // 如果已连接钱包，加载用户数据
    if (isWalletConnected()) {
        loadUserData();
    }
    
    // 绑定事件
    bindEvents();
    
    /**
     * 检查钱包连接状态
     */
    function checkWalletConnection() {
        const isConnected = localStorage.getItem('walletConnected') === 'true';
        const walletAddress = localStorage.getItem('walletAddress');
        
        if (isConnected && walletAddress) {
            // 更新UI为已连接状态
            document.getElementById('connectWallet').classList.add('d-none');
            document.getElementById('accountDropdown').classList.remove('d-none');
            
            // 显示钱包地址
            const displayAddress = walletAddress.substring(0, 6) + '...' + walletAddress.substring(walletAddress.length - 4);
            document.getElementById('walletAddress').textContent = displayAddress;
            document.getElementById('walletAddressCard').textContent = displayAddress;
            
            // 加载数据
            loadUserData();
        } else {
            // 显示连接钱包按钮
            document.getElementById('connectWallet').classList.remove('d-none');
            document.getElementById('accountDropdown').classList.add('d-none');
        }
    }
    
    /**
     * 判断是否已连接钱包
     */
    function isWalletConnected() {
        return localStorage.getItem('walletConnected') === 'true';
    }
    
    /**
     * 加载用户数据
     */
    function loadUserData() {
        loadWalletBalance();
        loadAccountDeposit();
        loadTransactionHistory();
        loadManagedClubs();
        loadJoinedClubs();
        loadMembershipCards();
        loadGlobalInheritancePolicy();
    }
    
    /**
     * 加载钱包余额
     */
    function loadWalletBalance() {
        simulateQuery('getWalletBalance').then(balance => {
            document.getElementById('walletBalance').textContent = balance + ' ETH';
        });
    }
    
    /**
     * 加载账户押金
     */
    function loadAccountDeposit() {
        simulateQuery('getAccountDeposit').then(deposit => {
            document.getElementById('accountDeposit').textContent = deposit + ' ETH';
        });
    }
    
    /**
     * 加载交易历史
     */
    function loadTransactionHistory() {
        simulateQuery('getTransactionHistory').then(transactions => {
            const tableBody = document.getElementById('transactionsTable').querySelector('tbody');
            tableBody.innerHTML = '';
            
            if (transactions && transactions.length > 0) {
                transactions.forEach(tx => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${tx.type}</td>
                        <td>${tx.amount} ETH</td>
                        <td>${formatDate(tx.date)}</td>
                        <td><span class="badge ${getBadgeClass(tx.status)}">${tx.status}</span></td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td colspan="4" class="text-center">No transaction records</td>
                `;
                tableBody.appendChild(row);
            }
        });
    }
    
    /**
     * 加载全局继承策略
     */
    function loadGlobalInheritancePolicy() {
        // 调用合约获取用户的全局继承策略
        simulateQuery('getUserAutoInheritancePolicy').then(policy => {
            document.getElementById('globalInheritancePolicy').value = policy;
        });
    }
    
    /**
     * 保存全局继承策略
     */
    function saveGlobalInheritancePolicy() {
        const policy = document.getElementById('globalInheritancePolicy').value;
        
        // 显示加载中提示
        showNotification('Saving global inheritance strategy...', 'info');
        
        // 调用合约设置用户全局继承策略
        simulateContract('setUserAutoInheritancePolicy', { policy: policy })
            .then(() => {
                showNotification('Global inheritance strategy saved successfully!', 'success');
            })
            .catch(error => {
                showNotification('Failed to save global inheritance strategy: ' + error.message, 'danger');
            });
    }
    
    /**
     * 加载我管理的俱乐部
     */
    function loadManagedClubs() {
        simulateQuery('getManagedClubs').then(clubs => {
            const container = document.getElementById('managedClubs');
            container.innerHTML = '';
            
            if (clubs && clubs.length > 0) {
                document.getElementById('noManagedClubs').classList.add('d-none');
                
                clubs.forEach(club => {
                    const card = createClubCard(club, true);
                    container.appendChild(card);
                });
            } else {
                document.getElementById('noManagedClubs').classList.remove('d-none');
            }
        });
    }
    
    /**
     * 加载我加入的俱乐部
     */
    function loadJoinedClubs() {
        simulateQuery('getJoinedClubs').then(clubs => {
            const container = document.getElementById('joinedClubs');
            container.innerHTML = '';
            
            if (clubs && clubs.length > 0) {
                document.getElementById('noJoinedClubs').classList.add('d-none');
                
                clubs.forEach(club => {
                    const card = createClubCard(club, false);
                    container.appendChild(card);
                });
            } else {
                document.getElementById('noJoinedClubs').classList.remove('d-none');
            }
        });
    }
    
    /**
     * 加载会员卡
     */
    function loadMembershipCards() {
        simulateQuery('getMembershipCards').then(cards => {
            const container = document.getElementById('membershipCards');
            container.innerHTML = '';
            
            if (cards && cards.length > 0) {
                document.getElementById('noMemberships').classList.add('d-none');
                
                cards.forEach(card => {
                    const cardElement = createMembershipCard(card);
                    container.appendChild(cardElement);
                });
            } else {
                document.getElementById('noMemberships').classList.remove('d-none');
            }
        });
    }
    
    /**
     * 创建俱乐部卡片
     */
    function createClubCard(club, isManaged) {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        
        col.innerHTML = `
            <div class="card h-100">
                <img src="${club.bannerUrl || 'https://placehold.co/800x200/cccccc/ffffff?text=Club'}" class="card-img-top" alt="${club.name}">
                <div class="card-body">
                    <h5 class="card-title">${club.name}</h5>
                    <p class="card-text">${club.description || 'No description'}</p>
                    <div class="d-flex align-items-center mb-3">
                        <i class="bi bi-people-fill me-2"></i>
                        <span>${club.memberCount} Members</span>
                    </div>
                    <div class="d-grid gap-2">
                        <a href="club.html?domain=${club.domain}" class="btn btn-outline-primary">
                            <i class="bi bi-box-arrow-in-right"></i> Enter Club
                        </a>
                        ${isManaged ? `
                        <a href="club-management.html?domain=${club.domain}" class="btn btn-primary">
                            <i class="bi bi-gear"></i> Manage Club
                        </a>
                        ` : ''}
                    </div>
                </div>
                <div class="card-footer text-muted">
                    ${club.domain}.web3.club
                </div>
            </div>
        `;
        
        return col;
    }
    
    /**
     * 创建会员卡
     */
    function createMembershipCard(card) {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        
        col.innerHTML = `
            <div class="card h-100 membership-card ${getCardClass(card.type)}">
                <div class="card-header">
                    <h5 class="card-title">${card.clubName}</h5>
                    <span class="badge ${getBadgeClass(card.type)}">${translateMembershipType(card.type)}</span>
                </div>
                <div class="card-body text-center">
                    <img src="${card.imageUrl || 'https://placehold.co/300x200/cccccc/ffffff?text=Membership Card'}" 
                         class="img-fluid rounded mb-3" 
                         style="max-height: 150px;" 
                         alt="${card.clubName} Membership Card">
                    <h5 class="card-title">Card #${card.tokenId}</h5>
                    <p class="card-text">Member Level: ${translateMembershipType(card.type)}</p>
                </div>
                <div class="card-footer">
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">Join Date: ${formatDate(card.issueDate)}</small>
                        ${card.expiryDate ? `
                        <small class="text-muted">Expiry Date: ${formatDate(card.expiryDate)}</small>
                        ` : '<small class="text-muted">Never Expires</small>'}
                    </div>
                </div>
            </div>
        `;
        
        return col;
    }
    
    /**
     * 绑定事件
     */
    function bindEvents() {
        // 连接钱包按钮点击事件
        document.getElementById('connectWallet').addEventListener('click', connectWallet);
        
        // 断开连接按钮点击事件
        document.getElementById('disconnectWallet').addEventListener('click', disconnectWallet);
        
        // 充值押金按钮点击事件
        document.getElementById('depositBtn').addEventListener('click', function() {
            // 实现充值功能
            const amount = prompt('Enter deposit amount (ETH):', '0.1');
            if (amount) {
                showNotification('Deposit transaction sent, please wait for confirmation...', 'info');
                
                // 模拟交易等待
                setTimeout(() => {
                    showNotification('Deposit successful!', 'success');
                    loadWalletBalance();
                    loadAccountDeposit();
                    loadTransactionHistory();
                }, 2000);
            }
        });
        
        // 提取押金按钮点击事件
        document.getElementById('withdrawBtn').addEventListener('click', function() {
            // 实现提取功能
            const amount = prompt('Enter withdrawal amount (ETH):', '0.1');
            if (amount) {
                showNotification('Withdrawal transaction sent, please wait for confirmation...', 'info');
                
                // 模拟交易等待
                setTimeout(() => {
                    showNotification('Withdrawal successful!', 'success');
                    loadWalletBalance();
                    loadAccountDeposit();
                    loadTransactionHistory();
                }, 2000);
            }
        });
        
        // 保存全局继承策略按钮点击事件
        document.getElementById('globalInheritanceForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveGlobalInheritancePolicy();
        });
    }
    
    /**
     * 连接钱包
     */
    function connectWallet() {
        // 模拟连接钱包
        const randomAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        
        // 保存连接状态
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', randomAddress);
        
        // 刷新连接状态
        checkWalletConnection();
        
        // 显示成功消息
        showNotification('Wallet connected successfully!', 'success');
    }
    
    /**
     * 断开钱包连接
     */
    function disconnectWallet() {
        // 清除连接状态
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
        
        // 刷新连接状态
        checkWalletConnection();
        
        // 显示成功消息
        showNotification('Wallet disconnected', 'info');
    }
    
    /**
     * 显示通知消息
     */
    function showNotification(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        alertDiv.style.zIndex = '1050';
        alertDiv.role = 'alert';
        
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // 自动关闭
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alertDiv);
            bsAlert.close();
        }, 3000);
    }
    
    /**
     * 获取会员类型对应的徽章样式
     */
    function getBadgeClass(type) {
        switch (type) {
            case '永久会员':
            case 'Permanent Member':
            case '成功':
            case 'Success':
                return 'bg-success';
            case '临时会员(月)':
            case '临时会员(季)':
            case '临时会员(年)':
            case 'Temporary Member (Monthly)':
            case 'Temporary Member (Quarterly)':
            case 'Temporary Member (Annual)':
            case '处理中':
            case 'Processing':
                return 'bg-primary';
            case '代币持有者':
            case 'Token Holder':
                return 'bg-info';
            case '失败':
            case 'Failed':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    }
    
    /**
     * 获取会员卡类型对应的卡片样式
     */
    function getCardClass(type) {
        switch (type) {
            case '永久会员':
            case 'Permanent Member':
                return 'border-success';
            case '临时会员(月)':
            case '临时会员(季)':
            case '临时会员(年)':
            case 'Temporary Member (Monthly)':
            case 'Temporary Member (Quarterly)':
            case 'Temporary Member (Annual)':
                return 'border-primary';
            case '代币持有者':
            case 'Token Holder':
                return 'border-info';
            default:
                return '';
        }
    }
    
    /**
     * 格式化日期
     */
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            return dateStr; // 如果不是有效日期，返回原字符串
        }
        return date.toLocaleDateString('zh-CN');
    }
    
    /**
     * 模拟查询请求
     */
    function simulateQuery(method, params = {}) {
        console.log(`Simulating query: ${method}`, params);
        
        return new Promise((resolve) => {
            setTimeout(() => {
                switch (method) {
                    case 'getWalletBalance':
                        resolve('1.56');
                        break;
                    case 'getAccountDeposit':
                        resolve('0.35');
                        break;
                    case 'getTransactionHistory':
                        resolve([
                            {
                                type: 'Deposit',
                                amount: '0.1',
                                date: '2023/6/15',
                                status: 'Success'
                            },
                            {
                                type: 'Buy Membership',
                                amount: '0.05',
                                date: '2023/6/20',
                                status: 'Success'
                            },
                            {
                                type: 'Buy Domain',
                                amount: '0.02',
                                date: '2023/7/5',
                                status: 'Success'
                            },
                            {
                                type: 'Set Resolution',
                                amount: '0.001',
                                date: '2023/7/10',
                                status: 'Success'
                            },
                            {
                                type: 'Renew Domain',
                                amount: '0.02',
                                date: '2023/8/12',
                                status: 'Success'
                            }
                        ]);
                        break;
                    case 'getManagedClubs':
                        resolve([
                            { 
                                name: 'Tech Enthusiasts', 
                                domain: 'tech', 
                                description: 'Discuss the latest technology trends and Web3 applications, exploring the intersection of blockchain, AI and metaverse.', 
                                memberCount: 48,
                                bannerUrl: 'https://placehold.co/800x200/4285F4/ffffff?text=Tech+Enthusiasts' 
                            },
                            { 
                                name: 'Art Collectors', 
                                domain: 'art', 
                                description: 'NFT art collection and sharing, bridging artists and collectors, exploring the future of digital art.', 
                                memberCount: 73,
                                bannerUrl: 'https://placehold.co/800x200/E1306C/ffffff?text=Art+Collectors' 
                            },
                            { 
                                name: 'Metaverse Pioneers', 
                                domain: 'metaverse', 
                                description: 'Focus on metaverse space building, virtual reality and augmented reality technology applications and development.', 
                                memberCount: 56,
                                bannerUrl: 'https://placehold.co/800x200/8E44AD/ffffff?text=Metaverse+Pioneers' 
                            }
                        ]);
                        break;
                    case 'getJoinedClubs':
                        resolve([
                            { 
                                name: 'Gamers Alliance', 
                                domain: 'gaming', 
                                description: 'A gathering place for blockchain game enthusiasts to share gaming experiences, strategies and latest GameFi updates.', 
                                memberCount: 126,
                                bannerUrl: 'https://placehold.co/800x200/2ECC71/ffffff?text=Gamers+Alliance' 
                            },
                            { 
                                name: 'Investment Research Club', 
                                domain: 'invest', 
                                description: 'Cryptocurrency investment research and market analysis, sharing investment insights and risk management strategies.', 
                                memberCount: 215,
                                bannerUrl: 'https://placehold.co/800x200/F39C12/ffffff?text=Investment+Research' 
                            },
                            { 
                                name: 'DAO Governance Lab', 
                                domain: 'dao', 
                                description: 'Explore governance models, voting mechanisms and community building methods for decentralized autonomous organizations.', 
                                memberCount: 89,
                                bannerUrl: 'https://placehold.co/800x200/3498DB/ffffff?text=DAO+Lab' 
                            },
                            { 
                                name: 'Developers Community', 
                                domain: 'dev', 
                                description: 'Web3 developer exchange platform, sharing smart contract development, DApp design and best practices.', 
                                memberCount: 153,
                                bannerUrl: 'https://placehold.co/800x200/E74C3C/ffffff?text=Dev+Community' 
                            }
                        ]);
                        break;
                    case 'getMembershipCards':
                        resolve([
                            {
                                clubName: 'Tech Enthusiasts',
                                tokenId: '423',
                                type: 'Permanent Member',
                                issueDate: '2023-06-20',
                                expiryDate: null,
                                imageUrl: 'https://placehold.co/300x200/4285F4/ffffff?text=Tech+Card'
                            },
                            {
                                clubName: 'Gamers Alliance',
                                tokenId: '1057',
                                type: 'Temporary Member (Quarterly)',
                                issueDate: '2023-07-15',
                                expiryDate: '2023-10-15',
                                imageUrl: 'https://placehold.co/300x200/2ECC71/ffffff?text=Gamers+Card'
                            },
                            {
                                clubName: 'Investment Research Club',
                                tokenId: '2196',
                                type: 'Token Holder',
                                issueDate: '2023-08-03',
                                expiryDate: null,
                                imageUrl: 'https://placehold.co/300x200/F39C12/ffffff?text=Investment+Card'
                            },
                            {
                                clubName: 'DAO Governance Lab',
                                tokenId: '3254',
                                type: 'Temporary Member (Annual)',
                                issueDate: '2023-09-01',
                                expiryDate: '2024-09-01',
                                imageUrl: 'https://placehold.co/300x200/3498DB/ffffff?text=DAO+Card'
                            },
                            {
                                clubName: 'Developers Community',
                                tokenId: '4872',
                                type: 'Temporary Member (Monthly)',
                                issueDate: '2023-10-05',
                                expiryDate: '2023-11-05',
                                imageUrl: 'https://placehold.co/300x200/E74C3C/ffffff?text=Dev+Card'
                            }
                        ]);
                        break;
                    case 'getUserAutoInheritancePolicy':
                        // 随机返回一个继承策略
                        const policies = ['Always', 'Never', 'Prompt'];
                        resolve(policies[Math.floor(Math.random() * policies.length)]);
                        break;
                    default:
                        resolve(null);
                }
            }, 500);
        });
    }
    
    /**
     * 模拟合约调用
     */
    function simulateContract(method, params = {}) {
        console.log(`Simulating contract call: ${method}`, params);
        
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // 随机模拟成功或失败
                if (Math.random() > 0.1) {
                    resolve(true);
                } else {
                    reject(new Error('Transaction failed'));
                }
            }, 1000);
        });
    }

    function translateMembershipType(type) {
        switch (type) {
            case '永久会员':
                return 'Permanent Member';
            case '临时会员(月)':
                return 'Temporary Member (Monthly)';
            case '临时会员(季)':
                return 'Temporary Member (Quarterly)';
            case '临时会员(年)':
                return 'Temporary Member (Annual)';
            case '代币持有者':
                return 'Token Holder';
            default:
                return type;
        }
    }
}); 