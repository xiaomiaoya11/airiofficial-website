// 加载报表页面
function loadReport() {
    console.log('开始加载报表数据');
    
    // 加载销售统计
    loadSalesStats();
    
    // 加载员工销售排行
    loadStaffRanking();
    
    // 加载会员统计
    loadMemberStats();
    
    // 加载商品销售排行
    loadProductRanking();
    
    // 加载会员消费排行
    loadMemberRanking();
    
    console.log('报表数据加载完成');
}

// 加载销售统计
function loadSalesStats() {
    const today = new Date().toLocaleDateString();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // 今日销售
    const todayOrders = systemData.orders.filter(order => {
        const orderDate = new Date(order.createTime).toLocaleDateString();
        return orderDate === today && order.status === 'success';
    });
    const todaySales = todayOrders.reduce((sum, order) => sum + order.amount, 0);
    
    // 本周销售
    const weekOrders = systemData.orders.filter(order => {
        const orderDate = new Date(order.createTime);
        return orderDate >= weekAgo && order.status === 'success';
    });
    const weekSales = weekOrders.reduce((sum, order) => sum + order.amount, 0);
    
    // 本月销售
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthOrders = systemData.orders.filter(order => {
        const orderDate = new Date(order.createTime);
        return orderDate.getMonth() === currentMonth && 
               orderDate.getFullYear() === currentYear && 
               order.status === 'success';
    });
    const monthSales = monthOrders.reduce((sum, order) => sum + order.amount, 0);
    
    // 总销售
    const totalSales = systemData.orders
        .filter(order => order.status === 'success')
        .reduce((sum, order) => sum + order.amount, 0);
    
    // 更新销售统计显示
    const todaySalesStat = document.getElementById('todaySalesStat');
    const weekSalesStat = document.getElementById('weekSalesStat');
    const monthSalesStat = document.getElementById('monthSalesStat');
    const totalSalesStat = document.getElementById('totalSalesStat');
    
    if (todaySalesStat) todaySalesStat.textContent = todaySales.toLocaleString() + ' Ks';
    if (weekSalesStat) weekSalesStat.textContent = weekSales.toLocaleString() + ' Ks';
    if (monthSalesStat) monthSalesStat.textContent = monthSales.toLocaleString() + ' Ks';
    if (totalSalesStat) totalSalesStat.textContent = totalSales.toLocaleString() + ' Ks';
    
    // 加载销售趋势图表数据
    loadSalesChart();
}

// 加载员工销售排行
function loadStaffRanking() {
    // 确保员工销售数据存在
    const staffSalesArray = Object.values(systemData.staffSales || {})
        .filter(staff => staff && staff.totalSales > 0)
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 10); // 显示前10名
    
    let staffHtml = '';
    if (staffSalesArray.length === 0) {
        staffHtml = `
            <div class="text-center text-gray-500 py-8">
                <i class="fa fa-users fa-2x mb-2"></i>
                <div>暂无销售数据</div>
                <div class="text-sm mt-1">员工完成销售后显示排行</div>
            </div>
        `;
    } else {
        staffSalesArray.forEach((staff, index) => {
            const rankClass = index === 0 ? 'bg-yellow-100 text-yellow-800' : 
                            index === 1 ? 'bg-gray-100 text-gray-800' : 
                            index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-gray-50';
            
            staffHtml += `
                <div class="flex justify-between items-center p-4 rounded-lg mb-2 ${rankClass}">
                    <div class="flex items-center">
                        <div class="ranking-num ${index < 3 ? 'bg-primary text-white' : 'bg-gray-300'}">${index + 1}</div>
                        <div>
                            <div class="font-medium">${staff.name}</div>
                            <div class="text-sm text-gray-500">${staff.orderCount || 0} 个订单</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold text-primary">${staff.totalSales.toLocaleString()} Ks</div>
                        <div class="text-sm text-gray-500">平均: ${staff.orderCount > 0 ? Math.round(staff.totalSales / staff.orderCount).toLocaleString() : 0} Ks/单</div>
                    </div>
                </div>
            `;
        });
    }
    
    const staffRanking = document.getElementById('staffSalesRanking');
    if (staffRanking) {
        staffRanking.innerHTML = staffHtml;
    }
}

// 加载会员统计
function loadMemberStats() {
    const levelCounts = {};
    Object.keys(systemData.memberLevels || {}).forEach(level => {
        levelCounts[level] = 0;
    });
    
    (systemData.members || []).forEach(member => {
        if (levelCounts[member.level] !== undefined) {
            levelCounts[member.level]++;
        }
    });
    
    let memberHtml = '';
    Object.entries(levelCounts).forEach(([level, count]) => {
        const levelInfo = systemData.memberLevels[level];
        if (levelInfo) {
            memberHtml += `
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2">
                    <div>
                        <div class="font-medium">${levelInfo.name}</div>
                        <div class="text-sm text-gray-500">${(levelInfo.discount * 10).toFixed(1)}折</div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold text-primary">${count} 人</div>
                    </div>
                </div>
            `;
        }
    });
    
    const memberStats = document.getElementById('memberStats');
    if (memberStats) {
        memberStats.innerHTML = memberHtml;
    }
}

// 加载商品销售排行
function loadProductRanking() {
    const productSales = {};
    
    (systemData.orders || []).forEach(order => {
        if (order.status === 'success' && order.items) {
            order.items.forEach(item => {
                if (!productSales[item.productId]) {
                    const product = systemData.products.find(p => p.id === item.productId);
                    productSales[item.productId] = {
                        productId: item.productId,
                        productName: product ? product.name : item.productName,
                        quantity: 0,
                        revenue: 0
                    };
                }
                productSales[item.productId].quantity += item.quantity;
                productSales[item.productId].revenue += item.price * item.quantity;
            });
        }
    });
    
    const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
    
    let productHtml = '';
    if (topProducts.length === 0) {
        productHtml = `
            <div class="text-center text-gray-500 py-8">
                <i class="fa fa-cube fa-2x mb-2"></i>
                <div>暂无销售数据</div>
                <div class="text-sm mt-1">商品售出后显示排行</div>
            </div>
        `;
    } else {
        topProducts.forEach((product, index) => {
            productHtml += `
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2">
                    <div class="flex items-center">
                        <div class="ranking-num ${index < 3 ? 'bg-primary text-white' : 'bg-gray-300'}">${index + 1}</div>
                        <div>
                            <div class="font-medium">${product.productName}</div>
                            <div class="text-sm text-gray-500">${product.quantity} 件</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold text-primary">${product.revenue.toLocaleString()} Ks</div>
                    </div>
                </div>
            `;
        });
    }
    
    const productRanking = document.getElementById('productRanking');
    if (productRanking) {
        productRanking.innerHTML = productHtml;
    }
}

// 加载销售趋势图表
function loadSalesChart() {
    const reportType = document.getElementById('reportType') ? document.getElementById('reportType').value : 'daily';
    let labels = [];
    let data = [];

    if (reportType === 'daily') {
        // 最近7天数据
        for (let i = 6; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
            labels.push(dateStr);
            
            const dayOrders = (systemData.orders || []).filter(order => {
                const orderDate = new Date(order.createTime).toLocaleDateString();
                return orderDate === date.toLocaleDateString() && order.status === 'success';
            });
            data.push(dayOrders.reduce((sum, order) => sum + order.amount, 0));
        }
    } else if (reportType === 'weekly') {
        // 最近4周数据
        for (let i = 3; i >= 0; i--) {
            const weekStart = new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000);
            const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
            labels.push(`第${getWeekNumber(weekStart)}周`);
            
            const weekOrders = (systemData.orders || []).filter(order => {
                const orderDate = new Date(order.createTime);
                return orderDate >= weekStart && orderDate <= weekEnd && order.status === 'success';
            });
            data.push(weekOrders.reduce((sum, order) => sum + order.amount, 0));
        }
    } else if (reportType === 'monthly') {
        // 最近6个月数据
        for (let i = 5; i >= 0; i--) {
            const month = new Date();
            month.setMonth(month.getMonth() - i);
            const monthStr = month.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' });
            labels.push(monthStr);
            
            const monthOrders = (systemData.orders || []).filter(order => {
                const orderDate = new Date(order.createTime);
                return orderDate.getMonth() === month.getMonth() && 
                       orderDate.getFullYear() === month.getFullYear() && 
                       order.status === 'success';
            });
            data.push(monthOrders.reduce((sum, order) => sum + order.amount, 0));
        }
    }

    // 显示销售趋势
    const chartContainer = document.getElementById('salesTrend');
    if (chartContainer) {
        if (data.some(value => value > 0)) {
            // 如果有数据，显示图表
            chartContainer.innerHTML = `
                <div class="bg-white p-4 rounded-lg">
                    <h3 class="text-lg font-bold mb-4">销售趋势 - ${getReportTypeName(reportType)}</h3>
                    <div class="relative h-64">
                        <canvas id="salesChartCanvas"></canvas>
                    </div>
                    <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div class="text-center">
                            <div class="text-gray-600">最高销售额</div>
                            <div class="font-bold text-primary">${Math.max(...data).toLocaleString()} Ks</div>
                        </div>
                        <div class="text-center">
                            <div class="text-gray-600">平均销售额</div>
                            <div class="font-bold text-primary">${Math.round(data.reduce((a, b) => a + b, 0) / data.length).toLocaleString()} Ks</div>
                        </div>
                    </div>
                </div>
            `;
            
            // 初始化图表
            setTimeout(() => {
                initSalesChart(labels, data);
            }, 100);
        } else {
            // 没有数据时显示提示
            chartContainer.innerHTML = `
                <div class="text-center text-gray-500 py-12">
                    <i class="fa fa-line-chart fa-3x mb-4"></i>
                    <div class="text-lg font-medium">暂无销售数据</div>
                    <div class="text-sm mt-2">完成交易后查看销售趋势</div>
                </div>
            `;
        }
    }
}

// 初始化销售图表
function initSalesChart(labels, data) {
    const ctx = document.getElementById('salesChartCanvas');
    if (!ctx) return;
    
    // 销毁现有图表
    if (window.salesChart) {
        window.salesChart.destroy();
    }
    
    // 创建新图表
    window.salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '销售额 (Ks)',
                data: data,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString() + ' Ks';
                        }
                    }
                }
            }
        }
    });
}

// 获取周数
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// 获取报表类型名称
function getReportTypeName(type) {
    const names = {
        'daily': '今日',
        'weekly': '本周', 
        'monthly': '本月'
    };
    return names[type] || type;
}

// 导出报表
function exportReport() {
    alert('报表导出功能将在后续版本中实现');
}

// 加载会员消费排行
function loadMemberRanking() {
    const memberRanking = (systemData.members || [])
        .filter(member => member.totalSpent > 0)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);
    
    let memberHtml = '';
    if (memberRanking.length === 0) {
        memberHtml = `
            <div class="text-center text-gray-500 py-8">
                <i class="fa fa-star fa-2x mb-2"></i>
                <div>暂无消费数据</div>
                <div class="text-sm mt-1">会员消费后显示排行</div>
            </div>
        `;
    } else {
        memberRanking.forEach((member, index) => {
            const levelInfo = systemData.memberLevels[member.level];
            memberHtml += `
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2">
                    <div class="flex items-center">
                        <div class="ranking-num ${index < 3 ? 'bg-primary text-white' : 'bg-gray-300'}">${index + 1}</div>
                        <div>
                            <div class="font-medium">${member.name}</div>
                            <div class="text-sm text-gray-500">${levelInfo ? levelInfo.name : '会员'} · ${(member.discount * 10).toFixed(1)}折</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold text-primary">${member.totalSpent.toLocaleString()} Ks</div>
                    </div>
                </div>
            `;
        });
    }
    
    const memberRankingContainer = document.getElementById('memberRanking');
    if (memberRankingContainer) {
        memberRankingContainer.innerHTML = memberHtml;
    }
}