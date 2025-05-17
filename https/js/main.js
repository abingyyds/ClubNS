// 工具函数
const utils = {
    // 格式化地址（显示前几位和后几位）
    formatAddress: (address, prefixLength = 6, suffixLength = 4) => {
        if (!address || address.length < (prefixLength + suffixLength + 3)) {
            return address;
        }
        return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
    },

    // 格式化日期
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    },

    // 计算域名状态
    calculateDomainStatus: (domain) => {
        // 强制状态显示（基于截图中显示的状态）
        if (domain.name === 'demo') {
            return { status: 'expired', statusText: 'Expired' };
        }
        if (domain.name === 'example' || domain.name === 'test') {
            return { status: 'reclaiming', statusText: 'In reclaiming period' };
        }
        if (domain.name === 'crypto') {
            return { status: 'expiring_soon', statusText: 'Expires soon' };
        }
        if (domain.name === 'nft') {
            return { status: 'grace_period', statusText: 'Grace period' };
        }
        if (domain.name === 'defi') {
            return { status: 'expired', statusText: 'Expired' };
        }
        if (domain.name === 'dao') {
            return { status: 'frozen', statusText: 'Frozen' };
        }
        if (domain.name === 'active1' || domain.name === 'active2') {
            return { status: 'active', statusText: 'Active' };
        }
        
        // 正常计算逻辑（如果需要）
        const now = new Date();
        const expiryDate = new Date(domain.expiryTime);
        const daysDifference = Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24));
        
        let status, statusText;
        
        if (daysDifference > 30) {
            // 域名正常
            status = 'active';
            statusText = `${daysDifference} days remaining`;
        } else if (daysDifference > 0) {
            // 即将到期
            status = 'expiring_soon';
            statusText = `Expires in ${daysDifference} days`;
        } else if (daysDifference >= -30) {
            // 宽限期（过期30天内）
            status = 'grace_period';
            statusText = `Grace period: ${Math.abs(daysDifference)} days`;
        } else if (daysDifference >= -60) {
            // 已过期
            status = 'expired';
            statusText = `Expired: ${Math.abs(daysDifference)} days ago`;
        } else if (daysDifference >= -90) {
            // 已冻结
            status = 'frozen';
            statusText = `Frozen: ${Math.abs(daysDifference)} days ago`;
        } else {
            // 回收期
            status = 'reclaiming';
            statusText = `In reclaiming period`;
        }
        
        return { status, statusText };
    },

    // 模拟交易延迟
    simulateTransaction: (type, data) => {
        return new Promise((resolve) => {
            // 显示加载状态
            console.log(`Processing ${type} transaction...`);
            
            // 随机延迟1-3秒
            const delay = 1000 + Math.random() * 2000;
            
            setTimeout(() => {
                // 添加交易记录
                mockData.transactions.unshift({
                    type: type,
                    amount: data.amount || 0,
                    date: new Date().toISOString(),
                    status: 'success'
                });
                
                console.log(`${type} transaction completed!`);
                resolve(true);
            }, delay);
        });
    },

    // 生成随机密钥
    generateRandomSecret: (length = 16) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
};

// 在文件顶部添加DOMContentLoaded事件监听器
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航栏
    initNavigation();
    
    // 检查并初始化钱包连接状态
    initWalletStatus();
    
    // 绑定全局连接钱包按钮事件
    bindWalletButtons();
});

/**
 * 初始化钱包状态
 */
function initWalletStatus() {
    const isConnected = localStorage.getItem('walletConnected') === 'true';
    const walletAddress = localStorage.getItem('walletAddress');
    
    // 获取连接钱包和账户下拉菜单元素
    const connectWallet = document.getElementById('connectWallet');
    const accountDropdown = document.getElementById('accountDropdown');
    const walletAddressElement = document.getElementById('walletAddress');
    
    if (connectWallet && accountDropdown) {
        if (isConnected && walletAddress) {
            // 已连接钱包，显示地址
            connectWallet.classList.add('d-none');
            accountDropdown.classList.remove('d-none');
            
            // 显示钱包地址
            if (walletAddressElement) {
                const displayAddress = walletAddress.substring(0, 6) + '...' + walletAddress.substring(walletAddress.length - 4);
                walletAddressElement.textContent = displayAddress;
            }
        } else {
            // 未连接钱包
            connectWallet.classList.remove('d-none');
            accountDropdown.classList.add('d-none');
        }
    }
}

/**
 * 绑定钱包按钮事件
 */
function bindWalletButtons() {
    // 连接钱包按钮
    const connectButton = document.querySelector('#connectWallet a');
    if (connectButton) {
        connectButton.addEventListener('click', function(e) {
            e.preventDefault();
            connectWallet();
        });
    }
    
    // 断开连接按钮
    const disconnectButton = document.getElementById('disconnectWallet');
    if (disconnectButton) {
        disconnectButton.addEventListener('click', function(e) {
            e.preventDefault();
            disconnectWallet();
        });
    }
}

/**
 * 连接钱包功能
 */
function connectWallet() {
    // 模拟连接钱包，生成随机地址
    const randomAddress = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    
    // 保存连接状态
    localStorage.setItem('walletConnected', 'true');
    localStorage.setItem('walletAddress', randomAddress);
    
    // 更新UI
    initWalletStatus();
    
    // 显示提示
    showNotification('Wallet connected successfully!');
    
    // 刷新页面以加载用户数据
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

/**
 * 断开钱包连接
 */
function disconnectWallet() {
    // 清除连接状态
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
    
    // 更新UI
    initWalletStatus();
    
    // 显示提示
    showNotification('Wallet disconnected', 'info');
    
    // 刷新页面
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

/**
 * 显示通知
 */
function showNotification(message, type = 'success') {
    // 检查是否存在通知容器
    let notificationContainer = document.getElementById('notificationContainer');
    
    if (!notificationContainer) {
        // 创建通知容器
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '9999';
        document.body.appendChild(notificationContainer);
    }
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // 添加到容器
    notificationContainer.appendChild(notification);
    
    // 自动关闭
    setTimeout(() => {
        try {
            const bsAlert = new bootstrap.Alert(notification);
            bsAlert.close();
        } catch(e) {
            notification.remove();
        }
    }, 3000);
}

// 导航栏初始化函数
function initNavigation() {
    // 获取当前页面的URL
    const currentPage = window.location.pathname.split('/').pop();
    
    // 设置活动状态
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
    
    // 确保"俱乐部"下拉菜单正确显示
    const clubsNavItem = document.querySelector('.nav-item.dropdown');
    if (clubsNavItem) {
        // 确保在相关页面上保持下拉菜单活动状态
        if (['my-clubs.html', 'explore-clubs.html', 'my-memberships.html'].includes(currentPage)) {
            const dropdownToggle = clubsNavItem.querySelector('.dropdown-toggle');
            if (dropdownToggle) {
                dropdownToggle.classList.add('active');
            }
            
            // 设置对应的下拉菜单项为活动状态
            const dropdownItems = clubsNavItem.querySelectorAll('.dropdown-item');
            dropdownItems.forEach(item => {
                const itemHref = item.getAttribute('href');
                if (itemHref === currentPage) {
                    item.classList.add('active');
                }
            });
        }
    }
} 