const Orders = {
    data: {
        orders: [],
        customers: [],
        products: [],
        filteredOrders: [],
        currentOrder: null,
        tempCart: []
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
                    <button class="btn btn-primary" onclick="Orders.showNewOrderModal()">
                        ${Components.icons.plus} Pesanan Baru
                    </button>
                </div>
                <div class="table-container">
                    <table class="table data-table">
                        <thead>
                            <tr><th>Customer</th><th>Invoice</th><th>Items</th><th>Total</th><th>Aksi</th></tr>
                        </thead>
                        <tbody id="ordersTableBody">${this.renderOrderRows()}</tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderOrderRows() {
        if (this.data.filteredOrders.length === 0) return `<tr><td colspan="5" style="text-align:center; padding:40px;">Belum ada pesanan</td></tr>`;
        return this.data.filteredOrders.map(o => `
            <tr style="cursor:pointer;" onclick="Orders.viewOrder('${o.id}')">
                <td><strong>${o.customerName}</strong><br><small>${o.customerPhone}</small></td>
                <td>${o.invoiceNumber}</td>
                <td><span class="badge badge-secondary">${o.items ? o.items.length : 1} Produk</span></td>
                <td>Rp ${App.formatNumber(o.total)}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); Orders.viewOrder('${o.id}')">Detail</button>
                </td>
            </tr>
        `).join('');
    },

    // ==========================================
    // FORM PESANAN BARU (KODE SEBELUMNYA TETAP SAMA)
    // ==========================================
    showNewOrderModal() {
        this.data.tempCart = [];
        Components.showModal({
            title: 'Buat Pesanan Baru',
            size: 'modal-xl',
            content: `
                <div style="position: relative;">
                    <form id="orderForm" onsubmit="Orders.saveOrder(event)">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                            <div>
                                <h4 style="margin-bottom: 16px; color: var(--accent-primary);">Data Customer</h4>
                                <div class="form-group">
                                    <label class="form-label">Nama</label>
                                    <input type="text" class="form-input" name="customerName" required placeholder="Nama Customer">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">WhatsApp</label>
                                    <input type="tel" class="form-input" name="customerPhone" required placeholder="08xx">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Alamat</label>
                                    <textarea class="form-input form-textarea" name="customerAddress"></textarea>
                                </div>
                            </div>
                            <div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                                    <h4 style="color: var(--accent-primary); margin: 0;">Keranjang</h4>
                                    <button type="button" class="btn btn-primary btn-sm" onclick="Orders.toggleAddItemOverlay(true)">+ Tambah</button>
                                </div>
                                <div id="cartItemsContainer" style="min-height: 150px; border: 1px solid var(--border-color); border-radius: 8px; padding: 8px; background: var(--bg-tertiary); margin-bottom: 16px;">
                                    <p style="text-align:center; color:var(--text-muted); padding: 20px;">Klik Tambah Produk</p>
                                </div>
                                <div style="background: var(--bg-secondary); padding: 16px; border-radius: 8px;">
                                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                                        <span>Subtotal</span>
                                        <span id="lblSubtotal">Rp 0</span>
                                    </div>
                                    <div class="form-group" style="margin-bottom:10px;">
                                        <label style="font-size:0.9rem;">DP</label>
                                        <input type="number" class="form-input" name="downPayment" value="0" onchange="Orders.updatePayment()">
                                    </div>
                                    <div style="display:flex; justify-content:space-between; font-weight:700; color: var(--accent-primary);">
                                        <span>Sisa Bayar</span>
                                        <span id="lblRemaining">Rp 0</span>
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
                    <div id="addItemOverlay" style="display: none; position: absolute; inset: 0; background: rgba(10,10,15,0.98); z-index: 10; padding: 24px; border-radius: var(--radius-xl);">
                        <div style="max-width: 500px; margin: 0 auto;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                                <h3 style="margin:0">Tambah Produk</h3>
                                <button type="button" class="btn btn-sm btn-ghost" onclick="Orders.toggleAddItemOverlay(false)">X</button>
                            </div>
                            <div class="form-group">
                                <label>Tipe</label>
                                <select class="form-input form-select" id="overlay_type" onchange="Orders.updateOverlayStockInfo()">
                                    <option value="stock">Ready Stock</option>
                                    <option value="po">Pre-Order</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Produk</label>
                                <select class="form-input form-select" id="overlay_product" onchange="Orders.selectProductOverlay(this.value)">
                                    <option value="">-- Pilih --</option>
                                    ${this.data.products.map(p => `<option value="${p.id}">${p.name} (Stok: ${p.stock})</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Ukuran</label>
                                    <select class="form-input form-select" id="overlay_size"><option value="">-</option></select>
                                </div>
                                <div class="form-group">
                                    <label>Jumlah</label>
                                    <input type="number" class="form-input" id="overlay_qty" value="1">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Catatan Item</label>
                                <textarea class="form-input" id="overlay_notes" placeholder="Warna/Detail"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Harga</label>
                                <input type="number" class="form-input" id="overlay_price" readonly>
                            </div>
                            <div id="overlay_stockInfo" style="margin-bottom:16px; font-size:0.85rem; color:var(--text-muted);"></div>
                            <div style="display:flex; gap:12px;">
                                <button type="button" class="btn btn-secondary" style="flex:1" onclick="Orders.toggleAddItemOverlay(false)">Batal</button>
                                <button type="button" class="btn btn-primary" style="flex:1" onclick="Orders.addItemToCart()">Tambahkan</button>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            footer: false
        });
    },

    toggleAddItemOverlay(show) {
        const overlay = document.getElementById('addItemOverlay');
        if (overlay) overlay.style.display = show ? 'block' : 'none';
    },

    selectProductOverlay(id) {
        if (!id) return;
        const p = this.data.products.find(x => x.id === id);
        document.getElementById('overlay_price').value = p.price;
        const sizeSel = document.getElementById('overlay_size');
        sizeSel.innerHTML = '<option value="">Pilih</option>';
        if (p.sizes) p.sizes.forEach(s => sizeSel.innerHTML += `<option value="${s}">${s}</option>`);
        this.updateOverlayStockInfo();
    },

    updateOverlayStockInfo() {
        const type = document.getElementById('overlay_type').value;
        const sel = document.getElementById('overlay_product');
        const stock = sel.options[sel.selectedIndex]?.getAttribute('data-stock') || 0;
        const info = document.getElementById('overlay_stockInfo');
        info.innerText = type === 'stock' ? `Stok: ${stock}` : 'Pre-Order';
    },

    addItemToCart() {
        const productId = document.getElementById('overlay_product').value;
        if (!productId) return Components.showToast('Pilih produk', 'warning');
        const product = this.data.products.find(p => p.id === productId);
        const type = document.getElementById('overlay_type').value;
        const size = document.getElementById('overlay_size').value;
        const notes = document.getElementById('overlay_notes').value;
        const qty = parseInt(document.getElementById('overlay_qty').value) || 0;
        const price = parseFloat(document.getElementById('overlay_price').value) || 0;

        if (type === 'stock' && product.stock < qty) return Components.showToast('Stok tidak cukup', 'danger');

        this.data.tempCart.push({
            tempId: Date.now(),
            productId: product.id,
            productName: product.name,
            productImage: (product.images && product.images[0]) ? product.images[0] : null,
            size: size,
            notes: notes,
            quantity: qty,
            pricePerUnit: price,
            subtotal: qty * price,
            orderType: type
        });

        this.renderCartItems();
        this.toggleAddItemOverlay(false);
    },

    removeItemFromCart(tempId) {
        this.data.tempCart = this.data.tempCart.filter(i => i.tempId !== tempId);
        this.renderCartItems();
    },

    renderCartItems() {
        const container = document.getElementById('cartItemsContainer');
        if (this.data.tempCart.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding: 20px;">Klik Tambah Produk</p>`;
            return this.updatePayment();
        }
        container.innerHTML = this.data.tempCart.map(item => `
            <div style="display:flex; align-items:center; gap:10px; padding:8px; background:var(--bg-card); border-radius:6px; margin-bottom:6px; border:1px solid var(--border-color);">
                <div style="flex:1;">
                    <div style="font-weight:600;">${item.productName}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">Size: ${item.size} | Qty: ${item.quantity}</div>
                    ${item.notes ? `<div style="font-size:0.75rem; color:var(--accent-secondary);">${item.notes}</div>` : ''}
                    <div style="font-size:0.8rem; color:var(--accent-primary);">Rp ${App.formatNumber(item.subtotal)}</div>
                </div>
                <button type="button" class="btn btn-sm btn-ghost" onclick="Orders.removeItemFromCart(${item.tempId})" style="color:var(--danger);">Hapus</button>
            </div>
        `).join('');
        this.updatePayment();
    },

    updatePayment() {
        const total = this.data.tempCart.reduce((sum, item) => sum + item.subtotal, 0);
        const dp = parseFloat(document.querySelector('input[name="downPayment"]')?.value) || 0;
        const subtotalEl = document.getElementById('lblSubtotal');
        const remainingEl = document.getElementById('lblRemaining');
        if (subtotalEl) subtotalEl.innerText = `Rp ${App.formatNumber(total)}`;
        if (remainingEl) remainingEl.innerText = `Rp ${App.formatNumber(total - dp)}`;
    },

    async saveOrder(e) {
        e.preventDefault();
        if (this.data.tempCart.length === 0) return Components.showToast('Keranjang kosong', 'warning');
        Components.showLoading('Menyimpan...');
        try {
            const form = e.target;
            const formData = new FormData(form);

            // Proses Stok
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

            let customer = this.data.customers.find(c => c.phone === formData.get('customerPhone'));
            if (!customer) {
                customer = { id: Storage.generateId(), name: formData.get('customerName'), phone: formData.get('customerPhone'), address: formData.get('customerAddress') };
                await Storage.add('customers', customer);
            }

            const total = this.data.tempCart.reduce((sum, item) => sum + item.subtotal, 0);
            const dp = parseFloat(formData.get('downPayment')) || 0;

            const order = {
                id: Storage.generateId(),
                invoiceNumber: Storage.generateInvoiceNumber(),
                customerId: customer.id, customerName: customer.name, customerPhone: customer.phone, customerAddress: customer.address,
                items: this.data.tempCart,
                total: total, downPayment: dp, remainingPayment: total - dp,
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
    // VIEW DETAIL & HAPUS PESANAN
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
                            <p>${order.customerName}<br>${order.customerPhone}</p>
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
                            <button class="btn btn-primary" onclick="Orders.updateStatus('${order.id}')">Simpan Status</button>
                        </div>
                    </div>

                    <!-- FITUR HAPUS PESANAN -->
                    <div style="border-top:1px solid var(--border-color); padding-top:16px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4>Aksi Pesanan</h4>
                            <p style="font-size: 0.8rem; color: var(--text-muted);">Hapus pesanan akan mengembalikan stok produk (jika Ready Stock).</p>
                        </div>
                        <button class="btn btn-danger" onclick="Orders.confirmDeleteOrder('${order.id}')">
                            ${Components.icons.trash} Hapus Pesanan
                        </button>
                    </div>

                    <div style="border-top:1px solid var(--border-color); padding-top:16px;">
                        <h4>Cetak Struk</h4>
                        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px;">
                            <button class="btn btn-secondary" onclick="Invoice.printCustomerInvoice('${order.id}')">Customer</button>
                            <button class="btn btn-secondary" onclick="Invoice.printAdminInvoice('${order.id}')">Admin</button>
                            <button class="btn btn-secondary" onclick="Production.showRecapModal()">Rekap Penjahit</button>
                        </div>
                    </div>
                </div>
            `,
            footer: `<button class="btn btn-secondary" onclick="Components.closeModal()">Tutup</button>`
        });
    },

    // Konfirmasi Hapus
    confirmDeleteOrder(id) {
        if (confirm('Yakin hapus pesanan ini? Stok akan dikembalikan.')) {
            this.deleteOrder(id);
        }
    },

    // Logika Hapus
    async deleteOrder(id) {
        Components.showLoading('Menghapus...');
        try {
            const order = await Storage.get('orders', id);

            // 1. Kembalikan Stok
            if (order.items && order.items.length > 0) {
                for (const item of order.items) {
                    if (item.orderType === 'stock') {
                        const product = await Storage.get('products', item.productId);
                        if (product) {
                            product.stock += item.quantity;
                            await Storage.update('products', product);
                        }
                    }
                }
            }

            // 2. Hapus Order
            await Storage.delete('orders', id);

            Components.closeModal(); // Tutup modal detail
            Components.showToast('Pesanan dihapus, stok dikembalikan', 'success');

            await this.loadData();
            this.render();

        } catch (e) {
            Components.showToast('Gagal hapus: ' + e.message, 'danger');
        } finally {
            Components.hideLoading();
        }
    },

    async updateStatus(orderId) {
        const newStatus = document.getElementById('statusSelect').value;
        Components.showLoading('Updating...');
        try {
            const order = await Storage.get('orders', orderId);
            const oldStatus = order.status;

            // Jika Dibatalkan -> Kembalikan Stok
            if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
                if (order.items) {
                    for (const item of order.items) {
                        if (item.orderType === 'stock') {
                            const product = await Storage.get('products', item.productId);
                            if (product) {
                                product.stock += item.quantity;
                                await Storage.update('products', product);
                            }
                        }
                    }
                }
            }

            // Jika Re-aktif dari Batal -> Kurangi Stok
            if (oldStatus === 'cancelled' && newStatus !== 'cancelled') {
                if (order.items) {
                    for (const item of order.items) {
                        if (item.orderType === 'stock') {
                            const product = await Storage.get('products', item.productId);
                            if (product && product.stock >= item.quantity) {
                                product.stock -= item.quantity;
                                await Storage.update('products', product);
                            } else {
                                throw new Error('Stok tidak cukup');
                            }
                        }
                    }
                }
            }

            order.status = newStatus;
            await Storage.update('orders', order);
            Components.showToast('Status diubah', 'success');
            await this.loadData();
            this.render();
            Components.closeModal();
        } catch (e) {
            Components.showToast('Gagal: ' + e.message, 'danger');
        } finally { Components.hideLoading(); }
    }
};

window.Orders = Orders;