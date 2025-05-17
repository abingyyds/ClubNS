document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const walletNotConnected = document.getElementById('walletNotConnected');
    const domainFullName = document.getElementById('domainFullName');
    const domainStatus = document.getElementById('domainStatus');
    const domainStatusDescription = document.getElementById('domainStatusDescription');
    const domainOwner = document.getElementById('domainOwner');
    const renewBtn = document.getElementById('renewBtn');
    const transferBtn = document.getElementById('transferBtn');
    
    // 初始化页面
    initPage();
    
    // 绑定事件
    renewBtn.addEventListener('click', openRenewModal);
    transferBtn.addEventListener('click', openTransferModal);
    document.getElementById('addRecordBtn').addEventListener('click', openAddRecordModal);
    document.getElementById('saveRecordBtn').addEventListener('click', saveRecord);
    document.getElementById('manualRenewBtn').addEventListener('click', manualRenew);
    document.getElementById('addAutoRenewalBtn').addEventListener('click', addAutoRenewal);
    document.getElementById('recordType').addEventListener('change', handleRecordTypeChange);
    
    // 直接绑定创建俱乐部按钮
    const createClubBtn = document.getElementById('createClubBtn');
    if (createClubBtn) {
        createClubBtn.addEventListener('click', function() {
            console.log('创建俱乐部按钮被点击');
            showNotification('正在创建俱乐部...', 'info');
            
            // 模拟区块链交易
            setTimeout(() => {
                showNotification('俱乐部创建成功！', 'success');
                
                // 获取当前域名
                const urlParams = new URLSearchParams(window.location.search);
                const domainName = urlParams.get('domain');
                
                // 更新界面，显示俱乐部已创建
                document.getElementById('clubNotCreated').classList.add('d-none');
                document.getElementById('clubCreated').classList.remove('d-none');
                
                // 加载俱乐部详情
                if (typeof loadClubDetails === 'function') {
                    loadClubDetails();
                }
            }, 1500);
        });
    }
    
    // 创建通知函数 - 全局可用
    window.showNotification = function(message, type = 'info') {
        // 创建通知元素
        const notificationDiv = document.createElement('div');
        notificationDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        notificationDiv.style.zIndex = "9999";
        notificationDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // 添加到页面
        document.body.appendChild(notificationDiv);
        
        // 自动关闭
        setTimeout(() => {
            try {
                const alert = new bootstrap.Alert(notificationDiv);
                alert.close();
            } catch(e) {
                notificationDiv.remove();
            }
        }, 3000);
    };
    
    // 初始化页面
    function initPage() {
        if (!mockData.wallet.connected) {
            // 未连接钱包，显示连接提示
            walletNotConnected.classList.remove('d-none');
            return;
        }
        
        // 从URL获取域名
        const urlParams = new URLSearchParams(window.location.search);
        const domainName = urlParams.get('domain');
        
        // 如果没有域名参数，显示错误
        if (!domainName) {
            alert('未指定域名');
            window.location.href = 'my-domains.html';
            return;
        }
        
        // 找到域名
        const domain = mockData.domains.find(d => d.name === domainName);
        
        // 如果域名不存在，显示错误
        if (!domain) {
            alert('域名不存在');
            window.location.href = 'my-domains.html';
            return;
        }
        
        // 显示域名基本信息
        domainFullName.textContent = domain.fullName;
        domainOwner.textContent = domain.owner;
        
        // 计算域名状态和剩余时间
        const { status, statusText } = utils.calculateDomainStatus(domain);
        
        // 设置状态样式
        domainStatus.textContent = getStatusText(status);
        domainStatus.className = `badge ${getStatusClass(status)}`;
        domainStatusDescription.textContent = `有效期至 ${utils.formatDate(domain.expiryTime)}`;
        
        // 填充域名基本信息
        document.getElementById('registrationTime').textContent = utils.formatDate(domain.registrationTime);
        document.getElementById('expiryTime').textContent = utils.formatDate(domain.expiryTime);
        document.getElementById('daysRemaining').textContent = getDaysRemaining(domain.expiryTime);
        document.getElementById('tokenId').textContent = domain.tokenId;
        document.getElementById('currentOwner').textContent = domain.owner;
        
        // 加载NFT信息
        document.getElementById('nftDomainName').textContent = domain.fullName;
        document.getElementById('nftTokenId').textContent = domain.tokenId;
        document.getElementById('nftContractAddress').textContent = '0x123...456';
        document.getElementById('nftOwner').textContent = domain.owner;
        document.getElementById('nftLastTx').textContent = utils.formatDate(domain.registrationTime);
        
        // 加载解析记录
        loadResolverRecords(domain.fullName);
        
        // 设置自动续费信息
        document.getElementById('autoRenewalCurrentBalance').value = domain.autoRenewalFunds || 0;
        document.getElementById('autoRenewalYears').textContent = ((domain.autoRenewalFunds || 0) / mockData.settings.baseYearlyFee).toFixed(1);
    }
    
    // 加载解析记录
    function loadResolverRecords(domainName) {
        const recordsTableBody = document.getElementById('recordsTableBody');
        const noRecords = document.getElementById('noRecords');
        
        // 获取解析记录
        const records = mockData.resolverRecords[domainName] || [];
        
        if (records.length === 0) {
            // 没有记录，显示提示
            recordsTableBody.innerHTML = '';
            noRecords.classList.remove('d-none');
            return;
        }
        
        // 有记录，隐藏提示
        noRecords.classList.add('d-none');
        
        // 清空表格
        recordsTableBody.innerHTML = '';
        
        // 填充记录
        records.forEach((record, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.type}</td>
                <td>${record.value}</td>
                <td>${utils.formatDate(record.updatedAt)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" data-action="edit-record" data-index="${index}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" data-action="delete-record" data-index="${index}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            
            // 绑定编辑和删除按钮事件
            row.querySelector('[data-action="edit-record"]').addEventListener('click', () => {
                editRecord(index);
            });
            
            row.querySelector('[data-action="delete-record"]').addEventListener('click', () => {
                deleteRecord(index);
            });
            
            recordsTableBody.appendChild(row);
        });
    }
    
    // 打开添加记录模态框
    function openAddRecordModal() {
        // 设置模态框标题
        document.getElementById('recordModalTitle').textContent = '添加解析记录';
        
        // 重置表单
        document.getElementById('recordForm').reset();
        document.getElementById('recordAction').value = 'add';
        document.getElementById('recordId').value = '';
        
        // 根据记录类型更新表单
        handleRecordTypeChange();
        
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('recordModal'));
        modal.show();
    }
    
    // 编辑记录
    function editRecord(index) {
        // 获取域名
        const urlParams = new URLSearchParams(window.location.search);
        const domainName = urlParams.get('domain');
        const fullDomainName = `${domainName}.web3.club`;
        
        // 获取记录
        const records = mockData.resolverRecords[fullDomainName] || [];
        const record = records[index];
        
        if (!record) {
            alert('记录不存在');
            return;
        }
        
        // 设置模态框标题
        document.getElementById('recordModalTitle').textContent = '编辑解析记录';
        
        // 填充表单
        document.getElementById('recordAction').value = 'edit';
        document.getElementById('recordId').value = index;
        document.getElementById('recordType').value = record.type;
        document.getElementById('recordValue').value = record.value;
        document.getElementById('recordTtl').value = record.ttl;
        
        // 如果是MX记录，设置优先级
        if (record.type === 'MX' && record.priority) {
            document.getElementById('mxPriority').value = record.priority;
        }
        
        // 根据记录类型更新表单
        handleRecordTypeChange();
        
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('recordModal'));
        modal.show();
    }
    
    // 删除记录
    function deleteRecord(index) {
        if (!confirm('确定要删除此记录吗？')) {
            return;
        }
        
        // 获取域名
        const urlParams = new URLSearchParams(window.location.search);
        const domainName = urlParams.get('domain');
        const fullDomainName = `${domainName}.web3.club`;
        
        // 获取记录
        const records = mockData.resolverRecords[fullDomainName] || [];
        
        // 删除记录
        records.splice(index, 1);
        
        // 更新记录
        mockData.resolverRecords[fullDomainName] = records;
        
        // 重新加载记录
        loadResolverRecords(fullDomainName);
    }
    
    // 保存记录
    function saveRecord() {
        // 获取表单数据
        const action = document.getElementById('recordAction').value;
        const recordId = document.getElementById('recordId').value;
        const recordType = document.getElementById('recordType').value;
        const recordValue = document.getElementById('recordValue').value;
        const recordTtl = document.getElementById('recordTtl').value;
        
        // 验证
        if (!recordValue) {
            alert('请输入记录值');
            return;
        }
        
        // 获取域名
        const urlParams = new URLSearchParams(window.location.search);
        const domainName = urlParams.get('domain');
        const fullDomainName = `${domainName}.web3.club`;
        
        // 创建新记录
        const newRecord = {
            type: recordType,
            value: recordValue,
            ttl: parseInt(recordTtl),
            updatedAt: new Date().toISOString()
        };
        
        // 如果是MX记录，添加优先级
        if (recordType === 'MX') {
            newRecord.priority = parseInt(document.getElementById('mxPriority').value);
        }
        
        // 获取记录列表
        if (!mockData.resolverRecords[fullDomainName]) {
            mockData.resolverRecords[fullDomainName] = [];
        }
        
        // 添加或更新记录
        if (action === 'add') {
            // 添加新记录
            mockData.resolverRecords[fullDomainName].push(newRecord);
        } else {
            // 更新记录
            const index = parseInt(recordId);
            mockData.resolverRecords[fullDomainName][index] = newRecord;
        }
        
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('recordModal'));
        modal.hide();
        
        // 重新加载记录
        loadResolverRecords(fullDomainName);
    }
    
    // 处理记录类型变化
    function handleRecordTypeChange() {
        const recordType = document.getElementById('recordType').value;
        const mxPriorityField = document.getElementById('mxPriorityField');
        const recordValueHelp = document.getElementById('recordValueHelp');
        
        // 显示或隐藏MX优先级字段
        if (recordType === 'MX') {
            mxPriorityField.style.display = 'block';
        } else {
            mxPriorityField.style.display = 'none';
        }
        
        // 设置记录值帮助文本
        switch (recordType) {
            case 'A':
                recordValueHelp.textContent = '请输入IPv4地址，例如：192.168.1.1';
                break;
            case 'AAAA':
                recordValueHelp.textContent = '请输入IPv6地址，例如：2001:db8::1';
                break;
            case 'CNAME':
                recordValueHelp.textContent = '请输入另一个域名，例如：example.com';
                break;
            case 'TXT':
                recordValueHelp.textContent = '请输入文本记录，例如：v=spf1 include:_spf.example.com ~all';
                break;
            case 'MX':
                recordValueHelp.textContent = '请输入邮件服务器域名，例如：mail.example.com';
                break;
            default:
                recordValueHelp.textContent = '';
        }
    }
    
    // 打开续费模态框
    function openRenewModal() {
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('renewModal'));
        
        // 获取域名
        const urlParams = new URLSearchParams(window.location.search);
        const domainName = urlParams.get('domain');
        
        // 设置域名
        document.getElementById('renewDomainName').textContent = domainName;
        
        // 设置续费金额
        const yearlyFee = mockData.settings.baseYearlyFee;
        document.getElementById('renewYearlyFee').value = yearlyFee;
        document.getElementById('renewTotalFee').value = yearlyFee;
        
        // 监听续费时长变化
        document.getElementById('renewDuration').addEventListener('change', updateRenewTotal);
        
        // 按钮事件
        document.getElementById('confirmRenewBtn').addEventListener('click', renewDomain);
        
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
        const urlParams = new URLSearchParams(window.location.search);
        const domainName = urlParams.get('domain');
        
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
            
            // 刷新页面
            alert(`域名 ${domainName}.web3.club 已成功续费 ${duration} 年`);
            window.location.reload();
        });
    }
    
    // 手动续费
    function manualRenew() {
        // 获取域名
        const urlParams = new URLSearchParams(window.location.search);
        const domainName = urlParams.get('domain');
        
        // 获取续费时长和费用
        const duration = parseInt(document.getElementById('manualRenewDuration').value);
        const totalFee = parseFloat(document.getElementById('manualRenewTotalFee').value);
        
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
            
            // 刷新页面
            alert(`域名 ${domainName}.web3.club 已成功续费 ${duration} 年`);
            window.location.reload();
        });
    }
    
    // 添加自动续费资金
    function addAutoRenewal() {
        // 获取域名
        const urlParams = new URLSearchParams(window.location.search);
        const domainName = urlParams.get('domain');
        
        // 获取添加金额
        const amount = parseFloat(document.getElementById('addAutoRenewalAmount').value);
        
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
            
            // 刷新页面
            alert(`已成功添加 ${amount} ETH 自动续费资金`);
            window.location.reload();
        });
    }
    
    // 打开转移模态框
    function openTransferModal() {
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('transferModal'));
        
        // 获取域名
        const urlParams = new URLSearchParams(window.location.search);
        const domainName = urlParams.get('domain');
        
        // 设置域名
        document.getElementById('transferDomainName').textContent = domainName;
        
        // 按钮事件
        document.getElementById('confirmTransferBtn').addEventListener('click', transferDomain);
        
        modal.show();
    }
    
    // 转移域名
    function transferDomain() {
        // 获取域名
        const urlParams = new URLSearchParams(window.location.search);
        const domainName = urlParams.get('domain');
        
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
            
            // 提示并返回我的域名页面
            alert(`域名 ${domainName}.web3.club 已成功转移至 ${utils.formatAddress(receiverAddress)}`);
            window.location.href = 'my-domains.html';
        });
    }
    
    // 获取状态文本
    function getStatusText(status) {
        switch (status) {
            case 'active':
                return '活跃';
            case 'frozen':
                return '冻结期';
            case 'reclaimed':
                return '回收期';
            case 'available':
                return '可注册';
            default:
                return status;
        }
    }
    
    // 获取状态样式类
    function getStatusClass(status) {
        switch (status) {
            case 'active':
                return 'bg-success';
            case 'frozen':
                return 'bg-warning';
            case 'reclaimed':
                return 'bg-danger';
            case 'available':
                return 'bg-primary';
            default:
                return 'bg-secondary';
        }
    }
    
    // 计算剩余天数
    function getDaysRemaining(expiryTimeStr) {
        const expiryTime = new Date(expiryTimeStr);
        const now = new Date();
        const diffTime = expiryTime - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays > 0 ? `${diffDays}天` : `已过期${Math.abs(diffDays)}天`;
    }

    // 俱乐部管理功能
    document.addEventListener('DOMContentLoaded', function() {
        // 添加缺失的shortenAddress函数
        function shortenAddress(address) {
            if (!address) return '';
            return address.substring(0, 6) + '...' + address.substring(address.length - 4);
        }
        
        // 检查俱乐部状态
        function checkClubStatus() {
            // 获取当前域名
            const urlParams = new URLSearchParams(window.location.search);
            const domainName = urlParams.get('domain');
            
            // 修改：所有域名都显示已创建俱乐部状态，无需条件判断
            // const hasClub = domainName === 'demo' ? true : Math.random() > 0.5; // 模拟随机结果，实际应通过API查询
            const hasClub = true; // 所有域名都显示为已创建俱乐部
            
            if (hasClub) {
                document.getElementById('clubNotCreated').classList.add('d-none');
                document.getElementById('clubCreated').classList.remove('d-none');
                loadClubDetails();
            } else {
                document.getElementById('clubNotCreated').classList.remove('d-none');
                document.getElementById('clubCreated').classList.add('d-none');
            }
        }
        
        // 加载俱乐部详情
        function loadClubDetails() {
            // 获取当前域名
            const urlParams = new URLSearchParams(window.location.search);
            const domainName = urlParams.get('domain');
            
            // 模拟从区块链加载俱乐部详情
            let clubDetails;
            
            if (domainName === 'demo') {
                // 为demo.web3.club域名返回特定的俱乐部信息
                clubDetails = {
                    name: "Demo Web3 俱乐部",
                    symbol: "DW3",
                    description: "这是demo.web3.club的官方俱乐部，专注于Web3技术和应用的讨论与分享。欢迎所有对Web3感兴趣的朋友加入！",
                    logoUrl: "https://placehold.co/200x200?text=DW3",
                    bannerUrl: "https://placehold.co/1200x300?text=Demo+Web3+Club",
                    baseUri: "https://metadata.example.com/demo/",
                    permanentPrice: 0.08,
                    permanentReceiver: mockData.wallet.address,
                    transferPolicy: "RESTRICT",
                    monthlyPrice: 0.015,
                    quarterlyPrice: 0.04,
                    yearlyPrice: 0.12,
                    tokenAddress: "0x1234567890abcdef1234567890abcdef12345678",
                    tokenThreshold: 50,
                    nftAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
                    nftThreshold: 1,
                    members: [
                        { address: "0x1111111111111111111111111111111111111111", type: "永久会员", joinTime: "2023-05-15", expiryTime: "永不过期" },
                        { address: "0x2222222222222222222222222222222222222222", type: "临时会员(月)", joinTime: "2023-06-20", expiryTime: "2023-12-20" },
                        { address: "0x3333333333333333333333333333333333333333", type: "代币持有者", joinTime: "2023-06-10", expiryTime: "持续持有" },
                        { address: mockData.wallet.address, type: "管理员", joinTime: "2023-04-10", expiryTime: "永不过期" }
                    ],
                    inheritancePolicy: "Always"
                };
            } else {
                clubDetails = {
                    name: domainName + " 俱乐部",
                    symbol: domainName.toUpperCase().substring(0, 3),
                    description: "这是 " + domainName + " 的官方俱乐部，欢迎加入！",
                    logoUrl: "https://placehold.co/200x200?text=" + domainName,
                    bannerUrl: "https://placehold.co/1200x300?text=" + domainName,
                    baseUri: "https://metadata.example.com/" + domainName + "/",
                    permanentPrice: 0.05,
                    permanentReceiver: mockData.wallet.address,
                    transferPolicy: "RESTRICT",
                    monthlyPrice: 0.01,
                    quarterlyPrice: 0.025,
                    yearlyPrice: 0.08,
                    tokenAddress: "0x1234567890abcdef1234567890abcdef12345678",
                    tokenThreshold: 100,
                    nftAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
                    nftThreshold: 1,
                    members: [
                        { address: "0x1111111111111111111111111111111111111111", type: "永久会员", joinTime: "2023-05-15", expiryTime: "永不过期" },
                        { address: "0x2222222222222222222222222222222222222222", type: "临时会员(月)", joinTime: "2023-06-20", expiryTime: "2023-07-20" },
                        { address: "0x3333333333333333333333333333333333333333", type: "代币持有者", joinTime: "2023-06-10", expiryTime: "持续持有" }
                    ],
                    inheritancePolicy: "Always"
                };
            }
            
            // 填充表单数据
            document.getElementById('clubName').value = clubDetails.name;
            document.getElementById('clubSymbol').value = clubDetails.symbol;
            document.getElementById('clubDescription').value = clubDetails.description;
            document.getElementById('clubLogoUrl').value = clubDetails.logoUrl;
            document.getElementById('clubBannerUrl').value = clubDetails.bannerUrl;
            document.getElementById('clubBaseUri').value = clubDetails.baseUri;
            
            document.getElementById('permanentPrice').value = clubDetails.permanentPrice;
            document.getElementById('permanentReceiver').value = clubDetails.permanentReceiver;
            document.getElementById('transferPolicy').value = clubDetails.transferPolicy;
            
            document.getElementById('monthlyPrice').value = clubDetails.monthlyPrice;
            document.getElementById('quarterlyPrice').value = clubDetails.quarterlyPrice;
            document.getElementById('yearlyPrice').value = clubDetails.yearlyPrice;
            
            document.getElementById('tokenAddress').value = clubDetails.tokenAddress;
            document.getElementById('tokenThreshold').value = clubDetails.tokenThreshold;
            document.getElementById('nftAddress').value = clubDetails.nftAddress;
            document.getElementById('nftThreshold').value = clubDetails.nftThreshold;
            
            document.getElementById('inheritancePolicy').value = clubDetails.inheritancePolicy;
            
            // 加载会员列表
            const membersTable = document.getElementById('clubMembersTable');
            membersTable.innerHTML = '';
            
            if (clubDetails.members && clubDetails.members.length > 0) {
                document.getElementById('noMembers').classList.add('d-none');
                
                clubDetails.members.forEach(member => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${shortenAddress(member.address)}</td>
                        <td><span class="badge ${member.type === '永久会员' ? 'bg-success' : (member.type.includes('临时') ? 'bg-primary' : (member.type === '管理员' ? 'bg-danger' : 'bg-secondary'))}">${member.type}</span></td>
                        <td>${member.joinTime}</td>
                        <td>${member.expiryTime}</td>
                        <td>
                            ${member.type.includes('临时') ? 
                                `<button class="btn btn-sm btn-outline-primary renewMember" data-address="${member.address}" data-bs-toggle="modal" data-bs-target="#renewMemberModal">续期</button>` : 
                                ''}
                        </td>
                    `;
                    membersTable.appendChild(row);
                });
                
                // 添加续期按钮事件
                document.querySelectorAll('.renewMember').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const address = this.getAttribute('data-address');
                        document.getElementById('renewMemberAddress').textContent = shortenAddress(address);
                        // 设置当前和新的过期时间（模拟数据）
                        document.getElementById('currentExpiryTime').value = domainName === 'demo' ? "2023-12-20" : "2023-07-20";
                        updateNewExpiryTime();
                    });
                });
            } else {
                document.getElementById('noMembers').classList.remove('d-none');
            }
        }
        
        // 保存俱乐部基本信息
        document.getElementById('saveClubInfoBtn').addEventListener('click', function() {
            const name = document.getElementById('clubName').value;
            const symbol = document.getElementById('clubSymbol').value;
            
            if (!name || !symbol) {
                showNotification('请填写俱乐部名称和符号', 'warning');
                return;
            }
            
            showNotification('正在保存俱乐部信息...', 'info');
            
            // 模拟区块链交易
            setTimeout(() => {
                showNotification('俱乐部信息保存成功！', 'success');
            }, 1500);
        });
        
        // 保存永久会员设置
        document.getElementById('savePermanentSettingsBtn').addEventListener('click', function() {
            showNotification('正在保存永久会员设置...', 'info');
            
            // 模拟区块链交易
            setTimeout(() => {
                showNotification('永久会员设置保存成功！', 'success');
            }, 1500);
        });
        
        // 保存临时会员设置
        document.getElementById('saveTemporarySettingsBtn').addEventListener('click', function() {
            showNotification('正在保存临时会员设置...', 'info');
            
            // 模拟区块链交易
            setTimeout(() => {
                showNotification('临时会员设置保存成功！', 'success');
            }, 1500);
        });
        
        // 保存代币门槛
        document.getElementById('saveTokenGateBtn').addEventListener('click', function() {
            showNotification('正在设置代币门槛...', 'info');
            
            // 模拟区块链交易
            setTimeout(() => {
                showNotification('代币门槛设置成功！', 'success');
            }, 1500);
        });
        
        // 保存NFT门槛
        document.getElementById('saveNftGateBtn').addEventListener('click', function() {
            showNotification('正在设置NFT门槛...', 'info');
            
            // 模拟区块链交易
            setTimeout(() => {
                showNotification('NFT门槛设置成功！', 'success');
            }, 1500);
        });
        
        // 添加跨链代币
        document.getElementById('saveCrossChainTokenBtn').addEventListener('click', function() {
            showNotification('正在添加跨链代币门槛...', 'info');
            
            // 模拟区块链交易
            setTimeout(() => {
                showNotification('跨链代币门槛添加成功！', 'success');
            }, 1500);
        });
        
        // 移除跨链代币
        document.getElementById('removeCrossChainTokenBtn').addEventListener('click', function() {
            showNotification('正在移除跨链代币门槛...', 'info');
            
            // 模拟区块链交易
            setTimeout(() => {
                showNotification('跨链代币门槛已移除！', 'success');
            }, 1500);
        });
        
        // 保存继承策略
        document.getElementById('saveInheritancePolicyBtn').addEventListener('click', function() {
            showNotification('正在保存继承策略...', 'info');
            
            // 模拟区块链交易
            setTimeout(() => {
                showNotification('继承策略保存成功！', 'success');
            }, 1500);
        });
        
        // 检查继承决策需求
        checkInheritanceDecision();
        
        // 继承决策按钮
        document.getElementById('acceptInheritanceBtn').addEventListener('click', function() {
            acceptInheritance();
        });
        
        document.getElementById('rejectInheritanceBtn').addEventListener('click', function() {
            rejectInheritance();
        });
        
        // 导出会员
        document.getElementById('exportMembersBtn').addEventListener('click', function() {
            showNotification('正在导出会员数据...', 'info');
            
            // 模拟导出
            setTimeout(() => {
                showNotification('会员数据导出成功！', 'success');
                
                // 获取当前域名
                const urlParams = new URLSearchParams(window.location.search);
                const domainName = urlParams.get('domain');
                
                // 创建CSV数据
                const csvContent = "data:text/csv;charset=utf-8,地址,会员类型,加入时间,到期时间\n" +
                    "0x1111111111111111111111111111111111111111,永久会员,2023-05-15,永不过期\n" +
                    "0x2222222222222222222222222222222222222222,临时会员(月),2023-06-20,2023-07-20\n" +
                    "0x3333333333333333333333333333333333333333,代币持有者,2023-06-10,持续持有";
                
                // 创建下载链接
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `${domainName}_会员数据.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, 1500);
        });
        
        // 批量授予会员
        document.getElementById('confirmBatchGrantBtn').addEventListener('click', function() {
            const type = document.getElementById('batchMembershipType').value;
            const addresses = document.getElementById('memberAddresses').value.trim().split('\n');
            
            if (addresses.length === 0 || addresses[0] === '') {
                showNotification('请输入至少一个地址', 'warning');
                return;
            }
            
            showNotification(`正在批量授予${type === 'permanent' ? '永久' : '临时'}会员资格...`, 'info');
            
            // 关闭模态框
            const batchGrantModal = bootstrap.Modal.getInstance(document.getElementById('batchGrantModal'));
            batchGrantModal.hide();
            
            // 模拟区块链交易
            setTimeout(() => {
                showNotification(`已成功授予 ${addresses.length} 个地址会员资格！`, 'success');
                // 重新加载会员列表
                loadClubDetails();
            }, 2000);
        });
        
        // 续期会员
        document.getElementById('confirmRenewBtn').addEventListener('click', function() {
            showNotification('正在续期会员...', 'info');
            
            // 关闭模态框
            const renewModal = bootstrap.Modal.getInstance(document.getElementById('renewMemberModal'));
            renewModal.hide();
            
            // 模拟区块链交易
            setTimeout(() => {
                showNotification('会员续期成功！', 'success');
                // 重新加载会员列表
                loadClubDetails();
            }, 1500);
        });
        
        // 会员类型切换
        document.getElementById('batchMembershipType').addEventListener('change', function() {
            const temporaryDurationContainer = document.getElementById('temporaryDurationContainer');
            if (this.value === 'temporary') {
                temporaryDurationContainer.classList.remove('d-none');
            } else {
                temporaryDurationContainer.classList.add('d-none');
            }
        });
        
        // 更新新的到期时间
        function updateNewExpiryTime() {
            const currentExpiry = new Date(document.getElementById('currentExpiryTime').value);
            const duration = parseInt(document.getElementById('renewDuration').value);
            const unit = document.getElementById('renewDurationUnit').value;
            
            let newExpiry = new Date(currentExpiry);
            
            if (unit === 'days') {
                newExpiry.setDate(newExpiry.getDate() + duration);
            } else if (unit === 'months') {
                newExpiry.setMonth(newExpiry.getMonth() + duration);
            } else if (unit === 'years') {
                newExpiry.setFullYear(newExpiry.getFullYear() + duration);
            }
            
            document.getElementById('newExpiryTime').value = newExpiry.toISOString().split('T')[0];
        }
        
        // 添加到期时间计算事件监听器
        document.getElementById('renewDuration').addEventListener('input', updateNewExpiryTime);
        document.getElementById('renewDurationUnit').addEventListener('change', updateNewExpiryTime);
        
        // 添加标签页切换监听
        document.querySelector('button[data-bs-target="#club"]').addEventListener('click', function() {
            checkClubStatus();
        });
        
        // 确保在页面加载时检查俱乐部状态
        setTimeout(() => {
            // 立即检查当前活动的标签页
            if (document.querySelector('.tab-pane#club.active')) {
                checkClubStatus();
            }

            // 强制初始化显示俱乐部状态 - 解决一些初始化问题
            if (document.querySelector('button[data-bs-target="#club"]')) {
                checkClubStatus();
            }
        }, 500);
    });

    // 直接绑定"管理"按钮的点击事件
    document.addEventListener('DOMContentLoaded', function() {
        // 等待DOM完全加载后，处理所有"管理"相关的按钮
        setTimeout(function() {
            try {
                // 找到所有包含"管理"文本的按钮
                document.querySelectorAll('button').forEach(function(button) {
                    if (button.innerText && button.innerText.includes('管理')) {
                        console.log('找到管理按钮:', button);
                        button.addEventListener('click', function(e) {
                            e.preventDefault();
                            console.log('管理按钮被点击');
                            
                            // 尝试获取域名或俱乐部ID
                            const parentElement = button.closest('[data-domain]') || button.closest('[data-club-id]');
                            let identifier = 'web3club'; // 默认标识符
                            
                            if (parentElement) {
                                identifier = parentElement.getAttribute('data-domain') || 
                                             parentElement.getAttribute('data-club-id');
                            }
                            
                            // 导航到管理页面
                            window.location.href = `club-management.html?id=${identifier}`;
                        });
                    }
                });
                
                // 特别处理Web3 Club官方俱乐部卡片
                const clubCards = document.querySelectorAll('.club-card');
                clubCards.forEach(function(card) {
                    const manageBtn = card.querySelector('button.btn-primary');
                    if (manageBtn && manageBtn.innerText && manageBtn.innerText.includes('管理')) {
                        manageBtn.addEventListener('click', function(e) {
                            e.preventDefault();
                            const clubName = card.querySelector('h3, h4, h5')?.innerText || 'Web3 Club';
                            console.log('点击管理俱乐部:', clubName);
                            window.location.href = `club-management.html?name=${encodeURIComponent(clubName)}`;
                        });
                    }
                });
            } catch (err) {
                console.error('绑定管理按钮事件时出错:', err);
            }
        }, 1000); // 延迟1秒，确保其他脚本已加载
    });

    // 直接绑定创建俱乐部按钮的点击事件
    window.addEventListener('load', function() {
        setTimeout(function() {
            try {
                // 寻找创建俱乐部按钮
                const createButtons = document.querySelectorAll('button');
                createButtons.forEach(function(button) {
                    if (button.innerText && (button.innerText.includes('创建俱乐部') || button.innerHTML.includes('创建俱乐部'))) {
                        console.log('找到创建俱乐部按钮:', button);
                        
                        // 移除现有的事件监听器
                        const newButton = button.cloneNode(true);
                        button.parentNode.replaceChild(newButton, button);
                        
                        // 添加新的点击事件
                        newButton.addEventListener('click', function(e) {
                            console.log('创建俱乐部按钮被点击');
                            
                            // 显示通知
                            if (window.showNotification) {
                                window.showNotification('正在创建俱乐部...', 'info');
                            } else {
                                alert('正在创建俱乐部...');
                            }
                            
                            // 模拟创建俱乐部过程
                            setTimeout(function() {
                                // 显示成功通知
                                if (window.showNotification) {
                                    window.showNotification('俱乐部创建成功！', 'success');
                                } else {
                                    alert('俱乐部创建成功！');
                                }
                                
                                // 隐藏创建提示，显示俱乐部管理界面
                                const notCreatedElem = document.getElementById('clubNotCreated');
                                const createdElem = document.getElementById('clubCreated');
                                
                                if (notCreatedElem && createdElem) {
                                    notCreatedElem.style.display = 'none';
                                    createdElem.style.display = 'block';
                                    notCreatedElem.classList.add('d-none');
                                    createdElem.classList.remove('d-none');
                                }
                                
                                // 刷新页面或加载俱乐部详情
                                window.location.reload();
                            }, 1500);
                        });
                    }
                });
            } catch (err) {
                console.error('绑定创建俱乐部按钮事件时出错:', err);
            }
        }, 1000); // 延迟1秒
    });

    /**
     * 检查是否需要继承决策
     */
    function checkInheritanceDecision() {
        // 获取当前域名
        const urlParams = new URLSearchParams(window.location.search);
        const domainName = urlParams.get('domain');
        
        if (!domainName) return;
        
        // 模拟从区块链检查是否需要继承决策
        setTimeout(() => {
            // 假设 30% 的概率需要继承决策
            const needsDecision = Math.random() < 0.3;
            
            if (needsDecision) {
                // 显示继承决策卡片
                document.getElementById('inheritanceDecisionCard').style.display = 'block';
                document.getElementById('inheritanceDomainName').textContent = domainName;
                
                // 加载原俱乐部信息
                const mockPrevClub = {
                    name: `${domainName}俱乐部(原)`,
                    memberCount: Math.floor(Math.random() * 100) + 10,
                    creationDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000))
                };
                
                document.getElementById('prevClubName').textContent = mockPrevClub.name;
                document.getElementById('prevClubMembers').textContent = mockPrevClub.memberCount;
                document.getElementById('prevClubCreationDate').textContent = formatDate(mockPrevClub.creationDate);
            }
        }, 1000);
    }
    
    /**
     * 接受继承会员数据
     */
    function acceptInheritance() {
        // 获取当前域名
        const urlParams = new URLSearchParams(window.location.search);
        const domainName = urlParams.get('domain');
        
        showNotification('正在处理继承决策...', 'info');
        
        // 模拟调用合约 decideClubInheritance(domainName, true)
        setTimeout(() => {
            showNotification('已成功继承原俱乐部会员数据！', 'success');
            
            // 隐藏继承决策卡片
            document.getElementById('inheritanceDecisionCard').style.display = 'none';
            
            // 刷新页面数据
            loadDomainData();
        }, 2000);
    }
    
    /**
     * 拒绝继承会员数据
     */
    function rejectInheritance() {
        // 获取当前域名
        const urlParams = new URLSearchParams(window.location.search);
        const domainName = urlParams.get('domain');
        
        showNotification('正在处理继承决策...', 'info');
        
        // 模拟调用合约 decideClubInheritance(domainName, false)
        setTimeout(() => {
            showNotification('已拒绝继承原俱乐部会员数据，您可以创建全新的俱乐部！', 'success');
            
            // 隐藏继承决策卡片
            document.getElementById('inheritanceDecisionCard').style.display = 'none';
        }, 2000);
    }
    
    /**
     * 格式化日期
     */
    function formatDate(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        if (isNaN(date.getTime())) {
            return '未知日期';
        }
        
        return date.toLocaleDateString('zh-CN');
    }
}); 