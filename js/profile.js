// 用户菜单和个人信息管理功能

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

// 点击页面其他区域关闭用户菜单
document.addEventListener('click', function(event) {
    const userMenu = document.getElementById('userMenu');
    const userAvatar = document.querySelector('.relative .rounded-full');
    
    if (userMenu && !userMenu.classList.contains('hidden') && 
        !userMenu.contains(event.target) && 
        !userAvatar.contains(event.target)) {
        userMenu.classList.add('hidden');
    }
});

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
    document.getElementById('currentUser').textContent = name;
    document.getElementById('menuUserName').textContent = name;
    
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

// 在登录成功后初始化用户信息显示
function updateUserInfoDisplay() {
    if (systemData.currentUser) {
        document.getElementById('currentUser').textContent = systemData.currentUser.name;
        document.getElementById('currentRole').textContent = 
            systemData.currentUser.role === 'admin' ? '管理员（店长）' : 
            systemData.currentUser.role === 'manager' ? '经理' : '普通员工';
    }
}