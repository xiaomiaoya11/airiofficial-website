// auth.js - 修复登录功能
function login(event) {
    if (event) event.preventDefault(); // 阻止表单默认提交
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    console.log('尝试登录:', username); // 调试日志
    
    // 验证输入不为空
    if (!username || !password) {
        document.getElementById('loginError').textContent = '请输入用户名和密码';
        document.getElementById('loginError').classList.remove('hidden');
        return false;
    }
    
    // 查找用户并验证
    const user = systemData.staff.find(s => 
        s.username === username && 
        s.password === password &&
        s.status === 'active'
    );
    
    if (user) {
        systemData.currentUser = user;
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('mainSystem').classList.remove('hidden');
        
        // 更新当前用户信息显示
        updateUserInfoDisplay();
        
        // 根据权限隐藏菜单项 - 新增这一行
        updateMenuVisibility();
        
        // 加载默认视图
        switchView('posView');
        
        // 保存登录状态
        saveLocalStorageData();
        
        console.log('登录成功:', user.name); // 调试日志
        return false;
    } else {
        document.getElementById('loginError').textContent = '用户名或密码错误';
        document.getElementById('loginError').classList.remove('hidden');
        console.log('登录失败: 用户名或密码错误'); // 调试日志
        return false;
    }
}

// 退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        systemData.currentUser = null;
        document.getElementById('mainSystem').classList.add('hidden');
        document.getElementById('loginPage').classList.remove('hidden');
        
        // 清空登录表单
        document.getElementById('loginForm').reset();
        document.getElementById('loginError').classList.add('hidden');
        
        saveLocalStorageData();
    }
}

// 权限检查
function checkPermission(requiredRole) {
    if (!systemData.currentUser) return false;
    
    const roleHierarchy = {
        'staff': 1,
        'manager': 2,
        'admin': 3
    };
    
    return roleHierarchy[systemData.currentUser.role] >= roleHierarchy[requiredRole];
}

// 检查具体功能权限
function checkFeaturePermission(feature) {
    if (!systemData.currentUser) return false;
    
    console.log('检查权限:', feature, '用户:', systemData.currentUser.name);
    
    // 店长拥有所有权限
    if (systemData.currentUser.role === 'admin') {
        return true;
    }
    
    // 检查员工的具体权限设置
    if (systemData.currentUser.permissions) {
        const hasPermission = systemData.currentUser.permissions[feature] || false;
        console.log('权限结果:', hasPermission);
        return hasPermission;
    }
    
    return false;
}

// 根据权限更新菜单可见性 - 修复版本
function updateMenuVisibility() {
    if (!systemData.currentUser) return;
    
    console.log('更新菜单可见性，当前用户:', systemData.currentUser.name);
    console.log('用户权限:', systemData.currentUser.permissions);
    
    // 菜单项和对应的权限 - 与HTML中的data-menu属性对应
    const menuPermissions = {
        'dashboardMenu': 'viewDashboard',
        'productsMenu': 'viewProducts',
        'membersMenu': 'viewMembers', 
        'ordersMenu': 'viewOrders',
        'reportMenu': 'viewReports',
        'staffMenu': 'viewStaff',
        'settingsMenu': 'viewSettings'
    };
    
    // 隐藏没有权限的菜单项
    Object.entries(menuPermissions).forEach(([menuId, permission]) => {
        const hasPermission = checkFeaturePermission(permission);
        console.log(`菜单 ${menuId} 权限 ${permission}: ${hasPermission}`);
        
        const menuElement = document.querySelector(`[data-menu="${menuId}"]`);
        if (menuElement) {
            if (!hasPermission) {
                menuElement.style.display = 'none';
                console.log(`隐藏菜单: ${menuId}`);
            } else {
                menuElement.style.display = 'flex';
                console.log(`显示菜单: ${menuId}`);
            }
        } else {
            console.log(`未找到菜单元素: ${menuId}`);
        }
    });
}

// 更新用户信息显示
function updateUserInfoDisplay() {
    if (systemData.currentUser) {
        document.getElementById('currentUser').textContent = systemData.currentUser.name;
        document.getElementById('currentRole').textContent = 
            systemData.currentUser.role === 'admin' ? '管理员（店长）' : 
            systemData.currentUser.role === 'manager' ? '经理' : '普通员工';
    }
}

// 切换用户菜单显示/隐藏
function toggleUserMenu() {
    const userMenu = document.getElementById('userMenu');
    userMenu.classList.toggle('hidden');
    
    // 更新菜单中的用户信息
    if (!userMenu.classList.contains('hidden')) {
        document.getElementById('menuUserName').textContent = systemData.currentUser.name;
        document.getElementById('menuUserRole').textContent = 
            systemData.currentUser.role === 'admin' ? '管理员（店长）' : 
            systemData.currentUser.role === 'manager' ? '经理' : '普通员工';
    }
}

// 打开修改个人信息模态框
function openEditProfileModal() {
    const user = systemData.currentUser;
    if (!user) return;
    
    document.getElementById('editUserName').value = user.name;
    document.getElementById('editUserUsername').value = user.username;
    document.getElementById('editUserPhone').value = user.phone;
    
    // 关闭用户菜单
    document.getElementById('userMenu').classList.add('hidden');
    
    openModal('editProfileModal');
}

// 打开修改密码模态框
function openChangePasswordModal() {
    // 关闭用户菜单
    document.getElementById('userMenu').classList.add('hidden');
    
    // 清空表单
    document.getElementById('changePasswordForm').reset();
    
    openModal('changePasswordModal');
}

// 保存个人信息
function saveProfile() {
    const name = document.getElementById('editUserName').value.trim();
    const username = document.getElementById('editUserUsername').value.trim();
    const phone = document.getElementById('editUserPhone').value.trim();
    
    // 验证输入
    if (!name || !username || !phone) {
        alert('请填写完整的个人信息');
        return;
    }
    
    // 检查用户名是否已被其他用户使用
    const usernameExists = systemData.staff.some(staff => 
        staff.username === username && staff.id !== systemData.currentUser.id
    );
    
    if (usernameExists) {
        alert('该用户名已被其他用户使用');
        return;
    }
    
    // 验证手机号格式（简单验证）
    if (!/^[0-9+-\s()]+$/.test(phone)) {
        alert('请输入有效的手机号码');
        return;
    }
    
    // 更新当前用户信息
    systemData.currentUser.name = name;
    systemData.currentUser.username = username;
    systemData.currentUser.phone = phone;
    
    // 同时更新员工列表中的信息
    const staff = systemData.staff.find(s => s.id === systemData.currentUser.id);
    if (staff) {
        staff.name = name;
        staff.username = username;
        staff.phone = phone;
    }
    
    // 更新显示
    updateUserInfoDisplay();
    
    saveLocalStorageData();
    closeModal('editProfileModal');
    alert('个人信息更新成功');
}

// 保存密码
function savePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // 验证输入
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('请填写所有密码字段');
        return;
    }
    
    // 验证当前密码
    if (currentPassword !== systemData.currentUser.password) {
        alert('当前密码不正确');
        return;
    }
    
    // 验证新密码长度
    if (newPassword.length < 6) {
        alert('新密码长度至少6位');
        return;
    }
    
    // 验证确认密码
    if (newPassword !== confirmPassword) {
        alert('新密码和确认密码不一致');
        return;
    }
    
    // 更新密码
    systemData.currentUser.password = newPassword;
    
    // 同时更新员工列表中的密码
    const staff = systemData.staff.find(s => s.id === systemData.currentUser.id);
    if (staff) {
        staff.password = newPassword;
    }
    
    saveLocalStorageData();
    closeModal('changePasswordModal');
    alert('密码修改成功');
}

// 绑定登录事件
document.addEventListener('DOMContentLoaded', function() {
    // 正确绑定登录表单提交事件
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', login);
        console.log('登录表单事件绑定成功'); // 调试日志
    }
    
    // 增加回车键登录支持
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                login(e);
            }
        });
    }
    
    // 点击页面其他区域关闭用户菜单
    document.addEventListener('click', function(event) {
        const userMenu = document.getElementById('userMenu');
        const userAvatar = document.querySelector('.relative .rounded-full');
        
        if (userMenu && !userMenu.classList.contains('hidden') && 
            userAvatar && !userMenu.contains(event.target) && 
            !userAvatar.contains(event.target)) {
            userMenu.classList.add('hidden');
        }
    });
    
    // 检查是否已登录
    if (systemData.currentUser) {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('mainSystem').classList.remove('hidden');
        
        // 更新当前用户信息显示
        updateUserInfoDisplay();
        
        // 根据权限隐藏菜单项 - 新增这一行
        updateMenuVisibility();
        
        // 加载默认视图
        switchView('posView');
    }
});