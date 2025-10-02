// app.js - 主应用初始化
// 全局数据对象
let systemData = {
    products: [],
    members: [],
    orders: [],
    staff: [],
    staffSales: {},
    cart: [],
    selectedMember: null,
    selectedPayment: null,
    currentUser: null,
    // 新增活动相关数据
    activities: [],
    activityParticipants: [],
    settings: {
        shopName: 'Airiofficial 饰品店',
        shopPhone: '+95 123 456 789',
        shopAddress: '缅甸仰光市',
        openTime: '09:00',
        closeTime: '21:00',
        paymentMethods: {
            cash: true,
            kpay: true,
            kbz: true,
            wave: true,
            alipay: true,
            wechat: true
        }
    },
    memberLevels: {
        normal: { name: '普通会员', discount: 1.0, condition: 0 },
        silver: { name: '白银会员', discount: 0.95, condition: 100000 },
        gold: { name: '黄金会员', discount: 0.9, condition: 300000 },
        diamond: { name: '钻石会员', discount: 0.85, condition: 500000 }
    }
};

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

// 初始化应用数据
function initApp() {
    console.log('初始化应用数据...');
    
    // 尝试从本地存储加载数据
    const savedData = localStorage.getItem('airiofficial_pos_data');
    
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            systemData = { ...systemData, ...parsedData };
            console.log('从本地存储加载数据成功');
            console.log('当前设置:', systemData.settings);
            
            // 数据迁移：确保新字段存在
            migrateData();
            
        } catch (error) {
            console.error('加载本地存储数据失败:', error);
            initDefaultData();
        }
    } else {
        console.log('无本地存储数据，初始化默认数据');
        initDefaultData();
    }
    
    // 初始化员工销售数据
    initStaffSalesData();
}

// 数据迁移函数
function migrateData() {
    // 确保活动相关字段存在
    if (!systemData.activities) {
        systemData.activities = [];
    }
    if (!systemData.activityParticipants) {
        systemData.activityParticipants = [];
    }
    
    // 确保联系方式字段存在
    if (!systemData.settings.shopWechat) {
        systemData.settings.shopWechat = '';
    }
    if (!systemData.settings.shopTelegram) {
        systemData.settings.shopTelegram = '';
    }
    
    // 确保员工有权限对象
    systemData.staff.forEach(staff => {
        if (!staff.permissions) {
            staff.permissions = getDefaultPermissions(staff.role);
        }
    });
    
    // 保存迁移后的数据
    saveLocalStorageData();
}

// 清理示例订单
function cleanupSampleOrders() {
    const sampleOrderIds = ['ORD001', 'ORD002', 'ORD003'];
    const originalLength = systemData.orders.length;
    
    systemData.orders = systemData.orders.filter(order => 
        !sampleOrderIds.includes(order.id)
    );
    
    if (originalLength !== systemData.orders.length) {
        console.log('已清理示例订单');
        saveLocalStorageData();
    }
}

// 初始化默认数据
function initDefaultData() {
    // 默认员工数据
    systemData.staff = [
        {
            id: 1,
            name: '管理员',
            username: 'admin',
            password: 'admin123',
            role: 'admin',
            phone: '09123456789',
            hireTime: new Date().toLocaleDateString(),
            status: 'active',
            permissions: getDefaultPermissions('admin')
        },
        {
            id: 2,
            name: '销售员',
            username: 'staff',
            password: 'staff123',
            role: 'staff',
            phone: '09123456788',
            hireTime: new Date().toLocaleDateString(),
            status: 'active',
            permissions: getDefaultPermissions('staff')
        }
    ];
    
    // 默认商品数据（包含成本价）
    systemData.products = [
    {
        id: 1,
        name: '水晶项链',
        costPrice: 15000,
        price: 25000,
        stock: 10,
        image: '💎',
        barcode: '10001',
        sku: 'NECK-CRYS-001',
        category: 'necklace',
        material: 'crystal',
        size: 'medium',
        color: '',
        status: 'active',
        grossProfit: 10000,
        grossProfitRate: 40.0,
        createTime: new Date().toLocaleDateString()
    },

        {
            id: 2,
            name: '珍珠耳环',
            costPrice: 8000,
            price: 15000,
            stock: 15,
            image: '📿',
            barcode: '10002',
            sku: 'EARR001',
            category: 'earrings',
            status: 'active',
            grossProfit: 7000,
            grossProfitRate: 46.7,
            createTime: new Date().toLocaleDateString()
        },
        {
            id: 3,
            name: '银质手链',
            costPrice: 10000,
            price: 18000,
            stock: 8,
            image: '✨',
            barcode: '10003',
            sku: 'BRAC001',
            category: 'bracelet',
            status: 'active',
            grossProfit: 8000,
            grossProfitRate: 44.4,
            createTime: new Date().toLocaleDateString()
        },
        {
            id: 4,
            name: '钻石戒指',
            costPrice: 30000,
            price: 50000,
            stock: 5,
            image: '💍',
            barcode: '10004',
            sku: 'RING001',
            category: 'ring',
            status: 'active',
            grossProfit: 20000,
            grossProfitRate: 40.0,
            createTime: new Date().toLocaleDateString()
        },
        {
            id: 5,
            name: '黄金发夹',
            costPrice: 5000,
            price: 12000,
            stock: 12,
            image: '📎',
            barcode: '10005',
            sku: 'HAIR001',
            category: 'hairpin',
            status: 'active',
            grossProfit: 7000,
            grossProfitRate: 58.3,
            createTime: new Date().toLocaleDateString()
        },
        {
            id: 6,
            name: '宝石胸针',
            costPrice: 12000,
            price: 22000,
            stock: 6,
            image: '🧷',
            barcode: '10006',
            sku: 'BROO001',
            category: 'brooch',
            status: 'active',
            grossProfit: 10000,
            grossProfitRate: 45.5,
            createTime: new Date().toLocaleDateString()
        }
    ];
    
    // 默认会员数据
systemData.members = [
    {
        id: 1,
        name: '测试会员',
        phone: '09111111111',
        level: 'normal',
        discount: 1.0,
        totalSpent: 0,
        registerTime: new Date().toLocaleDateString(),
        lastSpendTime: null,
        contactInfo: {
            wechat: 'test_wechat123',
            telegram: '@test_user',
            email: 'test@example.com',
            address: '测试地址',
            note: '测试会员'
        }
    }
];
    
    // 清空订单数据 - 删除所有示例订单
    systemData.orders = [];
    
    // 新增：默认活动数据
    systemData.activities = [
        {
            id: 'ACT202412001',
            name: '圣诞促销活动',
            type: 'product',
            status: 'active',
            startDate: '2024-12-01',
            endDate: '2024-12-31',
            description: '圣诞期间消费满50000Ks赠送水晶项链',
            conditions: {
                minAmount: 50000,
                target: 'all'
            },
            reward: {
                type: 'product',
                productId: 1,
                productName: '水晶项链',
                quantity: 1
            },
            participants: [],
            createdTime: new Date().toLocaleDateString()
        },
        {
            id: 'ACT202412002',
            name: '新会员专享',
            type: 'cash',
            status: 'active',
            startDate: '2024-12-01',
            endDate: '2024-12-31',
            description: '新注册会员首次消费赠送2000Ks现金券',
            conditions: {
                minAmount: 0,
                target: 'new_member'
            },
            reward: {
                type: 'cash',
                amount: 2000,
                wallet: 'kpay'
            },
            participants: [],
            createdTime: new Date().toLocaleDateString()
        },
        {
            id: 'ACT202412003',
            name: '会员折扣周',
            type: 'discount',
            status: 'active',
            startDate: '2024-12-01',
            endDate: '2024-12-07',
            description: '会员专享额外9折优惠',
            conditions: {
                minAmount: 0,
                target: 'member'
            },
            reward: {
                type: 'discount',
                discount: 0.9
            },
            participants: [],
            createdTime: new Date().toLocaleDateString()
        },
        {
            id: 'ACT202412004',
            name: '积分翻倍活动',
            type: 'points',
            status: 'inactive',
            startDate: '2025-01-01',
            endDate: '2025-01-31',
            description: '1月份所有消费积分翻倍',
            conditions: {
                minAmount: 0,
                target: 'all'
            },
            reward: {
                type: 'points',
                points: 2,
                isMultiplier: true
            },
            participants: [],
            createdTime: new Date().toLocaleDateString()
        }
    ];
    
    // 新增：活动参与记录数据
    systemData.activityParticipants = [
        {
            id: 1,
            activityId: 'ACT202412001',
            memberId: 1,
            memberName: '测试会员',
            memberPhone: '09111111111',
            orderId: 'ORD001',
            orderAmount: 75000,
            rewardGiven: true,
            rewardDetails: '水晶项链 x1',
            participateTime: new Date().toLocaleString(),
            contactInfo: {
                wechat: 'test_user123',
                note: '已通知客户领取赠品'
            }
        }
    ];
    
    // 保存初始数据
    saveLocalStorageData();
}

// 初始化员工销售数据
function initStaffSalesData() {
    systemData.staff.forEach(staff => {
        if (!systemData.staffSales[staff.id]) {
            systemData.staffSales[staff.id] = {
                id: staff.id,
                name: staff.name,
                totalSales: 0,
                orderCount: 0
            };
        }
    });
}

// 保存数据到本地存储
function saveLocalStorageData() {
    try {
        localStorage.setItem('airiofficial_pos_data', JSON.stringify(systemData));
        console.log('数据保存成功');
    } catch (error) {
        console.error('保存数据失败:', error);
    }
}

// 打开模态框
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
}

// 关闭模态框
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// 主应用初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化应用
    initApp();
    
    // 检查是否已登录
    if (systemData.currentUser) {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('mainSystem').classList.remove('hidden');
        
        // 更新当前用户信息显示
        document.getElementById('currentUser').textContent = systemData.currentUser.name;
        document.getElementById('currentRole').textContent = 
            systemData.currentUser.role === 'admin' ? '管理员（店长）' : 
            systemData.currentUser.role === 'manager' ? '经理' : '普通员工';
        
        // 加载默认视图
        switchView('posView');
    }
    
    // 绑定图片预览事件
    const productImageInput = document.getElementById('productImage');
    if (productImageInput) {
        productImageInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('previewImg').src = e.target.result;
                    document.getElementById('productImagePreview').classList.remove('hidden');
                }
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }
    
    console.log('Airiofficial POS系统已初始化');
    
    // 调试信息
    console.log('可用登录账号:');
    console.log('管理员 - 用户名: admin, 密码: admin123');
    console.log('销售员 - 用户名: staff, 密码: staff123');
});