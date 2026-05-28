/**
 * POS Konveksi - UI Components Module
 * Reusable UI components for the application
 */

const Components = {
    // Icons (SVG)
    icons: {
        dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>',
        orders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>',
        products: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
        production: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
        customers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        reports: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
        search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
        bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
        plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
        trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
        eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
        download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
        print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
        whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
        x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
        chevronLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>',
        chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>',
        upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
        calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
        dollarSign: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
        trendingUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
        trendingDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>',
        package: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
        logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'
    },

    // Render Sidebar
    renderSidebar(activePage) {
        const navItems = [
            { id: 'dashboard', icon: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
            { id: 'orders', icon: 'orders', label: 'Pesanan', href: 'orders.html', badge: 5 },
            { id: 'products', icon: 'products', label: 'Produk', href: 'products.html' },
            { id: 'production', icon: 'production', label: 'Produksi', href: 'production.html' },
            { id: 'customers', icon: 'customers', label: 'Customer', href: 'customers.html' },
            { id: 'reports', icon: 'reports', label: 'Laporan', href: 'reports.html' },
            { id: 'settings', icon: 'settings', label: 'Pengaturan', href: 'settings.html' }
        ];

        return `
            <aside class="sidebar" id="sidebar">
                <div class="sidebar-header">
                    <div class="sidebar-logo">K</div>
                    <div class="sidebar-brand">
                        <h1>KONVEKSI PRO</h1>
                        <span>Point of Sale System</span>
                    </div>
                </div>
                
                <nav class="sidebar-nav">
                    <div class="nav-section">
                        <div class="nav-section-title">Menu Utama</div>
                        ${navItems.map(item => `
                            <a href="${item.href}" class="nav-item ${activePage === item.id ? 'active' : ''}">
                                ${this.icons[item.icon]}
                                <span>${item.label}</span>
                                ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
                            </a>
                        `).join('')}
                    </div>
                </nav>
                
                <div class="sidebar-footer">
                    <button class="sidebar-toggle" onclick="Components.toggleSidebar()">
                        ${this.icons.chevronLeft}
                        <span>Collapse</span>
                    </button>
                </div>
            </aside>
            <div class="sidebar-overlay" id="sidebarOverlay" onclick="Components.closeMobileSidebar()"></div>
        `;
    },

    // Render Navbar
    renderNavbar(title) {
        return `
            <header class="navbar">
                <div class="navbar-left">
                    <button class="mobile-menu-btn" onclick="Components.toggleMobileSidebar()">
                        ${this.icons.menu}
                    </button>
                    <div class="search-box">
                        ${this.icons.search}
                        <input type="text" placeholder="Cari pesanan, produk, customer...">
                    </div>
                </div>
                
                <div class="navbar-right">
                    <button class="navbar-btn" onclick="App.showNotifications()">
                        ${this.icons.bell}
                        <span class="badge">3</span>
                    </button>
                    
                    <div class="navbar-divider"></div>
                    
                    <div class="user-menu" onclick="App.toggleUserMenu()">
                        <div class="user-avatar">AD</div>
                        <div class="user-info">
                            <div class="name">Admin</div>
                            <div class="role">Administrator</div>
                        </div>
                    </div>
                </div>
            </header>
        `;
    },

    // Render Mobile Nav
    // Render Mobile Nav
    renderMobileNav(activePage) {
        const items = [
            { id: 'dashboard', icon: 'dashboard', label: 'Home', href: 'dashboard.html' },
            { id: 'orders', icon: 'orders', label: 'Pesanan', href: 'orders.html' },
            { id: 'products', icon: 'products', label: 'Produk', href: 'products.html' },
            { id: 'production', icon: 'production', label: 'Produksi', href: 'production.html' },
            { id: 'more', icon: 'menu', label: 'Menu', href: '#', onclick: 'App.showMobileMenu()' }
        ];

        return `
        <nav class="mobile-nav">
            <div class="mobile-nav-items">
                ${items.map(item => `
                    <a href="${item.href}" class="mobile-nav-item ${activePage === item.id ? 'active' : ''}" ${item.onclick ? `onclick="${item.onclick}"` : ''}>
                        ${this.icons[item.icon]}
                        <span>${item.label}</span>
                    </a>
                `).join('')}
            </div>
        </nav>
    `;
    },

    // Render Stat Card
    renderStatCard(data) {
        return `
            <div class="stat-card ${data.type || ''} animate-fadeInUp">
                <div class="stat-header">
                    <div class="stat-icon ${data.type || 'primary'}">
                        ${this.icons[data.icon] || this.icons.package}
                    </div>
                    ${data.trend ? `
                        <div class="stat-trend ${data.trend > 0 ? 'up' : 'down'}">
                            ${data.trend > 0 ? this.icons.trendingUp : this.icons.trendingDown}
                            ${Math.abs(data.trend)}%
                        </div>
                    ` : ''}
                </div>
                <div class="stat-value">${data.value}</div>
                <div class="stat-label">${data.label}</div>
            </div>
        `;
    },

    // Render Product Card
    renderProductCard(product) {
        const placeholderImage = `https://picsum.photos/seed/${product.id}/400/300`;

        return `
            <div class="product-card" onclick="Products.viewProduct('${product.id}')">
                <div class="product-image">
                    <img src="${product.images && product.images[0] ? product.images[0] : placeholderImage}" alt="${product.name}">
                    <div class="product-overlay"></div>
                    <div class="product-badges">
                        ${product.isNew ? '<span class="product-badge new">NEW</span>' : ''}
                        ${product.isBestseller ? '<span class="product-badge bestseller">BEST</span>' : ''}
                    </div>
                    <div class="product-actions">
                        <button class="product-action-btn" onclick="event.stopPropagation(); Products.editProduct('${product.id}')">
                            ${this.icons.edit}
                        </button>
                        <button class="product-action-btn" onclick="event.stopPropagation(); Products.deleteProduct('${product.id}')">
                            ${this.icons.trash}
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-category">${product.category}</div>
                    <h4 class="product-name">${product.name}</h4>
                    <div class="product-price">
                        <span class="current">Rp ${App.formatNumber(product.price)}</span>
                    </div>
                    <div class="product-meta">
                        <span>Stok: ${product.stock}</span>
                        <span>•</span>
                        <span>${product.sizes ? product.sizes.length : 0} Ukuran</span>
                    </div>
                </div>
            </div>
        `;
    },

    // Render Order Row
    renderOrderRow(order) {
        return `
            <tr onclick="Orders.viewOrder('${order.id}')" style="cursor: pointer;">
                <td>
                    <div class="customer-cell">
                        <div class="customer-avatar">${order.customerName ? order.customerName.charAt(0).toUpperCase() : 'C'}</div>
                        <div>
                            <div class="customer-name">${order.customerName || 'Customer'}</div>
                            <div class="customer-phone">${order.customerPhone || '-'}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="font-mono">${order.invoiceNumber}</span>
                </td>
                <td>${App.formatDate(order.createdAt)}</td>
                <td>
                    <span class="status-indicator status-${order.status}">${this.getStatusLabel(order.status)}</span>
                </td>
                <td class="amount">Rp ${App.formatNumber(order.total)}</td>
                <td>
                    <div class="actions-cell">
                        <button class="action-btn" onclick="event.stopPropagation(); Orders.viewOrder('${order.id}')" title="Lihat Detail">
                            ${this.icons.eye}
                        </button>
                        <button class="action-btn" onclick="event.stopPropagation(); Invoice.generatePDF('${order.id}')" title="Cetak Invoice">
                            ${this.icons.print}
                        </button>
                        <button class="action-btn danger" onclick="event.stopPropagation(); Orders.deleteOrder('${order.id}')" title="Hapus">
                            ${this.icons.trash}
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    // Get Status Label
    getStatusLabel(status) {
        const labels = {
            pending: 'Menunggu',
            designing: 'Desain',
            cutting: 'Pemotongan',
            sewing: 'Penjahitan',
            printing: 'Sablon',
            embroidery: 'Bordir',
            finishing: 'Finishing',
            packing: 'Packing',
            shipped: 'Dikirim',
            completed: 'Selesai',
            cancelled: 'Dibatalkan'
        };
        return labels[status] || status;
    },

    // Render Production Status Steps
    renderProductionSteps(currentStatus) {
        const steps = [
            { id: 'pending', label: 'Menunggu' },
            { id: 'designing', label: 'Desain' },
            { id: 'cutting', label: 'Potong' },
            { id: 'sewing', label: 'Jahit' },
            { id: 'printing', label: 'Sablon' },
            { id: 'finishing', label: 'Finishing' },
            { id: 'completed', label: 'Selesai' }
        ];

        const currentIndex = steps.findIndex(s => s.id === currentStatus);

        return `
            <div class="production-steps">
                ${steps.map((step, index) => `
                    <div class="production-step ${index < currentIndex ? 'completed' : ''} ${index === currentIndex ? 'active' : ''}" title="${step.label}"></div>
                `).join('')}
            </div>
        `;
    },

    // Render Toast
    showToast(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toastContainer') || this.createToastContainer();
        const id = `toast-${Date.now()}`;

        const icons = {
            success: this.icons.check,
            warning: this.icons.bell,
            danger: this.icons.x,
            info: this.icons.bell
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = id;
        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="Components.hideToast('${id}')">${this.icons.x}</button>
        `;

        container.appendChild(toast);

        if (duration > 0) {
            setTimeout(() => this.hideToast(id), duration);
        }

        return id;
    },

    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        container.id = 'toastContainer';
        document.body.appendChild(container);
        return container;
    },

    hideToast(id) {
        const toast = document.getElementById(id);
        if (toast) {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }
    },

    // Render Modal
    showModal(options) {
        const existingModal = document.getElementById('dynamicModal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'dynamicModal';
        modal.innerHTML = `
            <div class="modal ${options.size || ''}">
                <div class="modal-header">
                    <h3 class="modal-title">${options.title}</h3>
                    <button class="modal-close" onclick="Components.closeModal()">
                        ${this.icons.x}
                    </button>
                </div>
                <div class="modal-body">
                    ${options.content}
                </div>
                ${options.footer !== false ? `
                    <div class="modal-footer">
                        ${options.footer || `
                            <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
                            <button class="btn btn-primary" onclick="${options.onConfirm || 'Components.closeModal()'}">${options.confirmText || 'Simpan'}</button>
                        `}
                    </div>
                ` : ''}
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            modal.classList.add('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        return modal;
    },

    closeModal() {
        const modal = document.getElementById('dynamicModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    },

    // Render Loading
    showLoading(message = 'Memproses...') {
        const existing = document.getElementById('loadingOverlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.id = 'loadingOverlay';
        overlay.innerHTML = `
            <div class="spinner"></div>
            <div class="loading-text">${message}</div>
        `;

        document.body.appendChild(overlay);
    },

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.remove();
    },

    // Render Empty State
    renderEmptyState(options) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    ${this.icons[options.icon] || this.icons.package}
                </div>
                <h3 class="empty-state-title">${options.title}</h3>
                <p class="empty-state-text">${options.description}</p>
                ${options.action ? `
                    <button class="btn btn-primary" onclick="${options.action.onclick}">
                        ${options.action.icon ? this.icons[options.action.icon] : ''}
                        ${options.action.label}
                    </button>
                ` : ''}
            </div>
        `;
    },

    // Sidebar Toggle
    toggleSidebar() {
        document.body.classList.toggle('sidebar-collapsed');
        Storage.local.set('sidebarCollapsed', document.body.classList.contains('sidebar-collapsed'));
    },

    toggleMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
    },

    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
    },

    // Initialize sidebar state
    initSidebar() {
        const collapsed = Storage.local.get('sidebarCollapsed');
        if (collapsed) {
            document.body.classList.add('sidebar-collapsed');
        }
    }
};

// Export
window.Components = Components;