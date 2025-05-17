document.addEventListener('DOMContentLoaded', function() {
    // 检查钱包连接状态
    function checkWalletConnection() {
        if (mockData.wallet.connected) {
            loadMemberships();
            loadUserInheritancePolicy();
        } else {
            showNotification('请先连接钱包以查看您的会员卡', 'warning');
        }
    }
    
    // 加载用户的会员资格
    function loadMemberships() {
        // 模拟从区块链加载用户的会员资格
        const permanentMemberships = [
            {
                domain: 'community1',
                name: 'Community1 俱乐部',
                logo: 'https://placehold.co/200x200?text=C1',
                tokenId: 123,
                issueDate: '2023-05-10',
                contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
                benefits: ['专属内容访问权', '俱乐部活动优先参与', '俱乐部投票权']
            },
            {
                domain: 'nft',
                name: 'NFT 收藏家俱乐部',
                logo: 'https://placehold.co/200x200?text=NFT',
                tokenId: 456,
                issueDate: '2023-04-20',
                contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
                benefits: ['专属NFT空投', '艺术家交流会', '定制NFT头像']
            }
        ];
        
        const temporaryMemberships = [
            {
                domain: 'gaming',
                name: 'Gaming 俱乐部',
                logo: 'https://placehold.co/200x200?text=G',
                tokenId: 789,
                issueDate: '2023-06-15',
                expiryDate: '2023-07-15',
                contractAddress: '0x2345678901abcdef2345678901abcdef23456789',
                benefits: ['游戏内道具优惠', '游戏测试资格', '每月游戏礼包']
            }
        ];
        
        const tokenMemberships = [
            {
                domain: 'defi',
                name: 'DeFi 研究俱乐部',
                logo: 'https://placehold.co/200x200?text=DeFi',
                tokenSymbol: 'DEFI',
                tokenAmount: 100,
                tokenAddress: '0x3456789012abcdef3456789012abcdef34567890',
                joinDate: '2023-06-20',
                benefits: ['市场分析报告', '项目评测服务', '投资策略分享']
            },
            {
                domain: 'dao',
                name: 'Web3 DAO 俱乐部',
                logo: 'https://placehold.co/200x200?text=DAO',
                tokenSymbol: 'DAO',
                tokenAmount: 50,
                tokenAddress: '0x4567890123abcdef4567890123abcdef45678901',
                joinDate: '2023-05-25',
                benefits: ['治理投票权', 'DAO项目孵化', '社区资源共享']
            }
        ];
        
        // 加载永久会员卡
        loadPermanentMemberships(permanentMemberships);
        
        // 加载临时会员卡
        loadTemporaryMemberships(temporaryMemberships);
        
        // 加载代币会员资格
        loadTokenMemberships(tokenMemberships);
    }
    
    // 加载永久会员卡
    function loadPermanentMemberships(memberships) {
        const container = document.getElementById('permanentMemberships');
        container.innerHTML = '';
        
        if (memberships.length > 0) {
            document.getElementById('noPermanentMemberships').classList.add('d-none');
            
            memberships.forEach(membership => {
                const card = document.createElement('div');
                card.className = 'col-md-4 mb-4';
                card.innerHTML = `
                    <div class="card h-100">
                        <div class="card-header bg-success text-white">
                            <h5 class="card-title mb-0">${membership.name}</h5>
                        </div>
                        <div class="card-body">
                            <div class="text-center mb-3">
                                <img src="${membership.logo}" alt="${membership.name}" class="rounded" style="width: 100px; height: 100px;">
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>Token ID:</span>
                                <span>#${membership.tokenId}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>发行日期:</span>
                                <span>${membership.issueDate}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>域名:</span>
                                <span>${membership.domain}.web3.club</span>
                            </div>
                        </div>
                        <div class="card-footer">
                            <button class="btn btn-outline-primary w-100 viewMembershipDetails" 
                                    data-bs-toggle="modal" 
                                    data-bs-target="#membershipDetailsModal"
                                    data-membership='${JSON.stringify(membership)}'>
                                查看详情
                            </button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
            
            // 添加查看详情按钮事件
            document.querySelectorAll('.viewMembershipDetails').forEach(btn => {
                btn.addEventListener('click', function() {
                    const membership = JSON.parse(this.getAttribute('data-membership'));
                    populateMembershipDetailsModal(membership, '永久会员');
                });
            });
        } else {
            document.getElementById('noPermanentMemberships').classList.remove('d-none');
        }
    }
    
    // 加载临时会员卡
    function loadTemporaryMemberships(memberships) {
        const container = document.getElementById('temporaryMemberships');
        container.innerHTML = '';
        
        if (memberships.length > 0) {
            document.getElementById('noTemporaryMemberships').classList.add('d-none');
            
            memberships.forEach(membership => {
                const card = document.createElement('div');
                card.className = 'col-md-4 mb-4';
                card.innerHTML = `
                    <div class="card h-100">
                        <div class="card-header bg-primary text-white">
                            <h5 class="card-title mb-0">${membership.name}</h5>
                        </div>
                        <div class="card-body">
                            <div class="text-center mb-3">
                                <img src="${membership.logo}" alt="${membership.name}" class="rounded" style="width: 100px; height: 100px;">
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>Token ID:</span>
                                <span>#${membership.tokenId}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>开始日期:</span>
                                <span>${membership.issueDate}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>到期日期:</span>
                                <span>${membership.expiryDate}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>域名:</span>
                                <span>${membership.domain}.web3.club</span>
                            </div>
                        </div>
                        <div class="card-footer">
                            <button class="btn btn-outline-primary w-100 viewMembershipDetails" 
                                    data-bs-toggle="modal" 
                                    data-bs-target="#membershipDetailsModal"
                                    data-membership='${JSON.stringify(membership)}'>
                                查看详情
                            </button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
            
            // 添加查看详情按钮事件
            document.querySelectorAll('.viewMembershipDetails').forEach(btn => {
                btn.addEventListener('click', function() {
                    const membership = JSON.parse(this.getAttribute('data-membership'));
                    populateMembershipDetailsModal(membership, '临时会员');
                });
            });
        } else {
            document.getElementById('noTemporaryMemberships').classList.remove('d-none');
        }
    }
    
    // 加载代币会员资格
    function loadTokenMemberships(memberships) {
        const container = document.getElementById('tokenMemberships');
        container.innerHTML = '';
        
        if (memberships.length > 0) {
            document.getElementById('noTokenMemberships').classList.add('d-none');
            
            memberships.forEach(membership => {
                const card = document.createElement('div');
                card.className = 'col-md-4 mb-4';
                card.innerHTML = `
                    <div class="card h-100">
                        <div class="card-header bg-secondary text-white">
                            <h5 class="card-title mb-0">${membership.name}</h5>
                        </div>
                        <div class="card-body">
                            <div class="text-center mb-3">
                                <img src="${membership.logo}" alt="${membership.name}" class="rounded" style="width: 100px; height: 100px;">
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>代币:</span>
                                <span>${membership.tokenAmount} ${membership.tokenSymbol}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>加入日期:</span>
                                <span>${membership.joinDate}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>状态:</span>
                                <span><i class="bi bi-check-circle-fill text-success"></i> 有效</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>域名:</span>
                                <span>${membership.domain}.web3.club</span>
                            </div>
                        </div>
                        <div class="card-footer">
                            <button class="btn btn-outline-primary w-100 viewMembershipDetails" 
                                    data-bs-toggle="modal" 
                                    data-bs-target="#membershipDetailsModal"
                                    data-membership='${JSON.stringify(membership)}'>
                                查看详情
                            </button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
            
            // 添加查看详情按钮事件
            document.querySelectorAll('.viewMembershipDetails').forEach(btn => {
                btn.addEventListener('click', function() {
                    const membership = JSON.parse(this.getAttribute('data-membership'));
                    populateMembershipDetailsModal(membership, '代币会员');
                });
            });
        } else {
            document.getElementById('noTokenMemberships').classList.remove('d-none');
        }
    }
    
    // 填充会员卡详情模态框
    function populateMembershipDetailsModal(membership, type) {
        document.getElementById('memberCardImage').src = membership.logo;
        document.getElementById('memberCardClubName').textContent = membership.name;
        document.getElementById('memberCardType').textContent = type;
        
        if (type === '永久会员' || type === '临时会员') {
            document.getElementById('memberCardTokenId').textContent = membership.tokenId;
            document.getElementById('memberCardIssueTime').textContent = membership.issueDate;
            document.getElementById('memberCardExpiryTime').textContent = type === '永久会员' ? '永不过期' : membership.expiryDate;
            document.getElementById('memberCardContractAddress').textContent = shortenAddress(membership.contractAddress);
            
            // 设置OpenSea链接
            const openSeaUrl = `https://opensea.io/assets/ethereum/${membership.contractAddress}/${membership.tokenId}`;
            document.getElementById('viewOnOpenSea').href = openSeaUrl;
            document.getElementById('viewOnOpenSea').classList.remove('d-none');
        } else {
            document.getElementById('memberCardTokenId').textContent = '不适用';
            document.getElementById('memberCardIssueTime').textContent = membership.joinDate;
            document.getElementById('memberCardExpiryTime').textContent = '持续持有代币期间';
            document.getElementById('memberCardContractAddress').textContent = shortenAddress(membership.tokenAddress);
            document.getElementById('viewOnOpenSea').classList.add('d-none');
        }
        
        // 填充会员权益
        const benefitsList = document.getElementById('memberCardBenefits');
        benefitsList.innerHTML = '';
        
        membership.benefits.forEach(benefit => {
            const li = document.createElement('li');
            li.textContent = benefit;
            benefitsList.appendChild(li);
        });
    }
    
    // 加载用户继承策略
    function loadUserInheritancePolicy() {
        // 模拟从区块链获取用户继承策略
        const policy = 'Always'; // 可能的值: Always, Never, Ask
        document.getElementById('userInheritancePolicy').value = policy;
    }
    
    // 保存用户继承策略
    document.getElementById('saveInheritancePolicyBtn').addEventListener('click', function() {
        const policy = document.getElementById('userInheritancePolicy').value;
        showNotification('正在保存继承策略...', 'info');
        
        // 模拟区块链交易
        setTimeout(() => {
            showNotification('继承策略保存成功！', 'success');
        }, 1500);
    });
    
    // 刷新会员状态
    document.getElementById('refreshMembershipsBtn').addEventListener('click', function() {
        showNotification('正在刷新会员状态...', 'info');
        
        // 模拟刷新
        setTimeout(() => {
            showNotification('会员状态已刷新！', 'success');
            loadMemberships();
        }, 1500);
    });
    
    // 通知函数
    function showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        const toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            const container = document.createElement('div');
            container.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(container);
            container.appendChild(toast);
        } else {
            toastContainer.appendChild(toast);
        }
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }
    
    // 缩短地址显示
    function shortenAddress(address) {
        return address.substring(0, 6) + '...' + address.substring(address.length - 4);
    }
    
    // 初始化
    checkWalletConnection();
}); 