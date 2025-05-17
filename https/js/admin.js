document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const walletNotConnected = document.getElementById('walletNotConnected');
    const notAdmin = document.getElementById('notAdmin');
    const adminContent = document.getElementById('adminContent');
    
    // 仪表盘
    const activeDomains = document.getElementById('activeDomains');
    const frozenDomains = document.getElementById('frozenDomains');
    const reclaimedDomains = document.getElementById('reclaimedDomains');
    const contractBalance = document.getElementById('contractBalance');
    const totalDomains = document.getElementById('totalDomains');
    const baseYearlyFee = document.getElementById('baseYearlyFee');
    const depositAmount = document.getElementById('depositAmount');
    const penaltyPercentage = document.getElementById('penaltyPercentage');
    
    // 初始化页面
    initPage();
    
    // 绑定事件
    // 系统设置
    document.getElementById('saveContractAddressesBtn')?.addEventListener('click', saveContractAddresses);
    
    // 价格管理
    document.getElementById('saveBasicPriceBtn')?.addEventListener('click', saveBasicPrice);
    document.getElementById('saveShortNamePremiumBtn')?.addEventListener('click', saveShortNamePremium);
    
    // 保留名称
    document.getElementById('saveReservedNameBtn')?.addEventListener('click', saveReservedName);
    
    // 管理员管理
    document.getElementById('saveAdminBtn')?.addEventListener('click', saveAdmin);
    
    // 财务管理
    document.getElementById('withdrawContractBalanceBtn')?.addEventListener('click', withdrawContractBalance);
    
    // 过期域名
    document.getElementById('batchReclaimBtn')?.addEventListener('click', batchReclaimDomains);
    
    // 绑定删除按钮事件
    document.querySelectorAll('[data-action="remove-reserved"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const name = this.closest('tr').querySelector('td:first-child').textContent;
            removeReservedName(name);
        });
    });
    
    document.querySelectorAll('[data-action="remove-admin"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const address = this.closest('tr').querySelector('td:first-child').textContent;
            removeAdmin(address);
        });
    });
    
    document.querySelectorAll('[data-action="reclaim-domain"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const domain = this.closest('tr').querySelector('td:first-child').textContent;
            reclaimDomain(domain);
        });
    });
    
    // 初始化页面
    function initPage() {
        if (!mockData.wallet.connected) {
            // 未连接钱包
            walletNotConnected.classList.remove('d-none');
            notAdmin.classList.add('d-none');
            adminContent.classList.add('d-none');
            return;
        }
        
        // 检查是否是管理员
        const isAdmin = mockData.admins.some(admin => 
            admin.address.toLowerCase() === mockData.wallet.address.toLowerCase()
        );
        
        if (!isAdmin) {
            // 不是管理员
            walletNotConnected.classList.add('d-none');
            notAdmin.classList.remove('d-none');
            adminContent.classList.add('d-none');
            return;
        }
        
        // 是管理员
        walletNotConnected.classList.add('d-none');
        notAdmin.classList.add('d-none');
        adminContent.classList.remove('d-none');
        
        // 初始化仪表盘
        initDashboard();
        
        // 初始化系统设置
        initSystemSettings();
        
        // 初始化价格管理
        initPriceSettings();
        
        // 初始化保留名称
        initReservedNames();
        
        // 初始化管理员管理
        initAdmins();
        
        // 初始化财务管理
        initFinance();
        
        // 初始化过期域名
        initExpiredDomains();
    }
    
    // 初始化仪表盘
    function initDashboard() {
        // 统计域名状态
        let active = 0;
        let frozen = 0;
        let reclaimed = 0;
        
        mockData.domains.forEach(domain => {
            const { status } = utils.calculateDomainStatus(domain);
            switch (status) {
                case 'active':
                    active++;
                    break;
                case 'frozen':
                    frozen++;
                    break;
                case 'reclaimed':
                    reclaimed++;
                    break;
            }
        });
        
        // 更新仪表盘
        activeDomains.textContent = active.toLocaleString();
        frozenDomains.textContent = frozen.toLocaleString();
        reclaimedDomains.textContent = reclaimed.toLocaleString();
        contractBalance.textContent = mockData.contractBalance;
        totalDomains.textContent = mockData.domains.length.toLocaleString();
        baseYearlyFee.textContent = `${mockData.settings.baseYearlyFee} ETH`;
        depositAmount.textContent = `${mockData.settings.depositAmount} ETH`;
        penaltyPercentage.textContent = `${mockData.settings.lateRenewalPenalty}%`;
        
        // 加载最近注册域名
        loadRecentRegistrations();
    }
    
    // 加载最近注册域名
    function loadRecentRegistrations() {
        const recentRegistrationsTable = document.getElementById('recentRegistrationsTable');
        if (!recentRegistrationsTable) return;
        
        // 按注册时间排序，取最近10个
        const recentDomains = [...mockData.domains]
            .sort((a, b) => new Date(b.registrationTime) - new Date(a.registrationTime))
            .slice(0, 10);
        
        // 清空表格
        recentRegistrationsTable.innerHTML = '';
        
        // 添加域名行
        recentDomains.forEach(domain => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${domain.fullName}</td>
                <td>${utils.formatAddress(domain.owner)}</td>
                <td>${utils.formatDate(domain.registrationTime)}</td>
                <td>${utils.formatDate(domain.expiryTime)}</td>
            `;
            
            recentRegistrationsTable.appendChild(row);
        });
    }
    
    // 初始化系统设置
    function initSystemSettings() {
        // 假设合约地址
        document.getElementById('nftContractAddress').value = '0x1234567890123456789012345678901234567890';
        document.getElementById('governanceContractAddress').value = '0x2345678901234567890123456789012345678901';
        document.getElementById('registryContractAddress').value = '0x3456789012345678901234567890123456789012';
        document.getElementById('resolverContractAddress').value = '0x4567890123456789012345678901234567890123';
    }
    
    // 保存合约地址
    function saveContractAddresses() {
        alert('合约地址已更新（模拟）');
    }
    
    // 初始化价格管理
    function initPriceSettings() {
        // 基础价格
        document.getElementById('baseYearlyFeeInput').value = mockData.settings.baseYearlyFee;
        document.getElementById('depositAmountInput').value = mockData.settings.depositAmount;
        document.getElementById('penaltyPercentageInput').value = mockData.settings.lateRenewalPenalty;
        
        // 短域名溢价
        document.getElementById('premiumLength3').value = mockData.settings.shortNamePremiums[3];
        document.getElementById('premiumLength4').value = mockData.settings.shortNamePremiums[4];
        document.getElementById('premiumLength5').value = mockData.settings.shortNamePremiums[5];
    }
    
    // 保存基础价格
    function saveBasicPrice() {
        // 获取输入值
        const baseYearlyFee = document.getElementById('baseYearlyFeeInput').value;
        const depositAmount = document.getElementById('depositAmountInput').value;
        const penaltyPercentage = document.getElementById('penaltyPercentageInput').value;
        
        // 更新模拟数据
        mockData.settings.baseYearlyFee = baseYearlyFee;
        mockData.settings.depositAmount = depositAmount;
        mockData.settings.lateRenewalPenalty = parseInt(penaltyPercentage);
        
        // 刷新仪表盘
        initDashboard();
        
        alert('基础价格设置已更新');
    }
    
    // 保存短域名溢价
    function saveShortNamePremium() {
        // 获取输入值
        const premiumLength3 = document.getElementById('premiumLength3').value;
        const premiumLength4 = document.getElementById('premiumLength4').value;
        const premiumLength5 = document.getElementById('premiumLength5').value;
        
        // 更新模拟数据
        mockData.settings.shortNamePremiums[3] = parseFloat(premiumLength3);
        mockData.settings.shortNamePremiums[4] = parseFloat(premiumLength4);
        mockData.settings.shortNamePremiums[5] = parseFloat(premiumLength5);
        
        alert('短域名溢价设置已更新');
    }
    
    // 初始化保留名称
    function initReservedNames() {
        const reservedNamesTable = document.getElementById('reservedNamesTable');
        if (!reservedNamesTable) return;
        
        // 清空表格
        reservedNamesTable.innerHTML = '';
        
        // 添加保留名称
        mockData.reservedNames.forEach(name => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${name}</td>
                <td>2023-01-01</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" data-action="remove-reserved">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            
            // 绑定删除按钮事件
            row.querySelector('[data-action="remove-reserved"]').addEventListener('click', function() {
                removeReservedName(name);
            });
            
            reservedNamesTable.appendChild(row);
        });
    }
    
    // 移除保留名称
    function removeReservedName(name) {
        if (confirm(`确定要移除保留名称 "${name}" 吗？`)) {
            // 从列表中移除
            const index = mockData.reservedNames.indexOf(name);
            if (index !== -1) {
                mockData.reservedNames.splice(index, 1);
                
                // 刷新列表
                initReservedNames();
            }
        }
    }
    
    // 保存保留名称
    function saveReservedName() {
        // 获取单个名称
        const name = document.getElementById('reservedName').value.trim().toLowerCase();
        
        // 获取批量名称
        const batchNames = document.getElementById('batchReservedNames').value
            .split('\n')
            .map(n => n.trim().toLowerCase())
            .filter(n => n);
        
        // 合并名称
        const namesToAdd = [];
        if (name) namesToAdd.push(name);
        namesToAdd.push(...batchNames);
        
        // 添加到保留名称列表
        namesToAdd.forEach(n => {
            if (n && !mockData.reservedNames.includes(n)) {
                mockData.reservedNames.push(n);
            }
        });
        
        // 刷新列表
        initReservedNames();
        
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('addReservedModal'));
        modal.hide();
        
        alert(`已添加 ${namesToAdd.length} 个保留名称`);
    }
    
    // 初始化管理员管理
    function initAdmins() {
        const adminsTable = document.getElementById('adminsTable');
        if (!adminsTable) return;
        
        // 清空表格
        adminsTable.innerHTML = '';
        
        // 添加管理员
        mockData.admins.forEach(admin => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${admin.address}</td>
                <td>${utils.formatDate(admin.addedAt)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" data-action="remove-admin">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            
            // 绑定删除按钮事件
            row.querySelector('[data-action="remove-admin"]').addEventListener('click', function() {
                removeAdmin(admin.address);
            });
            
            adminsTable.appendChild(row);
        });
    }
    
    // 移除管理员
    function removeAdmin(address) {
        if (confirm(`确定要移除管理员 "${utils.formatAddress(address)}" 吗？`)) {
            // 从列表中移除
            const index = mockData.admins.findIndex(a => a.address === address);
            if (index !== -1) {
                mockData.admins.splice(index, 1);
                
                // 刷新列表
                initAdmins();
            }
        }
    }
    
    // 保存管理员
    function saveAdmin() {
        // 获取管理员地址
        const address = document.getElementById('adminAddress').value.trim();
        
        // 验证地址
        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            alert('请输入有效的地址');
            return;
        }
        
        // 检查是否已存在
        if (mockData.admins.some(a => a.address === address)) {
            alert('该地址已经是管理员');
            return;
        }
        
        // 添加到管理员列表
        mockData.admins.push({
            address,
            addedAt: new Date().toISOString()
        });
        
        // 刷新列表
        initAdmins();
        
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('addAdminModal'));
        modal.hide();
        
        alert(`已添加管理员 ${utils.formatAddress(address)}`);
    }
    
    // 初始化财务管理
    function initFinance() {
        // 合约余额
        document.getElementById('contractBalanceDisplay').textContent = `${mockData.contractBalance} ETH`;
        document.getElementById('withdrawTo').value = mockData.wallet.address;
        
        // 收入统计
        document.getElementById('registrationIncome').textContent = '1.523 ETH';
        document.getElementById('renewalIncome').textContent = '0.756 ETH';
        document.getElementById('penaltyIncome').textContent = '0.177 ETH';
        document.getElementById('totalIncome').textContent = mockData.contractBalance;
    }
    
    // 提取合约余额
    function withdrawContractBalance() {
        // 获取提取金额和地址
        const amount = parseFloat(document.getElementById('withdrawAmount').value);
        const to = document.getElementById('withdrawTo').value.trim();
        
        // 验证输入
        if (isNaN(amount) || amount <= 0) {
            alert('请输入有效金额');
            return;
        }
        
        if (!to || !/^0x[a-fA-F0-9]{40}$/.test(to)) {
            alert('请输入有效的地址');
            return;
        }
        
        // 检查余额是否足够
        if (amount > parseFloat(mockData.contractBalance)) {
            alert('合约余额不足');
            return;
        }
        
        // 模拟提取
        mockData.contractBalance = (parseFloat(mockData.contractBalance) - amount).toFixed(3);
        
        // 刷新页面
        initFinance();
        
        alert(`已成功提取 ${amount} ETH 到地址 ${utils.formatAddress(to)}`);
    }
    
    // 初始化过期域名
    function initExpiredDomains() {
        const expiredDomainsTable = document.getElementById('expiredDomainsTable');
        if (!expiredDomainsTable) return;
        
        // 清空表格
        expiredDomainsTable.innerHTML = '';
        
        // 筛选过期域名
        const expiredDomains = mockData.domains.filter(domain => {
            const { status } = utils.calculateDomainStatus(domain);
            return status === 'reclaimed';
        });
        
        // 添加域名行
        expiredDomains.forEach(domain => {
            const { statusText } = utils.calculateDomainStatus(domain);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${domain.fullName}</td>
                <td>${utils.formatAddress(domain.owner)}</td>
                <td>${utils.formatDate(domain.expiryTime)} (${statusText})</td>
                <td><span class="badge bg-danger">回收期</span></td>
                <td>
                    <button class="btn btn-sm btn-warning" data-action="reclaim-domain">
                        回收
                    </button>
                </td>
            `;
            
            // 绑定回收按钮事件
            row.querySelector('[data-action="reclaim-domain"]').addEventListener('click', function() {
                reclaimDomain(domain.fullName);
            });
            
            expiredDomainsTable.appendChild(row);
        });
        
        // 如果没有可回收域名，显示提示
        if (expiredDomains.length === 0) {
            expiredDomainsTable.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-3">
                        <i class="bi bi-info-circle"></i> 当前没有可回收的域名
                    </td>
                </tr>
            `;
        }
    }
    
    // 回收单个域名
    function reclaimDomain(domainName) {
        if (confirm(`确定要回收域名 "${domainName}.web3.club" 吗？`)) {
            // 查找域名
            const index = mockData.domains.findIndex(d => d.name === domainName);
            if (index !== -1) {
                // 移除域名
                mockData.domains.splice(index, 1);
                
                // 刷新列表
                initExpiredDomains();
                
                // 刷新仪表盘
                initDashboard();
                
                alert(`已成功回收域名 ${domainName}.web3.club`);
            }
        }
    }
    
    // 批量回收域名
    function batchReclaimDomains() {
        // 筛选可回收的域名
        const reclaimableDomains = mockData.domains.filter(domain => {
            const { status } = utils.calculateDomainStatus(domain);
            return status === 'reclaimed';
        });
        
        if (reclaimableDomains.length === 0) {
            alert('当前没有可回收的域名');
            return;
        }
        
        if (confirm(`确定要批量回收 ${reclaimableDomains.length} 个过期域名吗？`)) {
            // 记录域名名称
            const domainNames = reclaimableDomains.map(d => d.name);
            
            // 移除这些域名
            mockData.domains = mockData.domains.filter(domain => {
                const { status } = utils.calculateDomainStatus(domain);
                return status !== 'reclaimed';
            });
            
            // 刷新列表
            initExpiredDomains();
            
            // 刷新仪表盘
            initDashboard();
            
            alert(`已成功回收 ${domainNames.length} 个域名`);
        }
    }
}); 