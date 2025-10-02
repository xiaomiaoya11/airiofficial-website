// 加载订单管理页面
function loadOrders() {
    console.log('开始加载订单数据');
    const ordersTableBody = document.querySelector('#ordersTable tbody');
    
    if (!ordersTableBody) {
        console.error('找不到订单表格的 tbody 元素');
        return;
    }
    
    let ordersHtml = '';
    
    if (systemData.orders.length === 0) {
        ordersHtml = `
            <tr>
                <td colspan="8" class="px-6 py-8 text-center text-gray-500">
                    <i class="fa fa-file-text fa-2x mb-2"></i>
                    <div>暂无订单数据</div>
                    <div class="text-sm mt-1">请在收银台完成交易后查看订单</div>
                </td>
            </tr>
        `;
    } else {
        systemData.orders.forEach(order => {
            const statusMap = {
                'success': { text: '已完成', class: 'badge-success' },
                'pending': { text: '待支付', class: 'badge-warning' },
                'canceled': { text: '已取消', class: 'badge-canceled' }
            };
            
            const paymentMap = {
                'cash': '现金',
                'kpay': 'KPay',
                'kbz': 'KBZ Pay', 
                'wave': 'Wave Money',
                'alipay': '支付宝',
                'wechat': '微信支付'
            };
            
            const statusInfo = statusMap[order.status] || { text: '未知', class: 'badge-canceled' };
            
            ordersHtml += `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">${order.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${order.customerName}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${order.amount.toLocaleString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${paymentMap[order.paymentMethod] || order.paymentMethod}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="badge ${statusInfo.class}">${statusInfo.text}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">${order.createTime}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button class="btn btn-secondary btn-sm" onclick="viewOrderDetail('${order.id}')">详情</button>
                        <button class="btn btn-info btn-sm" onclick="printOrderReceipt('${order.id}')">打印</button>
                        ${order.status === 'pending' ? 
                            `<button class="btn btn-success btn-sm" onclick="completeOrder('${order.id}')">完成</button>
                             <button class="btn btn-danger btn-sm" onclick="cancelOrder('${order.id}')">取消</button>` : 
                            ''
                        }
                        ${systemData.currentUser && systemData.currentUser.role === 'admin' ? 
                            `<button class="btn btn-danger btn-sm ml-1" onclick="deleteOrder('${order.id}')">删除</button>` : 
                            ''
                        }
                    </td>
                </tr>
            `;
        });
    }
    
    ordersTableBody.innerHTML = ordersHtml;
    console.log('订单数据加载完成，共', systemData.orders.length, '个订单');
}

// 搜索订单
function searchOrders() {
    const query = document.getElementById('orderSearch').value.toLowerCase();
    let ordersHtml = '';
    
    const filteredOrders = systemData.orders.filter(order => 
        order.id.toLowerCase().includes(query) || 
        order.customerName.toLowerCase().includes(query) ||
        (order.paymentMethod && order.paymentMethod.toLowerCase().includes(query))
    );
    
    if (filteredOrders.length === 0) {
        ordersHtml = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                    未找到匹配的订单
                </td>
            </tr>
        `;
    } else {
        filteredOrders.forEach(order => {
            const statusMap = {
                'success': { text: '已完成', class: 'badge-success' },
                'pending': { text: '待支付', class: 'badge-warning' },
                'canceled': { text: '已取消', class: 'badge-canceled' }
            };
            
            const paymentMap = {
                'cash': '现金',
                'kpay': 'KPay',
                'kbz': 'KBZ Pay',
                'wave': 'Wave Money',
                'alipay': '支付宝',
                'wechat': '微信支付'
            };
            
            const statusInfo = statusMap[order.status] || { text: '未知', class: 'badge-canceled' };
            
            ordersHtml += `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">${order.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${order.customerName}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${order.amount.toLocaleString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${paymentMap[order.paymentMethod] || order.paymentMethod}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="badge ${statusInfo.class}">${statusInfo.text}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">${order.createTime}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button class="btn btn-secondary btn-sm" onclick="viewOrderDetail('${order.id}')">详情</button>
                        <button class="btn btn-info btn-sm" onclick="printOrderReceipt('${order.id}')">打印</button>
                        ${order.status === 'pending' ? 
                            `<button class="btn btn-success btn-sm" onclick="completeOrder('${order.id}')">完成</button>
                             <button class="btn btn-danger btn-sm" onclick="cancelOrder('${order.id}')">取消</button>` : 
                            ''
                        }
                        ${systemData.currentUser && systemData.currentUser.role === 'admin' ? 
                            `<button class="btn btn-danger btn-sm ml-1" onclick="deleteOrder('${order.id}')">删除</button>` : 
                            ''
                        }
                    </td>
                </tr>
            `;
        });
    }
    
    document.querySelector('#ordersTable tbody').innerHTML = ordersHtml;
}

// 筛选订单
function filterOrders() {
    const statusFilter = document.getElementById('orderStatusFilter').value;
    const dateFilter = document.getElementById('orderDateFilter').value;
    
    let filteredOrders = systemData.orders;
    
    // 状态筛选
    if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }
    
    // 日期筛选
    if (dateFilter) {
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.createTime).toISOString().split('T')[0];
            return orderDate === dateFilter;
        });
    }
    
    let ordersHtml = '';
    
    if (filteredOrders.length === 0) {
        ordersHtml = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                    未找到符合条件的订单
                </td>
            </tr>
        `;
    } else {
        filteredOrders.forEach(order => {
            const statusMap = {
                'success': { text: '已完成', class: 'badge-success' },
                'pending': { text: '待支付', class: 'badge-warning' },
                'canceled': { text: '已取消', class: 'badge-canceled' }
            };
            
            const paymentMap = {
                'cash': '现金',
                'kpay': 'KPay',
                'kbz': 'KBZ Pay',
                'wave': 'Wave Money',
                'alipay': '支付宝',
                'wechat': '微信支付'
            };
            
            const statusInfo = statusMap[order.status] || { text: '未知', class: 'badge-canceled' };
            
            ordersHtml += `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">${order.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${order.customerName}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${order.amount.toLocaleString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${paymentMap[order.paymentMethod] || order.paymentMethod}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="badge ${statusInfo.class}">${statusInfo.text}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">${order.createTime}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button class="btn btn-secondary btn-sm" onclick="viewOrderDetail('${order.id}')">详情</button>
                        <button class="btn btn-info btn-sm" onclick="printOrderReceipt('${order.id}')">打印</button>
                        ${order.status === 'pending' ? 
                            `<button class="btn btn-success btn-sm" onclick="completeOrder('${order.id}')">完成</button>
                             <button class="btn btn-danger btn-sm" onclick="cancelOrder('${order.id}')">取消</button>` : 
                            ''
                        }
                        ${systemData.currentUser && systemData.currentUser.role === 'admin' ? 
                            `<button class="btn btn-danger btn-sm ml-1" onclick="deleteOrder('${order.id}')">删除</button>` : 
                            ''
                        }
                    </td>
                </tr>
            `;
        });
    }
    
    document.querySelector('#ordersTable tbody').innerHTML = ordersHtml;
}