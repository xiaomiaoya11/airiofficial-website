// 加载员工管理页面
function loadStaff() {
    console.log('开始加载员工数据');
    const staffTableBody = document.querySelector('#staffTable tbody');
    
    if (!staffTableBody) {
        console.error('找不到员工表格的 tbody 元素');
        return;
    }
    
    let staffHtml = '';
    
    systemData.staff.forEach(staff => {
        const roleNames = {
            'admin': '管理员',
            'manager': '经理', 
            'staff': '员工'
        };
        
        staffHtml += `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">${staff.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${staff.username}</td>
                <td class="px-6 py-4 whitespace-nowrap">${roleNames[staff.role] || staff.role}</td>
                <td class="px-6 py-4 whitespace-nowrap">${staff.phone}</td>
                <td class="px-6 py-4 whitespace-nowrap">${staff.hireTime}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="badge ${staff.status === 'active' ? 'badge-success' : 'badge-canceled'}">
                        ${staff.status === 'active' ? '在职' : '离职'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button class="btn btn-secondary btn-sm" onclick="editStaff(${staff.id})">编辑</button>
                    <button class="btn ${staff.status === 'active' ? 'btn-danger' : 'btn-success'} btn-sm" onclick="toggleStaffStatus(${staff.id})">
                        ${staff.status === 'active' ? '离职' : '复职'}
                    </button>
                    ${systemData.currentUser && systemData.currentUser.role === 'admin' && staff.role !== 'admin' ? 
                        `<button class="btn btn-danger btn-sm ml-1" onclick="deleteStaff(${staff.id})">删除</button>` : ''
                    }
                </td>
            </tr>
        `;
    });
    
    staffTableBody.innerHTML = staffHtml;
    console.log('员工数据加载完成');
}

// 搜索员工
function searchStaff() {
    const query = document.getElementById('staffSearch').value.toLowerCase();
    let staffHtml = '';
    
    const filteredStaff = systemData.staff.filter(staff => 
        staff.name.toLowerCase().includes(query) || 
        staff.username.toLowerCase().includes(query) ||
        staff.phone.includes(query)
    );
    
    filteredStaff.forEach(staff => {
        const roleNames = {
            'admin': '管理员',
            'manager': '经理',
            'staff': '员工'
        };
        
        staffHtml += `
            <tr>
                <td>${staff.name}</td>
                <td>${staff.username}</td>
                <td>${roleNames[staff.role] || staff.role}</td>
                <td>${staff.phone}</td>
                <td>${staff.hireTime}</td>
                <td><span class="badge badge-${staff.status === 'active' ? 'success' : 'canceled'}">${staff.status === 'active' ? '在职' : '离职'}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editStaff(${staff.id})">编辑</button>
                    <button class="btn ${staff.status === 'active' ? 'btn-danger' : 'btn-success'} btn-sm" onclick="toggleStaffStatus(${staff.id})">
                        ${staff.status === 'active' ? '离职' : '复职'}
                    </button>
                    ${systemData.currentUser && systemData.currentUser.role === 'admin' && staff.role !== 'admin' ? 
                        `<button class="btn btn-danger btn-sm ml-1" onclick="deleteStaff(${staff.id})">删除</button>` : ''
                    }
                </td>
            </tr>
        `;
    });
    
    document.querySelector('#staffTable tbody').innerHTML = staffHtml;
}

// 编辑员工
function editStaff(staffId) {
    const staff = systemData.staff.find(s => s.id === staffId);
    if (!staff) {
        alert('员工不存在');
        return;
    }
    
    // 检查权限
    if (systemData.currentUser && systemData.currentUser.role !== 'admin' && staff.role === 'admin') {
        alert('您没有权限编辑管理员账户');
        return;
    }
    
    // 填充表单数据
    window.editingStaffId = staffId;
    document.getElementById('staffModalTitle').textContent = '编辑员工';
    document.getElementById('staffName').value = staff.name;
    document.getElementById('staffUsername').value = staff.username;
    document.getElementById('staffPassword').value = ''; // 密码留空
    document.getElementById('staffRole').value = staff.role;
    document.getElementById('staffPhone').value = staff.phone;
    
    // 确保权限对象存在
    if (!staff.permissions) {
        staff.permissions = getDefaultPermissions(staff.role);
    }
    
    // 加载权限设置 - 添加延迟确保DOM已更新
    setTimeout(() => {
        loadStaffPermissions(staff);
    }, 100);
    
    // 打开模态框
    openModal('addStaffModal');
}

// 加载员工权限设置
function loadStaffPermissions(staff) {
    console.log('加载员工权限:', staff);
    
    // 确保员工有权限对象
    if (!staff.permissions) {
        staff.permissions = getDefaultPermissions(staff.role);
        console.log('设置默认权限:', staff.permissions);
    }
    
    const permissions = staff.permissions;
    
    // 菜单权限
    document.getElementById('viewDashboardPermission').checked = permissions.viewDashboard || false;
    document.getElementById('viewProductsPermission').checked = permissions.viewProducts || false;
    document.getElementById('viewMembersPermission').checked = permissions.viewMembers || false;
    document.getElementById('viewOrdersPermission').checked = permissions.viewOrders || false;
    document.getElementById('viewReportsPermission').checked = permissions.viewReports || false;
    document.getElementById('viewSettingsPermission').checked = permissions.viewSettings || false;
    
    // 商品权限
    document.getElementById('viewCostPricePermission').checked = permissions.viewCostPrice || false;
    document.getElementById('viewProfitMarginPermission').checked = permissions.viewProfitMargin || false;
    document.getElementById('addProductsPermission').checked = permissions.addProducts || false;
    document.getElementById('editProductsPermission').checked = permissions.editProducts || false;
    document.getElementById('deleteProductsPermission').checked = permissions.deleteProducts || false;
    document.getElementById('toggleProductStatusPermission').checked = permissions.toggleProductStatus || false;
    document.getElementById('importProductsPermission').checked = permissions.importProducts || false;
    document.getElementById('exportProductsPermission').checked = permissions.exportProducts || false;
    
    // 会员权限
    document.getElementById('addMembersPermission').checked = permissions.addMembers || false;
    document.getElementById('editMembersPermission').checked = permissions.editMembers || false;
    document.getElementById('viewMemberDetailsPermission').checked = permissions.viewMemberDetails || false;
    document.getElementById('manageMemberLevelsPermission').checked = permissions.manageMemberLevels || false;
    
    // 订单权限
    document.getElementById('viewOrderDetailsPermission').checked = permissions.viewOrderDetails || false;
    document.getElementById('cancelOrdersPermission').checked = permissions.cancelOrders || false;
    document.getElementById('deleteOrdersPermission').checked = permissions.deleteOrders || false;
    document.getElementById('printReceiptsPermission').checked = permissions.printReceipts || false;
    
    // 收银权限
    document.getElementById('checkoutPermission').checked = permissions.checkout || false;
    document.getElementById('clearCartPermission').checked = permissions.clearCart || false;
    document.getElementById('applyDiscountsPermission').checked = permissions.applyDiscounts || false;
    document.getElementById('selectPaymentPermission').checked = permissions.selectPayment || false;
    
    // 数据管理权限
    document.getElementById('backupDataPermission').checked = permissions.backupData || false;
    document.getElementById('restoreDataPermission').checked = permissions.restoreData || false;
    document.getElementById('resetDataPermission').checked = permissions.resetData || false;
    
    // 系统设置权限
    document.getElementById('manageShopSettingsPermission').checked = permissions.manageShopSettings || false;
    document.getElementById('managePaymentMethodsPermission').checked = permissions.managePaymentMethods || false;
    document.getElementById('manageStaffPermission').checked = permissions.manageStaff || false;
    
    // 根据角色显示/隐藏权限面板
    togglePermissionVisibility(staff.role);
}

// 获取默认权限
function getDefaultPermissions(role) {
    const defaultPermissions = {
        // 店长拥有所有权限
        admin: {
            // 菜单权限
            viewDashboard: true,
            viewProducts: true,
            viewMembers: true,
            viewOrders: true,
            viewReports: true,
            viewSettings: true,
            viewStaff: true, // 新增
            
            // 商品权限
            viewCostPrice: true,
            viewProfitMargin: true,
            addProducts: true,
            editProducts: true,
            deleteProducts: true,
            toggleProductStatus: true,
            importProducts: true,
            exportProducts: true,
            
            // 会员权限
            addMembers: true,
            editMembers: true,
            viewMemberDetails: true,
            manageMemberLevels: true,
            
            // 订单权限
            viewOrderDetails: true,
            cancelOrders: true,
            deleteOrders: true,
            printReceipts: true,
            
            // 收银权限
            checkout: true,
            clearCart: true,
            applyDiscounts: true,
            selectPayment: true,
            
            // 数据管理权限
            backupData: true,
            restoreData: true,
            resetData: true,
            
            // 系统设置权限
            manageShopSettings: true,
            managePaymentMethods: true,
            manageStaff: true
        },
        
        // 经理权限
        manager: {
            // 菜单权限
            viewDashboard: true,
            viewProducts: true,
            viewMembers: true,
            viewOrders: true,
            viewReports: true,
            viewSettings: false,
            viewStaff: false, // 新增
            
            // 商品权限
            viewCostPrice: true,
            viewProfitMargin: true,
            addProducts: true,
            editProducts: true,
            deleteProducts: false,
            toggleProductStatus: true,
            importProducts: true,
            exportProducts: true,
            
            // 会员权限
            addMembers: true,
            editMembers: true,
            viewMemberDetails: true,
            manageMemberLevels: false,
            
            // 订单权限
            viewOrderDetails: true,
            cancelOrders: true,
            deleteOrders: false,
            printReceipts: true,
            
            // 收银权限
            checkout: true,
            clearCart: true,
            applyDiscounts: true,
            selectPayment: true,
            
            // 数据管理权限
            backupData: true,
            restoreData: false,
            resetData: false,
            
            // 系统设置权限
            manageShopSettings: false,
            managePaymentMethods: false,
            manageStaff: false
        },
        
        // 普通员工权限
        staff: {
            // 菜单权限
            viewDashboard: true,
            viewProducts: true,
            viewMembers: true,
            viewOrders: true,
            viewReports: false,
            viewSettings: false,
            viewStaff: false, // 新增
            
            // 商品权限
            viewCostPrice: false,
            viewProfitMargin: false,
            addProducts: false,
            editProducts: false,
            deleteProducts: false,
            toggleProductStatus: false,
            importProducts: false,
            exportProducts: false,
            
            // 会员权限
            addMembers: true,
            editMembers: false,
            viewMemberDetails: true,
            manageMemberLevels: false,
            
            // 订单权限
            viewOrderDetails: true,
            cancelOrders: false,
            deleteOrders: false,
            printReceipts: true,
            
            // 收银权限
            checkout: true,
            clearCart: true,
            applyDiscounts: true,
            selectPayment: true,
            
            // 数据管理权限
            backupData: false,
            restoreData: false,
            resetData: false,
            
            // 系统设置权限
            manageShopSettings: false,
            managePaymentMethods: false,
            manageStaff: false
        }
    };
    
    return defaultPermissions[role] || defaultPermissions.staff;
}

// 根据角色切换权限可见性
function togglePermissionVisibility(role) {
    const permissionSections = document.querySelectorAll('.permission-section');
    
    if (role === 'admin') {
        // 店长可以看到所有权限设置
        permissionSections.forEach(section => {
            section.style.display = 'block';
        });
    } else if (role === 'manager') {
        // 经理可以看到大部分权限，但不能设置系统管理权限
        permissionSections.forEach(section => {
            if (section.id === 'systemSettingsPermissions') {
                section.style.display = 'none';
            } else {
                section.style.display = 'block';
            }
        });
    } else {
        // 普通员工只能看到基础权限
        permissionSections.forEach(section => {
            if (section.id === 'basicPermissions') {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    }
}

// 删除员工
function deleteStaff(staffId) {
    if (!confirm('确定要删除该员工吗？此操作不可撤销！')) return;
    
    // 检查权限
    if (!systemData.currentUser || systemData.currentUser.role !== 'admin') {
        alert('您没有删除员工的权限');
        return;
    }
    
    const staff = systemData.staff.find(s => s.id === staffId);
    if (!staff) return;
    
    if (staff.role === 'admin') {
        alert('不能删除管理员账户');
        return;
    }
    
    const staffIndex = systemData.staff.findIndex(s => s.id === staffId);
    if (staffIndex !== -1) {
        systemData.staff.splice(staffIndex, 1);
        saveLocalStorageData();
        loadStaff();
        alert('员工已删除');
    }
}

// 切换员工状态
function toggleStaffStatus(staffId) {
    const staff = systemData.staff.find(s => s.id === staffId);
    if (!staff) return;
    
    // 检查权限
    if (systemData.currentUser && systemData.currentUser.role !== 'admin' && staff.role === 'admin') {
        alert('您没有权限修改管理员账户状态');
        return;
    }
    
    staff.status = staff.status === 'active' ? 'inactive' : 'active';
    saveLocalStorageData();
    loadStaff();
    alert(`员工状态已${staff.status === 'active' ? '激活' : '停用'}`);
}

// 保存员工
function saveStaff() {
    const name = document.getElementById('staffName').value;
    const username = document.getElementById('staffUsername').value;
    const password = document.getElementById('staffPassword').value;
    const role = document.getElementById('staffRole').value;
    const phone = document.getElementById('staffPhone').value;
    
    // 简单验证
    if (!name || !username || !phone) {
        alert('请填写完整的员工信息');
        return;
    }
    
    // 检查权限
    if (role === 'admin' && systemData.currentUser && systemData.currentUser.role !== 'admin') {
        alert('您没有权限创建管理员账户');
        return;
    }
    
    // 检查用户名是否已存在
    if (systemData.staff.some(s => s.username === username && s.id !== (window.editingStaffId || 0))) {
        alert('该用户名已存在');
        return;
    }
    
    // 收集权限设置
    const permissions = collectStaffPermissions();
    
    if (window.editingStaffId) {
        // 编辑现有员工
        const staff = systemData.staff.find(s => s.id === window.editingStaffId);
        if (staff) {
            staff.name = name;
            staff.username = username;
            if (password) {
                staff.password = password;
            }
            staff.role = role;
            staff.phone = phone;
            staff.permissions = permissions;
        }
        alert('员工信息更新成功');
        delete window.editingStaffId;
    } else {
        // 添加新员工
        if (!password) {
            alert('请设置员工密码');
            return;
        }
        
        const newId = systemData.staff.length > 0 
            ? Math.max(...systemData.staff.map(s => s.id)) + 1 
            : 1;
        
        systemData.staff.push({
            id: newId,
            name: name,
            username: username,
            password: password,
            role: role,
            phone: phone,
            hireTime: new Date().toLocaleDateString(),
            status: 'active',
            permissions: permissions
        });
        
        // 初始化销售数据
        systemData.staffSales[newId] = {
            id: newId,
            name: name,
            totalSales: 0,
            orderCount: 0
        };
        
        alert('新员工添加成功');
    }
    
    // 保存数据并刷新页面
    saveLocalStorageData();
    loadStaff();
    
    // 重置表单并关闭模态框
    document.getElementById('addStaffForm').reset();
    closeModal('addStaffModal');
}

// 收集员工权限设置
function collectStaffPermissions() {
    return {
        // 菜单权限
        viewDashboard: document.getElementById('viewDashboardPermission').checked,
        viewProducts: document.getElementById('viewProductsPermission').checked,
        viewMembers: document.getElementById('viewMembersPermission').checked,
        viewOrders: document.getElementById('viewOrdersPermission').checked,
        viewReports: document.getElementById('viewReportsPermission').checked,
        viewSettings: document.getElementById('viewSettingsPermission').checked,
        
        // 商品权限
        viewCostPrice: document.getElementById('viewCostPricePermission').checked,
        viewProfitMargin: document.getElementById('viewProfitMarginPermission').checked,
        addProducts: document.getElementById('addProductsPermission').checked,
        editProducts: document.getElementById('editProductsPermission').checked,
        deleteProducts: document.getElementById('deleteProductsPermission').checked,
        toggleProductStatus: document.getElementById('toggleProductStatusPermission').checked,
        importProducts: document.getElementById('importProductsPermission').checked,
        exportProducts: document.getElementById('exportProductsPermission').checked,
        
        // 会员权限
        addMembers: document.getElementById('addMembersPermission').checked,
        editMembers: document.getElementById('editMembersPermission').checked,
        viewMemberDetails: document.getElementById('viewMemberDetailsPermission').checked,
        manageMemberLevels: document.getElementById('manageMemberLevelsPermission').checked,
        
        // 订单权限
        viewOrderDetails: document.getElementById('viewOrderDetailsPermission').checked,
        cancelOrders: document.getElementById('cancelOrdersPermission').checked,
        deleteOrders: document.getElementById('deleteOrdersPermission').checked,
        printReceipts: document.getElementById('printReceiptsPermission').checked,
        
        // 收银权限
        checkout: document.getElementById('checkoutPermission').checked,
        clearCart: document.getElementById('clearCartPermission').checked,
        applyDiscounts: document.getElementById('applyDiscountsPermission').checked,
        selectPayment: document.getElementById('selectPaymentPermission').checked,
        
        // 数据管理权限
        backupData: document.getElementById('backupDataPermission').checked,
        restoreData: document.getElementById('restoreDataPermission').checked,
        resetData: document.getElementById('resetDataPermission').checked,
        
        // 系统设置权限
        manageShopSettings: document.getElementById('manageShopSettingsPermission').checked,
        managePaymentMethods: document.getElementById('managePaymentMethodsPermission').checked,
        manageStaff: document.getElementById('manageStaffPermission').checked
    };
}

// 角色变化时更新权限
function onRoleChange() {
    const role = document.getElementById('staffRole').value;
    const staff = window.editingStaffId ? 
        systemData.staff.find(s => s.id === window.editingStaffId) : null;
    
    if (!staff) {
        // 新员工，设置默认权限
        const defaultPermissions = getDefaultPermissions(role);
        setDefaultPermissions(defaultPermissions);
    }
    
    togglePermissionVisibility(role);
}

// 设置默认权限
function setDefaultPermissions(permissions) {
    for (const key in permissions) {
        const element = document.getElementById(key + 'Permission');
        if (element) {
            element.checked = permissions[key];
        }
    }
}