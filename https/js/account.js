document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const walletNotConnected = document.getElementById('walletNotConnected');
    const accountInfo = document.getElementById('accountInfo');
    
    // 账户概览
    const userWalletAddress = document.getElementById('userWalletAddress');
    const networkInfo = document.getElementById('networkInfo');
    const domainsCount = document.getElementById('domainsCount');
    const accountBalance = document.getElementById('accountBalance');
    
    // 押金管理
    const depositBalance = document.getElementById('depositBalance');
    const depositAmount = document.getElementById('depositAmount');
    const depositBtn = document.getElementById('depositBtn');
    const withdrawAmount = document.getElementById('withdrawAmount');
    const withdrawBtn = document.getElementById('withdrawBtn');
    
    // 交易记录
    const transactionsTable = document.getElementById('transactionsTable');
    const noTransactions = document.getElementById('noTransactions');
    
    // NFT展示
    const nftGallery = document.getElementById('nftGallery');
    const noNFTs = document.getElementById('noNFTs');
    
    // 初始化页面
    initPage();
    
    // 绑定事件
    depositBtn.addEventListener('click', depositFunds);
    withdrawBtn.addEventListener('click', withdrawFunds);
    
    // 初始化页面
    function initPage() {
        if (!mockData.wallet.connected) {
            // 未连接钱包，显示连接提示
            walletNotConnected.classList.remove('d-none');
            accountInfo.classList.add('d-none');
            return;
        }
        
        // 已连接钱包，显示账户信息
        walletNotConnected.classList.add('d-none');
        accountInfo.classList.remove('d-none');
        
        // 加载账户信息
        loadAccountInfo();
        
        // 加载交易记录
        loadTransactions();
        
        // 加载NFT展示
        loadNFTGallery();
    }
    
    // 加载账户信息
    function loadAccountInfo() {
        // 设置钱包地址
        userWalletAddress.textContent = mockData.wallet.address;
        
        // 设置网络信息
        networkInfo.textContent = '以太坊主网';
        
        // 设置账户余额
        accountBalance.textContent = mockData.wallet.balance;
        
        // 设置已注册域名数量
        const userDomains = mockData.domains.filter(domain => 
            domain.owner.toLowerCase() === mockData.wallet.address.toLowerCase()
        );
        domainsCount.textContent = userDomains.length;
        
        // 设置押金余额
        const depositBalance = mockData.userDeposits[mockData.wallet.address] || 0;
        depositBalance.textContent = depositBalance;
    }
    
    // 加载交易记录
    function loadTransactions() {
        const transactionsTable = document.getElementById('transactionsTable');
        const noTransactions = document.getElementById('noTransactions');
        
        if (mockData.transactions.length === 0) {
            // 没有交易记录，显示提示
            transactionsTable.innerHTML = '';
            noTransactions.classList.remove('d-none');
            return;
        }
        
        // 有交易记录，隐藏提示
        noTransactions.classList.add('d-none');
        
        // 清空表格
        transactionsTable.innerHTML = '';
        
        // 填充交易记录
        mockData.transactions.forEach(tx => {
            const row = document.createElement('tr');
            
            // 设置交易类型和标签
            let badge, typeText;
            switch (tx.type) {
                case 'deposit':
                    badge = 'bg-primary';
                    typeText = '存入押金';
                    break;
                case 'withdraw':
                    badge = 'bg-danger';
                    typeText = '提取押金';
                    break;
                case 'register':
                    badge = 'bg-info';
                    typeText = '域名注册';
                    break;
                case 'renew':
                    badge = 'bg-secondary';
                    typeText = '域名续费';
                    break;
                case 'transfer':
                    badge = 'bg-warning';
                    typeText = '域名转移';
                    break;
                case 'autoRenewal':
                    badge = 'bg-success';
                    typeText = '自动续费';
                    break;
                default:
                    badge = 'bg-secondary';
                    typeText = tx.type;
            }
            
            row.innerHTML = `
                <td>
                    <span class="badge ${badge}">${typeText}</span>
                </td>
                <td>${tx.amount} ETH</td>
                <td>${utils.formatDate(tx.date)}</td>
                <td>
                    <span class="badge bg-success">成功</span>
                </td>
            `;
            
            transactionsTable.appendChild(row);
        });
    }
    
    // 加载NFT展示
    function loadNFTGallery() {
        const nftGallery = document.getElementById('nftGallery');
        const noNFTs = document.getElementById('noNFTs');
        
        // 获取用户域名
        const userDomains = mockData.domains.filter(domain => 
            domain.owner.toLowerCase() === mockData.wallet.address.toLowerCase()
        );
        
        if (userDomains.length === 0) {
            // 没有域名NFT，显示提示
            nftGallery.innerHTML = '';
            noNFTs.classList.remove('d-none');
            return;
        }
        
        // 有域名NFT，隐藏提示
        noNFTs.classList.add('d-none');
        
        // 清空画廊
        nftGallery.innerHTML = '';
        
        // 填充域名NFT
        userDomains.forEach(domain => {
            const card = document.createElement('div');
            card.className = 'col-md-4 col-lg-3 mb-4';
            
            card.innerHTML = `
                <div class="card">
                    <img src="images/domain-nft.jpg" class="card-img-top" alt="Domain NFT">
                    <div class="card-body">
                        <h6 class="card-title">${domain.fullName}</h6>
                        <p class="text-muted small">Token ID: ${domain.tokenId}</p>
                        <a href="domain-details.html?domain=${domain.name}" class="btn btn-sm btn-outline-primary">查看详情</a>
                    </div>
                </div>
            `;
            
            nftGallery.appendChild(card);
        });
    }
    
    // 存入押金
    function depositFunds() {
        // 获取存入金额
        const amount = parseFloat(depositAmount.value);
        
        // 验证金额
        if (isNaN(amount) || amount <= 0) {
            alert('请输入有效金额');
            return;
        }
        
        // 模拟交易
        utils.simulateTransaction('deposit', {
            amount: amount
        }).then(() => {
            // 更新押金余额
            const currentDeposit = parseFloat(mockData.userDeposits[mockData.wallet.address] || 0);
            mockData.userDeposits[mockData.wallet.address] = (currentDeposit + amount).toFixed(3);
            
            // 刷新页面
            loadAccountInfo();
            loadTransactions();
            
            // 显示成功消息
            alert(`已成功存入 ${amount} ETH 押金`);
        });
    }
    
    // 提取押金
    function withdrawFunds() {
        // 获取提取金额
        const amount = parseFloat(withdrawAmount.value);
        
        // 验证金额
        if (isNaN(amount) || amount <= 0) {
            alert('请输入有效金额');
            return;
        }
        
        // 检查余额是否足够
        const currentDeposit = parseFloat(mockData.userDeposits[mockData.wallet.address] || 0);
        if (amount > currentDeposit) {
            alert('押金余额不足');
            return;
        }
        
        // 模拟交易
        utils.simulateTransaction('withdraw', {
            amount: amount
        }).then(() => {
            // 更新押金余额
            mockData.userDeposits[mockData.wallet.address] = (currentDeposit - amount).toFixed(3);
            
            // 刷新页面
            loadAccountInfo();
            loadTransactions();
            
            // 显示成功消息
            alert(`已成功提取 ${amount} ETH 押金`);
        });
    }
}); 