// 加载会员管理页面
function loadMembers() {
    console.log('开始加载会员数据');
    const membersTableBody = document.querySelector('#membersTable tbody');
    
    if (!membersTableBody) {
        console.error('找不到会员表格的 tbody 元素');
        return;
    }
    
    let membersHtml = '';
    systemData.members.forEach(member => {
        const levelNames = {
            'diamond': '钻石会员',
            'gold': '黄金会员', 
            'silver': '白银会员',
            'normal': '普通会员'
        };
        
        membersHtml += `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">${member.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${member.phone}</td>
                <td class="px-6 py-4 whitespace-nowrap"><span class="badge badge-${member.level}">${levelNames[member.level] || member.level}</span></td>
                <td class="px-6 py-4 whitespace-nowrap">${(member.discount * 10).toFixed(1)}折</td>
                <td class="px-6 py-4 whitespace-nowrap">${member.totalSpent.toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap">${member.registerTime}</td>
                <td class="px-6 py-4 whitespace-nowrap">${member.lastSpendTime || '无记录'}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button class="btn btn-secondary btn-sm" onclick="viewMemberDetail(${member.id})">详情</button>
                    <button class="btn btn-primary btn-sm" onclick="editMember(${member.id})">编辑</button>
                </td>
            </tr>
        `;
    });
    
    membersTableBody.innerHTML = membersHtml;
    console.log('会员数据加载完成');
    
    // 新增：加载会员等级设置
    loadMemberLevels();
}
// 搜索会员
function searchMembers() {
    const query = document.getElementById('memberSearch').value.toLowerCase();
    let membersHtml = '';
    
    const filteredMembers = systemData.members.filter(member => 
        member.name.toLowerCase().includes(query) || 
        member.phone.includes(query)
    );
    
    filteredMembers.forEach(member => {
        const levelNames = {
            'diamond': '钻石会员',
            'gold': '黄金会员',
            'silver': '白银会员',
            'normal': '普通会员'
        };
        
        membersHtml += `
            <tr>
                <td>${member.name}</td>
                <td>${member.phone}</td>
                <td><span class="badge badge-${member.level}">${levelNames[member.level] || member.level}</span></td>
                <td>${(member.discount * 10).toFixed(1)}折</td>
                <td>${member.totalSpent.toLocaleString()}</td>
                <td>${member.registerTime}</td>
                <td>${member.lastSpendTime || '无记录'}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="viewMemberDetail(${member.id})">详情</button>
                    <button class="btn btn-primary btn-sm" onclick="editMember(${member.id})">编辑</button>
                </td>
            </tr>
        `;
    });
    
    document.querySelector('#membersTable tbody').innerHTML = membersHtml;
}

// 查看会员详情
function viewMemberDetail(memberId) {
    const member = systemData.members.find(m => m.id === memberId);
    if (!member) return;
    
    // 查找该会员的所有订单
    const memberOrders = systemData.orders.filter(order => order.customerId === memberId);
    
    let orderList = '';
    if (memberOrders.length > 0) {
        memberOrders.forEach(order => {
            orderList += `
                <div style="padding: 8px 0; border-bottom: 1px solid #eee;">
                    <div>订单号: ${order.id} - ${order.createTime}</div>
                    <div>金额: ${order.amount.toLocaleString()} Ks - 状态: ${order.status === 'success' ? '已完成' : '未完成'}</div>
                </div>
            `;
        });
    } else {
        orderList = '<div style="padding: 10px; text-align: center; color: #666;">暂无订单记录</div>';
    }
    
    const levelNames = {
        'diamond': '钻石会员',
        'gold': '黄金会员',
        'silver': '白银会员',
        'normal': '普通会员'
    };
    
    // 构建联系方式详情
    let contactDetails = '';
    if (member.contactInfo) {
        if (member.contactInfo.wechat) contactDetails += `微信: ${member.contactInfo.wechat}\n`;
        if (member.contactInfo.telegram) contactDetails += `Telegram: ${member.contactInfo.telegram}\n`;
        if (member.contactInfo.email) contactDetails += `邮箱: ${member.contactInfo.email}\n`;
        if (member.contactInfo.address) contactDetails += `地址: ${member.contactInfo.address}\n`;
        if (member.contactInfo.note) contactDetails += `备注: ${member.contactInfo.note}\n`;
    }
    
    alert(`会员详情:
姓名: ${member.name}
手机号: ${member.phone}
会员等级: ${levelNames[member.level] || member.level}
折扣: ${(member.discount * 10).toFixed(1)}折
累计消费: ${member.totalSpent.toLocaleString()} Ks
注册日期: ${member.registerTime}
最近消费: ${member.lastSpendTime || '无记录'}

联系方式:
${contactDetails || '无联系方式'}

订单记录:
${orderList}`.replace(/  +/g, ' '));
}

// 编辑会员
function editMember(memberId) {
    const member = systemData.members.find(m => m.id === memberId);
    if (!member) return;
    
    // 填充表单数据
    window.editingMemberId = memberId;
    document.getElementById('memberModalTitle').textContent = '编辑会员';
    document.getElementById('memberName').value = member.name;
    document.getElementById('memberPhoneInput').value = member.phone;
    document.getElementById('memberLevel').value = member.level;
    document.getElementById('memberTotalSpent').value = member.totalSpent;
    
    // 填充联系方式
    document.getElementById('memberWechat').value = member.contactInfo?.wechat || '';
    document.getElementById('memberTelegram').value = member.contactInfo?.telegram || '';
    document.getElementById('memberEmail').value = member.contactInfo?.email || '';
    document.getElementById('memberAddress').value = member.contactInfo?.address || '';
    document.getElementById('memberNote').value = member.contactInfo?.note || '';
    
    // 打开模态框
    openModal('addMemberModal');
}

// 保存会员
function saveMember() {
    const name = document.getElementById('memberName').value;
    const phone = document.getElementById('memberPhoneInput').value;
    const level = document.getElementById('memberLevel').value;
    const totalSpent = parseInt(document.getElementById('memberTotalSpent').value) || 0;
    
    // 获取联系方式
    const wechat = document.getElementById('memberWechat').value;
    const telegram = document.getElementById('memberTelegram').value;
    const email = document.getElementById('memberEmail').value;
    const address = document.getElementById('memberAddress').value;
    const note = document.getElementById('memberNote').value;
    
    // 简单验证
    if (!name || !phone) {
        alert('请填写会员姓名和手机号');
        return;
    }
    
    // 检查手机号是否已存在
    if (systemData.members.some(m => m.phone === phone && m.id !== (window.editingMemberId || 0))) {
        alert('该手机号已注册为会员');
        return;
    }
    
    // 检查会员等级是否存在
    if (!systemData.memberLevels[level]) {
        alert('选择的会员等级不存在');
        return;
    }
    
    if (window.editingMemberId) {
        // 编辑现有会员
        const member = systemData.members.find(m => m.id === window.editingMemberId);
        if (member) {
            member.name = name;
            member.phone = phone;
            member.level = level;
            member.discount = systemData.memberLevels[level].discount;
            member.totalSpent = totalSpent;
            
            // 更新联系方式
            if (!member.contactInfo) member.contactInfo = {};
            member.contactInfo.wechat = wechat;
            member.contactInfo.telegram = telegram;
            member.contactInfo.email = email;
            member.contactInfo.address = address;
            member.contactInfo.note = note;
            
            // 检查是否需要更新会员等级
            checkMemberLevelUpgrade(member);
            
            alert('会员信息更新成功');
            delete window.editingMemberId;
        }
    } else {
        // 添加新会员
        const newId = systemData.members.length > 0 
            ? Math.max(...systemData.members.map(m => m.id)) + 1 
            : 1;
        
        systemData.members.push({
            id: newId,
            name: name,
            phone: phone,
            level: level,
            discount: systemData.memberLevels[level].discount,
            totalSpent: totalSpent,
            registerTime: new Date().toLocaleDateString(),
            lastSpendTime: totalSpent > 0 ? new Date().toLocaleString() : null,
            contactInfo: {
                wechat: wechat,
                telegram: telegram,
                email: email,
                address: address,
                note: note
            }
        });
        
        alert('新会员添加成功');
    }
    
    // 保存数据并刷新页面
    saveLocalStorageData();
    loadMembers();
    
    // 重置表单并关闭模态框
    document.getElementById('addMemberForm').reset();
    closeModal('addMemberModal');
}

// 在会员表格中显示联系方式
function loadMembers() {
    console.log('开始加载会员数据');
    const membersTableBody = document.querySelector('#membersTable tbody');
    
    if (!membersTableBody) {
        console.error('找不到会员表格的 tbody 元素');
        return;
    }
    
    let membersHtml = '';
    systemData.members.forEach(member => {
        const levelNames = {
            'diamond': '钻石会员',
            'gold': '黄金会员', 
            'silver': '白银会员',
            'normal': '普通会员'
        };
        
        // 构建联系方式显示
        let contactDisplay = '';
        if (member.contactInfo) {
            const contacts = [];
            if (member.contactInfo.wechat) contacts.push(`微信: ${member.contactInfo.wechat}`);
            if (member.contactInfo.telegram) contacts.push(`TG: ${member.contactInfo.telegram}`);
            if (member.contactInfo.email) contacts.push(`邮箱: ${member.contactInfo.email}`);
            contactDisplay = contacts.join('<br>') || '无';
        } else {
            contactDisplay = '无';
        }
        
        membersHtml += `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">${member.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${member.phone}</td>
                <td class="px-6 py-4 whitespace-nowrap"><span class="badge badge-${member.level}">${levelNames[member.level] || member.level}</span></td>
                <td class="px-6 py-4 whitespace-nowrap">${(member.discount * 10).toFixed(1)}折</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${contactDisplay}</td>
                <td class="px-6 py-4 whitespace-nowrap">${member.totalSpent.toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap">${member.registerTime}</td>
                <td class="px-6 py-4 whitespace-nowrap">${member.lastSpendTime || '无记录'}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button class="btn btn-secondary btn-sm" onclick="viewMemberDetail(${member.id})">详情</button>
                    <button class="btn btn-primary btn-sm" onclick="editMember(${member.id})">编辑</button>
                </td>
            </tr>
        `;
    });
    
    membersTableBody.innerHTML = membersHtml;
    console.log('会员数据加载完成');
}