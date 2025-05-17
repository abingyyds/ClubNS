document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const nullifierInput = document.getElementById('nullifier');
    const generateRandomBtn = document.getElementById('generateRandomBtn');
    const generateProofBtn = document.getElementById('generateProofBtn');
    const nullifierWarning = document.getElementById('nullifierWarning');
    const nullifierValue = document.getElementById('nullifierValue');
    const proofResult = document.getElementById('proofResult');
    const proofHash = document.getElementById('proofHash');
    const proofHashInput = document.getElementById('proofHashInput');
    const usageCount = document.getElementById('usageCount');
    const estimatedFee = document.getElementById('estimatedFee');
    const uploadProofBtn = document.getElementById('uploadProofBtn');
    const uploadResult = document.getElementById('uploadResult');
    const myProofsTable = document.getElementById('myProofsTable');
    const noProofs = document.getElementById('noProofs');

    // 存储用户生成的证明列表
    let userProofs = [];
    
    // 模拟费用计算常量
    const FEE_PER_USE = 0.001; // 每次使用的费用（ETH）
    
    // 随机数长度限制
    const MIN_NULLIFIER_LENGTH = 12;
    const MAX_NULLIFIER_LENGTH = 20;
    
    // 初始化
    init();
    
    // 事件监听器
    generateRandomBtn.addEventListener('click', generateRandomNullifier);
    generateProofBtn.addEventListener('click', generateProof);
    usageCount.addEventListener('input', updateEstimatedFee);
    uploadProofBtn.addEventListener('click', uploadProof);
    
    // 复制按钮事件监听
    const copyProofBtn = document.getElementById('copyProofBtn');
    
    if (copyProofBtn) {
        copyProofBtn.addEventListener('click', function() {
            copyTextToClipboard(proofHash.textContent, 'Complete Proof has been copied to clipboard');
        });
    }
    
    // 帮助函数：复制文本到剪贴板
    function copyTextToClipboard(text, successMessage) {
        navigator.clipboard.writeText(text)
            .then(() => {
                showNotification(successMessage, 'success');
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
                showNotification('Copy failed, please copy manually', 'danger');
            });
    }
    
    // 限制随机数输入只能是数字
    nullifierInput.addEventListener('input', function() {
        // 移除非数字字符
        this.value = this.value.replace(/[^0-9]/g, '');
        
        // 长度限制
        if (this.value.length > MAX_NULLIFIER_LENGTH) {
            this.value = this.value.slice(0, MAX_NULLIFIER_LENGTH);
        }
    });
    
    // 从本地存储加载用户证明
    function init() {
        // 初始化费用估算
        updateEstimatedFee();
        
        // 从localStorage加载证明列表
        const storedProofs = localStorage.getItem('zkProofs');
        if (storedProofs) {
            userProofs = JSON.parse(storedProofs);
            renderProofsList();
        } else {
            showNoProofs();
        }
    }
    
    // 生成随机Nullifier
    function generateRandomNullifier() {
        // 生成12-20位随机数字
        const length = MIN_NULLIFIER_LENGTH + Math.floor(Math.random() * (MAX_NULLIFIER_LENGTH - MIN_NULLIFIER_LENGTH + 1));
        let randomNullifier = '';
        for (let i = 0; i < length; i++) {
            randomNullifier += Math.floor(Math.random() * 10).toString();
        }
        nullifierInput.value = randomNullifier;
    }
    
    // 生成零知识证明
    function generateProof() {
        // 获取nullifier
        const nullifier = nullifierInput.value.trim();
        
        // 验证输入
        if (!nullifier) {
            showNotification('Please enter or generate a random number', 'warning');
            return;
        }
        
        // 验证随机数长度
        if (nullifier.length < MIN_NULLIFIER_LENGTH || nullifier.length > MAX_NULLIFIER_LENGTH) {
            showNotification(`Random number length must be between ${MIN_NULLIFIER_LENGTH} and ${MAX_NULLIFIER_LENGTH} digits`, 'warning');
            return;
        }
        
        // 验证随机数只包含数字
        if (!/^\d+$/.test(nullifier)) {
            showNotification('Random number can only contain digits', 'warning');
            return;
        }
        
        // 模拟生成零知识证明的过程
        showNotification('Generating zero-knowledge proof...', 'info');
        
        // 模拟延迟
        setTimeout(() => {
            // 生成完整的Proof（模拟8个哈希值加上1个公共输入）
            const proofParts = [];
            for (let i = 0; i < 8; i++) {
                proofParts.push(generateRandomHash());
            }
            
            // 生成公共输入（最后一个哈希值）
            const walletAddress = localStorage.getItem('walletAddress') || '0x0000000000000000000000000000000000000000';
            const timestamp = Date.now();
            const rawProof = `${nullifier}-${walletAddress}-${timestamp}`;
            const publicInput = generateHashFromString(rawProof);
            
            // 将公共输入添加到Proof的最后
            proofParts.push(publicInput);
            
            // 完整的Proof是逗号分隔的哈希值列表
            const fullProof = proofParts.join(',');
            
            // 显示证明结果
            proofResult.classList.remove('d-none');
            proofHash.textContent = fullProof;
            
            // 将公共输入复制到上传步骤
            proofHashInput.value = publicInput;
            
            // 显示nullifier警告，提醒用户保存
            nullifierWarning.classList.remove('d-none');
            nullifierValue.textContent = nullifier;
            
            showNotification('Zero-knowledge proof generated successfully! Please save the complete proof, but only upload the final hash value (public input) to the contract', 'success');
        }, 1500);
    }
    
    // 更新预估费用
    function updateEstimatedFee() {
        const count = parseInt(usageCount.value) || 1;
        const fee = count * FEE_PER_USE;
        estimatedFee.value = fee.toFixed(3);
    }
    
    // 上传证明到合约
    function uploadProof() {
        // 检查钱包是否已连接
        if (localStorage.getItem('walletConnected') !== 'true') {
            showNotification('Please connect your wallet first', 'warning');
            return;
        }
        
        // 获取证明哈希和使用次数
        const hash = proofHashInput.value.trim();
        const count = parseInt(usageCount.value) || 1;
        
        // 验证输入
        if (!hash) {
            showNotification('Please generate a proof or enter a valid public input hash', 'warning');
            return;
        }
        
        // 验证哈希格式
        if (!hash.startsWith('0x') || hash.length !== 66) {
            showNotification('Invalid public input hash format. It should be a 64-character hexadecimal string starting with 0x', 'warning');
            return;
        }
        
        if (count < 1 || count > 100) {
            showNotification('Usage count must be between 1 and 100', 'warning');
            return;
        }
        
        // 模拟上传到合约的过程
        showNotification('Uploading proof public input to contract...', 'info');
        
        // 模拟交易延迟
        utils.simulateTransaction('uploadProof', {
            hash: hash,
            usageCount: count,
            amount: count * FEE_PER_USE
        }).then(() => {
            // 显示上传成功结果
            uploadResult.classList.remove('d-none');
            showNotification('Proof uploaded successfully!', 'success');
            
            // 保存证明到本地存储
            const proof = {
                hash: hash,
                usageCount: count,
                remainingUses: count,
                creationTime: new Date().toISOString(),
                status: 'Active'
            };
            userProofs.push(proof);
            localStorage.setItem('zkProofs', JSON.stringify(userProofs));
            
            // 刷新证明列表
            renderProofsList();
        }).catch(error => {
            showNotification('Failed to upload proof: ' + error.message, 'danger');
        });
    }
    
    // 渲染证明列表
    function renderProofsList() {
        if (userProofs.length === 0) {
            showNoProofs();
            return;
        }
        
        // 隐藏"无证明"信息
        noProofs.classList.add('d-none');
        
        // 清空表格
        myProofsTable.innerHTML = '';
        
        // 按创建时间排序，最新的在前面
        const sortedProofs = [...userProofs].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // 添加证明到表格
        sortedProofs.forEach(proof => {
            const row = document.createElement('tr');
            
            // 根据状态设置行样式
            if (proof.status === 'expired' || proof.remainingUses <= 0) {
                row.classList.add('table-secondary');
                proof.status = 'expired';
            } else if (proof.remainingUses < 3) {
                row.classList.add('table-warning');
            }
            
            // 格式化创建时间
            const createdDate = new Date(proof.createdAt);
            const formattedDate = createdDate.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // 设置状态文本
            let statusText, statusClass;
            if (proof.status === 'expired' || proof.remainingUses <= 0) {
                statusText = 'Expired';
                statusClass = 'danger';
            } else if (proof.remainingUses < 3) {
                statusText = 'Expiring Soon';
                statusClass = 'warning';
            } else {
                statusText = 'Active';
                statusClass = 'success';
            }
            
            // 添加行内容
            row.innerHTML = `
                <td><span class="text-truncate d-inline-block" style="max-width: 200px;">${proof.hash}</span></td>
                <td>${proof.remainingUses}</td>
                <td>${formattedDate}</td>
                <td><span class="badge bg-${statusClass}">${statusText}</span></td>
            `;
            
            // 添加到表格
            myProofsTable.appendChild(row);
        });
    }
    
    // 显示"无证明"信息
    function showNoProofs() {
        noProofs.classList.remove('d-none');
        myProofsTable.innerHTML = '';
    }
    
    // 生成随机哈希值
    function generateRandomHash() {
        return '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    }
    
    // 辅助函数：生成伪哈希（实际项目中应使用加密库）
    function generateHashFromString(str) {
        // 这只是一个演示用的简单哈希算法
        // 实际项目中应使用适当的加密库如sha3.js等
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        
        // 转换为16进制字符串并添加前缀
        const hashHex = Math.abs(hash).toString(16).padStart(8, '0');
        return '0x' + hashHex + Array(56).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    }
    
    // 模拟使用证明
    function useProof(proofHash, nullifier) {
        // 实际项目中，这里会调用合约方法来验证零知识证明
        // 在本演示中，我们只是简单地减少使用次数
        
        // 检查证明是否有效（剩余使用次数不为0）
        const proof = userProofs.find(p => p.hash === proofHash);
        if (!proof || proof.remainingUses <= 0) {
            showNotification('Proof is invalid or has no remaining uses', 'danger');
            return false;
        }
        
        // 查找证明
        const proofIndex = userProofs.findIndex(p => p.hash === proofHash);
        if (proofIndex >= 0) {
            // 减少使用次数
            userProofs[proofIndex].remainingUses--;
            
            // 如果使用次数为0，标记为过期
            if (userProofs[proofIndex].remainingUses <= 0) {
                userProofs[proofIndex].status = 'expired';
            }
            
            // 保存更新
            localStorage.setItem('zkProofs', JSON.stringify(userProofs));
            
            // 重新渲染列表
            renderProofsList();
            
            return true;
        }
        
        return false;
    }
}); 