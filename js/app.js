/**
 * POS Konveksi - Main Application Module
 */

const App = {
    currentPage: '',

    // Initialize Application
    async init() {
        console.log('Initializing POS Konveksi...');

        // Initialize storage
        await Storage.init();

        // Check authentication
        const isLoggedIn = Storage.local.get('isLoggedIn');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        if (!isLoggedIn && !['login.html', 'register.html', 'index.html'].includes(currentPage)) {
            window.location.href = 'login.html';
            return;
        }

        // Initialize sidebar state
        Components.initSidebar();

        // Render base layout
        this.renderLayout();

        // Initialize page-specific functionality
        this.initPage();
    },

    // Render Layout
    renderLayout() {
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
        this.currentPage = currentPage;

        // Render sidebar
        const sidebarContainer = document.getElementById('sidebarContainer');
        if (sidebarContainer) {
            sidebarContainer.innerHTML = Components.renderSidebar(currentPage);
        }

        // Render navbar
        const navbarContainer = document.getElementById('navbarContainer');
        if (navbarContainer) {
            navbarContainer.innerHTML = Components.renderNavbar();
        }

        // Render mobile nav
        const mobileNavContainer = document.getElementById('mobileNavContainer');
        if (mobileNavContainer) {
            mobileNavContainer.innerHTML = Components.renderMobileNav(currentPage);
        }

        // Add background effects
        this.addBackgroundEffects();
    },

    // Add Background Effects
    addBackgroundEffects() {
        if (!document.querySelector('.bg-effects')) {
            const bgEffects = document.createElement('div');
            bgEffects.className = 'bg-effects';
            bgEffects.innerHTML = `
                <div class="bg-gradient-orb orb-1"></div>
                <div class="bg-gradient-orb orb-2"></div>
                <div class="bg-gradient-orb orb-3"></div>
                <div class="bg-grid"></div>
                <div class="bg-noise"></div>
            `;
            document.body.insertBefore(bgEffects, document.body.firstChild);
        }
    },

    // Initialize Page
    initPage() {
        const page = this.currentPage;

        switch (page) {
            case 'dashboard':
                if (typeof Dashboard !== 'undefined') Dashboard.init();
                break;
            case 'orders':
            case 'order-detail':
                if (typeof Orders !== 'undefined') Orders.init();
                break;
            case 'products':
            case 'add-product':
            case 'edit-product':
                if (typeof Products !== 'undefined') Products.init();
                break;
            case 'production':
                if (typeof Production !== 'undefined') Production.init();
                break;
            case 'customers':
                if (typeof Customers !== 'undefined') Customers.init();
                break;
            case 'reports':
                if (typeof Reports !== 'undefined') Reports.init();
                break;
            case 'settings':
                if (typeof Settings !== 'undefined') Settings.init();
                break;
        }
    },

    // Format Number
    formatNumber(num) {
        return new Intl.NumberFormat('id-ID').format(num);
    },

    // Format Currency
    formatCurrency(num) {
        return `Rp ${this.formatNumber(num)}`;
    },

    // Format Date
    formatDate(dateString) {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    },

    // Format DateTime
    formatDateTime(dateString) {
        const options = {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    },

    // Show Notification
    showNotifications() {
        Components.showModal({
            title: 'Notifikasi',
            content: `
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div style="padding: 12px; background: var(--bg-tertiary); border-radius: var(--radius-md);">
                        <div style="font-weight: 500; margin-bottom: 4px;">Pesanan Baru</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">INV20240115001 menunggu proses</div>
                    </div>
                    <div style="padding: 12px; background: var(--bg-tertiary); border-radius: var(--radius-md);">
                        <div style="font-weight: 500; margin-bottom: 4px;">Produksi Selesai</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">Order #1234 telah selesai diproduksi</div>
                    </div>
                    <div style="padding: 12px; background: var(--bg-tertiary); border-radius: var(--radius-md);">
                        <div style="font-weight: 500; margin-bottom: 4px;">Pembayaran Diterima</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">Pembayaran DP dari Customer ABC</div>
                    </div>
                </div>
            `,
            footer: `<button class="btn btn-secondary" onclick="Components.closeModal()">Tutup</button>`
        });
    },

    // Toggle User Menu
    toggleUserMenu() {
        Components.showModal({
            title: 'Menu Pengguna',
            content: `
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <a href="settings.html" class="btn btn-ghost" style="justify-content: flex-start;">
                        ${Components.icons.settings}
                        Pengaturan
                    </a>
                    <button class="btn btn-ghost" style="justify-content: flex-start; color: var(--danger);" onclick="App.logout()">
                        ${Components.icons.logout}
                        Keluar
                    </button>
                </div>
            `,
            footer: false
        });
    },

    // Show More Menu (Mobile)
    showMoreMenu() {
        Components.showModal({
            title: 'Menu Lainnya',
            content: `
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <a href="customers.html" class="btn btn-ghost" style="justify-content: flex-start;">
                        ${Components.icons.customers}
                        Customer
                    </a>
                    <a href="reports.html" class="btn btn-ghost" style="justify-content: flex-start;">
                        ${Components.icons.reports}
                        Laporan
                    </a>
                    <a href="settings.html" class="btn btn-ghost" style="justify-content: flex-start;">
                        ${Components.icons.settings}
                        Pengaturan
                    </a>
                    <button class="btn btn-ghost" style="justify-content: flex-start; color: var(--danger);" onclick="App.logout()">
                        ${Components.icons.logout}
                        Keluar
                    </button>
                </div>
            `,
            footer: false
        });
    },

    // Tambahkan fungsi ini di dalam const App = { ... }

    showMobileMenu() {
        Components.showModal({
            title: 'Menu',
            content: `
            <div style="display: grid; gap: 8px;">
                <a href="customers.html" class="btn btn-ghost" style="justify-content: flex-start; padding: 16px;">
                    ${Components.icons.customers}
                    <span style="margin-left: 12px;">Customer</span>
                </a>
                <a href="reports.html" class="btn btn-ghost" style="justify-content: flex-start; padding: 16px;">
                    ${Components.icons.reports}
                    <span style="margin-left: 12px;">Laporan</span>
                </a>
                <a href="settings.html" class="btn btn-ghost" style="justify-content: flex-start; padding: 16px;">
                    ${Components.icons.settings}
                    <span style="margin-left: 12px;">Pengaturan</span>
                </a>
                <div style="border-top: 1px solid var(--border-color); margin: 8px 0;"></div>
                <button class="btn btn-ghost" style="justify-content: flex-start; padding: 16px; color: var(--danger);" onclick="App.logout()">
                    ${Components.icons.logout}
                    <span style="margin-left: 12px;">Keluar</span>
                </button>
            </div>
        `,
            footer: false
        });
    },

    // Logout
    logout() {
        Storage.local.remove('isLoggedIn');
        Storage.local.remove('currentUser');
        window.location.href = 'login.html';
    },

    // Debounce
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export
window.App = App;