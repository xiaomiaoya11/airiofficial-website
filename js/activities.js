// activities.js - 活动管理功能

// 加载活动管理页面
function loadActivities() {
    console.log('开始加载活动数据');
    updateActivityStats();
    loadActivitiesTable();
    loadProductOptions();
    
    // 初始化奖励类型选择
    initRewardTypeSelection();
}

// 初始化奖励类型选择
function initRewardTypeSelection() {
    // 默认选择商品赠品
    selectRewardType('product');
}

// 选择奖励类型
function selectRewardType(type) {
    console.log('选择奖励类型:', type);
    
    // 更新按钮状态
    document.querySelectorAll('.reward-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const selectedBtn = document.querySelector(`.reward-type-btn[data-type="${type}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    // 显示对应的奖励选项
    document.querySelectorAll('.reward-option').forEach(option => {
        option.classList.add('hidden');
    });
    const rewardOption = document.getElementById(`${type}Reward`);
    if (rewardOption) {
        rewardOption.classList.remove('hidden');
    }
    
    // 设置默认值
    setDefaultRewardValues(type);
}

// 设置默认奖励值
function setDefaultRewardValues(type) {
    switch (type) {
        case 'product':
            document.getElementById('productQuantity').value = 1;
            break;
        case 'cash':
            document.getElementById('cashAmount').value = 2000;
            document.getElementById('cashWallet').value = 'kpay';
            break;
        case 'discount':
            document.getElementById('discountType').value = 'percentage';
            document.getElementById('discountPercentage').value = 10;
            document.getElementById('discountMaxAmount').value = 0;
            toggleDiscountType();
            break;
        case 'points':
            document.getElementById('pointsType').value = 'fixed';
            document.getElementById('pointsAmount').value = 100;
            togglePointsType();
            break;
    }
}

// 切换折扣类型
function toggleDiscountType() {
    const type = document.getElementById('discountType').value;
    document.getElementById('percentageDiscountContainer').classList.toggle('hidden', type !== 'percentage');
    document.getElementById('fixedDiscountContainer').classList.toggle('hidden', type !== 'fixed');
}

// 切换积分类型
function togglePointsType() {
    const type = document.getElementById('pointsType').value;
    document.getElementById('fixedPointsContainer').classList.toggle('hidden', type !== 'fixed');
    document.getElementById('multiplierPointsContainer').classList.toggle('hidden', type !== 'multiplier');
}

// 搜索商品
function searchProductForActivity() {
    const query = document.getElementById('productSearch').value.toLowerCase();
    const select = document.getElementById('activityProduct');
    
    // 清空选项
    select.innerHTML = '<option value="">选择商品</option>';
    
    // 搜索商品
    const filteredProducts = systemData.products.filter(product => 
        product.status === 'active' && 
        (product.name.toLowerCase().includes(query) || product.barcode.includes(query))
    );
    
    // 添加选项
    filteredProducts.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} - ${product.price.toLocaleString()} Ks`;
        select.appendChild(option);
    });
    
    if (filteredProducts.length === 0) {
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "未找到相关商品";
        select.appendChild(option);
    }
}

// 更新活动统计
function updateActivityStats() {
    const activeActivities = systemData.activities.filter(activity => 
        activity.status === 'active'
    ).length;
    
    const totalParticipants = systemData.activityParticipants.length;
    
    const today = new Date().toLocaleDateString();
    const todayParticipants = systemData.activityParticipants.filter(participant => 
        new Date(participant.participateTime).toLocaleDateString() === today
    ).length;
    
    const completionRate = systemData.activities.length > 0 ? 
        Math.round((systemData.activities.filter(a => a.status === 'completed').length / systemData.activities.length) * 100) : 0;
    
    document.getElementById('activeActivities').textContent = activeActivities;
    document.getElementById('totalParticipants').textContent = totalParticipants;
    document.getElementById('todayParticipants').textContent = todayParticipants;
    document.getElementById('completionRate').textContent = completionRate + '%';
}

// 加载活动表格
function loadActivitiesTable() {
    const activitiesTableBody = document.querySelector('#activitiesTable tbody');
    if (!activitiesTableBody) return;
    
    let activitiesHtml = '';
    
    systemData.activities.forEach(activity => {
        const typeNames = {
            'product': '商品赠品',
            'cash': '现金奖励',
            'discount': '折扣券',
            'points': '积分奖励'
        };
        
        const statusNames = {
            'active': '进行中',
            'inactive': '未开始',
            'expired': '已结束',
            'completed': '已完成'
        };
        
        const statusClasses = {
            'active': 'badge-success',
            'inactive': 'badge-warning',
            'expired': 'badge-canceled',
            'completed': 'badge-info'
        };
        
        const participantCount = systemData.activityParticipants.filter(p => p.activityId === activity.id).length;
        
        activitiesHtml += `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">${activity.id}</td>
                <td class="px-6 py-4 whitespace-nowrap">${activity.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${typeNames[activity.type] || activity.type}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="badge ${statusClasses[activity.status] || 'badge-canceled'}">
                        ${statusNames[activity.status] || activity.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">${participantCount} 人</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button class="btn btn-secondary btn-sm" onclick="viewActivityDetail('${activity.id}')">详情</button>
                    <button class="btn btn-info btn-sm" onclick="viewParticipants('${activity.id}')">参与记录</button>
                    ${activity.status === 'active' ? 
                        `<button class="btn btn-danger btn-sm" onclick="endActivity('${activity.id}')">结束</button>` : 
                        ''
                    }
                </td>
            </tr>
        `;
    });
    
    activitiesTableBody.innerHTML = activitiesHtml || `
        <tr>
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                <i class="fa fa-gift fa-2x mb-2"></i>
                <div>暂无活动数据</div>
                <div class="text-sm mt-1">点击"创建活动"开始您的第一个营销活动</div>
            </td>
        </tr>
    `;
}

// 加载商品选项
function loadProductOptions() {
    const productSelect = document.getElementById('activityProduct');
    if (!productSelect) return;
    
    let optionsHtml = '<option value="">选择赠送商品</option>';
    
    systemData.products.forEach(product => {
        if (product.status === 'active') {
            optionsHtml += `<option value="${product.id}">${product.name} - ${product.price.toLocaleString()} Ks</option>`;
        }
    });
    
    productSelect.innerHTML = optionsHtml;
}

// 保存活动
function saveActivity() {
    // 获取基础信息
    const name = document.getElementById('activityName').value.trim();
    const target = document.getElementById('activityTarget').value;
    const startDate = document.getElementById('activityStartDate').value;
    const endDate = document.getElementById('activityEndDate').value;
    const minAmount = parseInt(document.getElementById('activityMinAmount').value) || 0;
    const description = document.getElementById('activityDescription').value.trim();
    
    // 获取当前选中的奖励类型
    const activeRewardType = document.querySelector('.reward-type-btn.active');
    if (!activeRewardType) {
        alert('请选择奖励类型');
        return;
    }
    const type = activeRewardType.getAttribute('data-type');
    
    // 验证输入
    if (!name || !startDate || !endDate) {
        alert('请填写完整的活动信息');
        return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
        alert('结束日期不能早于开始日期');
        return;
    }
    
    // 生成活动ID
    const activityId = 'ACT' + new Date().getFullYear() + 
        String(new Date().getMonth() + 1).padStart(2, '0') + 
        String(systemData.activities.length + 1).padStart(3, '0');
    
    // 构建奖励对象
    let reward = {};
    let rewardValid = true;
    
    switch (type) {
        case 'product':
            const productId = parseInt(document.getElementById('activityProduct').value);
            const productQuantity = parseInt(document.getElementById('productQuantity').value) || 1;
            const product = systemData.products.find(p => p.id === productId);
            if (!product) {
                alert('请选择赠送商品');
                rewardValid = false;
                break;
            }
            reward = {
                type: 'product',
                productId: productId,
                productName: product.name,
                quantity: productQuantity
            };
            break;
            
        case 'cash':
            const cashAmount = parseInt(document.getElementById('cashAmount').value);
            const cashWallet = document.getElementById('cashWallet').value;
            if (!cashAmount || cashAmount <= 0) {
                alert('请输入有效的现金金额');
                rewardValid = false;
                break;
            }
            reward = {
                type: 'cash',
                amount: cashAmount,
                wallet: cashWallet
            };
            break;
            
        case 'discount':
            const discountType = document.getElementById('discountType').value;
            if (discountType === 'percentage') {
                const discountPercentage = parseInt(document.getElementById('discountPercentage').value);
                if (!discountPercentage || discountPercentage < 1 || discountPercentage > 100) {
                    alert('请输入1-100之间的折扣比例');
                    rewardValid = false;
                    break;
                }
                reward = {
                    type: 'discount',
                    discountType: 'percentage',
                    discount: discountPercentage / 100,
                    maxAmount: parseInt(document.getElementById('discountMaxAmount').value) || 0
                };
            } else {
                const discountFixed = parseInt(document.getElementById('discountFixed').value);
                if (!discountFixed || discountFixed <= 0) {
                    alert('请输入有效的折扣金额');
                    rewardValid = false;
                    break;
                }
                reward = {
                    type: 'discount',
                    discountType: 'fixed',
                    amount: discountFixed
                };
            }
            break;
            
        case 'points':
            const pointsType = document.getElementById('pointsType').value;
            if (pointsType === 'fixed') {
                const pointsAmount = parseInt(document.getElementById('pointsAmount').value);
                if (!pointsAmount || pointsAmount <= 0) {
                    alert('请输入有效的积分数量');
                    rewardValid = false;
                    break;
                }
                reward = {
                    type: 'points',
                    pointsType: 'fixed',
                    points: pointsAmount
                };
            } else {
                const pointsMultiplier = parseFloat(document.getElementById('pointsMultiplier').value);
                if (!pointsMultiplier || pointsMultiplier <= 0) {
                    alert('请输入有效的积分倍数');
                    rewardValid = false;
                    break;
                }
                reward = {
                    type: 'points',
                    pointsType: 'multiplier',
                    multiplier: pointsMultiplier
                };
            }
            break;
    }
    
    if (!rewardValid) return;
    
    // 创建活动对象
    const newActivity = {
        id: activityId,
        name: name,
        type: type,
        status: 'active',
        startDate: startDate,
        endDate: endDate,
        description: description,
        conditions: {
            minAmount: minAmount,
            target: target
        },
        reward: reward,
        participants: [],
        createdTime: new Date().toLocaleString()
    };
    
    systemData.activities.push(newActivity);
    saveLocalStorageData();
    loadActivities();
    closeModal('addActivityModal');
    alert('活动创建成功！活动编码：' + activityId);
}

// 查看活动详情
function viewActivityDetail(activityId) {
    const activity = systemData.activities.find(a => a.id === activityId);
    if (!activity) return;
    
    const typeNames = {
        'product': '商品赠品',
        'cash': '现金奖励',
        'discount': '折扣券',
        'points': '积分奖励'
    };
    
    let rewardInfo = '';
    switch (activity.reward.type) {
        case 'product':
            rewardInfo = `赠送商品：${activity.reward.productName} x ${activity.reward.quantity}`;
            break;
        case 'cash':
            rewardInfo = `现金奖励：${activity.reward.amount.toLocaleString()} Ks (${activity.reward.wallet})`;
            break;
        case 'discount':
            if (activity.reward.discountType === 'percentage') {
                rewardInfo = `折扣券：${(activity.reward.discount * 100).toFixed(0)}%${activity.reward.maxAmount > 0 ? `，最高${activity.reward.maxAmount.toLocaleString()} Ks` : ''}`;
            } else {
                rewardInfo = `折扣券：${activity.reward.amount.toLocaleString()} Ks`;
            }
            break;
        case 'points':
            if (activity.reward.pointsType === 'fixed') {
                rewardInfo = `积分奖励：${activity.reward.points} 积分`;
            } else {
                rewardInfo = `积分奖励：消费金额的${activity.reward.multiplier}倍积分`;
            }
            break;
    }
    
    alert(`活动详情：
活动编码：${activity.id}
活动名称：${activity.name}
活动类型：${typeNames[activity.type]}
活动状态：${activity.status}
活动时间：${activity.startDate} 至 ${activity.endDate}
参与条件：${activity.conditions.minAmount > 0 ? `消费满 ${activity.conditions.minAmount.toLocaleString()} Ks` : '无门槛'}
目标人群：${activity.conditions.target === 'all' ? '所有客户' : activity.conditions.target === 'member' ? '仅会员' : '新会员'}
活动奖励：${rewardInfo}
活动描述：${activity.description}
创建时间：${activity.createdTime}`);
}

// 查看参与记录
function viewParticipants(activityId) {
    const participants = systemData.activityParticipants.filter(p => p.activityId === activityId);
    if (participants.length === 0) {
        alert('暂无参与记录');
        return;
    }
    
    let participantList = '参与记录：\n\n';
    participants.forEach(participant => {
        participantList += `会员：${participant.memberName} (${participant.memberPhone})\n`;
        participantList += `订单：${participant.orderId}\n`;
        participantList += `金额：${participant.orderAmount.toLocaleString()} Ks\n`;
        participantList += `奖励：${participant.rewardDetails}\n`;
        participantList += `时间：${participant.participateTime}\n`;
        participantList += '------------------------\n';
    });
    
    alert(participantList);
}

// 结束活动
function endActivity(activityId) {
    if (!confirm('确定要结束这个活动吗？')) return;
    
    const activity = systemData.activities.find(a => a.id === activityId);
    if (activity) {
        activity.status = 'completed';
        saveLocalStorageData();
        loadActivities();
        alert('活动已结束');
    }
}

// 在收银台添加活动参与功能
function checkActivityEligibility(orderAmount, customerType) {
    const eligibleActivities = systemData.activities.filter(activity => {
        if (activity.status !== 'active') return false;
        if (activity.conditions.minAmount > orderAmount) return false;
        if (activity.conditions.target === 'member' && customerType === 'guest') return false;
        if (activity.conditions.target === 'new_member' && customerType !== 'new_member') return false;
        return true;
    });
    
    return eligibleActivities;
}