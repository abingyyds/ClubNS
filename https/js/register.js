document.addEventListener('DOMContentLoaded', () => {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const domainParam = urlParams.get('domain');
    
    // 获取DOM元素
    const domainSearch = document.getElementById('domainSearch');
    const searchButton = document.getElementById('searchButton');
    const searchResult = document.getElementById('searchResult');
    const domainStatus = document.getElementById('domainStatus');
    const registrationForm = document.getElementById('registrationForm');
    const commitForm = document.getElementById('commitForm');
    const domainName = document.getElementById('domainName');
    const owner = document.getElementById('owner');
    const secret = document.getElementById('secret');
    const commitButton = document.getElementById('commitButton');
    const commitmentStep = document.getElementById('commitmentStep');
    const waitingProgress = document.getElementById('waitingProgress');
    const waitingMessage = document.getElementById('waitingMessage');
    const countdownTimer = document.getElementById('countdownTimer');
    const registerForm = document.getElementById('registerForm');
    const registerDomainName = document.getElementById('registerDomainName');
    const registerOwner = document.getElementById('registerOwner');
    const registerSecret = document.getElementById('registerSecret');
    const duration = document.getElementById('duration');
    const yearlyFee = document.getElementById('yearlyFee');
    const totalFee = document.getElementById('totalFee');
    const registerButton = document.getElementById('registerButton');
    const registrationSuccess = document.getElementById('registrationSuccess');
    const successDomainName = document.getElementById('successDomainName');
    const nftId = document.getElementById('nftId');
    const expiryTime = document.getElementById('expiryTime');
    const viewDomainDetails = document.getElementById('viewDomainDetails');
    
    // 设置押金金额
    document.getElementById('depositAmount').value = mockData.settings.depositAmount;
    
    // 如果URL中有域名参数，自动搜索
    if (domainParam) {
        domainSearch.value = domainParam;
        searchDomain();
    }
    
    // 绑定事件
    searchButton.addEventListener('click', searchDomain);
    domainSearch.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchDomain();
        }
    });
    
    commitButton.addEventListener('click', commitDomain);
    registerButton.addEventListener('click', registerDomain);
    duration.addEventListener('change', updateTotalFee);
    
    // 自动生成秘密字符串
    secret.value = utils.generateRandomSecret();
    
    // 搜索域名
    function searchDomain() {
        // 获取搜索内容
        const name = domainSearch.value.trim().toLowerCase();
        
        // 验证域名格式
        if (!name) {
            showSearchResult('请输入域名', 'warning');
            return;
        }
        
        // 验证域名格式（只允许字母、数字和连字符）
        if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name)) {
            showSearchResult('域名格式不正确，只能包含字母、数字和连字符，且不能以连字符开头或结尾', 'danger');
            return;
        }
        
        // 验证域名长度
        if (name.length < 3) {
            showSearchResult('域名长度不能少于3个字符', 'danger');
            return;
        }
        
        // 检查是否是保留名称
        if (mockData.reservedNames.includes(name)) {
            showSearchResult(`"${name}.web3.club" 是保留域名，无法注册`, 'danger');
            return;
        }
        
        // 检查是否已被注册
        const existingDomain = mockData.domains.find(domain => domain.name === name);
        if (existingDomain) {
            const { status } = utils.calculateDomainStatus(existingDomain);
            
            if (status === 'active' || status === 'frozen' || status === 'reclaimed') {
                showSearchResult(`"${name}.web3.club" 已被注册`, 'danger');
                return;
            }
        }
        
        // 域名可注册
        showSearchResult(`"${name}.web3.club" 可以注册！`, 'success');
        
        // 显示注册表单
        registrationForm.classList.remove('d-none');
        
        // 填充表单
        domainName.value = name;
        registerDomainName.value = name;
        registerSecret.value = secret.value;
        
        // 如果钱包已连接，填充所有者地址
        if (mockData.wallet.connected) {
            owner.value = mockData.wallet.address;
            registerOwner.value = mockData.wallet.address;
        } else {
            owner.value = '';
            registerOwner.value = '';
        }
        
        // 计算价格
        updateTotalFee();
    }
    
    // 显示搜索结果
    function showSearchResult(message, type) {
        searchResult.classList.remove('d-none');
        
        // 设置消息类型
        domainStatus.textContent = message;
        
        // 更改警告框类型
        searchResult.querySelector('.alert').className = `alert alert-${type}`;
    }
    
    // 提交注册申请
    function commitDomain() {
        // 验证表单
        if (!validateCommitForm()) {
            return;
        }
        
        // 检查钱包是否已连接
        if (!mockData.wallet.connected) {
            alert('请先连接钱包');
            return;
        }
        
        // 获取域名和秘密
        const name = domainName.value.trim();
        const secretStr = secret.value.trim();
        
        // 模拟交易
        utils.simulateTransaction('commit', {
            domain: `${name}.web3.club`,
            secret: secretStr,
            amount: parseFloat(document.getElementById('depositAmount').value)
        }).then(() => {
            // 显示提交成功消息
            commitmentStep.classList.remove('d-none');
            
            // 禁用提交按钮
            commitButton.disabled = true;
            
            // 启动倒计时
            startCommitmentCountdown();
        });
    }
    
    // 验证提交表单
    function validateCommitForm() {
        // 验证域名
        if (!domainName.value.trim()) {
            alert('请输入域名');
            return false;
        }
        
        // 验证所有者地址
        if (!owner.value.trim()) {
            alert('请连接钱包');
            return false;
        }
        
        // 验证秘密字符串
        if (!secret.value.trim()) {
            alert('请输入秘密字符串');
            return false;
        }
        
        return true;
    }
    
    // 开始提交倒计时
    function startCommitmentCountdown() {
        let seconds = 60;
        
        // 更新倒计时显示
        countdownTimer.textContent = seconds;
        
        // 倒计时定时器
        const interval = setInterval(() => {
            seconds--;
            
            // 更新倒计时显示
            countdownTimer.textContent = seconds;
            
            // 更新进度条
            waitingProgress.style.width = `${(seconds / 60) * 100}%`;
            
            // 倒计时结束
            if (seconds <= 0) {
                clearInterval(interval);
                
                // 显示注册表单
                registerForm.classList.remove('d-none');
                
                // 隐藏等待消息
                waitingMessage.classList.add('d-none');
                
                // 停止进度条动画
                waitingProgress.classList.remove('progress-bar-animated');
            }
        }, 1000);
    }
    
    // 更新总费用
    function updateTotalFee() {
        const years = parseInt(duration.value) || 1;
        const fee = parseFloat(yearlyFee.value) || 0.01;
        
        // 计算总费用（考虑短域名溢价）
        const name = domainName.value.trim();
        let multiplier = 1;
        
        // 应用短域名溢价
        if (name.length <= 5 && mockData.settings.shortNamePremiums[name.length]) {
            multiplier = mockData.settings.shortNamePremiums[name.length];
        }
        
        // 计算总费用
        const total = fee * multiplier * years;
        
        // 更新显示
        totalFee.value = total.toFixed(3);
    }
    
    // 注册域名
    function registerDomain() {
        // 检查表单
        if (!validateRegisterForm()) {
            return;
        }
        
        // 获取域名信息
        const name = registerDomainName.value.trim();
        const ownerAddress = registerOwner.value.trim();
        const durationYears = parseInt(duration.value);
        const cost = parseFloat(totalFee.value);
        
        // 模拟交易
        utils.simulateTransaction('register', {
            domain: `${name}.web3.club`,
            owner: ownerAddress,
            duration: durationYears,
            amount: cost
        }).then(() => {
            // 创建新域名
            const now = new Date();
            const expiry = new Date(now);
            expiry.setFullYear(expiry.getFullYear() + durationYears);
            
            // 为新域名创建随机Token ID
            const tokenId = Math.floor(10000 + Math.random() * 90000);
            
            // 添加到域名列表
            const newDomain = {
                name: name,
                fullName: `${name}.web3.club`,
                owner: ownerAddress,
                registrationTime: now.toISOString(),
                expiryTime: expiry.toISOString(),
                tokenId: tokenId,
                autoRenewalFunds: 0
            };
            
            mockData.domains.push(newDomain);
            
            // 显示成功消息
            registrationForm.classList.add('d-none');
            registrationSuccess.classList.remove('d-none');
            
            // 填充成功信息
            successDomainName.textContent = name;
            nftId.textContent = tokenId;
            expiryTime.textContent = utils.formatDate(expiry.toISOString());
            
            // 设置查看详情链接
            viewDomainDetails.href = `domain-details.html?domain=${name}`;
        });
    }
    
    // 验证注册表单
    function validateRegisterForm() {
        // 验证域名
        if (!registerDomainName.value.trim()) {
            alert('域名信息有误');
            return false;
        }
        
        // 验证所有者地址
        if (!registerOwner.value.trim()) {
            alert('所有者地址有误');
            return false;
        }
        
        // 验证秘密字符串
        if (!registerSecret.value.trim()) {
            alert('秘密字符串有误');
            return false;
        }
        
        // 验证注册时长
        const durationValue = parseInt(duration.value);
        if (isNaN(durationValue) || durationValue < 1 || durationValue > 10) {
            alert('请输入有效的注册时长（1-10年）');
            return false;
        }
        
        return true;
    }
}); 