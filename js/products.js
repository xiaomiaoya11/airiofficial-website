// 加载商品管理页面
function loadProductsManage() {
    console.log('开始加载商品管理数据');
    const productsTableBody = document.querySelector('#productsTable tbody');
    
    if (!productsTableBody) {
        console.error('找不到商品表格的 tbody 元素');
        return;
    }
    
    let productsHtml = '';
    
    systemData.products.forEach(product => {
        const categoryNames = {
            'necklace': '项链',
            'earrings': '耳环',
            'bracelet': '手链',
            'anklet': '脚链',
            'ring': '戒指',
            'hairpin': '发饰',
            'brooch': '胸针'
        };
        
        // 计算毛利率显示
        const costPrice = product.costPrice || 0;
        const grossProfit = product.price - costPrice;
        const grossProfitRate = costPrice > 0 ? (grossProfit / product.price) * 100 : 0;
        
        let profitRateClass = 'text-gray-500';
        if (grossProfitRate >= 50) {
            profitRateClass = 'text-success';
        } else if (grossProfitRate >= 20) {
            profitRateClass = 'text-warning';
        } else if (grossProfitRate > 0) {
            profitRateClass = 'text-danger';
        }
        
        productsHtml += `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap" style="font-size: 24px;">${product.image}</td>
                <td class="px-6 py-4 whitespace-nowrap">${product.name}</td>
                <td class="px-6 py-4 whitespace-nowrap">${product.barcode}</td>
                <td class="px-6 py-4 whitespace-nowrap">${costPrice.toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap">${product.price.toLocaleString()}</td>
                <td class="px-6 py-4 whitespace-nowrap ${profitRateClass}">
                    ${grossProfitRate > 0 ? `${grossProfitRate.toFixed(1)}%` : '--'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">${product.stock} ${product.stock <= 5 ? '<span style="color: #ff4757;">(库存偏低)</span>' : ''}</td>
                <td class="px-6 py-4 whitespace-nowrap">${categoryNames[product.category] || product.category}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="badge ${product.status === 'active' ? 'badge-success' : 'badge-canceled'}">
                        ${product.status === 'active' ? '上架' : '下架'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button class="btn btn-secondary btn-sm" onclick="editProduct(${product.id})">编辑</button>
                    <button class="btn ${product.status === 'active' ? 'btn-danger' : 'btn-success'} btn-sm" onclick="toggleProductStatus(${product.id})">
                        ${product.status === 'active' ? '下架' : '上架'}
                    </button>
                    ${systemData.currentUser && systemData.currentUser.role === 'admin' ? 
                        `<button class="btn btn-danger btn-sm ml-1" onclick="deleteProduct(${product.id})">删除</button>` : ''
                    }
                </td>
            </tr>
        `;
    });
    
    productsTableBody.innerHTML = productsHtml;
    console.log('商品管理数据加载完成');
    
    // 新增：加载支付方式设置
    updatePaymentMethodsTable();
}

// 搜索商品（管理页面）
function searchProductsManage() {
    const query = document.getElementById('productManageSearch').value.toLowerCase();
    let productsHtml = '';
    
    const filteredProducts = systemData.products.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.barcode.includes(query) ||
        product.sku.toLowerCase().includes(query)
    );
    
    filteredProducts.forEach(product => {
        const categoryNames = {
            'necklace': '项链',
            'earrings': '耳环',
            'bracelet': '手链',
            'anklet': '脚链',
            'ring': '戒指',
            'hairpin': '发饰',
            'brooch': '胸针'
        };
        
        // 计算毛利率显示
        const costPrice = product.costPrice || 0;
        const grossProfit = product.price - costPrice;
        const grossProfitRate = costPrice > 0 ? (grossProfit / product.price) * 100 : 0;
        
        let profitRateClass = 'text-gray-500';
        if (grossProfitRate >= 50) {
            profitRateClass = 'text-success';
        } else if (grossProfitRate >= 20) {
            profitRateClass = 'text-warning';
        } else if (grossProfitRate > 0) {
            profitRateClass = 'text-danger';
        }
        
        productsHtml += `
            <tr>
                <td style="font-size: 24px;">${product.image}</td>
                <td>${product.name}</td>
                <td>${product.barcode}</td>
                <td>${costPrice.toLocaleString()}</td>
                <td>${product.price.toLocaleString()}</td>
                <td class="${profitRateClass}">
                    ${grossProfitRate > 0 ? `${grossProfitRate.toFixed(1)}%` : '--'}
                </td>
                <td>${product.stock}</td>
                <td>${categoryNames[product.category] || product.category}</td>
                <td><span class="badge badge-${product.status === 'active' ? 'success' : 'canceled'}">${product.status === 'active' ? '上架' : '下架'}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editProduct(${product.id})">编辑</button>
                    <button class="btn ${product.status === 'active' ? 'btn-danger' : 'btn-success'} btn-sm" onclick="toggleProductStatus(${product.id})">
                        ${product.status === 'active' ? '下架' : '上架'}
                    </button>
                    ${systemData.currentUser && systemData.currentUser.role === 'admin' ? 
                        `<button class="btn btn-danger btn-sm ml-1" onclick="deleteProduct(${product.id})">删除</button>` : ''
                    }
                </td>
            </tr>
        `;
    });
    
    document.querySelector('#productsTable tbody').innerHTML = productsHtml;
}

// 编辑商品
function editProduct(productId) {
    const product = systemData.products.find(p => p.id === productId);
    if (!product) return;
    
    // 填充表单数据
    window.editingProductId = productId;
    document.getElementById('productModalTitle').textContent = '编辑商品';
    document.getElementById('productName').value = product.name;
    document.getElementById('productBarcode').value = product.barcode;
    document.getElementById('productSku').value = product.sku;
    document.getElementById('productCostPrice').value = product.costPrice || '';
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productStatus').value = product.status;
    
    // 计算并显示毛利率
    calculateProfitRate();
    
    // 显示图片预览（如果有）
    if (product.imageUrl) {
        document.getElementById('previewImg').src = product.imageUrl;
        document.getElementById('productImagePreview').classList.remove('hidden');
    } else {
        document.getElementById('productImagePreview').classList.add('hidden');
    }
    
    // 打开模态框
    openModal('addProductModal');
}

// 删除商品
function deleteProduct(productId) {
    if (!confirm('确定要删除该商品吗？此操作不可撤销！')) return;
    
    // 检查是否有权限
    if (!systemData.currentUser || systemData.currentUser.role !== 'admin') {
        alert('您没有删除商品的权限');
        return;
    }
    
    const productIndex = systemData.products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        systemData.products.splice(productIndex, 1);
        saveLocalStorageData();
        loadProductsManage();
        loadProducts(); // 同时更新收银页面的商品列表
        alert('商品已删除');
    }
}

// 切换商品状态
function toggleProductStatus(productId) {
    const product = systemData.products.find(p => p.id === productId);
    if (!product) return;
    
    product.status = product.status === 'active' ? 'inactive' : 'active';
    saveLocalStorageData();
    loadProductsManage();
    loadProducts(); // 同时更新收银页面的商品列表
}

// 保存商品
function saveProduct() {
    const name = document.getElementById('productName').value;
    const barcode = document.getElementById('productBarcode').value;
    const sku = document.getElementById('productSku').value;
    const costPrice = parseInt(document.getElementById('productCostPrice').value) || 0;
    const salePrice = parseInt(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const category = document.getElementById('productCategory').value;
    const status = document.getElementById('productStatus').value;
    
    // 处理图片上传
    const imageInput = document.getElementById('productImage');
    let imageUrl = null;
    let displayImage = "💎"; // 默认图标
    
    // 如果有新图片上传
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageUrl = e.target.result;
            displayImage = `<img src="${imageUrl}" alt="${name}" style="max-width: 60px; max-height: 60px; border-radius: 4px;">`;
            saveProductData(name, barcode, sku, costPrice, salePrice, stock, category, status, displayImage, imageUrl);
        }
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        // 没有上传新图片，使用现有图片
        if (window.editingProductId) {
            const existingProduct = systemData.products.find(p => p.id === window.editingProductId);
            displayImage = existingProduct.image;
            imageUrl = existingProduct.imageUrl;
        }
        saveProductData(name, barcode, sku, costPrice, salePrice, stock, category, status, displayImage, imageUrl);
    }
}

// 保存商品数据（分离出来处理图片异步）
function saveProductData(name, barcode, sku, costPrice, salePrice, stock, category, status, displayImage, imageUrl) {
    // 简单验证
    if (!name || !barcode || !sku || isNaN(costPrice) || isNaN(salePrice) || isNaN(stock) || !category) {
        alert('请填写完整的商品信息');
        return;
    }
    
    // 验证价格合理性
    if (costPrice < 0 || salePrice < 0) {
        alert('价格不能为负数');
        return;
    }
    
    if (salePrice < costPrice) {
        alert('售价不能低于成本价');
        return;
    }
    
    // 计算毛利率
    const grossProfit = salePrice - costPrice;
    const grossProfitRate = costPrice > 0 ? (grossProfit / salePrice) * 100 : 100;
    
    // 检查条码是否已存在
    const barcodeExists = systemData.products.some(p => p.barcode === barcode && p.id !== (window.editingProductId || 0));
    if (barcodeExists) {
        alert('该商品条码已存在');
        return;
    }
    
    if (window.editingProductId) {
        // 编辑现有商品
        const product = systemData.products.find(p => p.id === window.editingProductId);
        if (product) {
            product.name = name;
            product.barcode = barcode;
            product.sku = sku;
            product.costPrice = costPrice;
            product.price = salePrice;
            product.stock = stock;
            product.category = category;
            product.image = displayImage;
            product.imageUrl = imageUrl;
            product.status = status;
            product.grossProfit = grossProfit;
            product.grossProfitRate = grossProfitRate;
        }
        alert('商品信息更新成功');
        delete window.editingProductId;
    } else {
        // 添加新商品
        const newId = systemData.products.length > 0 
            ? Math.max(...systemData.products.map(p => p.id)) + 1 
            : 1;
        
        systemData.products.push({
            id: newId,
            name: name,
            costPrice: costPrice,
            price: salePrice,
            stock: stock,
            image: displayImage,
            imageUrl: imageUrl,
            barcode: barcode,
            sku: sku,
            category: category,
            status: status,
            grossProfit: grossProfit,
            grossProfitRate: grossProfitRate,
            createTime: new Date().toLocaleDateString()
        });
        
        alert('商品添加成功');
    }
    
    // 保存数据并刷新页面
    saveLocalStorageData();
    loadProductsManage();
    loadProducts();
    
    // 重置表单并关闭模态框
    document.getElementById('addProductForm').reset();
    document.getElementById('productImagePreview').classList.add('hidden');
    closeModal('addProductModal');
}

// 自动计算毛利率
function calculateProfitRate() {
    const costPrice = parseFloat(document.getElementById('productCostPrice').value) || 0;
    const salePrice = parseFloat(document.getElementById('productPrice').value) || 0;
    
    if (costPrice > 0 && salePrice > 0) {
        const grossProfit = salePrice - costPrice;
        const grossProfitRate = (grossProfit / salePrice) * 100;
        
        document.getElementById('profitRateDisplay').textContent = 
            `毛利: ${grossProfit.toLocaleString()} Ks (${grossProfitRate.toFixed(1)}%)`;
        
        // 根据毛利率设置颜色
        const profitRateElement = document.getElementById('profitRateDisplay');
        if (grossProfitRate >= 50) {
            profitRateElement.className = 'text-success font-medium';
        } else if (grossProfitRate >= 20) {
            profitRateElement.className = 'text-warning font-medium';
        } else {
            profitRateElement.className = 'text-danger font-medium';
        }
    } else {
        document.getElementById('profitRateDisplay').textContent = '请输入成本和售价';
        document.getElementById('profitRateDisplay').className = 'text-gray-500';
    }
}

// 导出商品数据
function exportProducts() {
    if (systemData.products.length === 0) {
        alert('没有商品数据可以导出');
        return;
    }
    
    // 准备导出的数据
    const exportData = systemData.products.map(product => ({
        '商品名称': product.name,
        '商品条码': product.barcode,
        'SKU编码': product.sku,
        '成本价(Ks)': product.costPrice || 0,
        '售价(Ks)': product.price,
        '毛利率(%)': product.costPrice ? ((product.price - product.costPrice) / product.price * 100).toFixed(1) : 0,
        '库存数量': product.stock,
        '商品分类': product.category,
        '状态': product.status === 'active' ? '上架' : '下架',
        '创建时间': product.createTime
    }));
    
    // 转换为CSV
    const headers = ['商品名称', '商品条码', 'SKU编码', '成本价(Ks)', '售价(Ks)', '毛利率(%)', '库存数量', '商品分类', '状态', '创建时间'];
    let csvContent = headers.join(',') + '\n';
    
    exportData.forEach(row => {
        const rowData = headers.map(header => {
            let cell = row[header] || '';
            // 处理包含逗号或引号的情况
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
                cell = `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        });
        csvContent += rowData.join(',') + '\n';
    });
    
    // 创建下载链接
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `airiofficial_products_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert(`成功导出 ${systemData.products.length} 个商品数据`);
}

// 导入商品数据
function importProducts() {
    const fileInput = document.getElementById('importProductsFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('请先选择CSV文件');
        return;
    }
    
    if (!file.name.endsWith('.csv')) {
        alert('请选择CSV格式的文件');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csvContent = e.target.result;
            const lines = csvContent.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
                alert('文件内容为空或格式不正确');
                return;
            }
            
            // 解析CSV头
            const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
            const requiredHeaders = ['商品名称', '商品条码', 'SKU编码', '成本价(Ks)', '售价(Ks)', '库存数量', '商品分类'];
            
            // 检查必要的列
            for (const requiredHeader of requiredHeaders) {
                if (!headers.includes(requiredHeader)) {
                    alert(`CSV文件缺少必要的列: ${requiredHeader}\n请使用下载的模板文件`);
                    return;
                }
            }
            
            let successCount = 0;
            let errorCount = 0;
            const errors = [];
            
            // 处理每一行数据
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const values = parseCSVLine(line);
                
                if (values.length !== headers.length) {
                    errors.push(`第${i+1}行列数不匹配`);
                    errorCount++;
                    continue;
                }
                
                const rowData = {};
                headers.forEach((header, index) => {
                    rowData[header] = values[index] || '';
                });
                
                try {
                    // 验证和处理数据
                    const name = (rowData['商品名称'] || '').trim();
                    const barcode = (rowData['商品条码'] || '').trim();
                    const sku = (rowData['SKU编码'] || '').trim();
                    const costPrice = parseInt(rowData['成本价(Ks)']);
                    const salePrice = parseInt(rowData['售价(Ks)']);
                    const stock = parseInt(rowData['库存数量']);
                    const category = (rowData['商品分类'] || '').trim();
                    const status = (rowData['状态'] === '下架' ? 'inactive' : 'active');
                    
                    if (!name || !barcode || !sku || isNaN(costPrice) || costPrice < 0 || isNaN(salePrice) || salePrice < 0 || isNaN(stock) || stock < 0 || !category) {
                        errors.push(`第${i+1}行数据不完整或格式错误: ${name || '无名商品'}`);
                        errorCount++;
                        continue;
                    }
                    
                    if (salePrice < costPrice) {
                        errors.push(`第${i+1}行售价不能低于成本价: ${name}`);
                        errorCount++;
                        continue;
                    }
                    
                    // 检查条码是否已存在
                    if (systemData.products.some(p => p.barcode === barcode)) {
                        errors.push(`第${i+1}行商品条码已存在: ${barcode}`);
                        errorCount++;
                        continue;
                    }
                    
                    // 计算毛利率
                    const grossProfit = salePrice - costPrice;
                    const grossProfitRate = costPrice > 0 ? (grossProfit / salePrice) * 100 : 100;
                    
                    // 添加商品
                    const newId = systemData.products.length > 0 
                        ? Math.max(...systemData.products.map(p => p.id)) + 1 
                        : 1;
                    
                    systemData.products.push({
                        id: newId,
                        name: name,
                        costPrice: costPrice,
                        price: salePrice,
                        stock: stock,
                        image: "💎", // 默认图标
                        imageUrl: null,
                        barcode: barcode,
                        sku: sku,
                        category: category,
                        status: status,
                        grossProfit: grossProfit,
                        grossProfitRate: grossProfitRate,
                        createTime: new Date().toLocaleDateString()
                    });
                    
                    successCount++;
                } catch (error) {
                    errors.push(`第${i+1}行处理失败: ${error.message}`);
                    errorCount++;
                }
            }
            
            // 保存数据
            saveLocalStorageData();
            loadProductsManage();
            loadProducts();
            
            // 关闭模态框
            closeModal('importProductsModal');
            
            // 显示导入结果
            let message = `导入完成！\n成功: ${successCount} 个商品\n失败: ${errorCount} 个`;
            if (errors.length > 0) {
                message += '\n\n错误详情:\n' + errors.slice(0, 5).join('\n');
                if (errors.length > 5) {
                    message += `\n... 还有 ${errors.length - 5} 个错误`;
                }
            }
            
            alert(message);
            fileInput.value = ''; // 清空文件选择
            
        } catch (error) {
            alert('文件解析失败: ' + error.message);
            console.error('导入错误:', error);
        }
    };
    
    reader.onerror = function() {
        alert('文件读取失败');
    };
    
    reader.readAsText(file, 'UTF-8');
}

// 解析CSV行（处理包含逗号和引号的情况）
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    values.push(current.trim());
    return values.map(value => value.replace(/^"|"$/g, '').replace(/""/g, '"'));
}

// 下载导入模板（已在 products.js 中更新）
function downloadImportTemplate() {
    const templateData = [
        ['商品名称', '商品条码', 'SKU编码', '成本价(Ks)', '售价(Ks)', '库存数量', '商品分类', '状态'],
        ['水晶项链', '100001', 'NECK001', '15000', '25000', '10', 'necklace', '上架'],
        ['珍珠耳环', '100002', 'EARR001', '8000', '15000', '15', 'earrings', '上架'],
        ['银质手链', '100003', 'BRAC001', '10000', '18000', '8', 'bracelet', '上架']
    ];
    
    let csvContent = templateData.map(row => 
        row.map(cell => {
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
                return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        }).join(',')
    ).join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'airiofficial_products_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('导入模板下载完成！请按照模板格式填写商品数据。');
}

// 打开导入商品模态框
function openImportModal() {
    // 清空文件输入
    document.getElementById('importProductsFile').value = '';
    openModal('importProductsModal');
}
// SKU编码生成器
function generateSKU(category, material, size = '', color = '') {
    // 分类代码映射
    const categoryCodes = {
        'necklace': 'NECK',
        'earrings': 'EARR', 
        'bracelet': 'BRAC',
        'anklet': 'ANKL',
        'ring': 'RING',
        'hairpin': 'HAIR',
        'brooch': 'BROO'
    };
    
    // 材质代码映射
    const materialCodes = {
        'gold': 'GOLD',
        'silver': 'SILV',
        'diamond': 'DIAM',
        'pearl': 'PEAR',
        'crystal': 'CRYS',
        'gemstone': 'GEMS',
        'other': 'OTHR'
    };
    
    // 尺寸代码映射
    const sizeCodes = {
        'small': 'S',
        'medium': 'M',
        'large': 'L',
        '': ''
    };
    
    // 颜色代码映射（可选）
    const colorCodes = {
        'red': 'RED',
        'blue': 'BLUE',
        'green': 'GRN',
        'white': 'WHT',
        'black': 'BLK',
        'pink': 'PNK',
        'purple': 'PUR',
        '': ''
    };
    
    const categoryCode = categoryCodes[category] || 'PROD';
    const materialCode = materialCodes[material] || 'OTHR';
    const sizeCode = sizeCodes[size] || '';
    const colorCode = colorCodes[color] || '';
    
    // 生成序号
    const sameTypeProducts = systemData.products.filter(p => 
        p.category === category && 
        p.material === material
    );
    const sequence = String(sameTypeProducts.length + 1).padStart(3, '0');
    
    // 构建SKU
    let sku = categoryCode + '-' + materialCode;
    if (sizeCode) sku += '-' + sizeCode;
    if (colorCode) sku += '-' + colorCode;
    sku += '-' + sequence;
    
    return sku;
}

// 自动生成SKU
function autoGenerateSKU() {
    const category = document.getElementById('productCategory').value;
    const material = document.getElementById('productMaterial').value || 'other';
    const size = document.getElementById('productSize').value || '';
    const color = document.getElementById('productColor').value || '';
    
    const sku = generateSKU(category, material, size, color);
    document.getElementById('productSku').value = sku;
}