document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const domainSearchInput = document.getElementById('domainSearch');
    const searchButton = document.getElementById('searchButton');
    const recentDomainsContainer = document.getElementById('recentDomains');
    
    // 加载最近注册的域名
    loadRecentDomains();
    
    // 搜索按钮点击事件
    searchButton.addEventListener('click', () => {
        const domain = domainSearchInput.value.trim().toLowerCase();
        if (domain) {
            window.location.href = `register.html?domain=${encodeURIComponent(domain)}`;
        }
    });
    
    // 回车键搜索
    domainSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });
    
    // 加载最近注册的域名
    function loadRecentDomains() {
        // 按注册时间排序并获取最新的6个
        const recentDomains = [...mockData.domains]
            .sort((a, b) => new Date(b.registrationTime) - new Date(a.registrationTime))
            .slice(0, 6);
        
        // 清空容器
        recentDomainsContainer.innerHTML = '';
        
        // 生成卡片
        recentDomains.forEach(domain => {
            const { status } = utils.calculateDomainStatus(domain);
            
            const domainCard = document.createElement('div');
            domainCard.className = 'col-md-4 mb-4';
            domainCard.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title">${domain.fullName}</h5>
                            ${utils.getStatusBadgeHTML(status)}
                        </div>
                        <p class="card-text">
                            <small class="text-muted">注册于 ${utils.formatDate(domain.registrationTime)}</small>
                        </p>
                        <p class="card-text">
                            <small class="text-muted">到期时间: ${utils.formatDate(domain.expiryTime)}</small>
                        </p>
                        <a href="domain-details.html?domain=${domain.name}" class="btn btn-sm btn-outline-primary">查看详情</a>
                    </div>
                </div>
            `;
            
            recentDomainsContainer.appendChild(domainCard);
        });
        
        // 如果没有域名，显示提示
        if (recentDomains.length === 0) {
            recentDomainsContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-muted">暂无最近注册的域名</p>
                </div>
            `;
        }
    }
}); 