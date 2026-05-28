/**
 * POS Konveksi - Dashboard Module
 */

const Dashboard = {
    data: {
        stats: {},
        recentOrders: [],
        productionStatus: [],
        revenueChart: null
    },

    // Initialize Dashboard
    async init() {
        console.log('Initializing Dashboard...');

        Components.showLoading('Memuat dashboard...');

        try {
            await this.loadStats();
            await this.loadRecentOrders();
            await this.loadProductionStatus();

            this.render();
        } catch (error) {
            console.error('Error loading dashboard:', error);
            Components.showToast('Gagal memuat data dashboard', 'danger');
        } finally {
            Components.hideLoading();
        }
    },

    // Load Statistics
    async loadStats() {
        const orders = await Storage.getAll('orders');
        const products = await Storage.getAll('products');
        const customers = await Storage.getAll('customers');

        const today = new Date();
        const thisMonth = today.getMonth();
        const thisYear = today.getFullYear();

        // Calculate stats
        const totalRevenue = orders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + (o.total || 0), 0);

        const monthlyRevenue = orders
            .filter(o => {
                const orderDate = new Date(o.createdAt);
                return o.status === 'completed' &&
                    orderDate.getMonth() === thisMonth &&
                    orderDate.getFullYear() === thisYear;
            })
            .reduce((sum, o) => sum + (o.total || 0), 0);

        const pendingOrders = orders.filter(o =>
            ['pending', 'designing', 'cutting', 'sewing', 'printing', 'finishing'].includes(o.status)
        ).length;

        const completedOrders = orders.filter(o => o.status === 'completed').length;

        const totalProducts = products.length;
        const lowStockProducts = products.filter(p => p.stock < 10).length;

        this.data.stats = {
            totalRevenue,
            monthlyRevenue,
            totalOrders: orders.length,
            pendingOrders,
            completedOrders,
            totalProducts,
            lowStockProducts,
            totalCustomers: customers.length
        };
    },

    // Load Recent Orders
    async loadRecentOrders() {
        const orders = await Storage.getAll('orders');
        this.data.recentOrders = orders
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
    },

    // Load Production Status
    async loadProductionStatus() {
        const orders = await Storage.getAll('orders');

        const statusCount = {
            pending: 0,
            designing: 0,
            cutting: 0,
            sewing: 0,
            printing: 0,
            finishing: 0,
            completed: 0
        };

        orders.forEach(order => {
            if (statusCount[order.status] !== undefined) {
                statusCount[order.status]++;
            }
        });

        this.data.productionStatus = statusCount;
    },

    // Render Dashboard
    render() {
        const container = document.getElementById('dashboardContent');
        if (!container) return;

        container.innerHTML = `
            <!-- Stats Grid -->
            <div class="stats-grid">
                ${Components.renderStatCard({
            icon: 'dollarSign',
            value: `Rp ${App.formatNumber(this.data.stats.monthlyRevenue || 0)}`,
            label: 'Pemasukan Bulan Ini',
            type: 'success',
            trend: 12.5
        })}
                ${Components.renderStatCard({
            icon: 'orders',
            value: this.data.stats.totalOrders || 0,
            label: 'Total Pesanan',
            type: 'info',
            trend: 8.2
        })}
                ${Components.renderStatCard({
            icon: 'production',
            value: this.data.stats.pendingOrders || 0,
            label: 'Pesanan Diproses',
            type: 'warning'
        })}
                ${Components.renderStatCard({
            icon: 'check',
            value: this.data.stats.completedOrders || 0,
            label: 'Pesanan Selesai',
            type: 'success'
        })}
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
                <!-- Revenue Chart -->
                <div class="card animate-fadeInUp stagger-1">
                    <div class="card-header">
                        <h3 class="card-title">Grafik Pemasukan</h3>
                        <div class="tabs">
                            <div class="tab-item active">Minggu</div>
                            <div class="tab-item">Bulan</div>
                            <div class="tab-item">Tahun</div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="chart-container">
                            <canvas id="revenueChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Production Status -->
                <div class="card animate-fadeInUp stagger-2">
                    <div class="card-header">
                        <h3 class="card-title">Status Produksi</h3>
                    </div>
                    <div class="card-body">
                        <div style="display: flex; flex-direction: column; gap: 16px;">
                            ${this.renderProductionStatusItems()}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div style="margin-top: 24px;">
                <h3 style="margin-bottom: 16px;">Aksi Cepat</h3>
                <div class="quick-actions">
                    <div class="quick-action-card" onclick="window.location.href='orders.html?action=new'">
                        <div class="quick-action-icon">${Components.icons.plus}</div>
                        <div class="quick-action-content">
                            <h4>Pesanan Baru</h4>
                            <p>Buat transaksi baru</p>
                        </div>
                    </div>
                    <div class="quick-action-card" onclick="window.location.href='products.html'">
                        <div class="quick-action-icon">${Components.icons.products}</div>
                        <div class="quick-action-content">
                            <h4>Kelola Produk</h4>
                            <p>Tambah atau edit produk</p>
                        </div>
                    </div>
                    <div class="quick-action-card" onclick="window.location.href='production.html'">
                        <div class="quick-action-icon">${Components.icons.production}</div>
                        <div class="quick-action-content">
                            <h4>Tracking Produksi</h4>
                            <p>Pantau progress order</p>
                        </div>
                    </div>
                    <div class="quick-action-card" onclick="window.location.href='reports.html'">
                        <div class="quick-action-icon">${Components.icons.reports}</div>
                        <div class="quick-action-content">
                            <h4>Laporan</h4>
                            <p>Lihat laporan transaksi</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Orders -->
            <div class="card" style="margin-top: 24px;">
                <div class="card-header">
                    <h3 class="card-title">Pesanan Terbaru</h3>
                    <a href="orders.html" class="btn btn-ghost btn-sm">Lihat Semua</a>
                </div>
                <div class="table-container">
                    <table class="table data-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Invoice</th>
                                <th>Tanggal</th>
                                <th>Status</th>
                                <th>Total</th>
                                <th style="text-align: right;">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.data.recentOrders.length > 0
                ? this.data.recentOrders.map(order => Components.renderOrderRow(order)).join('')
                : `<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">Belum ada pesanan</td></tr>`
            }
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Initialize Chart
        this.initChart();
    },

    // Render Production Status Items
    renderProductionStatusItems() {
        const items = [
            { key: 'pending', label: 'Menunggu', color: 'var(--warning)' },
            { key: 'designing', label: 'Desain', color: 'var(--info)' },
            { key: 'cutting', label: 'Pemotongan', color: '#a855f7' },
            { key: 'sewing', label: 'Penjahitan', color: '#ec4899' },
            { key: 'printing', label: 'Sablon/Bordir', color: '#f97316' },
            { key: 'finishing', label: 'Finishing', color: '#06b6d4' },
            { key: 'completed', label: 'Selesai', color: 'var(--success)' }
        ];

        const total = Object.values(this.data.productionStatus).reduce((a, b) => a + b, 0);

        return items.map(item => {
            const count = this.data.productionStatus[item.key] || 0;
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

            return `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: ${item.color};"></div>
                    <span style="flex: 1; font-size: 0.875rem;">${item.label}</span>
                    <span style="font-family: var(--font-mono); font-weight: 600;">${count}</span>
                </div>
            `;
        }).join('');
    },

    // Initialize Revenue Chart
    initChart() {
        const canvas = document.getElementById('revenueChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.parentElement.clientWidth - 32;
        const height = 250;

        canvas.width = width;
        canvas.height = height;

        // Sample data
        const data = [4.5, 6.2, 5.8, 7.4, 6.9, 8.2, 9.1];
        const labels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

        const maxVal = Math.max(...data) * 1.2;
        const padding = { top: 20, right: 20, bottom: 40, left: 50 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
        }

        // Draw labels
        ctx.fillStyle = '#6a6a7a';
        ctx.font = '11px Space Grotesk';
        ctx.textAlign = 'center';

        labels.forEach((label, i) => {
            const x = padding.left + (chartWidth / (labels.length - 1)) * i;
            ctx.fillText(label, x, height - 15);
        });

        // Y-axis labels
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i;
            const value = ((5 - i) / 5 * maxVal).toFixed(1);
            ctx.fillText(`${value}jt`, padding.left - 10, y + 4);
        }

        // Draw gradient area
        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        gradient.addColorStop(0, 'rgba(0, 212, 170, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 212, 170, 0)');

        ctx.beginPath();
        ctx.moveTo(padding.left, height - padding.bottom);

        data.forEach((val, i) => {
            const x = padding.left + (chartWidth / (data.length - 1)) * i;
            const y = padding.top + chartHeight - (val / maxVal) * chartHeight;

            if (i === 0) {
                ctx.lineTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw line
        ctx.beginPath();
        ctx.strokeStyle = '#00d4aa';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        data.forEach((val, i) => {
            const x = padding.left + (chartWidth / (data.length - 1)) * i;
            const y = padding.top + chartHeight - (val / maxVal) * chartHeight;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw points
        data.forEach((val, i) => {
            const x = padding.left + (chartWidth / (data.length - 1)) * i;
            const y = padding.top + chartHeight - (val / maxVal) * chartHeight;

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#0a0a0f';
            ctx.fill();
            ctx.strokeStyle = '#00d4aa';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }
};

// Export
window.Dashboard = Dashboard;