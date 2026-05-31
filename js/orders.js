const Orders = {
    data: {
        orders: [],
        customers: [],
        products: [],
        filteredOrders: [],
        currentOrder: null,
        tempCart: [], // State utama keranjang
        selectedProduct: null // State produk yang sedang dipilih
    },

    async init() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('action') === 'new') this.showNewOrderModal();
        await this.loadData();
        this.render();
    },

    async loadData() {
        Components.showLoading('Memuat data...');
        try {
            this.data.orders = await Storage.getAll('orders');
            this.data.customers = await Storage.getAll('customers');
            this.data.products = await Storage.getAll('products');
            this.data.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            this.data.filteredOrders = [...this.data.orders];
        } catch (error) {
            console.error(error);
        } finally {
            Components.hideLoading();
        }
    },

    render() {
        const container = document.getElementById('ordersContent');
        if (!container) return;
        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Daftar Pesanan</h3>
                    <button class="btn btn-primary" onclick="Orders.showNewOrderModal()">+ Pesanan Baru</button>
                </div>
                <div class="table-container">
                    <table class="table data-table">
                        <thead><tr><th>Customer</th><th>Invoice</th><th>Items</th><th>Total</th><th>Aksi</th></tr></thead>
                        <tbody id="ordersTableBody">${this.renderOrderRows()}</tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderOrderRows() {
        if (this.data.filteredOrders.length === 0) return `<tr><td colspan="5" style="text-align:center; padding:40px;">Belum ada pesanan</td></tr>`;
        return this.data.filteredOrders.map(o => `
            <tr onclick="Orders.viewOrder('${o.id}')" style="cursor:pointer;">
                <td><strong>${o.customerName}</strong><br><small>${o.customerPhone}</small></td>
                <td>${o.invoiceNumber}</td>
                <td><span class="badge badge-secondary">${o.items ? o.items.length : 1}</span></td>
                <td>Rp ${App.formatNumber(o.total)}</td>
                <td><button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); Orders.viewOrder('${o.id}')">Detail</button></td>
            </tr>
        `).join('');
    },

    // ==========================================
    // MODAL PESANAN BARU (STATE MANAGEMENT)
    // ==========================================
    showNewOrderModal() {
        // 1. Reset State Utama
        this.data.tempCart = [];
        this.data.selectedProduct = null;

        Components.showModal({
            title: 'Buat Pesanan Baru',
            size: 'modal-xl',
            content: this.renderFormHTML(),
            footer: false
        });

        // 2. Inisialisasi Tampilan
        this.renderCartItems(); // Render keranjang kosong
        this.updatePayment(); // Reset total
    },

    renderFormHTML() {
        return `
            <div style="position: relative;">
                <form id="orderForm" onsubmit="Orders.saveOrder(event)">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                        <!-- Kiri: Customer -->
                        <div>
                            <h4 style="margin-bottom: 16px; color: var(--accent-primary);">Data Customer</h4>
                            <div class="form-group">
                                <label>Nama</label>
                                <input type="text" class="form-input" name="customerName" required placeholder="Nama Customer">
                            </div>
                            <div class="form-group">
                                <label>WhatsApp</label>
                                <input type="tel" class="form-input" name="customerPhone" required placeholder="08xx">
                            </div>
                            <div class="form-group">
                                <label>Alamat</label>
                                <textarea class="form-input form-textarea" name="customerAddress"></textarea>
                            </div>
                        </div>

                        <!-- Kanan: Keranjang -->
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                                <h4 style="color: var(--accent-primary); margin: 0;">Keranjang</h4>
                                <button type="button" class="btn btn-primary btn-sm" onclick="Orders.openItemOverlay()">+ Tambah</button>
                            </div>

                            <!-- LIST KERANJANG -->
                            <div id="cartContainer" style="min-height: 150px; border: 1px solid var(--border-color); border-radius: 8px; padding: 8px; background: var(--bg-tertiary); margin-bottom: 16px;">
                                <!-- Diisi oleh JS -->
                            </div>

                            <!-- TOTAL -->
                            <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px;">
                                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                                    <span>Subtotal</span>
                                    <span id="displaySubtotal">Rp 0</span>
                                </div>
                                <div class="form-group" style="margin-bottom:10px;">
                                    <label style="font-size:0.9rem;">DP</label>
                                    <input type="number" class="form-input" name="downPayment" value="0" oninput="Orders.updatePayment()">
                                </div>
                                <div style="display:flex; justify-content:space-between; font-weight:700; color: var(--accent-primary);">
                                    <span>Sisa Bayar</span>
                                    <span id="displayRemaining">Rp 0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="text-align:right; margin-top:24px;">
                        <button type="button" class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
                        <button type="submit" class="btn btn-primary">Simpan</button>
                    </div>
                </form>

                <!-- OVERLAY TAMBAH ITEM -->
                <div id="addItemOverlay" style="display: none; position: absolute; inset: 0; background: rgba(10,10,15,0.98); z-index: 10; padding: 24px; border-radius: var(--radius-xl); overflow-y: auto;">
                    <div style="max-width: 500px; margin: 0 auto;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                            <h3 style="margin:0">Tambah Produk</h3>
                            <button type="button" class="btn btn-sm btn-ghost" onclick="Orders.closeItemOverlay()">X</button>
                        </div>
                        
                        <div class="form-group">
                            <label>Tipe</label>
                            <select class="form-input form-select" id="itemType" onchange="Orders.checkStock()">
                                <option value="stock">Ready Stock</option>
                                <option value="po">Pre-Order</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Produk</label>
                            <select class="form-input form-select" id="itemProduct" onchange="Orders.onProductSelect()">
                                <option value="">-- Pilih --</option>
                                ${this.data.products.map(p => `<option value="${p.id}" data-price="${p.price}" data-stock="${p.stock}">${p.name} (Stok: ${p.stock})</option>`).join('')}
                            </select>
                        </div>
                        
                        <!-- PREVIEW & INPUTS -->
                        <div class="form-row">
                            <div class="form-group">
                                <label>Ukuran</label>
                                <select class="form-input form-select" id="itemSize"><option value="">Pilih</option></select>
                            </div>
                            <div class="form-group">
                                <label>Jumlah</label>
                                <input type="number" class="form-input" id="itemQty" value="1" min="1" oninput="Orders.calculateItemSubtotal()">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Catatan (Warna/Detail)</label>
                            <input type="text" class="form-input" id="itemNotes" placeholder="Contoh: Warna Hitam">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Harga</label>
                                <input type="number" class="form-input" id="itemPrice" readonly>
                            </div>
                            <div class="form-group">
                                <label>Subtotal</label>
                                <input type="text" class="form-input" id="itemSubtotal" readonly value="Rp 0">
                            </div>
                        </div>
                        
                        <div id="itemStockInfo" style="margin-bottom:16px; font-size:0.85rem; color:var(--text-muted);"></div>

                        <div style="display:flex; gap:12px;">
                            <button type="button" class="btn btn-secondary" style="flex:1" onclick="Orders.closeItemOverlay()">Batal</button>
                            <button type="button" class="btn btn-primary" style="flex:1" onclick="Orders.confirmAddItem()">Tambahkan</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // ==========================================
    // LOGIC OVERLAY (INPUT & OUTPUT SYNC)
    // ==========================================

    openItemOverlay() {
        // Reset Form di dalam Overlay
        document.getElementById('itemType').value = 'stock';
        document.getElementById('itemProduct').value = '';
        document.getElementById('itemSize').innerHTML = '<option value="">Pilih</option>';
        document.getElementById('itemQty').value = '1';
        document.getElementById('itemNotes').value = '';
        document.getElementById('itemPrice').value = '';
        document.getElementById('itemSubtotal').value = 'Rp 0';
        document.getElementById('itemStockInfo').innerText = '';

        // Tampilkan Overlay
        document.getElementById('addItemOverlay').style.display = 'block';
    },

    closeItemOverlay() {
        document.getElementById('addItemOverlay').style.display = 'none';
    },

    onProductSelect() {
        const select = document.getElementById('itemProduct');
        const id = select.value;

        if (!id) {
            this.data.selectedProduct = null;
            return;
        }

        const product = this.data.products.find(p => p.id === id);
        this.data.selectedProduct = product;

        // Update Harga
        document.getElementById('itemPrice').value = product.price;

        // Update Ukuran
        const sizeSelect = document.getElementById('itemSize');
        sizeSelect.innerHTML = '<option value="">Pilih</option>';
        if (product.sizes) {
            product.sizes.forEach(s => sizeSelect.innerHTML += `<option value="${s}">${s}</option>`);
        }

        this.checkStock();
        this.calculateItemSubtotal();
    },

    checkStock() {
        const type = document.getElementById('itemType').value;
        const select = document.getElementById('itemProduct');
        const stock = select.options[select.selectedIndex]?.getAttribute('data-stock') || 0;
        const info = document.getElementById('itemStockInfo');

        if (type === 'stock') {
            info.innerText = `Stok Tersedia: ${stock}`;
            info.style.color = 'var(--accent-primary)';
        } else {
            info.innerText = 'Pre-Order (Produksi)';
            info.style.color = 'var(--warning)';
        }
    },

    calculateItemSubtotal() {
        const qty = parseInt(document.getElementById('itemQty').value) || 0;
        const price = parseFloat(document.getElementById('itemPrice').value) || 0;
        const subtotal = qty * price;
        document.getElementById('itemSubtotal').value = `Rp ${App.formatNumber(subtotal)}`;
    },

    confirmAddItem() {
        const productId = document.getElementById('itemProduct').value;
        if (!productId) return Components.showToast('Pilih produk', 'warning');

        const product = this.data.products.find(p => p.id === productId);
        const type = document.getElementById('itemType').value;
        const size = document.getElementById('itemSize').value;
        const notes = document.getElementById('itemNotes').value;
        const qty = parseInt(document.getElementById('itemQty').value) || 0;
        const price = parseFloat(document.getElementById('itemPrice').value) || 0;

        // Validasi
        if (qty <= 0) return Components.showToast('Qty tidak valid', 'warning');
        if (type === 'stock' && product.stock < qty) return Components.showToast('Stok tidak cukup', 'danger');

        // Buat Object Item
        const item = {
            tempId: Date.now(),
            productId: product.id,
            productName: product.name,
            productImage: (product.images && product.images[0]) ? product.images[0] : null,
            size: size || 'All Size',
            notes: notes,
            quantity: qty,
            pricePerUnit: price,
            subtotal: qty * price,
            orderType: type
        };

        // Push ke State
        this.data.tempCart.push(item);

        // Update UI (Output)
        this.renderCartItems();
        this.updatePayment();

        this.closeItemOverlay();
        Components.showToast('Item ditambahkan', 'success');
    },

    removeItem(tempId) {
        this.data.tempCart = this.data.tempCart.filter(i => i.tempId !== tempId);
        this.renderCartItems();
        this.updatePayment();
    },

    // ==========================================
    // RENDER & UPDATE (OUTPUT)
    // ==========================================

    renderCartItems() {
        const container = document.getElementById('cartContainer');
        if (!container) return;

        if (this.data.tempCart.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding: 40px;">Klik '+ Tambah' untuk memulai</p>`;
            return;
        }

        container.innerHTML = this.data.tempCart.map(item => `
            <div style="display:flex; align-items:center; gap:10px; padding:10px; background:var(--bg-card); border-radius:6px; margin-bottom:6px; border:1px solid var(--border-color);">
                <div style="flex:1;">
                    <div style="font-weight:600;">${item.productName}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">Size: ${item.size} | Qty: ${item.quantity}</div>
                    ${item.notes ? `<div style="font-size:0.75rem; color:var(--accent-secondary);">${item.notes}</div>` : ''}
                    <div style="font-size:0.8rem; color:var(--accent-primary); font-weight:600;">Rp ${App.formatNumber(item.subtotal)}</div>
                </div>
                <button type="button" class="btn btn-sm btn-ghost" onclick="Orders.removeItem(${item.tempId})" style="color:var(--danger);">Hapus</button>
            </div>
        `).join('');
    },

    updatePayment() {
        const total = this.data.tempCart.reduce((sum, item) => sum + item.subtotal, 0);
        const dpInput = document.querySelector('input[name="downPayment"]');
        const dp = parseFloat(dpInput?.value) || 0;

        const subtotalEl = document.getElementById('displaySubtotal');
        const remainingEl = document.getElementById('displayRemaining');

        if (subtotalEl) subtotalEl.innerText = `Rp ${App.formatNumber(total)}`;
        if (remainingEl) remainingEl.innerText = `Rp ${App.formatNumber(total - dp)}`;
    },

    // ==========================================
    // SAVE ORDER
    // ==========================================
    async saveOrder(e) {
        e.preventDefault();
        if (this.data.tempCart.length === 0) return Components.showToast('Keranjang kosong', 'warning');

        Components.showLoading('Menyimpan...');
        try {
            const form = e.target;
            const formData = new FormData(form);

            // 1. Proses Stok
            for (const item of this.data.tempCart) {
                if (item.orderType === 'stock') {
                    const product = this.data.products.find(p => p.id === item.productId);
                    if (product) {
                        if (product.stock < item.quantity) throw new Error(`Stok ${product.name} habis`);
                        product.stock -= item.quantity;
                        await Storage.update('products', product);
                    }
                }
            }

            // 2. Simpan Customer
            let customer = this.data.customers.find(c => c.phone === formData.get('customerPhone'));
            if (!customer) {
                customer = {
                    id: Storage.generateId(),
                    name: formData.get('customerName'),
                    phone: formData.get('customerPhone'),
                    address: formData.get('customerAddress')
                };
                await Storage.add('customers', customer);
            }

            const total = this.data.tempCart.reduce((sum, item) => sum + item.subtotal, 0);
            const dp = parseFloat(formData.get('downPayment')) || 0;

            // 3. Simpan Order
            const order = {
                id: Storage.generateId(),
                invoiceNumber: Storage.generateInvoiceNumber(),
                customerId: customer.id,
                customerName: customer.name,
                customerPhone: customer.phone,
                customerAddress: customer.address,
                items: structuredClone(this.data.tempCart), // Deep copy
                total: total,
                downPayment: dp,
                remainingPayment: total - dp,
                status: 'pending',
                paymentStatus: dp >= total ? 'paid' : (dp > 0 ? 'partial' : 'unpaid'),
                createdAt: new Date().toISOString()
            };

            await Storage.add('orders', order);

            Components.closeModal();
            Components.showToast('Pesanan disimpan', 'success');
            await this.loadData();
            this.render();

        } catch (err) {
            Components.showToast('Gagal: ' + err.message, 'danger');
        } finally { Components.hideLoading(); }
    },

    // ==========================================
    // VIEW, UPDATE, DELETE (Sama seperti sebelumnya)
    // ==========================================
    async viewOrder(id) {
        const order = await Storage.get('orders', id);
        if (!order) return;

        const statuses = [
            { id: 'pending', label: 'Menunggu' },
            { id: 'processing', label: 'Diproses' },
            { id: 'completed', label: 'Selesai' },
            { id: 'cancelled', label: 'Dibatalkan' }
        ];

        const itemsHtml = (order.items || []).map(item => `
            <tr>
                <td>${item.productName}</td>
                <td>${item.size}</td>
                <td style="font-size: 0.8rem;">${item.notes || '-'}</td>
                <td>${item.quantity}</td>
                <td>Rp ${App.formatNumber(item.subtotal)}</td>
            </tr>
        `).join('');

        Components.showModal({
            title: `Detail: ${order.invoiceNumber}`,
            size: 'modal-lg',
            content: `
                <div style="display:grid; gap:20px;">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                        <div>
                            <h4>Customer</h4>
                            <p>${order.customerName}<br>${order.customerPhone}<br>${order.customerAddress || '-'}</p>
                        </div>
                        <div>
                            <h4>Total</h4>
                            <p style="font-size: 1.2rem; font-weight: 700; color: var(--accent-primary);">Rp ${App.formatNumber(order.total)}</p>
                        </div>
                    </div>
                    <div style="border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden;">
                        <table class="table" style="margin: 0;">
                            <thead><tr><th>Produk</th><th>Size</th><th>Catatan</th><th>Qty</th><th>Subtotal</th></tr></thead>
                            <tbody>${itemsHtml}</tbody>
                        </table>
                    </div>
                    <div style="background: var(--bg-tertiary); padding: 16px; border-radius: 8px;">
                        <h4 style="margin-bottom:10px;">Update Status</h4>
                        <div style="display:flex; gap:12px; align-items:center;">
                            <select class="form-input form-select" id="statusSelect" style="width: 200px;">
                                ${statuses.map(s => `<option value="${s.id}" ${order.status === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}
                            </select>
                            <button class="btn btn-primary" onclick="Orders.updateStatus('${order.id}')">Simpan</button>
                        </div>
                    </div>
                    <div style="border-top:1px solid var(--border-color); padding-top:16px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4>Aksi</h4>
                            <p style="font-size: 0.8rem; color: var(--text-muted);">Hapus pesanan mengembalikan stok.</p>
                        </div>
                        <button class="btn btn-danger" onclick="Orders.confirmDelete('${order.id}')">Hapus Pesanan</button>
                    </div>
                    <div style="border-top:1px solid var(--border-color); padding-top:16px;">
                        <h4>Cetak Struk</h4>
                        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px;">
                            <button class="btn btn-secondary" onclick="Invoice.printCustomerInvoice('${order.id}')">Customer</button>
                            <button class="btn btn-secondary" onclick="Invoice.printAdminInvoice('${order.id}')">Admin</button>
                            <button class="btn btn-secondary" onclick="Production.showRecapModal()">Penjahit</button>
                        </div>
                    </div>
                </div>
            `,
            footer: `<button class="btn btn-secondary" onclick="Components.closeModal()">Tutup</button>`
        });
    },

    confirmDelete(id) {
        if (confirm('Yakin hapus? Stok akan dikembalikan.')) this.deleteOrder(id);
    },

    async deleteOrder(id) {
        Components.showLoading('Menghapus...');
        try {
            const order = await Storage.get('orders', id);
            if (order.items) {
                for (const item of order.items) {
                    if (item.orderType === 'stock') {
                        const p = await Storage.get('products', item.productId);
                        if (p) {
                            p.stock += item.quantity;
                            await Storage.update('products', p);
                        }
                    }
                }
            }
            await Storage.delete('orders', id);
            Components.closeModal();
            Components.showToast('Terhapus', 'success');
            await this.loadData();
            this.render();
        } catch (e) { Components.showToast('Gagal', 'danger'); }
        finally { Components.hideLoading(); }
    },

    async updateStatus(id) {
        const status = document.getElementById('statusSelect').value;
        Components.showLoading('Update...');
        try {
            const order = await Storage.get('orders', id);
            const old = order.status;

            if (status === 'cancelled' && old !== 'cancelled') {
                if (order.items) {
                    for (const item of order.items) {
                        if (item.orderType === 'stock') {
                            const p = await Storage.get('products', item.productId);
                            if (p) { p.stock += item.quantity; await Storage.update('products', p); }
                        }
                    }
                }
            }

            if (old === 'cancelled' && status !== 'cancelled') {
                if (order.items) {
                    for (const item of order.items) {
                        if (item.orderType === 'stock') {
                            const p = await Storage.get('products', item.productId);
                            if (p && p.stock >= item.quantity) { p.stock -= item.quantity; await Storage.update('products', p); }
                            else throw new Error('Stok tidak cukup');
                        }
                    }
                }
            }

            order.status = status;
            await Storage.update('orders', order);
            Components.showToast('Status updated', 'success');
            await this.loadData();
            this.render();
            Components.closeModal();
        } catch (e) { Components.showToast('Gagal: ' + e.message, 'danger'); }
        finally { Components.hideLoading(); }
    }
};

window.Orders = Orders;
