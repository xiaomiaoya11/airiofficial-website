// utils.js - 工具函数和通用功能

// 切换视图
function switchView(viewId) {
    console.log('开始切换视图:', viewId);
    
    // 检查页面访问权限
    if (!checkPagePermission(viewId)) {
        alert('您没有权限访问此页面');
        return;
    }
    
    // 隐藏所有视图
    document.querySelectorAll('.view-content').forEach(view => {
        view.classList.add('hidden');
    });

    // 显示目标视图
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hidden');
        console.log('成功显示视图:', viewId);
    } else {
        console.error('找不到视图:', viewId);
    }

    // 更新页面标题
    const pageTitles = {
        'dashboardView': '仪表盘',
        'posView': '收银台',
        'productsView': '商品管理',
        'membersView': '会员管理',
        'ordersView': '订单管理',
        'reportView': '数据报表',
        'staffView': '员工管理',
        'settingsView': '系统设置'
    };
    
    const pageTitleElement = document.getElementById('pageTitle');
    if (pageTitleElement) {
        pageTitleElement.textContent = pageTitles[viewId] || '';
    }

    // 进入特定视图时调用加载函数
    switch (viewId) {
        case 'dashboardView':
            if (typeof loadDashboard === 'function') {
                console.log('调用 loadDashboard');
                loadDashboard();
            }
            break;
        case 'productsView':
            if (typeof loadProductsManage === 'function') {
                console.log('调用 loadProductsManage');
                loadProductsManage();
            }
            break;
        case 'membersView':
            if (typeof loadMembers === 'function') {
                console.log('调用 loadMembers');
                loadMembers();
            }
            break;
        case 'ordersView':
            if (typeof loadOrders === 'function') {
                console.log('调用 loadOrders');
                loadOrders();
            }
            break;
        case 'reportView':
            if (typeof loadReport === 'function') {
                console.log('调用 loadReport');
                loadReport();
            }
            break;
        case 'staffView':
            if (typeof loadStaff === 'function') {
                console.log('调用 loadStaff');
                loadStaff();
            }
            break;
        case 'settingsView':
            if (typeof loadSettings === 'function') {
                console.log('调用 loadSettings');
                loadSettings();
            }
            break;
        case 'posView':
            if (typeof loadProducts === 'function') {
                console.log('调用 loadProducts');
                loadProducts();
            }
            if (typeof updateCartDisplay === 'function') {
                console.log('调用 updateCartDisplay');
                updateCartDisplay();
            }
            break;
        default:
            console.log('没有特定的加载函数用于:', viewId);
    }
    
    console.log('视图切换完成:', viewId);
}

// 检查页面权限
function checkPagePermission(viewId) {
    if (!systemData.currentUser) {
        console.log('用户未登录');
        return false;
    }
    
    // 页面权限映射
    const pagePermissions = {
        'dashboardView': 'viewDashboard',
        'productsView': 'viewProducts',
        'membersView': 'viewMembers',
        'ordersView': 'viewOrders',
        'reportView': 'viewReports',
        'staffView': 'viewStaff',
        'settingsView': 'viewSettings',
        'posView': 'checkout' // 收银台需要结账权限
    };
    
    const requiredPermission = pagePermissions[viewId];
    
    if (!requiredPermission) {
        console.log('页面无需权限:', viewId);
        return true; // 没有定义权限的页面默认允许访问
    }
    
    const hasPermission = checkFeaturePermission(requiredPermission);
    console.log(`页面 ${viewId} 需要权限 ${requiredPermission}: ${hasPermission}`);
    
    return hasPermission;
}

// 检查具体功能权限
function checkFeaturePermission(feature) {
    if (!systemData.currentUser) {
        console.log('用户未登录');
        return false;
    }
    
    console.log('检查权限:', feature, '用户:', systemData.currentUser.name);
    
    // 店长拥有所有权限
    if (systemData.currentUser.role === 'admin') {
        console.log('管理员拥有所有权限');
        return true;
    }
    
    // 检查员工的具体权限设置
    if (systemData.currentUser.permissions) {
        const hasPermission = systemData.currentUser.permissions[feature] || false;
        console.log('权限结果:', hasPermission);
        return hasPermission;
    }
    
    console.log('用户没有权限设置，使用默认权限');
    return false;
}

// 仪表盘加载函数
function loadDashboard() {
    console.log('加载仪表盘数据');
    
    // 更新统计卡片
    const today = new Date().toLocaleDateString();
    const todayOrders = systemData.orders.filter(order => 
        new Date(order.createTime).toLocaleDateString() === today && 
        order.status === 'success'
    );
    
    const todaySales = todayOrders.reduce((sum, order) => sum + order.amount, 0);
    const lowStockProducts = systemData.products.filter(product => product.stock <= 5).length;
    
    // 更新显示
    const todaySalesElement = document.getElementById('todaySales');
    const todayOrdersElement = document.getElementById('todayOrders');
    const totalMembersElement = document.getElementById('totalMembers');
    const lowStockProductsElement = document.getElementById('lowStockProducts');
    
    if (todaySalesElement) todaySalesElement.textContent = todaySales.toLocaleString() + ' Ks';
    if (todayOrdersElement) todayOrdersElement.textContent = todayOrders.length.toString();
    if (totalMembersElement) totalMembersElement.textContent = systemData.members.length.toString();
    if (lowStockProductsElement) lowStockProductsElement.textContent = lowStockProducts.toString();
    
    // 加载最近订单
    loadRecentOrders();
    
    // 加载热销商品
    loadHotProducts();

    // 加载活动管理数据
    if (typeof loadActivities === 'function') {
        console.log('调用 loadActivities');
        loadActivities();
    }
}

// 加载最近订单
function loadRecentOrders() {
    const recentOrdersContainer = document.getElementById('recentOrders');
    if (!recentOrdersContainer) {
        console.log('找不到最近订单容器');
        return;
    }
    
    const recentOrders = systemData.orders
        .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
        .slice(0, 5);
    
    let ordersHtml = '';
    
    if (recentOrders.length === 0) {
        ordersHtml = `
            <div class="text-center text-gray-500 py-4">
                <i class="fa fa-file-text fa-2x mb-2"></i>
                <div>暂无订单数据</div>
            </div>
        `;
    } else {
        recentOrders.forEach(order => {
            const statusMap = {
                'success': { text: '已完成', class: 'badge-success' },
                'pending': { text: '待支付', class: 'badge-warning' },
                'canceled': { text: '已取消', class: 'badge-canceled' }
            };
            
            const statusInfo = statusMap[order.status] || { text: '未知', class: 'badge-canceled' };
            
            ordersHtml += `
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2">
                    <div>
                        <div class="font-medium">${order.id}</div>
                        <div class="text-sm text-gray-500">${order.customerName}</div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold">${order.amount.toLocaleString()} Ks</div>
                        <span class="badge ${statusInfo.class}">${statusInfo.text}</span>
                    </div>
                </div>
            `;
        });
    }
    
    recentOrdersContainer.innerHTML = ordersHtml;
    console.log('最近订单加载完成，显示', recentOrders.length, '个订单');
}

// 加载热销商品
function loadHotProducts() {
    const hotProductsContainer = document.getElementById('hotProducts');
    if (!hotProductsContainer) {
        console.log('找不到热销商品容器');
        return;
    }
    
    // 计算商品销量
    const productSales = {};
    
    systemData.orders.forEach(order => {
        if (order.status === 'success' && order.items) {
            order.items.forEach(item => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = {
                        productId: item.productId,
                        productName: item.productName,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[item.productId].quantity += item.quantity;
                productSales[item.productId].revenue += item.price * item.quantity;
            });
        }
    });
    
    // 获取销量前5的商品
    const topProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
    
    let productsHtml = '';
    
    if (topProducts.length === 0) {
        productsHtml = `
            <div class="text-center text-gray-500 py-4">
                <i class="fa fa-cube fa-2x mb-2"></i>
                <div>暂无销售数据</div>
            </div>
        `;
    } else {
        topProducts.forEach((product, index) => {
            const productInfo = systemData.products.find(p => p.id === product.productId);
            const productImage = productInfo ? productInfo.image : '📦';
            
            productsHtml += `
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2">
                    <div class="flex items-center">
                        <div class="text-xl mr-3">${productImage}</div>
                        <div>
                            <div class="font-medium">${product.productName}</div>
                            <div class="text-sm text-gray-500">销量: ${product.quantity} 件</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold text-primary">${product.revenue.toLocaleString()} Ks</div>
                    </div>
                </div>
            `;
        });
    }
    
    hotProductsContainer.innerHTML = productsHtml;
    console.log('热销商品加载完成，显示', topProducts.length, '个商品');
}

// 打开模态框
function openModal(modalId) {
    console.log('打开模态框:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    } else {
        console.error('找不到模态框:', modalId);
    }
}

// 关闭模态框
function closeModal(modalId) {
    console.log('关闭模态框:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    } else {
        console.error('找不到模态框:', modalId);
    }
}

// 格式化金额显示
function formatCurrency(amount) {
    return amount.toLocaleString() + ' Ks';
}

// 格式化日期显示
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// 生成随机ID
function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return prefix + timestamp + random;
}

// 显示成功消息
function showSuccess(message) {
    // 可以在这里实现一个漂亮的消息提示
    alert('✅ ' + message);
}

// 显示错误消息
function showError(message) {
    // 可以在这里实现一个漂亮的错误提示
    alert('❌ ' + message);
}

// 显示确认对话框
function showConfirm(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 验证手机号格式
function isValidPhone(phone) {
    const phoneRegex = /^[0-9+\-\s()]+$/;
    return phoneRegex.test(phone);
}

// 验证邮箱格式
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 深拷贝对象
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    
    const clonedObj = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            clonedObj[key] = deepClone(obj[key]);
        }
    }
    return clonedObj;
}

// 获取查询参数
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 设置查询参数
function setQueryParam(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.pushState({}, '', url);
}

console.log('utils.js 加载完成');