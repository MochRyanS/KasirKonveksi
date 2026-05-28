const Products = {
    data: {
        products: [],
        filteredProducts: [],
        currentProduct: null,
        // KATEGORI BARU
        categories: [
            { id: 'atasan', label: 'Atasan' },
            { id: 'bawahan', label: 'Bawahan' },
            { id: 'rompi', label: 'Rompi' },
            { id: 'adds-ons', label: 'Adds Ons' }
        ],
        // UKURAN BARU
        sizes: ['XS', 'S', 'S+', 'M', 'M+', 'L', 'L+', 'XL', 'XL+', 'XXL', 'XXL+', 'XXXL']
    },

    // Initialize
    async init() {
        console.log('Initializing Products...');

        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        const productId = urlParams.get('id');

        if (action === 'edit' && productId) {
            await this.editProduct(productId);
            return;
        }

        if (action === 'add') {
            this.showAddProductModal();
            return;
        }

        await this.loadProducts();
        this.render();
    },

    // Load Products
    async loadProducts() {
        Components.showLoading('Memuat produk...');

        try {
            this.data.products = await Storage.getAll('products');
            this.data.filteredProducts = [...this.data.products];
        } catch (error) {
            console.error('Error loading products:', error);
            Components.showToast('Gagal memuat data produk', 'danger');
        } finally {
            Components.hideLoading();
        }
    },

    // Render
    render() {
        const container = document.getElementById('productsContent');
        if (!container) return;

        container.innerHTML = `
            <div class="card" style="margin-bottom: 24px;">
                <div class="card-header">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <h3 class="card-title">Katalog Produk</h3>
                        <span class="badge badge-secondary">${this.data.filteredProducts.length} produk</span>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <div class="search-box" style="width: 250px;">
                            ${Components.icons.search}
                            <input type="text" placeholder="Cari produk..." id="searchProduct" onkeyup="Products.searchProducts(this.value)">
                        </div>
                        <select class="form-input form-select" style="width: 150px;" id="filterCategory" onchange="Products.filterByCategory(this.value)">
                            <option value="">Semua Kategori</option>
                            ${this.data.categories.map(cat => `<option value="${cat.id}">${cat.label}</option>`).join('')}
                        </select>
                        <button class="btn btn-primary" onclick="Products.showAddProductModal()">
                            ${Components.icons.plus}
                            Tambah Produk
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="product-grid" id="productGrid">
                ${this.renderProductCards()}
            </div>
        `;
    },

    // Render Product Cards
    renderProductCards() {
        if (this.data.filteredProducts.length === 0) {
            return `
                <div style="grid-column: 1 / -1;">
                    ${Components.renderEmptyState({
                icon: 'products',
                title: 'Belum Ada Produk',
                description: 'Tambahkan produk baru ke katalog Anda',
                action: {
                    label: 'Tambah Produk',
                    icon: 'plus',
                    onclick: 'Products.showAddProductModal()'
                }
            })}
                </div>
            `;
        }

        return this.data.filteredProducts.map(product => Components.renderProductCard(product)).join('');
    },

    // Search Products
    searchProducts: App.debounce(function (query) {
        query = query.toLowerCase();

        if (!query) {
            Products.data.filteredProducts = [...Products.data.products];
        } else {
            Products.data.filteredProducts = Products.data.products.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query)
            );
        }

        document.getElementById('productGrid').innerHTML = Products.renderProductCards();
    }, 300),

    // Filter by Category
    filterByCategory(category) {
        if (!category) {
            this.data.filteredProducts = [...this.data.products];
        } else {
            this.data.filteredProducts = this.data.products.filter(product => product.category === category);
        }

        document.getElementById('productGrid').innerHTML = this.renderProductCards();
    },

    // Show Add Product Modal
    showAddProductModal() {
        Components.showModal({
            title: 'Tambah Produk Baru',
            size: 'modal-lg',
            content: this.renderProductForm(),
            footer: false
        });
    },

    // Render Product Form
    renderProductForm(product = null) {
        const isEdit = product !== null;

        return `
            <form id="productForm" onsubmit="Products.saveProduct(event, ${isEdit ? `'${product.id}'` : 'null'})">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    <div>
                        <div class="form-group">
                            <label class="form-label required">Nama Produk</label>
                            <input type="text" class="form-input" name="name" required placeholder="Nama produk" value="${isEdit ? product.name : ''}">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label required">Kategori</label>
                                <select class="form-input form-select" name="category" required>
                                    <option value="">Pilih kategori</option>
                                    ${this.data.categories.map(cat => `
                                        <option value="${cat.id}" ${isEdit && product.category === cat.id ? 'selected' : ''}>${cat.label}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label required">Stok</label>
                                <input type="number" class="form-input" name="stock" required min="0" value="${isEdit ? product.stock : 0}">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label required">Harga Jual</label>
                                <input type="number" class="form-input" name="price" required min="0" value="${isEdit ? product.price : ''}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Harga Modal</label>
                                <input type="number" class="form-input" name="costPrice" min="0" value="${isEdit ? product.costPrice || '' : ''}">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Deskripsi</label>
                            <textarea class="form-input form-textarea" name="description" placeholder="Deskripsi produk">${isEdit ? product.description || '' : ''}</textarea>
                        </div>
                        
                        <!-- UKURAN BARU -->
                        <div class="form-group">
                            <label class="form-label">Ukuran Tersedia</label>
                            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 8px;">
                                ${this.data.sizes.map(size => `
                                    <label class="form-check" style="margin: 0;">
                                        <input type="checkbox" name="sizes" value="${size}" ${isEdit && product.sizes && product.sizes.includes(size) ? 'checked' : ''}>
                                        <span class="form-check-label">${size}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 16px; margin-top: 16px;">
                            <label class="form-check">
                                <input type="checkbox" name="isNew" ${isEdit && product.isNew ? 'checked' : ''}>
                                <span class="form-check-label">Produk Baru</span>
                            </label>
                            <label class="form-check">
                                <input type="checkbox" name="isBestseller" ${isEdit && product.isBestseller ? 'checked' : ''}>
                                <span class="form-check-label">Best Seller</span>
                            </label>
                            <label class="form-check">
                                <input type="checkbox" name="isActive" ${isEdit ? (product.isActive !== false ? 'checked' : '') : 'checked'}>
                                <span class="form-check-label">Aktif</span>
                            </label>
                        </div>
                    </div>
                    
                    <div>
                        <div class="form-group">
                            <label class="form-label">Gambar Produk</label>
                            <div class="file-upload" id="productImageDropzone" onclick="document.getElementById('productImages').click()">
                                <input type="file" id="productImages" accept="image/*" multiple style="display: none;" onchange="Products.handleImageUpload(this)">
                                <div class="file-upload-icon">${Components.icons.upload}</div>
                                <div class="file-upload-text">Klik atau drag gambar</div>
                                <div class="file-upload-hint">PNG, JPG (Max 5MB per file)</div>
                            </div>
                            <div id="imagePreview" class="file-preview" style="margin-top: 12px;">
                                ${isEdit && product.images && product.images.length > 0 ?
                product.images.map((img, idx) => `
                                        <div class="file-preview-item" data-index="${idx}">
                                            <img src="${img}" alt="Product image ${idx + 1}">
                                            <button type="button" class="file-preview-remove" onclick="Products.removeImage(${idx})">
                                                ${Components.icons.x}
                                            </button>
                                        </div>
                                    `).join('') : ''
            }
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border-color);">
                    <button type="button" class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
                    <button type="submit" class="btn btn-primary">
                        ${Components.icons.check}
                        ${isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
                    </button>
                </div>
            </form>
        `;
    },

    // Handle Image Upload
    handleImageUpload(input) {
        const preview = document.getElementById('imagePreview');

        Array.from(input.files).forEach(file => {
            if (file.size > 5 * 1024 * 1024) {
                Components.showToast('File terlalu besar (max 5MB)', 'warning');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = 'file-preview-item';
                div.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button type="button" class="file-preview-remove" onclick="this.parentElement.remove()">
                        ${Components.icons.x}
                    </button>
                `;
                preview.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    },

    // Remove Image
    removeImage(index) {
        if (this.data.currentProduct && this.data.currentProduct.images) {
            this.data.currentProduct.images.splice(index, 1);
            // Re-render logic would be needed here if editing
        }
    },

    // Save Product
    async saveProduct(event, productId = null) {
        event.preventDefault();

        Components.showLoading('Menyimpan produk...');

        try {
            const form = document.getElementById('productForm');
            const formData = new FormData(form);

            // Get sizes
            const sizes = [];
            document.querySelectorAll('input[name="sizes"]:checked').forEach(cb => {
                sizes.push(cb.value);
            });

            // Get images from preview
            const imageElements = document.querySelectorAll('#imagePreview .file-preview-item img');
            const images = [];
            imageElements.forEach(img => {
                images.push(img.src);
            });

            const productData = {
                name: formData.get('name'),
                category: formData.get('category'),
                price: parseInt(formData.get('price')) || 0,
                costPrice: parseInt(formData.get('costPrice')) || 0,
                stock: parseInt(formData.get('stock')) || 0,
                description: formData.get('description'),
                sizes: sizes,
                images: images,
                isNew: formData.get('isNew') === 'on',
                isBestseller: formData.get('isBestseller') === 'on',
                isActive: formData.get('isActive') != false,
                updatedAt: new Date().toISOString()
            };

            if (productId) {
                // Update existing product
                const existing = await Storage.get('products', productId);
                productData.id = productId;
                productData.createdAt = existing.createdAt;
                await Storage.update('products', productData);
                Components.showToast('Produk berhasil diperbarui', 'success');
            } else {
                // Add new product
                productData.id = Storage.generateId();
                productData.createdAt = new Date().toISOString();
                await Storage.add('products', productData);
                Components.showToast('Produk berhasil ditambahkan', 'success');
            }

            Components.closeModal();
            await this.loadProducts();
            this.render();

        } catch (error) {
            console.error('Error saving product:', error);
            Components.showToast('Gagal menyimpan produk: ' + error.message, 'danger');
        } finally {
            Components.hideLoading();
        }
    },

    // Edit Product
    async editProduct(productId) {
        try {
            const product = await Storage.get('products', productId);
            if (!product) {
                Components.showToast('Produk tidak ditemukan', 'danger');
                return;
            }

            this.data.currentProduct = product;

            Components.showModal({
                title: 'Edit Produk',
                size: 'modal-lg',
                content: this.renderProductForm(product),
                footer: false
            });
        } catch (error) {
            console.error('Error editing product:', error);
            Components.showToast('Gagal memuat produk', 'danger');
        }
    },

    // View Product
    async viewProduct(productId) {
        try {
            const product = await Storage.get('products', productId);
            if (!product) {
                Components.showToast('Produk tidak ditemukan', 'danger');
                return;
            }

            const placeholderImage = `https://picsum.photos/seed/${product.id}/800/600`;

            Components.showModal({
                title: product.name,
                size: 'modal-lg',
                content: `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                        <div>
                            ${product.images && product.images.length > 0 ? `
                                <img src="${product.images[0]}" alt="${product.name}" style="width: 100%; border-radius: var(--radius-lg);">
                            ` : `
                                <img src="${placeholderImage}" alt="${product.name}" style="width: 100%; border-radius: var(--radius-lg);">
                            `}
                        </div>
                        <div>
                            <div class="badge badge-primary" style="margin-bottom: 12px;">${product.category}</div>
                            <h2 style="margin-bottom: 8px;">${product.name}</h2>
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--accent-primary); margin-bottom: 16px;">
                                Rp ${App.formatNumber(product.price)}
                            </div>
                            <p class="text-secondary" style="margin-bottom: 16px;">${product.description || 'Tidak ada deskripsi'}</p>
                            
                            ${product.sizes && product.sizes.length > 0 ? `
                                <div style="margin-bottom: 12px;">
                                    <div class="text-muted" style="font-size: 0.8rem; margin-bottom: 8px;">Ukuran</div>
                                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                        ${product.sizes.map(size => `
                                            <span style="padding: 6px 12px; background: var(--bg-tertiary); border-radius: var(--radius-sm); font-size: 0.8rem;">${size}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `,
                footer: `
                    <button class="btn btn-secondary" onclick="Components.closeModal()">Tutup</button>
                    <button class="btn btn-primary" onclick="Products.editProduct('${productId}')">
                        ${Components.icons.edit}
                        Edit Produk
                    </button>
                `
            });
        } catch (error) {
            console.error('Error viewing product:', error);
            Components.showToast('Gagal memuat detail produk', 'danger');
        }
    },

    // Delete Product
    async deleteProduct(productId) {
        if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

        Components.showLoading('Menghapus produk...');

        try {
            await Storage.delete('products', productId);
            Components.showToast('Produk berhasil dihapus', 'success');
            await this.loadProducts();
            this.render();
        } catch (error) {
            console.error('Error deleting product:', error);
            Components.showToast('Gagal menghapus produk', 'danger');
        } finally {
            Components.hideLoading();
        }
    }
};

window.Products = Products;