const Production = {
    data: {
        productions: [],
        orders: [],
        filteredProductions: []
    },

    async init() {
        console.log('Initializing Production...');
        await this.loadData();
        this.render();
    },

    async loadData() {
        Components.showLoading('Memuat data...');
        try {
            this.data.productions = await Storage.getAll('production');
            this.data.orders = await Storage.getAll('orders');
            this.data.productions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            this.data.filteredProductions = [...this.data.productions];
        } catch (error) {
            console.error(error);
            Components.showToast('Gagal memuat data', 'danger');
        } finally {
            Components.hideLoading();
        }
    },

    render() {
        const container = document.getElementById('productionContent');
        if (!container) return;

        container.innerHTML = `
            <div class="card" style="margin-bottom: 24px;">
                <div class="card-header">
                    <h3 class="card-title">Tracking Produksi</h3>
                    <div style="display: flex; gap: 12px;">
                         <button class="btn btn-primary" onclick="Production.showRecapModal()">
                            ${Components.icons.print}
                            Cetak Rekap Penjahit
                        </button>
                    </div>
                </div>
                <div class="table-container">
                    <table class="table data-table">
                        <thead>
                            <tr>
                                <th>Invoice</th>
                                <th>Produk</th>
                                <th>Jumlah</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderRows() {
        if (this.data.filteredProductions.length === 0) return `<tr><td colspan="4" style="text-align:center;">Tidak ada data</td></tr>`;

        return this.data.filteredProductions.map(prod => {
            const order = this.data.orders.find(o => o.id === prod.orderId) || {};
            return `
                <tr>
                    <td>${prod.invoiceNumber}</td>
                    <td>${order.productName || '-'}</td>
                    <td>${order.quantity || 0} pcs</td>
                    <td><span class="badge badge-${prod.status === 'completed' ? 'success' : 'warning'}">${prod.status}</span></td>
                </tr>
            `;
        }).join('');
    },

    // ==========================================
    // LOGIKA REKAP MINGGUAN
    // ==========================================
    showRecapModal() {
        const today = new Date();
        const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
        const lastDay = new Date(firstDay);
        lastDay.setDate(lastDay.getDate() + 6);

        const formatDateInput = (d) => d.toISOString().split('T')[0];

        Components.showModal({
            title: 'Cetak Rekap Produksi Penjahit',
            content: `
                <p style="margin-bottom: 16px;">Pilih rentang tanggal untuk rekap pesanan (tanpa nama customer).</p>
                <form id="recapForm" onsubmit="Production.generateRecap(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Dari Tanggal</label>
                            <input type="date" class="form-input" name="startDate" value="${formatDateInput(firstDay)}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Sampai Tanggal</label>
                            <input type="date" class="form-input" name="endDate" value="${formatDateInput(lastDay)}" required>
                        </div>
                    </div>
                    <div style="text-align: right; margin-top: 16px;">
                        <button type="submit" class="btn btn-primary">Generate PDF</button>
                    </div>
                </form>
            `,
            footer: false
        });
    },

    async generateRecap(event) {
        event.preventDefault();
        Components.showLoading('Mengumpulkan data...');

        try {
            const form = event.target;
            const startDate = new Date(form.startDate.value);
            const endDate = new Date(form.endDate.value);
            endDate.setHours(23, 59, 59, 999);

            const ordersInRange = this.data.orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= startDate && orderDate <= endDate;
            });

            if (ordersInRange.length === 0) {
                Components.showToast('Tidak ada pesanan di rentang tanggal ini', 'warning');
                Components.hideLoading();
                return;
            }

            await Invoice.printWeeklyTailorSlip(ordersInRange, form.startDate.value, form.endDate.value);

            Components.closeModal();

        } catch (error) {
            console.error(error);
            Components.showToast('Gagal generate rekap', 'danger');
        } finally {
            Components.hideLoading();
        }
    }
};

window.Production = Production;