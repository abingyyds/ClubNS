document.addEventListener('DOMContentLoaded', function() {
    // 检查钱包连接状态
    function checkWalletConnection() {
        if (mockData.wallet.connected) {
            loadManagedClubs();
            loadJoinedClubs();
        } else {
            showNotification('请先连接钱包以查看您的俱乐部', 'warning');
        }
    }
    
    // 加载用户管理的俱乐部
    function loadManagedClubs() {
        // 模拟从区块链加载用户管理的俱乐部
        const managedClubs = [
            {
                domain: 'example1',
                name: 'Example1 俱乐部',
                members: 120,
                logo: 'https://placehold.co/200x200?text=E1',
                description: '这是Example1的官方俱乐部，欢迎加入！',
                isActive: true
            },
            {
                domain: 'example2',
                name: 'Example2 俱乐部',
                members: 45,
                logo: 'https://placehold.co/200x200?text=E2',
                description: '这是Example2的官方俱乐部，欢迎加入！',
                isActive: true
            }
        ];
        
        const managedClubsContainer = document.getElementById('managedClubs');
        managedClubsContainer.innerHTML = '';
        
        if (managedClubs.length > 0) {
            document.getElementById('noManagedClubs').classList.add('d-none');
            
            managedClubs.forEach(club => {
                const card = document.createElement('div');
                card.className = 'col-md-4 mb-4';
                card.innerHTML = `
                    <div class="card h-100">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">${club.name}</h5>
                            <span class="badge ${club.isActive ? 'bg-success' : 'bg-secondary'}">${club.isActive ? '活跃' : '暂停'}</span>
                        </div>
                        <div class="card-body">
                            <div class="d-flex mb-3">
                                <img src="${club.logo}" alt="${club.name}" class="rounded me-3" style="width: 64px; height: 64px;">
                                <div>
                                    <p class="card-text">${club.domain}.web3.club</p>
                                    <p class="card-text"><small class="text-muted">会员: ${club.members}人</small></p>
                                </div>
                            </div>
                            <p class="card-text">${club.description}</p>
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <a href="domain-details.html?domain=${club.domain}#club" class="btn btn-primary">管理</a>
                            <a href="#" class="btn btn-outline-secondary viewStats" data-domain="${club.domain}">查看统计</a>
                        </div>
                    </div>
                `;
                managedClubsContainer.appendChild(card);
            });
            
            // 添加查看统计按钮事件
            document.querySelectorAll('.viewStats').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const domain = this.getAttribute('data-domain');
                    showNotification(`正在加载 ${domain} 俱乐部的统计数据...`, 'info');
                    // 模拟加载统计数据
                    setTimeout(() => {
                        showNotification('此功能尚未实现。', 'warning');
                    }, 1000);
                });
            });
        } else {
            document.getElementById('noManagedClubs').classList.remove('d-none');
        }
    }
    
    // 加载用户加入的俱乐部
    function loadJoinedClubs() {
        // 模拟从区块链加载用户加入的俱乐部
        const joinedClubs = [
            {
                domain: 'community1',
                name: 'Community1 俱乐部',
                members: 350,
                logo: 'https://placehold.co/200x200?text=C1',
                description: '这是一个社区驱动的俱乐部，专注于区块链技术讨论。',
                membershipType: '永久会员',
                joinDate: '2023-05-10'
            },
            {
                domain: 'gaming',
                name: 'Gaming 俱乐部',
                members: 780,
                logo: 'https://placehold.co/200x200?text=G',
                description: '为游戏爱好者打造的Web3俱乐部，探索GameFi和NFT游戏。',
                membershipType: '临时会员',
                joinDate: '2023-06-15',
                expiryDate: '2023-07-15'
            },
            {
                domain: 'defi',
                name: 'DeFi 研究俱乐部',
                members: 560,
                logo: 'https://placehold.co/200x200?text=DeFi',
                description: '专注于去中心化金融研究和项目分析的专业俱乐部。',
                membershipType: '代币会员',
                joinDate: '2023-06-20'
            }
        ];
        
        const joinedClubsContainer = document.getElementById('joinedClubs');
        joinedClubsContainer.innerHTML = '';
        
        if (joinedClubs.length > 0) {
            document.getElementById('noJoinedClubs').classList.add('d-none');
            
            joinedClubs.forEach(club => {
                const card = document.createElement('div');
                card.className = 'col-md-4 mb-4';
                card.innerHTML = `
                    <div class="card h-100">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">${club.name}</h5>
                            <span class="badge ${club.membershipType === '永久会员' ? 'bg-success' : (club.membershipType === '临时会员' ? 'bg-primary' : 'bg-secondary')}">${club.membershipType}</span>
                        </div>
                        <div class="card-body">
                            <div class="d-flex mb-3">
                                <img src="${club.logo}" alt="${club.name}" class="rounded me-3" style="width: 64px; height: 64px;">
                                <div>
                                    <p class="card-text">${club.domain}.web3.club</p>
                                    <p class="card-text"><small class="text-muted">会员: ${club.members}人</small></p>
                                </div>
                            </div>
                            <p class="card-text">${club.description}</p>
                            <div class="mt-2">
                                <small class="text-muted">加入时间: ${club.joinDate}</small>
                                ${club.expiryDate ? `<br><small class="text-muted">到期时间: ${club.expiryDate}</small>` : ''}
                            </div>
                        </div>
                        <div class="card-footer">
                            <a href="#" class="btn btn-outline-primary viewClub" data-domain="${club.domain}">查看俱乐部</a>
                        </div>
                    </div>
                `;
                joinedClubsContainer.appendChild(card);
            });
            
            // 添加查看俱乐部按钮事件
            document.querySelectorAll('.viewClub').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const domain = this.getAttribute('data-domain');
                    showNotification(`正在加载 ${domain} 俱乐部详情...`, 'info');
                    // 模拟加载俱乐部详情
                    setTimeout(() => {
                        window.location.href = `explore-clubs.html?club=${domain}`;
                    }, 1000);
                });
            });
        } else {
            document.getElementById('noJoinedClubs').classList.remove('d-none');
        }
    }
    
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
    
    // 初始化
    checkWalletConnection();
}); 