// 检查继承决策需求
checkInheritanceDecision();

// 继承决策按钮
document.getElementById('acceptInheritanceBtn').addEventListener('click', function() {
    acceptInheritance();
});

document.getElementById('rejectInheritanceBtn').addEventListener('click', function() {
    rejectInheritance();
});

/**
 * 检查是否需要继承决策
 */
function checkInheritanceDecision() {
    // 此功能已移至俱乐部管理页面，在创建俱乐部前进行决策
    // 隐藏域名详情页面中的继承决策卡片
    const inheritanceDecisionCard = document.getElementById('inheritanceDecisionCard');
    if (inheritanceDecisionCard) {
        inheritanceDecisionCard.style.display = 'none';
    }
}

/**
 * 接受继承会员数据
 */
function acceptInheritance() {
    // 此功能已移至俱乐部管理页面，此处仅为保持代码完整性
    console.log('继承功能已移至俱乐部管理页面');
}

/**
 * 拒绝继承会员数据
 */
function rejectInheritance() {
    // 此功能已移至俱乐部管理页面，此处仅为保持代码完整性
    console.log('继承功能已移至俱乐部管理页面');
} 