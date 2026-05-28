// ================= KONFIGURASI FIREBASE =================
const firebaseConfig = {
    apiKey: "AIzaSyDq-ngYO2uZt2NiW82uXGSNgXMFO2XeMFo",
    authDomain: "kasir-konveksi-5572a.firebaseapp.com",
    projectId: "kasir-konveksi-5572a",
    storageBucket: "kasir-konveksi-5572a.firebasestorage.app",
    messagingSenderId: "1042456177078",
    appId: "1:1042456177078:web:54ce2590bb82ed4cb7b917",
};

// Inisialisasi Firebase
let db;
let appId = 'pos-konveksi-main'; // ID unik untuk toko (bisa diubah jika ingin multi-toko)

const initDB = async () => {
    try {
        // Cek jika firebase sudah load
        if (typeof firebase !== 'undefined') {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            db = firebase.firestore();
            console.log("Firebase Connected");
        } else {
            console.warn("Firebase SDK not loaded. Falling back to IndexedDB.");
            return initIndexedDB();
        }
    } catch (error) {
        console.error("Firebase Init Error:", error);
        return initIndexedDB();
    }
};

// ================= FALLBACK INDEXED DB =================
// (Digunakan jika offline atau firebase error)
let idb = null;
const initIndexedDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('pos_konveksi_fallback', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => { idb = request.result; resolve(idb); };
        request.onupgradeneeded = (e) => {
            const d = e.target.result;
            if (!d.objectStoreNames.contains('products')) d.createObjectStore('products', { keyPath: 'id' });
            if (!d.objectStoreNames.contains('orders')) d.createObjectStore('orders', { keyPath: 'id' });
            if (!d.objectStoreNames.contains('customers')) d.createObjectStore('customers', { keyPath: 'id' });
            if (!d.objectStoreNames.contains('settings')) d.createObjectStore('settings', { keyPath: 'key' });
            if (!d.objectStoreNames.contains('production')) d.createObjectStore('production', { keyPath: 'id' });
        };
    });
};

const idbOperation = (storeName, mode, op) => {
    return new Promise((res, rej) => {
        if (!idb) return rej("IDB not ready");
        const t = idb.transaction(storeName, mode);
        const s = t.objectStore(storeName);
        const r = op(s);
        r.onsuccess = () => res(r.result);
        r.onerror = () => rej(r.error);
    });
};

// ================= STORAGE API =================
const Storage = {
    db: null, // Pointer ke Firestore atau IDB

    async init() {
        await initDB(); // Prioritas Firebase

        // Jika Firebase terpakai, seed data jika collection kosong
        if (db) {
            await this.seedDefaultData();
        } else {
            // Jika IDB fallback
            await this.seedDefaultDataIDB();
        }
    },

    isFirebase: () => !!db,

    // ========== SEED DATA ==========
    async seedDefaultData() {
        try {
            // Cek apakah ada produk di collection 'products'
            const snapshot = await db.collection('products').limit(1).get();
            if (snapshot.empty) {
                console.log("Seeding initial data to Firebase...");
                const batch = db.batch();

                const products = [
                    { id: this.generateId(), name: 'Oversize T-Shirt Premium', category: 'atasan', price: 125000, costPrice: 75000, sizes: ['S', 'M', 'L', 'XL'], stock: 100, isActive: true, isNew: true, isBestseller: true, createdAt: new Date().toISOString() },
                    { id: this.generateId(), name: 'Hoodie Streetwear', category: 'atasan', price: 285000, costPrice: 175000, sizes: ['S', 'M', 'L', 'XL'], stock: 50, isActive: true, isNew: true, isBestseller: false, createdAt: new Date().toISOString() },
                    { id: this.generateId(), name: 'Cargo Pants Tactical', category: 'bawahan', price: 275000, costPrice: 160000, sizes: ['28', '30', '32'], stock: 40, isActive: true, isNew: false, isBestseller: true, createdAt: new Date().toISOString() },
                    { id: this.generateId(), name: 'Rompi Denim Retro', category: 'rompi', price: 195000, costPrice: 110000, sizes: ['S', 'M', 'L'], stock: 25, isActive: true, isNew: true, isBestseller: false, createdAt: new Date().toISOString() },
                    { id: this.generateId(), name: 'Topi Trucker', category: 'adds-ons', price: 85000, costPrice: 45000, sizes: ['One Size'], stock: 150, isActive: true, isNew: false, isBestseller: false, createdAt: new Date().toISOString() }
                ];

                products.forEach(p => {
                    batch.set(db.collection('products').doc(p.id), p);
                });

                // Default Settings
                batch.set(db.collection('settings').doc('store'), {
                    key: 'store',
                    storeName: 'KONVEKSI PRO',
                    storeAddress: 'Jl. Fashion Industry No. 88',
                    storePhone: '021-12345678'
                });

                await batch.commit();
            }
        } catch (e) {
            console.error("Seed error", e);
        }
    },

    async seedDefaultDataIDB() {
        // Sama seperti sebelumnya untuk IDB fallback
        const prods = await this.getAll('products');
        if (prods.length === 0) {
            // ... (kode seed IDB lama bisa dimasukkan di sini jika perlu)
        }
    },

    // ========== CRUD OPERATIONS ==========

    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    generateInvoiceNumber() {
        const d = new Date();
        return `INV${d.getFullYear().toString().slice(-2)}${(d.getMonth() + 1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    },

    // ADD
    async add(storeName, data) {
        if (db) {
            return db.collection(storeName).doc(data.id).set(data);
        } else {
            return idbOperation(storeName, 'readwrite', s => s.add(data));
        }
    },

    // UPDATE
    async update(storeName, data) {
        if (db) {
            // Firestore butuh ID di dalam object atau reference
            const id = data.id || data.key;
            if (!id) throw new Error("ID required for update");
            return db.collection(storeName).doc(id).set(data, { merge: true });
        } else {
            return idbOperation(storeName, 'readwrite', s => s.put(data));
        }
    },

    // DELETE
    async delete(storeName, id) {
        if (db) {
            return db.collection(storeName).doc(id).delete();
        } else {
            return idbOperation(storeName, 'readwrite', s => s.delete(id));
        }
    },

    // GET SINGLE
    async get(storeName, id) {
        if (db) {
            const doc = await db.collection(storeName).doc(id).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } else {
            return idbOperation(storeName, 'readonly', s => s.get(id));
        }
    },

    // GET ALL
    async getAll(storeName) {
        if (db) {
            const snapshot = await db.collection(storeName).get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else {
            return idbOperation(storeName, 'readonly', s => s.getAll());
        }
    },

    // SET (Untuk settings key-value)
    async set(storeName, data) {
        return this.update(storeName, data);
    },

    // CLEAR
    async clear(storeName) {
        if (db) {
            const batch = db.batch();
            const snapshot = await db.collection(storeName).get();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            return batch.commit();
        } else {
            return idbOperation(storeName, 'readwrite', s => s.clear());
        }
    },

    // Local Storage Helpers (tidak berubah)
    local: {
        get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
        set(k, v) { localStorage.setItem(k, JSON.stringify(v)); },
        remove(k) { localStorage.removeItem(k); }
    }
};

window.Storage = Storage;