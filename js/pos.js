// 加载商品列表（收银页面）
function loadProducts() {
    console.log('开始加载收银台商品数据');
    const activeProducts = systemData.products.filter(product => product.status === 'active');
    let productsHtml = '';
    
    activeProducts.forEach(product => {
        productsHtml += `
            <div class="product-card" onclick="addToCart(${product.id})">
                <div class="product-image">${product.image}</div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">${product.price.toLocaleString()} Ks</div>
                    <div class="product-stock">库存: ${product.stock}</div>
                </div>
            </div>
        `;
    });
    
    document.getElementById('productsGrid').innerHTML = productsHtml;
    console.log('收银台商品数据加载完成');
}

// 搜索商品（收银页面）
function searchProducts() {
    const query = document.getElementById('productSearch').value.toLowerCase();
    const activeProducts = systemData.products.filter(product => 
        product.status === 'active' && 
        (product.name.toLowerCase().includes(query) || product.barcode.includes(query))
    );
    
    let productsHtml = '';
    activeProducts.forEach(product => {
        productsHtml += `
            <div class="product-card" onclick="addToCart(${product.id})">
                <div class="product-image">${product.image}</div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">${product.price.toLocaleString()} Ks</div>
                    <div class="product-stock">库存: ${product.stock}</div>
                </div>
            </div>
        `;
    });
    
    document.getElementById('productsGrid').innerHTML = productsHtml;
}

// 添加商品到购物车
function addToCart(productId) {
    const product = systemData.products.find(p => p.id === productId);
    if (!product || product.stock <= 0) {
        alert('商品库存不足');
        return;
    }
    
    const existingItem = systemData.cart.find(item => item.productId === productId);
    
    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            alert('库存不足');
            return;
        }
        existingItem.quantity += 1;
    } else {
        systemData.cart.push({
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    updateCartDisplay();
}

// 更新购物车显示
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const totalAmount = document.getElementById('totalAmount');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const itemCount = document.getElementById('itemCount');
    
    let itemsHtml = '';
    let total = 0;
    
    systemData.cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        
        itemsHtml += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.productName}</div>
                    <div class="cart-item-price">${item.price.toLocaleString()} Ks × ${item.quantity}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="cart-item-subtotal">${subtotal.toLocaleString()} Ks</div>
                    <button class="btn btn-sm btn-secondary" onclick="updateCartItemQuantity(${index}, ${item.quantity - 1})">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="btn btn-sm btn-secondary" onclick="updateCartItemQuantity(${index}, ${item.quantity + 1})">+</button>
                    <button class="btn btn-sm btn-danger" onclick="removeCartItem(${index})">删除</button>
                </div>
            </div>
        `;
    });
    
    cartItems.innerHTML = itemsHtml || '<div class="text-center text-gray-500">购物车为空</div>';
    totalAmount.textContent = total.toLocaleString() + ' Ks';
    
    // 更新商品数量显示
    if (itemCount) {
        itemCount.textContent = `(${systemData.cart.length})`;
    }
    
    // 更新结账按钮状态
    if (checkoutBtn) {
        checkoutBtn.disabled = systemData.cart.length === 0;
    }
    
    // 更新折扣显示
    updateDiscountDisplay(total);
}

// 更新购物车商品数量
function updateCartItemQuantity(index, newQuantity) {
    if (newQuantity <= 0) {
        removeCartItem(index);
        return;
    }
    
    const item = systemData.cart[index];
    const product = systemData.products.find(p => p.id === item.productId);
    
    if (!product || newQuantity > product.stock) {
        alert('库存不足');
        return;
    }
    
    item.quantity = newQuantity;
    updateCartDisplay();
}

// 移除购物车商品
function removeCartItem(index) {
    systemData.cart.splice(index, 1);
    updateCartDisplay();
}

// 清空购物车
function clearCart() {
    if (systemData.cart.length === 0) return;
    
    if (!confirm('确定要清空购物车吗？')) return;
    
    systemData.cart = [];
    systemData.selectedMember = null;
    systemData.selectedPayment = null;
    
    updateCartDisplay();
    updateMemberDisplay();
    updatePaymentDisplay();
    
    // 重置折扣相关
    document.getElementById('useMemberDiscount').checked = false;
    document.getElementById('memberInfo').classList.add('hidden');
    document.getElementById('memberPhone').value = '';
    document.getElementById('percentageDiscount').value = '';
    document.getElementById('fixedDiscount').value = '';
}

// 结账
function checkout() {
    if (systemData.cart.length === 0) {
        alert('购物车为空');
        return;
    }
    
    // 检查库存
    for (const item of systemData.cart) {
        const product = systemData.products.find(p => p.id === item.productId);
        if (!product || product.stock < item.quantity) {
            alert(`商品 "${item.productName}" 库存不足`);
            return;
        }
    }
    
    // 检查是否选择了支付方式
    if (!systemData.selectedPayment) {
        alert('请选择支付方式');
        return;
    }
    
    // 检查支付方式是否启用
    if (!systemData.settings.paymentMethods[systemData.selectedPayment]) {
        alert('该支付方式未启用，请在系统设置中启用');
        return;
    }
    
    // 计算总金额
    const totalAmount = systemData.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // 应用会员折扣
    let finalAmount = totalAmount;
    let discountAmount = 0;
    
    if (systemData.selectedMember) {
        discountAmount = totalAmount * (1 - systemData.selectedMember.discount);
        finalAmount = totalAmount - discountAmount;
    }
    
    // 显示结账确认
    document.getElementById('checkoutTotalAmount').textContent = totalAmount.toLocaleString() + ' Ks';
    document.getElementById('checkoutDiscountAmount').textContent = discountAmount.toLocaleString() + ' Ks';
    document.getElementById('checkoutFinalAmount').textContent = finalAmount.toLocaleString() + ' Ks';
    document.getElementById('checkoutMemberInfo').textContent = systemData.selectedMember ? 
        `${systemData.selectedMember.name} (${systemData.memberLevels[systemData.selectedMember.level].name})` : '散客';
    
    openModal('checkoutModal');
}

// 预览小票
function previewReceipt() {
    if (systemData.cart.length === 0) {
        alert('购物车为空');
        return;
    }
    
    // 计算总金额
    const totalAmount = systemData.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let finalAmount = totalAmount;
    let discountAmount = 0;
    
    if (systemData.selectedMember) {
        finalAmount = totalAmount * systemData.selectedMember.discount;
        discountAmount = totalAmount - finalAmount;
    }
    
    // 创建临时订单用于预览
    const tempOrder = {
        id: 'PREVIEW',
        customerName: systemData.selectedMember ? systemData.selectedMember.name : '散客',
        amount: finalAmount,
        originalAmount: totalAmount,
        discountAmount: discountAmount,
        paymentMethod: systemData.selectedPayment || '现金',
        createTime: new Date().toLocaleString(),
        items: [...systemData.cart],
        staffName: systemData.currentUser ? systemData.currentUser.name : '系统'
    };
    
    printReceipt(tempOrder);
}

// 确认结账
function confirmCheckout() {
    const paymentMethod = systemData.selectedPayment;
    
    if (!paymentMethod) {
        alert('请选择支付方式');
        return;
    }
    
    // 检查支付方式是否启用
    if (!systemData.settings.paymentMethods[paymentMethod]) {
        alert('该支付方式未启用，请在系统设置中启用');
        return;
    }
    
    // 创建订单
    const orderId = 'ORD' + Date.now();
    const totalAmount = systemData.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let finalAmount = totalAmount;
    let discountAmount = 0;
    
    if (systemData.selectedMember) {
        finalAmount = totalAmount * systemData.selectedMember.discount;
        discountAmount = totalAmount - finalAmount;
    }
    
    const newOrder = {
        id: orderId,
        customerId: systemData.selectedMember ? systemData.selectedMember.id : 0,
        customerName: systemData.selectedMember ? systemData.selectedMember.name : '散客',
        amount: finalAmount,
        originalAmount: totalAmount,
        discountAmount: discountAmount,
        paymentMethod: paymentMethod,
        status: 'success',
        createTime: new Date().toLocaleString(),
        items: [...systemData.cart],
        staffId: systemData.currentUser ? systemData.currentUser.id : 1,
        staffName: systemData.currentUser ? systemData.currentUser.name : '系统'
    };
    
    // 更新库存
    systemData.cart.forEach(item => {
        const product = systemData.products.find(p => p.id === item.productId);
        if (product) {
            product.stock -= item.quantity;
            if (product.stock < 0) product.stock = 0;
        }
    });
    
    // 更新会员消费记录
    if (systemData.selectedMember) {
        const member = systemData.members.find(m => m.id === systemData.selectedMember.id);
        if (member) {
            member.totalSpent += finalAmount;
            member.lastSpendTime = new Date().toLocaleString();
            
            // 检查是否需要升级会员等级
            checkMemberLevelUpgrade(member);
        }
    }
    
    // 更新员工销售数据
    const staffId = systemData.currentUser ? systemData.currentUser.id : 1;
    if (systemData.staffSales[staffId]) {
        systemData.staffSales[staffId].totalSales += finalAmount;
        systemData.staffSales[staffId].orderCount += 1;
    }
    
    // 保存订单
    systemData.orders.push(newOrder);
    saveLocalStorageData();
    
    // 清空购物车和选择
    systemData.cart = [];
    systemData.selectedMember = null;
    systemData.selectedPayment = null;
    
    // 更新显示
    updateCartDisplay();
    updateMemberDisplay();
    updatePaymentDisplay();
    
    // 重置折扣相关
    document.getElementById('useMemberDiscount').checked = false;
    document.getElementById('memberInfo').classList.add('hidden');
    document.getElementById('memberPhone').value = '';
    document.getElementById('percentageDiscount').value = '';
    document.getElementById('fixedDiscount').value = '';
    
    // 关闭模态框
    closeModal('checkoutModal');
    
    // 显示成功消息
    alert(`结账成功！订单号: ${orderId}\n金额: ${finalAmount.toLocaleString()} Ks`);
    
    // 打印小票
    printReceipt(newOrder);
}

// 打印小票（更新联系方式）
function printReceipt(order) {
    const receiptContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>小票打印 - ${order.id}</title>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: 'Courier New', monospace;
                    margin: 0;
                    padding: 15px;
                    max-width: 300px;
                    font-size: 14px;
                    line-height: 1.4;
                }
                .header {
                    text-align: center;
                    margin-bottom: 10px;
                    border-bottom: 1px dashed #000;
                    padding-bottom: 10px;
                }
                .shop-name {
                    font-weight: bold;
                    font-size: 18px;
                    margin-bottom: 5px;
                }
                .contact-info {
                    font-size: 12px;
                    margin: 5px 0;
                }
                .order-info {
                    margin: 10px 0;
                }
                .items-table {
                    width: 100%;
                    margin: 10px 0;
                    border-collapse: collapse;
                }
                .items-table th {
                    text-align: left;
                    border-bottom: 1px dashed #000;
                    padding: 5px 0;
                }
                .items-table td {
                    padding: 3px 0;
                    border-bottom: 1px dotted #ccc;
                }
                .total-section {
                    border-top: 2px solid #000;
                    margin-top: 10px;
                    padding-top: 10px;
                    font-weight: bold;
                }
                .footer {
                    text-align: center;
                    margin-top: 15px;
                    border-top: 1px dashed #000;
                    padding-top: 10px;
                    font-size: 12px;
                }
                .social-links {
                    margin-top: 8px;
                    font-size: 11px;
                }
                @media print {
                    body {
                        padding: 0;
                    }
                    .no-print {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="shop-name">${systemData.settings.shopName}</div>
                <div class="contact-info">${systemData.settings.shopAddress}</div>
                ${systemData.settings.shopPhone ? `<div class="contact-info">电话: ${systemData.settings.shopPhone}</div>` : ''}
                ${systemData.settings.shopWechat ? `<div class="contact-info">微信: ${systemData.settings.shopWechat}</div>` : ''}
                ${systemData.settings.shopTelegram ? `<div class="contact-info">Telegram: ${systemData.settings.shopTelegram}</div>` : ''}
            </div>
            
            <div class="order-info">
                <div><strong>订单号:</strong> ${order.id}</div>
                <div><strong>时间:</strong> ${order.createTime}</div>
                <div><strong>客户:</strong> ${order.customerName}</div>
                <div><strong>收银员:</strong> ${order.staffName || '系统'}</div>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>商品</th>
                        <th>数量</th>
                        <th>金额</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.productName}</td>
                            <td>${item.quantity}</td>
                            <td>${(item.price * item.quantity).toLocaleString()} Ks</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="total-section">
                <div style="display: flex; justify-content: space-between;">
                    <span>总计:</span>
                    <span>${order.originalAmount.toLocaleString()} Ks</span>
                </div>
                ${order.discountAmount > 0 ? `
                    <div style="display: flex; justify-content: space-between;">
                        <span>折扣:</span>
                        <span>-${order.discountAmount.toLocaleString()} Ks</span>
                    </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between;">
                    <span>实收:</span>
                    <span>${order.amount.toLocaleString()} Ks</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                    <span>支付方式:</span>
                    <span>${order.paymentMethod}</span>
                </div>
            </div>
            
            <div class="footer">
                <div>谢谢惠顾！欢迎再次光临！</div>
                <div class="social-links">
                    ${systemData.settings.shopWechat || systemData.settings.shopTelegram ? '关注我们:' : ''}
                    ${systemData.settings.shopWechat ? `微信 ${systemData.settings.shopWechat}` : ''}
                    ${systemData.settings.shopWechat && systemData.settings.shopTelegram ? ' | ' : ''}
                    ${systemData.settings.shopTelegram ? `TG ${systemData.settings.shopTelegram}` : ''}
                </div>
                <div>${order.id === 'PREVIEW' ? '*** 预览小票 ***' : ''}</div>
            </div>
            
            <div class="no-print" style="margin-top: 20px; text-align: center;">
                <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    🖨️ 打印小票
                </button>
                <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
                    ❌ 关闭
                </button>
            </div>
            
            <script>
                // 自动尝试打印
                setTimeout(() => {
                    if ("${order.id}" !== "PREVIEW") {
                        window.print();
                        setTimeout(() => {
                            window.close();
                        }, 1000);
                    }
                }, 500);
            </script>
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow.document.write(receiptContent);
    printWindow.document.close();
}

// 选择支付方式
function selectPayment(paymentMethod) {
    systemData.selectedPayment = paymentMethod;
    updatePaymentDisplay();
}

// 更新支付方式显示
function updatePaymentDisplay() {
    // 移除所有支付按钮的选中状态
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.classList.remove('bg-primary', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    
    // 为选中的支付方式添加选中状态
    if (systemData.selectedPayment) {
        const selectedBtn = document.querySelector(`.payment-btn[onclick="selectPayment('${systemData.selectedPayment}')"]`);
        if (selectedBtn) {
            selectedBtn.classList.remove('bg-gray-200', 'text-gray-700');
            selectedBtn.classList.add('bg-primary', 'text-white');
        }
    }
}

// 选择会员
function selectMember() {
    openModal('memberSelectModal');
}

// 搜索会员（结账页面）
function searchMemberForCheckout() {
    const query = document.getElementById('memberSearchCheckout').value.toLowerCase();
    let membersHtml = '';
    
    const filteredMembers = systemData.members.filter(member => 
        member.name.toLowerCase().includes(query) || 
        member.phone.includes(query)
    );
    
    filteredMembers.forEach(member => {
        const levelInfo = systemData.memberLevels[member.level];
        membersHtml += `
            <div class="member-item p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50" onclick="chooseMember(${member.id})">
                <div class="member-name font-medium">${member.name}</div>
                <div class="member-phone text-sm text-gray-600">${member.phone}</div>
                <div class="member-level text-sm text-primary">${levelInfo.name} (${(member.discount * 10).toFixed(1)}折)</div>
            </div>
        `;
    });
    
    document.getElementById('memberSearchResults').innerHTML = membersHtml;
}

// 选择会员
function chooseMember(memberId) {
    systemData.selectedMember = systemData.members.find(m => m.id === memberId);
    updateMemberDisplay();
    closeModal('memberSelectModal');
}

// 更新会员显示
function updateMemberDisplay() {
    const memberDisplay = document.getElementById('selectedMember');
    
    if (systemData.selectedMember) {
        const levelInfo = systemData.memberLevels[systemData.selectedMember.level];
        memberDisplay.innerHTML = `
            ${systemData.selectedMember.name} (${levelInfo.name})
            <button class="btn btn-sm btn-danger ml-2" onclick="clearMemberSelection()">取消</button>
        `;
    } else {
        memberDisplay.innerHTML = '<span class="text-gray-500">散客</span>';
    }
    
    updateCartDisplay(); // 重新计算折扣
}

// 清空会员选择
function clearMemberSelection() {
    systemData.selectedMember = null;
    document.getElementById('useMemberDiscount').checked = false;
    document.getElementById('memberInfo').classList.add('hidden');
    updateMemberDisplay();
}

// 检查会员等级升级
function checkMemberLevelUpgrade(member) {
    const currentLevel = member.level;
    let newLevel = currentLevel;
    
    // 根据消费金额确定新的会员等级
    Object.entries(systemData.memberLevels).forEach(([levelKey, levelInfo]) => {
        if (levelKey !== 'normal' && member.totalSpent >= levelInfo.condition) {
            if (!newLevel || systemData.memberLevels[newLevel].condition < levelInfo.condition) {
                newLevel = levelKey;
            }
        }
    });
    
    // 如果等级有变化，更新会员等级
    if (newLevel !== currentLevel) {
        const oldLevelName = systemData.memberLevels[currentLevel].name;
        const newLevelName = systemData.memberLevels[newLevel].name;
        
        member.level = newLevel;
        member.discount = systemData.memberLevels[newLevel].discount;
        
        alert(`恭喜！${member.name} 已从 ${oldLevelName} 升级为 ${newLevelName}`);
    }
}

// 折扣相关功能
function applyMemberDiscount() {
    const phone = document.getElementById('memberPhone').value.trim();
    if (!phone) {
        alert('请输入会员手机号');
        return;
    }
    
    const member = systemData.members.find(m => m.phone === phone);
    if (!member) {
        alert('未找到该会员');
        return;
    }
    
    systemData.selectedMember = member;
    updateMemberDisplay();
    
    // 显示会员信息
    const memberInfo = document.getElementById('memberInfo');
    const levelInfo = systemData.memberLevels[member.level];
    memberInfo.innerHTML = `${member.name} - ${levelInfo.name} (${(member.discount * 10).toFixed(1)}折)`;
    memberInfo.classList.remove('hidden');
    
    document.getElementById('useMemberDiscount').checked = true;
    updateCartDisplay();
}

function toggleMemberDiscount() {
    const useDiscount = document.getElementById('useMemberDiscount').checked;
    if (!useDiscount) {
        systemData.selectedMember = null;
        document.getElementById('memberInfo').classList.add('hidden');
        updateCartDisplay();
    } else if (!systemData.selectedMember) {
        alert('请先查询并选择会员');
        document.getElementById('useMemberDiscount').checked = false;
    }
}

function applyPercentageDiscount() {
    const discount = parseFloat(document.getElementById('percentageDiscount').value);
    if (isNaN(discount) || discount < 0 || discount > 100) {
        alert('请输入0-100之间的折扣百分比');
        return;
    }
    // 这里实现百分比折扣逻辑
    alert(`已应用 ${discount}% 折扣`);
}

function applyFixedDiscount() {
    const discount = parseFloat(document.getElementById('fixedDiscount').value);
    if (isNaN(discount) || discount < 0) {
        alert('请输入正确的折扣金额');
        return;
    }
    // 这里实现固定金额折扣逻辑
    alert(`已应用 ${discount} Ks 折扣`);
}

// 更新折扣显示
function updateDiscountDisplay(totalAmount) {
    let memberDiscount = 0;
    let percentageDiscount = 0;
    let fixedDiscount = 0;
    
    // 计算会员折扣
    if (systemData.selectedMember) {
        memberDiscount = totalAmount * (1 - systemData.selectedMember.discount);
    }
    
    // 计算百分比折扣（如果有实现的话）
    const percentageInput = document.getElementById('percentageDiscount');
    if (percentageInput && percentageInput.value) {
        const discountPercent = parseFloat(percentageInput.value);
        if (!isNaN(discountPercent) && discountPercent > 0 && discountPercent <= 100) {
            percentageDiscount = totalAmount * (discountPercent / 100);
        }
    }
    
    // 计算固定金额折扣（如果有实现的话）
    const fixedInput = document.getElementById('fixedDiscount');
    if (fixedInput && fixedInput.value) {
        const discountFixed = parseFloat(fixedInput.value);
        if (!isNaN(discountFixed) && discountFixed > 0) {
            fixedDiscount = Math.min(discountFixed, totalAmount);
        }
    }
    
    // 更新显示
    const memberDiscountElement = document.getElementById('memberDiscount');
    const percentageDiscountElement = document.getElementById('percentageDiscountDisplay');
    const fixedDiscountElement = document.getElementById('fixedDiscountDisplay');
    const totalDiscountElement = document.getElementById('totalDiscount');
    const subtotalElement = document.getElementById('subtotal');
    const totalAmountElement = document.getElementById('totalAmount');
    
    if (memberDiscountElement) memberDiscountElement.textContent = `-${memberDiscount.toLocaleString()} Ks`;
    if (percentageDiscountElement) percentageDiscountElement.textContent = `-${percentageDiscount.toLocaleString()} Ks`;
    if (fixedDiscountElement) fixedDiscountElement.textContent = `-${fixedDiscount.toLocaleString()} Ks`;
    if (totalDiscountElement) totalDiscountElement.textContent = `-${(memberDiscount + percentageDiscount + fixedDiscount).toLocaleString()} Ks`;
    if (subtotalElement) subtotalElement.textContent = `${totalAmount.toLocaleString()} Ks`;
    
    const finalAmount = totalAmount - memberDiscount - percentageDiscount - fixedDiscount;
    if (totalAmountElement) totalAmountElement.textContent = `${finalAmount.toLocaleString()} Ks`;
}