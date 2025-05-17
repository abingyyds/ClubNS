document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const walletNotConnected = document.getElementById('walletNotConnected');
    const domainsList = document.getElementById('domainsList');
    const noDomains = document.getElementById('noDomains');
    const domainsTableBody = document.getElementById('domainsTableBody');
    
    // 确保钱包连接状态为true
    mockData.wallet.connected = true;
    mockData.wallet.address = '0x1234567890123456789012345678901234567890';
    
    // 确保所有域名的所有者都是当前钱包地址
    mockData.domains.forEach(domain => {
        domain.owner = mockData.wallet.address;
    });
    
    // 续费模态框
    const renewModal = new bootstrap.Modal(document.getElementById('renewModal'));
    const renewDomainName = document.getElementById('renewDomainName');
    const renewDuration = document.getElementById('renewDuration');
    const renewYearlyFee = document.getElementById('renewYearlyFee');
    const renewTotalFee = document.getElementById('renewTotalFee');
    const confirmRenewBtn = document.getElementById('confirmRenewBtn');
    
    // 自动续费模态框
    const autoRenewalModal = new bootstrap.Modal(document.getElementById('autoRenewalModal'));
    const autoRenewalDomainName = document.getElementById('autoRenewalDomainName');
    const autoRenewalBalance = document.getElementById('autoRenewalBalance');
    const autoRenewalAmount = document.getElementById('autoRenewalAmount');
    const confirmAutoRenewalBtn = document.getElementById('confirmAutoRenewalBtn');
    
    // 转移模态框
    const transferModal = new bootstrap.Modal(document.getElementById('transferModal'));
    const transferDomainName = document.getElementById('transferDomainName');
    const receiverAddress = document.getElementById('receiverAddress');
    const confirmTransferBtn = document.getElementById('confirmTransferBtn');
    
    // 保存当前操作的域名
    let currentDomain = null;
    
    // 初始化页面
    initPage();
    
    // 绑定筛选和排序事件
    document.getElementById('statusFilter').addEventListener('change', filterAndSortDomains);
    document.getElementById('sortBy').addEventListener('change', filterAndSortDomains);
    document.getElementById('sortOrder').addEventListener('change', filterAndSortDomains);
    
    // 绑定模态框按钮事件
    document.getElementById('confirmRenewBtn').addEventListener('click', renewDomain);
    document.getElementById('confirmAutoRenewalBtn').addEventListener('click', addAutoRenewal);
    document.getElementById('confirmTransferBtn').addEventListener('click', transferDomain);
    
    // 初始化页面
    function initPage() {
        if (!mockData.wallet.connected) {
            // 未连接钱包，显示连接提示
            domainsList.classList.add('d-none');
            walletNotConnected.classList.remove('d-none');
            return;
        }
        
        // 已连接钱包，显示域名列表
        walletNotConnected.classList.add('d-none');
        domainsList.classList.remove('d-none');
        
        // 加载域名列表
        loadDomainsList();
    }
    
    // 加载域名列表
    function loadDomainsList() {
        // 获取当前用户的域名
        const userDomains = mockData.domains.filter(domain => 
            domain.owner.toLowerCase() === mockData.wallet.address.toLowerCase()
        );
        
        if (userDomains.length === 0) {
            // 没有域名，显示提示
            domainsTableBody.innerHTML = '';
            noDomains.classList.remove('d-none');
            return;
        }
        
        // 有域名，隐藏提示
        noDomains.classList.add('d-none');
        
        // 应用筛选和排序
        filterAndSortDomains();
    }
    
    // 筛选和排序域名
    function filterAndSortDomains() {
        // 获取筛选和排序选项
        const statusFilter = document.getElementById('statusFilter').value;
        const sortBy = document.getElementById('sortBy').value;
        const sortOrder = document.getElementById('sortOrder').value;
        
        // 获取当前用户的域名
        let userDomains = mockData.domains.filter(domain => 
            domain.owner.toLowerCase() === mockData.wallet.address.toLowerCase()
        );
        
        // 应用状态筛选
        if (statusFilter !== 'all') {
            userDomains = userDomains.filter(domain => {
                const { status } = utils.calculateDomainStatus(domain);
                return status === statusFilter;
            });
        }
        
        // 应用排序
        userDomains.sort((a, b) => {
            let valueA, valueB;
            
            if (sortBy === 'name') {
                valueA = a.name.toLowerCase();
                valueB = b.name.toLowerCase();
            } else if (sortBy === 'expiry') {
                valueA = new Date(a.expiryTime);
                valueB = new Date(b.expiryTime);
            } else if (sortBy === 'registration') {
                valueA = new Date(a.registrationTime);
                valueB = new Date(b.registrationTime);
            }
            
            if (sortOrder === 'asc') {
                return valueA > valueB ? 1 : -1;
            } else {
                return valueA < valueB ? 1 : -1;
            }
        });
        
        // 更新域名列表
        renderDomainsList(userDomains);
    }
    
    // 渲染域名列表
    function renderDomainsList(domains) {
        // 清空表格
        domainsTableBody.innerHTML = '';
        
        // 如果没有域名，显示提示
        if (domains.length === 0) {
            domainsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        <i class="bi bi-info-circle"></i> No domains matching the criteria
                    </td>
                </tr>
            `;
            return;
        }
        
        // 填充域名列表
        domains.forEach(domain => {
            const { status, statusText } = utils.calculateDomainStatus(domain);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <a href="domain-details.html?domain=${domain.name}" class="fw-bold">
                        ${domain.fullName}
                    </a>
                </td>
                <td>${utils.formatDate(domain.registrationTime)}</td>
                <td>${utils.formatDate(domain.expiryTime)}</td>
                <td>
                    <span class="badge ${getStatusBadgeClass(status)}">${getStatusText(status)}</span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary btn-renew" data-domain="${domain.name}" title="Renew">
                            <i class="bi bi-arrow-repeat"></i>
                        </button>
                        <button class="btn btn-outline-success btn-auto-renewal" data-domain="${domain.name}" title="Auto Renewal">
                            <i class="bi bi-clock-history"></i>
                        </button>
                        <button class="btn btn-outline-secondary btn-transfer" data-domain="${domain.name}" title="Transfer">
                            <i class="bi bi-send"></i>
                        </button>
                        <a href="domain-details.html?domain=${domain.name}" class="btn btn-outline-info" title="Details">
                            <i class="bi bi-info-circle"></i>
                        </a>
                    </div>
                </td>
            `;
            
            // 绑定按钮事件
            row.querySelector('.btn-renew').addEventListener('click', function() {
                openRenewModal(domain.name);
            });
            
            row.querySelector('.btn-auto-renewal').addEventListener('click', function() {
                openAutoRenewalModal(domain.name);
            });
            
            row.querySelector('.btn-transfer').addEventListener('click', function() {
                openTransferModal(domain.name);
            });
            
            domainsTableBody.appendChild(row);
        });
    }
    
    // 打开续费模态框
    function openRenewModal(domainName) {
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('renewModal'));
        
        // 设置域名
        document.getElementById('renewDomainName').textContent = domainName;
        currentDomain = domainName;
        
        // 获取域名信息
        const domain = mockData.domains.find(d => d.name === domainName);
        
        // 设置续费金额
        const yearlyFee = mockData.settings.baseYearlyFee;
        document.getElementById('renewYearlyFee').value = yearlyFee;
        document.getElementById('renewTotalFee').value = yearlyFee;
        
        // 监听续费时长变化
        document.getElementById('renewDuration').addEventListener('change', updateRenewTotal);
        
        modal.show();
    }
    
    // 更新续费总额
    function updateRenewTotal() {
        const duration = parseInt(document.getElementById('renewDuration').value);
        const yearlyFee = parseFloat(document.getElementById('renewYearlyFee').value);
        const totalFee = (duration * yearlyFee).toFixed(3);
        
        document.getElementById('renewTotalFee').value = totalFee;
    }
    
    // 续费域名
    function renewDomain() {
        // 获取域名
        const domainName = document.getElementById('renewDomainName').textContent;
        
        // 获取续费时长和费用
        const duration = parseInt(document.getElementById('renewDuration').value);
        const totalFee = parseFloat(document.getElementById('renewTotalFee').value);
        
        // 验证
        if (duration < 1 || duration > 10) {
            alert('请输入有效的续费时长（1-10年）');
            return;
        }
        
        // 模拟交易
        utils.simulateTransaction('renew', {
            domain: `${domainName}.web3.club`,
            amount: totalFee
        }).then(() => {
            // 更新域名到期时间
            const domain = mockData.domains.find(d => d.name === domainName);
            if (domain) {
                const expiryDate = new Date(domain.expiryTime);
                expiryDate.setFullYear(expiryDate.getFullYear() + duration);
                domain.expiryTime = expiryDate.toISOString();
            }
            
            // 关闭模态框
            const modal = bootstrap.Modal.getInstance(document.getElementById('renewModal'));
            modal.hide();
            
            // 重新加载域名列表
            loadDomainsList();
            
            // 显示成功消息
            alert(`域名 ${domainName}.web3.club 已成功续费 ${duration} 年`);
        });
    }
    
    // 打开自动续费模态框
    function openAutoRenewalModal(domainName) {
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('autoRenewalModal'));
        
        // 设置域名
        document.getElementById('autoRenewalDomainName').textContent = domainName;
        
        // 获取域名信息
        const domain = mockData.domains.find(d => d.name === domainName);
        
        // 设置当前自动续费余额
        document.getElementById('autoRenewalBalance').value = domain.autoRenewalFunds || 0;
        
        modal.show();
    }
    
    // 添加自动续费资金
    function addAutoRenewal() {
        // 获取域名
        const domainName = document.getElementById('autoRenewalDomainName').textContent;
        
        // 获取添加金额
        const amount = parseFloat(document.getElementById('autoRenewalAmount').value);
        
        // 验证
        if (isNaN(amount) || amount <= 0) {
            alert('请输入有效金额');
            return;
        }
        
        // 模拟交易
        utils.simulateTransaction('autoRenewal', {
            domain: `${domainName}.web3.club`,
            amount: amount
        }).then(() => {
            // 更新自动续费资金
            const domain = mockData.domains.find(d => d.name === domainName);
            if (domain) {
                domain.autoRenewalFunds = (parseFloat(domain.autoRenewalFunds || 0) + amount).toFixed(3);
            }
            
            // 关闭模态框
            const modal = bootstrap.Modal.getInstance(document.getElementById('autoRenewalModal'));
            modal.hide();
            
            // 显示成功消息
            alert(`已成功添加 ${amount} ETH 自动续费资金`);
        });
    }
    
    // 打开转移模态框
    function openTransferModal(domainName) {
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('transferModal'));
        
        // 设置域名
        document.getElementById('transferDomainName').textContent = domainName;
        
        modal.show();
    }
    
    // 转移域名
    function transferDomain() {
        // 获取域名
        const domainName = document.getElementById('transferDomainName').textContent;
        
        // 获取接收方地址
        const receiverAddress = document.getElementById('receiverAddress').value.trim();
        
        // 验证
        if (!receiverAddress) {
            alert('请输入接收方地址');
            return;
        }
        
        // 验证地址格式
        if (!/^0x[a-fA-F0-9]{40}$/.test(receiverAddress)) {
            alert('请输入有效的以太坊地址');
            return;
        }
        
        // 模拟交易
        utils.simulateTransaction('transfer', {
            domain: `${domainName}.web3.club`,
            to: receiverAddress
        }).then(() => {
            // 更新域名所有者
            const domain = mockData.domains.find(d => d.name === domainName);
            if (domain) {
                domain.owner = receiverAddress;
            }
            
            // 关闭模态框
            const modal = bootstrap.Modal.getInstance(document.getElementById('transferModal'));
            modal.hide();
            
            // 重新加载域名列表
            loadDomainsList();
            
            // 显示成功消息
            alert(`域名 ${domainName}.web3.club 已成功转移至 ${utils.formatAddress(receiverAddress)}`);
        });
    }
    
    // 获取状态Badge类
    function getStatusBadgeClass(status) {
        switch (status) {
            case 'active':
                return 'bg-success';
            case 'expiring_soon':
                return 'bg-warning';
            case 'grace_period':
                return 'bg-info';
            case 'expired':
                return 'bg-danger';
            case 'frozen':
                return 'bg-secondary';
            case 'reclaiming':
                return 'bg-dark';
            default:
                return 'bg-secondary';
        }
    }
    
    // 获取状态文本
    function getStatusText(status) {
        switch (status) {
            case 'active':
                return 'Active';
            case 'expiring_soon':
                return 'Expiring Soon';
            case 'grace_period':
                return 'Grace Period';
            case 'expired':
                return 'Expired';
            case 'frozen':
                return 'Frozen';
            case 'reclaiming':
                return 'Reclaiming Period';
            default:
                return status;
        }
    }
}); 