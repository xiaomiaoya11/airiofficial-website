// settings.js - 系统设置功能

// 更新支付方式表格显示
function updatePaymentMethodsTable() {
    const paymentMethods = systemData.settings.paymentMethods;
    const paymentNames = {
        'cash': '现金',
        'kpay': 'KPay',
        'kbz': 'KBZ Pay',
        'wave': 'Wave Money',
        'alipay': '支付宝',
        'wechat': '微信支付'
    };
    
    const tbody = document.querySelector('#paymentMethodsTable tbody');
    if (!tbody) {
        console.error('找不到支付方式表格的 tbody');
        return;
    }
    
    let tableHtml = '';
    
    Object.entries(paymentNames).forEach(([key, name]) => {
        const isEnabled = paymentMethods[key];
        tableHtml += `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">${name}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="badge ${isEnabled ? 'badge-success' : 'badge-canceled'}">
                        ${isEnabled ? '启用' : '禁用'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button class="btn ${isEnabled ? 'btn-danger' : 'btn-success'} btn-sm" onclick="togglePaymentStatus('${key}')">
                        ${isEnabled ? '禁用' : '启用'}
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = tableHtml;
}

// 切换支付方式状态
function togglePaymentStatus(paymentMethod) {
    systemData.settings.paymentMethods[paymentMethod] = !systemData.settings.paymentMethods[paymentMethod];
    saveLocalStorageData();
    updatePaymentMethodsTable();
    alert('支付方式设置已更新');
}

// 加载店铺设置
function loadShopSettings() {
    const shopName = document.getElementById('shopName');
    const shopPhone = document.getElementById('shopPhone');
    const shopAddress = document.getElementById('shopAddress');
    const openTime = document.getElementById('openTime');
    const closeTime = document.getElementById('closeTime');
    
    // 检查元素是否存在
    if (shopName) shopName.value = systemData.settings.shopName || '';
    if (shopPhone) shopPhone.value = systemData.settings.shopPhone || '';
    if (shopAddress) shopAddress.value = systemData.settings.shopAddress || '';
    if (openTime) openTime.value = systemData.settings.openTime || '09:00';
    if (closeTime) closeTime.value = systemData.settings.closeTime || '21:00';
}

// 加载支付方式设置
function loadPaymentMethods() {
    const paymentMethods = systemData.settings.paymentMethods;
    
    // 检查元素是否存在再设置值
    const cashPayment = document.getElementById('cashPayment');
    const kpayPayment = document.getElementById('kpayPayment');
    const kbzPayment = document.getElementById('kbzPayment');
    const wavePayment = document.getElementById('wavePayment');
    const alipayPayment = document.getElementById('alipayPayment');
    const wechatPayment = document.getElementById('wechatPayment');
    
    if (cashPayment) cashPayment.checked = paymentMethods.cash;
    if (kpayPayment) kpayPayment.checked = paymentMethods.kpay;
    if (kbzPayment) kbzPayment.checked = paymentMethods.kbz;
    if (wavePayment) wavePayment.checked = paymentMethods.wave;
    if (alipayPayment) alipayPayment.checked = paymentMethods.alipay;
    if (wechatPayment) wechatPayment.checked = paymentMethods.wechat;
    
    // 更新支付方式表格显示
    updatePaymentMethodsTable();
}

// 加载会员等级设置
function loadMemberLevels() {
    // 更新会员等级表格显示
    const memberLevelTableBody = document.querySelector('#memberLevelTable tbody');
    
    if (memberLevelTableBody) {
        let tableHtml = '';
        Object.entries(systemData.memberLevels).forEach(([key, level]) => {
            tableHtml += `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">${level.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${(level.discount * 10).toFixed(1)}折</td>
                    <td class="px-6 py-4 whitespace-nowrap">${key === 'normal' ? '默认等级' : level.condition.toLocaleString() + ' Ks'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button class="btn btn-secondary btn-sm" onclick="editMemberLevel('${key}')">编辑</button>
                        ${key !== 'normal' ? `<button class="btn btn-danger btn-sm ml-1" onclick="deleteMemberLevelPrompt('${key}')">删除</button>` : ''}
                    </td>
                </tr>
            `;
        });
        memberLevelTableBody.innerHTML = tableHtml;
    }
}

// 编辑会员等级
function editMemberLevel(levelKey) {
    const level = systemData.memberLevels[levelKey];
    if (!level) return;
    
    // 填充表单数据
    document.getElementById('editLevelType').value = levelKey;
    document.getElementById('editLevelName').value = level.name;
    document.getElementById('editLevelDiscount').value = level.discount;
    
    if (levelKey === 'normal') {
        document.getElementById('levelConditionContainer').classList.add('hidden');
    } else {
        document.getElementById('levelConditionContainer').classList.remove('hidden');
        document.getElementById('editLevelCondition').value = level.condition;
    }
    
    // 显示/隐藏删除按钮
    document.getElementById('deleteLevelBtn').style.display = levelKey === 'normal' ? 'none' : 'block';
    
    openModal('editMemberLevelModal');
}

// 删除会员等级提示
function deleteMemberLevelPrompt(levelKey) {
    if (levelKey === 'normal') {
        alert('不能删除普通会员等级');
        return;
    }
    
    if (!confirm('确定要删除该会员等级吗？此操作不可撤销！')) return;
    
    deleteMemberLevel(levelKey);
}

// 删除会员等级
function deleteMemberLevel(levelKey) {
    if (levelKey === 'normal') {
        alert('不能删除普通会员等级');
        return;
    }
    
    // 将该等级的会员降级为普通会员
    systemData.members.forEach(member => {
        if (member.level === levelKey) {
            member.level = 'normal';
            member.discount = systemData.memberLevels.normal.discount;
        }
    });
    
    // 删除等级
    delete systemData.memberLevels[levelKey];
    
    saveLocalStorageData();
    loadMemberLevels();
    closeModal('editMemberLevelModal');
    alert('会员等级已删除');
}

// 保存会员等级
function saveMemberLevel() {
    const levelType = document.getElementById('editLevelType').value;
    const name = document.getElementById('editLevelName').value;
    const discount = parseFloat(document.getElementById('editLevelDiscount').value);
    let condition = 0;
    
    if (levelType !== 'normal') {
        condition = parseInt(document.getElementById('editLevelCondition').value);
    }
    
    // 验证数据
    if (!name || isNaN(discount) || discount <= 0 || discount > 1) {
        alert('请填写正确的等级信息');
        return;
    }
    
    if (levelType !== 'normal' && (isNaN(condition) || condition < 0)) {
        alert('请填写正确的升级条件');
        return;
    }
    
    // 更新等级信息
    systemData.memberLevels[levelType] = {
        name: name,
        discount: discount,
        condition: condition
    };
    
    // 更新所有该等级会员的折扣
    systemData.members.forEach(member => {
        if (member.level === levelType) {
            member.discount = discount;
        }
    });
    
    saveLocalStorageData();
    loadMemberLevels();
    closeModal('editMemberLevelModal');
    alert('会员等级已更新');
}

// 添加会员等级
function addMemberLevel() {
    const name = document.getElementById('newLevelName').value;
    const discount = parseFloat(document.getElementById('newLevelDiscount').value);
    const condition = parseInt(document.getElementById('newLevelCondition').value);
    
    // 验证数据
    if (!name || isNaN(discount) || discount <= 0 || discount > 1 || isNaN(condition) || condition < 0) {
        alert('请填写完整的等级信息');
        return;
    }
    
    // 生成新的等级key
    const newLevelKey = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    // 检查是否已存在
    if (systemData.memberLevels[newLevelKey]) {
        alert('该等级名称已存在');
        return;
    }
    
    // 添加新等级
    systemData.memberLevels[newLevelKey] = {
        name: name,
        discount: discount,
        condition: condition
    };
    
    saveLocalStorageData();
    loadMemberLevels();
    closeModal('addMemberLevelModal');
    alert('新会员等级已添加');
}

// 添加新会员等级（从添加模态框）
function addNewMemberLevel() {
    const key = document.getElementById('addLevelKey').value;
    const name = document.getElementById('addLevelName').value;
    const discount = parseFloat(document.getElementById('addLevelDiscount').value);
    const condition = parseInt(document.getElementById('addLevelCondition').value);
    
    // 验证数据
    if (!key || !name || isNaN(discount) || discount <= 0 || discount > 1 || isNaN(condition) || condition < 0) {
        alert('请填写完整的等级信息');
        return;
    }
    
    // 检查是否已存在
    if (systemData.memberLevels[key]) {
        alert('该等级标识已存在');
        return;
    }
    
    // 添加新等级
    systemData.memberLevels[key] = {
        name: name,
        discount: discount,
        condition: condition
    };
    
    saveLocalStorageData();
    loadMemberLevels();
    closeModal('addMemberLevelModal');
    alert('新会员等级已添加');
}

// 保存店铺设置
function saveShopSettings() {
    systemData.settings.shopName = document.getElementById('shopName').value;
    systemData.settings.shopPhone = document.getElementById('shopPhone').value;
    systemData.settings.shopAddress = document.getElementById('shopAddress').value;
    systemData.settings.openTime = document.getElementById('openTime').value;
    systemData.settings.closeTime = document.getElementById('closeTime').value;
    
    // 新增：保存微信和Telegram联系方式
    systemData.settings.shopWechat = document.getElementById('shopWechat').value;
    systemData.settings.shopTelegram = document.getElementById('shopTelegram').value;
    
    saveLocalStorageData();
    alert('店铺设置已保存');
}

// 保存支付方式
function savePaymentMethods() {
    systemData.settings.paymentMethods.cash = document.getElementById('cashPayment').checked;
    systemData.settings.paymentMethods.kpay = document.getElementById('kpayPayment').checked;
    systemData.settings.paymentMethods.kbz = document.getElementById('kbzPayment').checked;
    systemData.settings.paymentMethods.wave = document.getElementById('wavePayment').checked;
    systemData.settings.paymentMethods.alipay = document.getElementById('alipayPayment').checked;
    systemData.settings.paymentMethods.wechat = document.getElementById('wechatPayment').checked;
    
    saveLocalStorageData();
    updatePaymentMethodsTable();
    alert('支付方式设置已保存');
}

// 数据备份
function backupData() {
    const dataStr = JSON.stringify(systemData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `airiofficial_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('数据备份成功');
}

// 数据恢复
function restoreData() {
    const fileInput = document.getElementById('restoreFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('请选择备份文件');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const restoredData = JSON.parse(e.target.result);
            systemData = restoredData;
            saveLocalStorageData();
            
            // 重新加载所有页面数据
            initApp();
            
            alert('数据恢复成功');
            fileInput.value = '';
        } catch (error) {
            alert('文件格式错误，恢复失败');
            console.error(error);
        }
    };
    reader.readAsText(file);
}

// 重置数据
function resetData() {
    if (!confirm('确定要重置所有数据吗？此操作不可撤销！')) return;
    
    localStorage.removeItem('airiofficial_pos_data');
    location.reload();
}

// settings.js - 系统设置功能

// 加载系统设置页面
function loadSettings() {
    console.log('开始加载系统设置页面');
    
    try {
        loadShopSettings();
        console.log('店铺设置加载完成');
        
        loadPaymentMethods();
        console.log('支付方式加载完成');
        
        loadMemberLevels();
        console.log('会员等级加载完成');
    } catch (error) {
        console.error('加载系统设置时出错:', error);
    }
    
    console.log('系统设置页面加载完成');
}

// 加载店铺设置
function loadShopSettings() {
    const shopName = document.getElementById('shopName');
    const shopPhone = document.getElementById('shopPhone');
    const shopAddress = document.getElementById('shopAddress');
    const openTime = document.getElementById('openTime');
    const closeTime = document.getElementById('closeTime');
    const shopWechat = document.getElementById('shopWechat');
    const shopTelegram = document.getElementById('shopTelegram');
    
    // 检查元素是否存在再设置值
    if (shopName) shopName.value = systemData.settings.shopName || '';
    if (shopPhone) shopPhone.value = systemData.settings.shopPhone || '';
    if (shopAddress) shopAddress.value = systemData.settings.shopAddress || '';
    if (openTime) openTime.value = systemData.settings.openTime || '09:00';
    if (closeTime) closeTime.value = systemData.settings.closeTime || '21:00';
    if (shopWechat) shopWechat.value = systemData.settings.shopWechat || '';
    if (shopTelegram) shopTelegram.value = systemData.settings.shopTelegram || '';
}

// 加载支付方式设置
function loadPaymentMethods() {
    updatePaymentMethodsTable();
}

// 加载会员等级设置
function loadMemberLevels() {
    const memberLevelTableBody = document.querySelector('#memberLevelTable tbody');
    
    if (memberLevelTableBody) {
        let tableHtml = '';
        Object.entries(systemData.memberLevels).forEach(([key, level]) => {
            tableHtml += `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">${level.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${(level.discount * 10).toFixed(1)}折</td>
                    <td class="px-6 py-4 whitespace-nowrap">${key === 'normal' ? '默认等级' : level.condition.toLocaleString() + ' Ks'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button class="btn btn-secondary btn-sm" onclick="editMemberLevel('${key}')">编辑</button>
                        ${key !== 'normal' ? `<button class="btn btn-danger btn-sm ml-1" onclick="deleteMemberLevelPrompt('${key}')">删除</button>` : ''}
                    </td>
                </tr>
            `;
        });
        memberLevelTableBody.innerHTML = tableHtml;
    }
}

// 更新支付方式表格显示
function updatePaymentMethodsTable() {
    const paymentMethods = systemData.settings.paymentMethods;
    const paymentNames = {
        'cash': '现金',
        'kpay': 'KPay',
        'kbz': 'KBZ Pay',
        'wave': 'Wave Money',
        'alipay': '支付宝',
        'wechat': '微信支付'
    };
    
    const tbody = document.querySelector('#paymentMethodsTable tbody');
    if (!tbody) {
        console.error('找不到支付方式表格的 tbody');
        return;
    }
    
    let tableHtml = '';
    
    Object.entries(paymentNames).forEach(([key, name]) => {
        const isEnabled = paymentMethods[key];
        tableHtml += `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">${name}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="badge ${isEnabled ? 'badge-success' : 'badge-canceled'}">
                        ${isEnabled ? '启用' : '禁用'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button class="btn ${isEnabled ? 'btn-danger' : 'btn-success'} btn-sm" onclick="togglePaymentStatus('${key}')">
                        ${isEnabled ? '禁用' : '启用'}
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = tableHtml;
}

// 其他函数保持不变（togglePaymentStatus、saveShopSettings等）
// ... 您之前 settings.js 中的其他函数