document.addEventListener('DOMContentLoaded', () => {
    // 全局变量
    let currentDomain = '';
    const hasClub = false; // 初始设为false，后续通过API检查
    
    // 初始化页面
    initPage();
    
    // 事件绑定
    bindEvents();
    
    /**
     * 初始化页面
     */
    function initPage() {
        // 获取当前域名
        const urlParams = new URLSearchParams(window.location.search);
        currentDomain = urlParams.get('domain') || '';
        
        if (!currentDomain) {
            showError('未指定域名');
            return;
        }
        
        console.log(`初始化俱乐部管理页面: ${currentDomain}`);
        
        // 设置页面标题
        document.getElementById('clubTitle').textContent = `${currentDomain} 俱乐部管理`;
        document.getElementById('clubDomain').textContent = `${currentDomain}.web3.club`;
        
        // 检查是否已创建俱乐部
        checkClubStatus();
    }
    
    /**
     * 检查俱乐部状态
     */
    function checkClubStatus() {
        // 获取当前域名
        const urlParams = new URLSearchParams(window.location.search);
        const domainName = urlParams.get('domain');
        
        // 模拟调用合约检查是否有俱乐部
        simulateContractCall('hasClub', {domain: domainName})
            .then(hasClub => {
                if (hasClub) {
                    showManageSection();
                    loadClubDetails();
                } else {
                    // 在显示创建俱乐部界面前，先检查是否需要进行继承决策
                    checkInheritanceNeeded(domainName);
                }
            })
            .catch(error => {
                showError('检查俱乐部状态失败: ' + error.message);
            });
    }
    
    /**
     * 检查是否需要进行继承决策
     */
    function checkInheritanceNeeded(domainName) {
        // 模拟调用合约检查该域名是否需要进行继承决策
        simulateContractCall('needsInheritanceDecision', {domain: domainName})
            .then(needsDecision => {
                if (needsDecision) {
                    // 显示继承决策界面
                    showInheritanceDecisionSection(domainName);
                } else {
                    // 不需要继承决策，直接显示创建俱乐部界面
                    showCreateSection();
                }
            })
            .catch(error => {
                showError('检查继承状态失败: ' + error.message);
                // 出错时默认显示创建俱乐部界面
                showCreateSection();
            });
    }
    
    /**
     * 显示继承决策界面
     */
    function showInheritanceDecisionSection(domainName) {
        // 隐藏创建和管理界面
        document.getElementById('createClubSection').classList.add('d-none');
        document.getElementById('manageClubSection').classList.add('d-none');
        
        // 创建继承决策界面（如果还不存在）
        let inheritanceDecisionSection = document.getElementById('inheritanceDecisionSection');
        if (!inheritanceDecisionSection) {
            inheritanceDecisionSection = document.createElement('div');
            inheritanceDecisionSection.id = 'inheritanceDecisionSection';
            inheritanceDecisionSection.className = 'mb-5';
            
            // 获取原俱乐部信息
            simulateContractCall('getPreviousClubInfo', {domain: domainName})
                .then(prevClubInfo => {
                    inheritanceDecisionSection.innerHTML = `
                        <div class="card">
                            <div class="card-header bg-warning text-dark">
                                <h5 class="card-title mb-0"><i class="bi bi-exclamation-triangle"></i> 继承决策</h5>
                            </div>
                            <div class="card-body">
                                <p>
                                    您注册的域名 "<strong>${domainName}.web3.club</strong>" 之前由其他用户创建过俱乐部。
                                    根据您的继承策略设置，需要您手动决定是否继承原有俱乐部的会员数据。
                                </p>
                                
                                <div class="card border-info mb-3">
                                    <div class="card-header bg-info text-white">原俱乐部信息</div>
                                    <div class="card-body">
                                        <p><strong>名称:</strong> <span>${prevClubInfo.name || '未知俱乐部'}</span></p>
                                        <p><strong>会员数:</strong> <span>${prevClubInfo.memberCount || 0}</span> 人</p>
                                        <p><strong>创建时间:</strong> <span>${formatDate(prevClubInfo.creationDate) || '未知'}</span></p>
                                    </div>
                                </div>
                                
                                <p>继承后，原俱乐部所有会员会自动成为您新俱乐部的会员。</p>
                                
                                <div class="d-grid gap-2">
                                    <button class="btn btn-success" id="acceptInheritanceBtn">
                                        <i class="bi bi-check-lg"></i> 继承会员数据并创建俱乐部
                                    </button>
                                    <button class="btn btn-danger" id="rejectInheritanceBtn">
                                        <i class="bi bi-x-lg"></i> 不继承，创建全新俱乐部
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    // 将继承决策区域插入到页面中，紧跟在页面头部之后
                    const pageHeader = document.querySelector('.d-flex.justify-content-between.align-items-center.mb-4');
                    pageHeader.parentNode.insertBefore(inheritanceDecisionSection, pageHeader.nextSibling);
                    
                    // 绑定继承决策按钮事件
                    document.getElementById('acceptInheritanceBtn').addEventListener('click', () => {
                        decideInheritance(domainName, true);
                    });
                    
                    document.getElementById('rejectInheritanceBtn').addEventListener('click', () => {
                        decideInheritance(domainName, false);
                    });
                })
                .catch(error => {
                    showError('获取原俱乐部信息失败: ' + error.message);
                    showCreateSection(); // 出错时显示创建界面
                });
        } else {
            // 如果继承决策区域已存在，则显示它
            inheritanceDecisionSection.classList.remove('d-none');
        }
    }
    
    /**
     * 处理继承决策
     */
    function decideInheritance(domainName, shouldInherit) {
        showMessage('正在处理继承决策...', 'info');
        
        // 模拟调用合约 decideClubInheritance
        simulateContractCall('decideClubInheritance', {domain: domainName, inherit: shouldInherit})
            .then(() => {
                if (shouldInherit) {
                    showMessage('已成功继承原俱乐部会员数据！', 'success');
                    // 继承成功后，显示管理界面而不是创建界面，因为俱乐部已经从原来的继承过来了
                    showManageSection();
                    loadClubDetails();
                } else {
                    showMessage('已拒绝继承原俱乐部会员数据，请创建全新的俱乐部！', 'success');
                    // 移除继承决策区域
                    const inheritanceDecisionSection = document.getElementById('inheritanceDecisionSection');
                    if (inheritanceDecisionSection) {
                        inheritanceDecisionSection.remove();
                    }
                    // 显示创建俱乐部界面
                    showCreateSection();
                }
            })
            .catch(error => {
                showError('处理继承决策失败: ' + error.message);
            });
    }
    
    /**
     * 显示创建俱乐部部分
     */
    function showCreateSection() {
        document.getElementById('createClubSection').classList.remove('d-none');
        document.getElementById('manageClubSection').classList.add('d-none');
    }
    
    /**
     * 显示管理俱乐部部分
     */
    function showManageSection() {
        document.getElementById('createClubSection').classList.add('d-none');
        document.getElementById('manageClubSection').classList.remove('d-none');
    }
    
    /**
     * 加载俱乐部详情
     */
    function loadClubDetails() {
        console.log('加载俱乐部详情...');
        
        // 加载基本信息
        loadBasicInfo();
        
        // 加载永久会员设置
        loadPermanentSettings();
        
        // 加载临时会员设置
        loadTemporarySettings();
        
        // 加载代币门槛设置
        loadTokenGateSettings();
        
        // 加载会员列表
        loadMembers();
        
        // 加载继承策略
        loadInheritancePolicy();
    }
    
    /**
     * 加载基本信息
     */
    function loadBasicInfo() {
        // 模拟从合约获取俱乐部基本信息
        // 实际项目中应通过合约调用 permMembership.getCollectionInfo(currentDomain)
        simulateContractCall('getCollectionInfo', {domain: currentDomain})
            .then(info => {
                // 填充表单
                document.getElementById('basicClubName').value = info.name;
                document.getElementById('basicClubSymbol').value = info.symbol;
                document.getElementById('basicClubDescription').value = info.description;
                document.getElementById('basicClubLogoUrl').value = info.logoURI;
                document.getElementById('basicClubBannerUrl').value = info.bannerURI;
                document.getElementById('basicClubBaseUri').value = info.baseURI;
                
                // 更新会员统计
                document.getElementById('totalMembers').textContent = info.memberCount || '0';
                
                // 获取永久会员和临时会员数量
                simulateContractCall('getMemberCounts', {domain: currentDomain})
                    .then(counts => {
                        document.getElementById('permanentMembers').textContent = counts.permanent || '0';
                        document.getElementById('temporaryMembers').textContent = counts.temporary || '0';
                    });
            })
            .catch(error => {
                showError('加载俱乐部信息失败: ' + error.message);
            });
    }
    
    /**
     * 加载永久会员设置
     */
    function loadPermanentSettings() {
        // 模拟从合约获取永久会员设置
        simulateContractCall('getPermanentSettings', {domain: currentDomain})
            .then(settings => {
                // 填充表单
                document.getElementById('permanentPrice').value = fromWei(settings.price);
                document.getElementById('permanentReceiver').value = settings.receiver;
                document.getElementById('transferPolicy').value = settings.policy;
                
                // 如果是白名单模式，显示白名单部分
                if (settings.policy === 'WHITELIST') {
                    document.getElementById('whitelistSection').style.display = 'block';
                    document.getElementById('whitelistAddresses').value = settings.whitelist.join('\n');
                } else {
                    document.getElementById('whitelistSection').style.display = 'none';
                }
            })
            .catch(error => {
                showError('加载永久会员设置失败: ' + error.message);
            });
    }
    
    /**
     * 加载临时会员设置
     */
    function loadTemporarySettings() {
        // 模拟从合约获取临时会员设置
        simulateContractCall('getTemporarySettings', {domain: currentDomain})
            .then(settings => {
                // 填充表单
                document.getElementById('monthlyPrice').value = fromWei(settings.monthlyPrice);
                document.getElementById('quarterlyPrice').value = fromWei(settings.quarterlyPrice);
                document.getElementById('yearlyPrice').value = fromWei(settings.yearlyPrice);
                document.getElementById('temporaryBaseUri').value = settings.baseUri;
            })
            .catch(error => {
                showError('加载临时会员设置失败: ' + error.message);
            });
    }
    
    /**
     * 加载代币门槛设置
     */
    function loadTokenGateSettings() {
        // 加载ERC20代币门槛
        simulateContractCall('getTokenGate', {domain: currentDomain})
            .then(gate => {
                if (gate.tokenAddress && gate.tokenAddress !== '0x0000000000000000000000000000000000000000') {
                    document.getElementById('tokenAddress').value = gate.tokenAddress;
                    document.getElementById('tokenThreshold').value = fromWei(gate.threshold);
                }
            });
        
        // 加载NFT门槛
        simulateContractCall('getNFTGate', {domain: currentDomain})
            .then(gate => {
                if (gate.tokenAddress && gate.tokenAddress !== '0x0000000000000000000000000000000000000000') {
                    document.getElementById('nftAddress').value = gate.tokenAddress;
                    document.getElementById('nftThreshold').value = gate.threshold;
                }
            });
        
        // 加载跨链代币
        loadCrossChainTokens();
    }
    
    /**
     * 加载跨链代币设置
     */
    function loadCrossChainTokens() {
        // 模拟从合约获取跨链代币列表
        simulateContractCall('getCrossChainTokens', {domain: currentDomain})
            .then(tokens => {
                const tableBody = document.getElementById('crossChainTableBody');
                tableBody.innerHTML = '';
                
                if (tokens && tokens.length > 0) {
                    document.getElementById('noCrossChain').classList.add('d-none');
                    
                    tokens.forEach(token => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${token.chainName}</td>
                            <td>${shortenAddress(token.tokenAddress)}</td>
                            <td>${token.tokenSymbol}</td>
                            <td>${token.threshold}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-danger remove-cross-chain" data-chain="${token.chainName}">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </td>
                        `;
                        tableBody.appendChild(row);
                    });
                    
                    // 绑定删除按钮事件
                    document.querySelectorAll('.remove-cross-chain').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const chainName = this.getAttribute('data-chain');
                            removeCrossChainToken(chainName);
                        });
                    });
                } else {
                    document.getElementById('noCrossChain').classList.remove('d-none');
                }
            })
            .catch(error => {
                showError('加载跨链代币设置失败: ' + error.message);
            });
    }
    
    /**
     * 加载会员列表
     */
    function loadMembers() {
        // 模拟从合约获取会员列表
        simulateContractCall('getMembers', {domain: currentDomain})
            .then(members => {
                const tableBody = document.getElementById('membersTableBody');
                tableBody.innerHTML = '';
                
                if (members && members.length > 0) {
                    document.getElementById('noMembers').classList.add('d-none');
                    document.getElementById('membersPagination').classList.remove('d-none');
                    
                    members.forEach(member => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>
                                <div class="form-check">
                                    <input class="form-check-input member-checkbox" type="checkbox" value="${member.address}">
                                </div>
                            </td>
                            <td>${shortenAddress(member.address)}</td>
                            <td><span class="badge ${getBadgeClass(member.type)}">${member.type}</span></td>
                            <td>${formatDate(member.joinTime)}</td>
                            <td>${formatDate(member.expiryTime)}</td>
                            <td>
                                ${member.type.includes('临时') ? 
                                    `<button class="btn btn-sm btn-outline-primary renew-member" data-address="${member.address}">续期</button>` : 
                                    ''}
                                <button class="btn btn-sm btn-outline-danger revoke-member" data-address="${member.address}">撤销</button>
                            </td>
                        `;
                        tableBody.appendChild(row);
                    });
                    
                    // 绑定会员操作按钮事件
                    bindMemberActionEvents();
                } else {
                    document.getElementById('noMembers').classList.remove('d-none');
                    document.getElementById('membersPagination').classList.add('d-none');
                }
            })
            .catch(error => {
                showError('加载会员列表失败: ' + error.message);
            });
    }
    
    /**
     * 加载继承策略
     */
    function loadInheritancePolicy() {
        // 模拟从合约获取继承策略
        simulateContractCall('getInheritancePolicy', {domain: currentDomain})
            .then(policy => {
                // 不再设置下拉框值，而是加载俱乐部继承相关信息
                simulateContractCall('getClubInheritanceInfo', {domain: currentDomain})
                    .then(info => {
                        // 设置继承状态
                        const statusElement = document.getElementById('inheritanceStatus');
                        if (info.isInherited) {
                            statusElement.textContent = '继承的俱乐部';
                            statusElement.className = 'badge bg-info';
                            
                            // 显示继承来源信息
                            document.getElementById('inheritedFromInfo').style.display = 'block';
                            document.getElementById('inheritedFromOwner').textContent = info.previousOwner;
                        } else {
                            statusElement.textContent = '原始俱乐部';
                            statusElement.className = 'badge bg-success';
                            
                            // 隐藏继承来源信息
                            document.getElementById('inheritedFromInfo').style.display = 'none';
                        }
                        
                        // 设置创建时间
                        document.getElementById('clubCreationDate').textContent = formatDate(info.creationDate);
                        
                        // 设置过期时间
                        document.getElementById('domainExpiryDate').textContent = formatDate(info.expiryDate);
                    });
            })
            .catch(error => {
                showError('加载继承策略失败: ' + error.message);
            });
    }
    
    /**
     * 绑定事件
     */
    function bindEvents() {
        // 创建俱乐部表单提交
        document.getElementById('createClubForm').addEventListener('submit', function(e) {
            e.preventDefault();
            createClub();
        });
        
        // 基本信息表单提交
        document.getElementById('basicInfoForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveBasicInfo();
        });
        
        // 永久会员价格表单提交
        document.getElementById('permanentMembershipForm').addEventListener('submit', function(e) {
            e.preventDefault();
            savePermanentPrice();
        });
        
        // 转移策略表单提交
        document.getElementById('transferPolicyForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveTransferPolicy();
        });
        
        // 授予永久会员表单提交
        document.getElementById('grantPermanentForm').addEventListener('submit', function(e) {
            e.preventDefault();
            grantPermanentMembership();
        });
        
        // 临时会员价格表单提交
        document.getElementById('temporaryPriceForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveTemporaryPrice();
        });
        
        // 临时会员元数据表单提交
        document.getElementById('temporaryMetadataForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveTemporaryMetadata();
        });
        
        // 授予临时会员表单提交
        document.getElementById('grantTemporaryForm').addEventListener('submit', function(e) {
            e.preventDefault();
            grantTemporaryMembership();
        });
        
        // ERC20代币门槛表单提交
        document.getElementById('erc20GateForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveTokenGate();
        });
        
        // 移除代币门槛按钮点击
        document.getElementById('removeTokenGateBtn').addEventListener('click', function() {
            removeTokenGate();
        });
        
        // NFT门槛表单提交
        document.getElementById('nftGateForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveNftGate();
        });
        
        // 移除NFT门槛按钮点击
        document.getElementById('removeNftGateBtn').addEventListener('click', function() {
            removeNftGate();
        });
        
        // 跨链代币表单提交
        document.getElementById('crossChainForm').addEventListener('submit', function(e) {
            e.preventDefault();
            addCrossChainToken();
        });
        
        // 转移管理权按钮点击
        document.getElementById('transferAdminBtn').addEventListener('click', function() {
            // 显示转移管理权模态框
            const modal = new bootstrap.Modal(document.getElementById('transferAdminModal'));
            modal.show();
        });
        
        // 确认转移管理权按钮点击
        document.getElementById('confirmTransferAdminBtn').addEventListener('click', function() {
            transferClubAdmin();
        });
        
        // 删除俱乐部按钮点击
        document.getElementById('deleteClubBtn').addEventListener('click', function() {
            // 显示删除确认模态框
            const modal = new bootstrap.Modal(document.getElementById('deleteClubModal'));
            modal.show();
        });
        
        // 删除确认文本框输入事件
        document.getElementById('deleteConfirmText').addEventListener('input', function() {
            const confirmBtn = document.getElementById('confirmDeleteClubBtn');
            if (this.value === 'DELETE') {
                confirmBtn.removeAttribute('disabled');
            } else {
                confirmBtn.setAttribute('disabled', 'disabled');
            }
        });
        
        // 确认删除俱乐部按钮点击
        document.getElementById('confirmDeleteClubBtn').addEventListener('click', function() {
            deleteClub();
        });
        
        // 导出会员按钮点击
        document.getElementById('exportMembersBtn').addEventListener('click', function() {
            exportMembers();
        });
        
        // 刷新会员按钮点击
        document.getElementById('refreshMembersBtn').addEventListener('click', function() {
            loadMembers();
        });
        
        // 批量续期按钮点击
        document.getElementById('batchRenewBtn').addEventListener('click', function() {
            prepareBatchRenew();
        });
        
        // 确认批量续期按钮点击
        document.getElementById('confirmBatchRenewBtn').addEventListener('click', function() {
            batchRenewMembers();
        });
        
        // 批量撤销按钮点击
        document.getElementById('batchRevokeBtn').addEventListener('click', function() {
            batchRevokeMembers();
        });
        
        // 全选会员复选框点击
        document.getElementById('selectAllMembers').addEventListener('click', function() {
            const isChecked = this.checked;
            document.querySelectorAll('.member-checkbox').forEach(checkbox => {
                checkbox.checked = isChecked;
            });
        });
        
        // 会员筛选下拉框变化
        document.getElementById('memberTypeFilter').addEventListener('change', function() {
            filterMembers();
        });
        
        // 会员搜索按钮点击
        document.getElementById('memberSearchBtn').addEventListener('click', function() {
            searchMembers();
        });
        
        // 会员搜索输入框回车事件
        document.getElementById('memberSearchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchMembers();
            }
        });
        
        // 转移策略下拉框变化
        document.getElementById('transferPolicy').addEventListener('change', function() {
            if (this.value === 'WHITELIST') {
                document.getElementById('whitelistSection').style.display = 'block';
            } else {
                document.getElementById('whitelistSection').style.display = 'none';
            }
        });
        
        // 区块链下拉框变化
        document.getElementById('chainName').addEventListener('change', function() {
            if (this.value === 'custom') {
                document.getElementById('customChainDiv').style.display = 'block';
            } else {
                document.getElementById('customChainDiv').style.display = 'none';
            }
        });
    }
    
    /**
     * 绑定会员操作按钮事件
     */
    function bindMemberActionEvents() {
        // 续期会员按钮点击
        document.querySelectorAll('.renew-member').forEach(btn => {
            btn.addEventListener('click', function() {
                const address = this.getAttribute('data-address');
                renewMember(address);
            });
        });
        
        // 撤销会员按钮点击
        document.querySelectorAll('.revoke-member').forEach(btn => {
            btn.addEventListener('click', function() {
                const address = this.getAttribute('data-address');
                revokeMember(address);
            });
        });
    }
    
    /**
     * 创建俱乐部
     */
    function createClub() {
        const name = document.getElementById('clubName').value;
        const symbol = document.getElementById('clubSymbol').value;
        const description = document.getElementById('clubDescription').value;
        const logoUrl = document.getElementById('clubLogoUrl').value;
        const bannerUrl = document.getElementById('clubBannerUrl').value;
        
        if (!name || !symbol) {
            showError('俱乐部名称和符号不能为空');
            return;
        }
        
        showMessage('正在创建俱乐部...', 'info');
        
        // 模拟合约调用创建俱乐部
        // 实际项目中应调用：clubManager.createClub(currentDomain)
        simulateContractCall('createClub', {domain: currentDomain})
            .then(() => {
                // 初始化永久会员设置
                return simulateContractCall('initializeClub', {
                    domain: currentDomain,
                    name: name,
                    symbol: symbol,
                    baseURI: '',
                    contract: 'permanent'
                });
            })
            .then(() => {
                // 初始化临时会员设置
                return simulateContractCall('initializeClub', {
                    domain: currentDomain,
                    name: name,
                    symbol: symbol,
                    baseURI: '',
                    contract: 'temporary'
                });
            })
            .then(() => {
                // 初始化代币门槛设置
                return simulateContractCall('initializeClub', {
                    domain: currentDomain,
                    contract: 'token'
                });
            })
            .then(() => {
                // 更新媒体信息
                if (logoUrl || bannerUrl || description) {
                    return simulateContractCall('updateCollectionMedia', {
                        domain: currentDomain,
                        logoURI: logoUrl,
                        bannerURI: bannerUrl,
                        description: description
                    });
                }
            })
            .then(() => {
                showMessage('俱乐部创建成功！', 'success');
                
                // 切换到管理界面
                showManageSection();
                loadClubDetails();
            })
            .catch(error => {
                showError('创建俱乐部失败: ' + error.message);
            });
    }
    
    /**
     * 保存基本信息
     */
    function saveBasicInfo() {
        const name = document.getElementById('basicClubName').value;
        const symbol = document.getElementById('basicClubSymbol').value;
        const description = document.getElementById('basicClubDescription').value;
        const logoUrl = document.getElementById('basicClubLogoUrl').value;
        const bannerUrl = document.getElementById('basicClubBannerUrl').value;
        const baseUri = document.getElementById('basicClubBaseUri').value;
        
        if (!name || !symbol) {
            showError('俱乐部名称和符号不能为空');
            return;
        }
        
        showMessage('正在保存基本信息...', 'info');
        
        // 更新合集信息
        simulateContractCall('updateCollectionInfo', {
            domain: currentDomain,
            name: name,
            symbol: symbol,
            baseURI: baseUri
        })
            .then(() => {
                // 更新媒体信息
                return simulateContractCall('updateCollectionMedia', {
                    domain: currentDomain,
                    logoURI: logoUrl,
                    bannerURI: bannerUrl,
                    description: description
                });
            })
            .then(() => {
                showMessage('基本信息保存成功！', 'success');
            })
            .catch(error => {
                showError('保存基本信息失败: ' + error.message);
            });
    }
    
    /**
     * 保存永久会员价格
     */
    function savePermanentPrice() {
        const price = document.getElementById('permanentPrice').value;
        const receiver = document.getElementById('permanentReceiver').value;
        
        if (!receiver) {
            showError('收款地址不能为空');
            return;
        }
        
        showMessage('正在保存永久会员价格...', 'info');
        
        // 模拟合约调用更新价格
        simulateContractCall('updatePaymentSettings', {
            domain: currentDomain,
            price: toWei(price),
            receiver: receiver
        })
            .then(() => {
                showMessage('永久会员价格保存成功！', 'success');
            })
            .catch(error => {
                showError('保存永久会员价格失败: ' + error.message);
            });
    }
    
    /**
     * 保存转移策略
     */
    function saveTransferPolicy() {
        const policy = document.getElementById('transferPolicy').value;
        let whitelist = [];
        
        if (policy === 'WHITELIST') {
            const whitelistText = document.getElementById('whitelistAddresses').value;
            whitelist = whitelistText.split('\n').map(address => address.trim()).filter(address => address);
            
            if (whitelist.length === 0) {
                showError('白名单不能为空');
                return;
            }
        }
        
        showMessage('正在保存转移策略...', 'info');
        
        // 模拟合约调用配置转移策略
        simulateContractCall('configureTransferPolicy', {
            domain: currentDomain,
            policy: policy,
            whitelist: whitelist
        })
            .then(() => {
                showMessage('转移策略保存成功！', 'success');
            })
            .catch(error => {
                showError('保存转移策略失败: ' + error.message);
            });
    }
    
    /**
     * 授予永久会员资格
     */
    function grantPermanentMembership() {
        const addressesText = document.getElementById('permanentAddresses').value;
        const addresses = addressesText.split('\n').map(address => address.trim()).filter(address => address);
        
        if (addresses.length === 0) {
            showError('请输入至少一个地址');
            return;
        }
        
        showMessage('正在授予永久会员资格...', 'info');
        
        // 模拟合约调用授予永久会员资格
        const promises = addresses.map(address => {
            return simulateContractCall('grantMembership', {
                domain: currentDomain,
                to: address,
                contract: 'permanent'
            });
        });
        
        Promise.all(promises)
            .then(() => {
                showMessage(`已成功授予 ${addresses.length} 人永久会员资格！`, 'success');
                loadMembers();
            })
            .catch(error => {
                showError('授予永久会员资格失败: ' + error.message);
            });
    }
    
    /**
     * 保存临时会员价格
     */
    function saveTemporaryPrice() {
        const monthlyPrice = document.getElementById('monthlyPrice').value;
        const quarterlyPrice = document.getElementById('quarterlyPrice').value;
        const yearlyPrice = document.getElementById('yearlyPrice').value;
        
        showMessage('正在保存临时会员价格...', 'info');
        
        // 设置月度价格
        simulateContractCall('setPrice', {
            domain: currentDomain,
            price: toWei(monthlyPrice)
        })
            .then(() => {
                // 设置季度价格
                return simulateContractCall('setQuarterPrice', {
                    domain: currentDomain,
                    price: toWei(quarterlyPrice)
                });
            })
            .then(() => {
                // 设置年度价格
                return simulateContractCall('setYearPrice', {
                    domain: currentDomain,
                    price: toWei(yearlyPrice)
                });
            })
            .then(() => {
                showMessage('临时会员价格保存成功！', 'success');
            })
            .catch(error => {
                showError('保存临时会员价格失败: ' + error.message);
            });
    }
    
    /**
     * 保存临时会员元数据
     */
    function saveTemporaryMetadata() {
        const baseUri = document.getElementById('temporaryBaseUri').value;
        
        showMessage('正在保存临时会员元数据...', 'info');
        
        // 模拟合约调用设置基础URI
        simulateContractCall('setClubBaseURI', {
            domain: currentDomain,
            baseURI: baseUri,
            contract: 'temporary'
        })
            .then(() => {
                showMessage('临时会员元数据保存成功！', 'success');
            })
            .catch(error => {
                showError('保存临时会员元数据失败: ' + error.message);
            });
    }
    
    /**
     * 授予临时会员资格
     */
    function grantTemporaryMembership() {
        const addressesText = document.getElementById('temporaryAddresses').value;
        const addresses = addressesText.split('\n').map(address => address.trim()).filter(address => address);
        const duration = parseInt(document.getElementById('temporaryDuration').value);
        const unit = document.getElementById('temporaryDurationUnit').value;
        
        if (addresses.length === 0) {
            showError('请输入至少一个地址');
            return;
        }
        
        if (isNaN(duration) || duration <= 0) {
            showError('请输入有效的会员时长');
            return;
        }
        
        // 计算秒数
        let durationInSeconds = duration * 24 * 60 * 60; // 默认天
        if (unit === 'months') {
            durationInSeconds = duration * 30 * 24 * 60 * 60;
        } else if (unit === 'years') {
            durationInSeconds = duration * 365 * 24 * 60 * 60;
        }
        
        showMessage('正在授予临时会员资格...', 'info');
        
        // 模拟合约调用批量授予临时会员资格
        simulateContractCall('grantMemberships', {
            domain: currentDomain,
            recipients: addresses,
            duration: durationInSeconds
        })
            .then(() => {
                showMessage(`已成功授予 ${addresses.length} 人临时会员资格！`, 'success');
                loadMembers();
            })
            .catch(error => {
                showError('授予临时会员资格失败: ' + error.message);
            });
    }
    
    /**
     * 保存代币门槛
     */
    function saveTokenGate() {
        const tokenAddress = document.getElementById('tokenAddress').value;
        const threshold = document.getElementById('tokenThreshold').value;
        
        if (!tokenAddress) {
            showError('代币地址不能为空');
            return;
        }
        
        if (isNaN(threshold) || parseFloat(threshold) <= 0) {
            showError('请输入有效的持有门槛');
            return;
        }
        
        showMessage('正在设置代币门槛...', 'info');
        
        // 模拟合约调用添加代币门槛
        simulateContractCall('addTokenGate', {
            domain: currentDomain,
            tokenAddress: tokenAddress,
            threshold: toWei(threshold)
        })
            .then(() => {
                showMessage('代币门槛设置成功！', 'success');
            })
            .catch(error => {
                showError('设置代币门槛失败: ' + error.message);
            });
    }
    
    /**
     * 移除代币门槛
     */
    function removeTokenGate() {
        showMessage('正在移除代币门槛...', 'info');
        
        // 模拟合约调用添加空的代币门槛（相当于移除）
        simulateContractCall('addTokenGate', {
            domain: currentDomain,
            tokenAddress: '0x0000000000000000000000000000000000000000',
            threshold: '0'
        })
            .then(() => {
                showMessage('代币门槛已移除！', 'success');
                document.getElementById('tokenAddress').value = '';
                document.getElementById('tokenThreshold').value = '0';
            })
            .catch(error => {
                showError('移除代币门槛失败: ' + error.message);
            });
    }
    
    /**
     * 保存NFT门槛
     */
    function saveNftGate() {
        const nftAddress = document.getElementById('nftAddress').value;
        const threshold = document.getElementById('nftThreshold').value;
        
        if (!nftAddress) {
            showError('NFT合约地址不能为空');
            return;
        }
        
        if (isNaN(threshold) || parseInt(threshold) <= 0) {
            showError('请输入有效的持有数量');
            return;
        }
        
        showMessage('正在设置NFT门槛...', 'info');
        
        // 模拟合约调用添加NFT门槛
        simulateContractCall('addNFTGate', {
            domain: currentDomain,
            nftContract: nftAddress,
            requiredAmount: threshold
        })
            .then(() => {
                showMessage('NFT门槛设置成功！', 'success');
            })
            .catch(error => {
                showError('设置NFT门槛失败: ' + error.message);
            });
    }
    
    /**
     * 移除NFT门槛
     */
    function removeNftGate() {
        showMessage('正在移除NFT门槛...', 'info');
        
        // 模拟合约调用添加空的NFT门槛（相当于移除）
        simulateContractCall('addNFTGate', {
            domain: currentDomain,
            nftContract: '0x0000000000000000000000000000000000000000',
            requiredAmount: '0'
        })
            .then(() => {
                showMessage('NFT门槛已移除！', 'success');
                document.getElementById('nftAddress').value = '';
                document.getElementById('nftThreshold').value = '1';
            })
            .catch(error => {
                showError('移除NFT门槛失败: ' + error.message);
            });
    }
    
    /**
     * 添加跨链代币
     */
    function addCrossChainToken() {
        let chainName = document.getElementById('chainName').value;
        const tokenAddress = document.getElementById('crossChainTokenAddress').value;
        const tokenSymbol = document.getElementById('tokenSymbol').value;
        const threshold = document.getElementById('crossChainThreshold').value;
        
        if (chainName === 'custom') {
            chainName = document.getElementById('customChainName').value;
            if (!chainName) {
                showError('自定义链名不能为空');
                return;
            }
        }
        
        if (!tokenAddress) {
            showError('代币地址不能为空');
            return;
        }
        
        if (!tokenSymbol) {
            showError('代币符号不能为空');
            return;
        }
        
        if (isNaN(threshold) || parseFloat(threshold) <= 0) {
            showError('请输入有效的持有门槛');
            return;
        }
        
        showMessage('正在添加跨链代币门槛...', 'info');
        
        // 模拟合约调用添加跨链代币门槛
        simulateContractCall('addCrossChainTokenGate', {
            domain: currentDomain,
            chainName: chainName,
            tokenAddress: tokenAddress,
            tokenSymbol: tokenSymbol,
            threshold: threshold
        })
            .then(() => {
                showMessage('跨链代币门槛添加成功！', 'success');
                loadCrossChainTokens();
                
                // 清空表单
                document.getElementById('chainName').value = 'polygon';
                document.getElementById('customChainName').value = '';
                document.getElementById('crossChainTokenAddress').value = '';
                document.getElementById('tokenSymbol').value = '';
                document.getElementById('crossChainThreshold').value = '100';
                document.getElementById('customChainDiv').style.display = 'none';
            })
            .catch(error => {
                showError('添加跨链代币门槛失败: ' + error.message);
            });
    }
    
    /**
     * 移除跨链代币
     */
    function removeCrossChainToken(chainName) {
        if (!confirm(`确定要移除 ${chainName} 链上的代币门槛吗？`)) {
            return;
        }
        
        showMessage('正在移除跨链代币门槛...', 'info');
        
        // 模拟合约调用移除跨链代币门槛
        simulateContractCall('removeCrossChainTokenGate', {
            domain: currentDomain,
            chainName: chainName
        })
            .then(() => {
                showMessage('跨链代币门槛已移除！', 'success');
                loadCrossChainTokens();
            })
            .catch(error => {
                showError('移除跨链代币门槛失败: ' + error.message);
            });
    }
    
    /**
     * 续期会员
     */
    function renewMember(address) {
        // 弹出对话框让用户输入续期时长
        const duration = prompt('请输入续期天数:', '30');
        
        if (!duration) return;
        
        const days = parseInt(duration);
        
        if (isNaN(days) || days <= 0) {
            showError('请输入有效的天数');
            return;
        }
        
        const durationInSeconds = days * 24 * 60 * 60;
        
        showMessage('正在续期会员...', 'info');
        
        // 模拟合约调用续期会员
        simulateContractCall('renewMembership', {
            domain: currentDomain,
            member: address,
            additionalDuration: durationInSeconds
        })
            .then(() => {
                showMessage('会员续期成功！', 'success');
                loadMembers();
            })
            .catch(error => {
                showError('会员续期失败: ' + error.message);
            });
    }
    
    /**
     * 撤销会员资格
     */
    function revokeMember(address) {
        if (!confirm(`确定要撤销 ${shortenAddress(address)} 的会员资格吗？`)) {
            return;
        }
        
        showMessage('正在撤销会员资格...', 'info');
        
        // 模拟合约调用撤销会员资格
        simulateContractCall('revokeAccess', {
            domain: currentDomain,
            accounts: [address]
        })
            .then(() => {
                showMessage('会员资格已撤销！', 'success');
                loadMembers();
            })
            .catch(error => {
                showError('撤销会员资格失败: ' + error.message);
            });
    }
    
    /**
     * 准备批量续期
     */
    function prepareBatchRenew() {
        const selectedMembers = getSelectedMembers();
        
        if (selectedMembers.length === 0) {
            showError('请选择至少一个会员');
            return;
        }
        
        // 更新选中的会员数量
        document.getElementById('selectedMemberCount').textContent = selectedMembers.length;
        
        // 显示批量续期模态框
        const modal = new bootstrap.Modal(document.getElementById('batchRenewModal'));
        modal.show();
    }
    
    /**
     * 批量续期会员
     */
    function batchRenewMembers() {
        const selectedMembers = getSelectedMembers();
        const duration = parseInt(document.getElementById('batchRenewDuration').value);
        const unit = document.getElementById('batchRenewDurationUnit').value;
        
        if (isNaN(duration) || duration <= 0) {
            showError('请输入有效的续期时长');
            return;
        }
        
        // 计算秒数
        let durationInSeconds = duration * 24 * 60 * 60; // 默认天
        if (unit === 'months') {
            durationInSeconds = duration * 30 * 24 * 60 * 60;
        } else if (unit === 'years') {
            durationInSeconds = duration * 365 * 24 * 60 * 60;
        }
        
        showMessage('正在批量续期会员...', 'info');
        
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('batchRenewModal'));
        modal.hide();
        
        // 模拟合约调用批量续期会员
        const promises = selectedMembers.map(address => {
            return simulateContractCall('renewMembership', {
                domain: currentDomain,
                member: address,
                additionalDuration: durationInSeconds
            });
        });
        
        Promise.all(promises)
            .then(() => {
                showMessage(`已成功续期 ${selectedMembers.length} 个会员！`, 'success');
                loadMembers();
            })
            .catch(error => {
                showError('批量续期会员失败: ' + error.message);
            });
    }
    
    /**
     * 批量撤销会员资格
     */
    function batchRevokeMembers() {
        const selectedMembers = getSelectedMembers();
        
        if (selectedMembers.length === 0) {
            showError('请选择至少一个会员');
            return;
        }
        
        if (!confirm(`确定要撤销选中的 ${selectedMembers.length} 个会员的资格吗？`)) {
            return;
        }
        
        showMessage('正在批量撤销会员资格...', 'info');
        
        // 模拟合约调用撤销会员资格
        simulateContractCall('revokeAccess', {
            domain: currentDomain,
            accounts: selectedMembers
        })
            .then(() => {
                showMessage(`已成功撤销 ${selectedMembers.length} 个会员的资格！`, 'success');
                loadMembers();
            })
            .catch(error => {
                showError('批量撤销会员资格失败: ' + error.message);
            });
    }
    
    /**
     * 转移俱乐部管理权
     */
    function transferClubAdmin() {
        const newAdmin = document.getElementById('newAdmin').value;
        
        if (!newAdmin) {
            showError('新管理员地址不能为空');
            return;
        }
        
        showMessage('正在转移管理权...', 'info');
        
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('transferAdminModal'));
        modal.hide();
        
        // 模拟合约调用转移管理权
        simulateContractCall('transferAdmin', {
            domain: currentDomain,
            newAdmin: newAdmin
        })
            .then(() => {
                showMessage('管理权转移成功！即将返回我的域名页面', 'success');
                
                // 延迟跳转
                setTimeout(() => {
                    window.location.href = 'my-domains.html';
                }, 2000);
            })
            .catch(error => {
                showError('转移管理权失败: ' + error.message);
            });
    }
    
    /**
     * 删除俱乐部
     */
    function deleteClub() {
        const confirmText = document.getElementById('deleteConfirmText').value;
        
        if (confirmText !== 'DELETE') {
            showError('请输入正确的确认文本');
            return;
        }
        
        showMessage('正在删除俱乐部...', 'info');
        
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteClubModal'));
        modal.hide();
        
        // 模拟合约调用取消初始化俱乐部
        simulateContractCall('uninitializeClub', {
            domain: currentDomain,
            contract: 'permanent'
        })
            .then(() => {
                return simulateContractCall('uninitializeClub', {
                    domain: currentDomain,
                    contract: 'temporary'
                });
            })
            .then(() => {
                return simulateContractCall('uninitializeClub', {
                    domain: currentDomain,
                    contract: 'token'
                });
            })
            .then(() => {
                showMessage('俱乐部删除成功！即将返回我的域名页面', 'success');
                
                // 延迟跳转
                setTimeout(() => {
                    window.location.href = 'my-domains.html';
                }, 2000);
            })
            .catch(error => {
                showError('删除俱乐部失败: ' + error.message);
            });
    }
    
    /**
     * 导出会员数据
     */
    function exportMembers() {
        showMessage('正在导出会员数据...', 'info');
        
        // 模拟从合约获取会员列表
        simulateContractCall('getMembers', {domain: currentDomain})
            .then(members => {
                if (!members || members.length === 0) {
                    showMessage('没有会员数据可导出', 'warning');
                    return;
                }
                
                // 创建CSV数据
                let csvContent = "data:text/csv;charset=utf-8,地址,会员类型,加入时间,到期时间\n";
                
                members.forEach(member => {
                    csvContent += `${member.address},${member.type},${formatDate(member.joinTime)},${formatDate(member.expiryTime)}\n`;
                });
                
                // 创建下载链接
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `${currentDomain}_会员数据.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                showMessage('会员数据导出成功！', 'success');
            })
            .catch(error => {
                showError('导出会员数据失败: ' + error.message);
            });
    }
    
    /**
     * 过滤会员列表
     */
    function filterMembers() {
        const filter = document.getElementById('memberTypeFilter').value;
        const rows = document.querySelectorAll('#membersTableBody tr');
        
        rows.forEach(row => {
            const typeCell = row.querySelector('td:nth-child(3)');
            const type = typeCell.textContent.trim();
            
            if (filter === 'all' || 
                (filter === 'permanent' && type === '永久会员') ||
                (filter === 'temporary' && type.includes('临时')) ||
                (filter === 'token' && type.includes('代币'))) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    /**
     * 搜索会员
     */
    function searchMembers() {
        const searchText = document.getElementById('memberSearchInput').value.toLowerCase();
        const rows = document.querySelectorAll('#membersTableBody tr');
        
        rows.forEach(row => {
            const addressCell = row.querySelector('td:nth-child(2)');
            const address = addressCell.textContent.trim().toLowerCase();
            
            if (address.includes(searchText)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    /**
     * 获取选中的会员
     */
    function getSelectedMembers() {
        const checkboxes = document.querySelectorAll('.member-checkbox:checked');
        return Array.from(checkboxes).map(checkbox => checkbox.value);
    }
    
    /**
     * 获取会员类型徽章样式
     */
    function getBadgeClass(type) {
        if (type === '永久会员') {
            return 'bg-success';
        } else if (type.includes('临时')) {
            return 'bg-primary';
        } else if (type.includes('代币')) {
            return 'bg-info';
        } else {
            return 'bg-secondary';
        }
    }
    
    /**
     * 显示错误消息
     */
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger alert-dismissible fade show';
        errorDiv.innerHTML = `
            <strong>错误：</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // 添加到页面顶部
        document.querySelector('.container').prepend(errorDiv);
        
        // 自动关闭
        setTimeout(() => {
            try {
                const alert = new bootstrap.Alert(errorDiv);
                alert.close();
            } catch (e) {
                errorDiv.remove();
            }
        }, 5000);
    }
    
    /**
     * 显示消息
     */
    function showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type} alert-dismissible fade show`;
        messageDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // 添加到页面顶部
        document.querySelector('.container').prepend(messageDiv);
        
        // 自动关闭
        setTimeout(() => {
            try {
                const alert = new bootstrap.Alert(messageDiv);
                alert.close();
            } catch (e) {
                messageDiv.remove();
            }
        }, 3000);
    }
    
    /**
     * 格式化日期
     */
    function formatDate(date) {
        if (!date) return '';
        
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        if (isNaN(date.getTime())) {
            return '未知日期';
        }
        
        return date.toLocaleDateString('zh-CN');
    }
    
    /**
     * 缩短地址
     */
    function shortenAddress(address) {
        if (!address) return '';
        if (address.length < 10) return address;
        return address.substring(0, 6) + '...' + address.substring(address.length - 4);
    }
    
    /**
     * Wei转换为ETH
     */
    function fromWei(wei) {
        if (!wei) return '0';
        return (parseFloat(wei) / 1e18).toString();
    }
    
    /**
     * ETH转换为Wei
     */
    function toWei(eth) {
        if (!eth) return '0';
        return (parseFloat(eth) * 1e18).toString();
    }
    
    /**
     * 模拟合约调用
     */
    function simulateContractCall(method, params) {
        console.log(`模拟合约调用: ${method}`, params);
        
        return new Promise((resolve, reject) => {
            // 延迟模拟网络请求
            setTimeout(() => {
                try {
                    // 根据方法返回模拟数据
                    switch (method) {
                        case 'checkClubStatus':
                            // 模拟检查俱乐部状态
                            // demo域名总是返回已存在，其他随机
                            const exists = params.domain === 'demo' ? true : Math.random() > 0.2;
                            resolve({ exists });
                            break;
                            
                        case 'getCollectionInfo':
                            // 模拟获取合集信息
                            resolve({
                                name: `${params.domain.charAt(0).toUpperCase() + params.domain.slice(1)} 俱乐部`,
                                symbol: params.domain.toUpperCase().substring(0, 3),
                                description: `这是 ${params.domain} 的官方俱乐部，欢迎加入！`,
                                logoURI: `https://placehold.co/500x500?text=${params.domain}`,
                                bannerURI: `https://placehold.co/1200x300?text=${params.domain}`,
                                baseURI: `https://metadata.web3.club/${params.domain}/`,
                                memberCount: Math.floor(Math.random() * 200)
                            });
                            break;
                            
                        case 'getMemberCounts':
                            // 模拟获取会员数量统计
                            const total = Math.floor(Math.random() * 200);
                            const permanent = Math.floor(total * 0.4);
                            resolve({
                                permanent: permanent,
                                temporary: total - permanent
                            });
                            break;
                            
                        case 'getPermanentSettings':
                            // 模拟获取永久会员设置
                            resolve({
                                price: (0.05 * 1e18).toString(),
                                receiver: '0x1234567890abcdef1234567890abcdef12345678',
                                policy: 'RESTRICT',
                                whitelist: []
                            });
                            break;
                            
                        case 'getTemporarySettings':
                            // 模拟获取临时会员设置
                            resolve({
                                monthlyPrice: (0.01 * 1e18).toString(),
                                quarterlyPrice: (0.025 * 1e18).toString(),
                                yearlyPrice: (0.08 * 1e18).toString(),
                                baseUri: `https://metadata.web3.club/${params.domain}/temp/`
                            });
                            break;
                            
                        case 'getTokenGate':
                            // 模拟获取代币门槛
                            resolve({
                                tokenAddress: '0x1234567890abcdef1234567890abcdef12345678',
                                threshold: (100 * 1e18).toString()
                            });
                            break;
                            
                        case 'getNFTGate':
                            // 模拟获取NFT门槛
                            resolve({
                                tokenAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
                                threshold: '1'
                            });
                            break;
                            
                        case 'getCrossChainTokens':
                            // 模拟获取跨链代币列表
                            resolve([
                                {
                                    chainName: 'polygon',
                                    tokenAddress: '0x1234567890abcdef1234567890abcdef12345678',
                                    tokenSymbol: 'MATIC',
                                    threshold: '50'
                                },
                                {
                                    chainName: 'bsc',
                                    tokenAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
                                    tokenSymbol: 'BNB',
                                    threshold: '0.1'
                                }
                            ]);
                            break;
                            
                        case 'getMembers':
                            // 模拟获取会员列表
                            const members = [];
                            const count = 10 + Math.floor(Math.random() * 10);
                            const types = ['永久会员', '临时会员(月)', '临时会员(季)', '临时会员(年)', '代币持有者'];
                            
                            for (let i = 0; i < count; i++) {
                                const type = types[Math.floor(Math.random() * types.length)];
                                const joinTime = new Date();
                                joinTime.setDate(joinTime.getDate() - Math.floor(Math.random() * 100));
                                
                                let expiryTime;
                                if (type === '永久会员') {
                                    expiryTime = '永不过期';
                                } else if (type === '代币持有者') {
                                    expiryTime = '持续持有';
                                } else {
                                    expiryTime = new Date();
                                    expiryTime.setDate(expiryTime.getDate() + 30 + Math.floor(Math.random() * 300));
                                }
                                
                                members.push({
                                    address: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
                                    type: type,
                                    joinTime: joinTime.toISOString(),
                                    expiryTime: expiryTime instanceof Date ? expiryTime.toISOString() : expiryTime
                                });
                            }
                            
                            resolve(members);
                            break;
                            
                        case 'getInheritancePolicy':
                            // 模拟获取继承策略
                            const policies = ['Always', 'Never', 'Ask'];
                            resolve(policies[Math.floor(Math.random() * policies.length)]);
                            break;
                            
                        case 'getClubInheritanceInfo':
                            // 模拟获取俱乐部继承信息
                            const isInherited = Math.random() > 0.7; // 30%的概率是继承的俱乐部
                            const creationDate = new Date(Date.now() - Math.floor(Math.random() * 31536000000)); // 随机1年内的时间
                            const expiryDate = new Date(Date.now() + Math.floor(Math.random() * 31536000000)); // 随机未来1年内的时间
                            
                            resolve({
                                isInherited: isInherited,
                                previousOwner: isInherited ? '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('') : null,
                                creationDate: creationDate,
                                expiryDate: expiryDate
                            });
                            break;
                            
                        default:
                            // 对于其他方法，模拟成功
                            resolve(true);
                    }
                } catch (error) {
                    reject(error);
                }
            }, 1000);
        });
    }
}); 