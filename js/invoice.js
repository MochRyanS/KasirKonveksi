const Invoice = {

    async getLogo() {
        const settings = await Storage.get('settings', 'store');
        return settings?.logoBase64 || null;
    },

    // 1. STRUK CUSTOMER (ALAMAT TANPA BINGKAI)
    async printCustomerInvoice(orderId) {
        Components.showLoading('Generating PDF...');
        try {
            const order = await Storage.get('orders', orderId);
            const settings = await Storage.get('settings', 'store');
            const logoBase64 = await this.getLogo();

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // === HEADER ===
            let startX = 15;
            if (logoBase64) {
                try { doc.addImage(logoBase64, 'PNG', 15, 8, 30, 30); startX = 50; } catch (e) { }
            }

            doc.setFontSize(20); doc.setFont('helvetica', 'bold');
            doc.text(settings?.storeName || 'KONVEKSI PRO', startX, 22);

            doc.setFontSize(9); doc.setFont('helvetica', 'normal');
            doc.text(settings?.storeAddress || 'Alamat Toko', startX, 30);
            doc.text(`Whatsapp: ${settings?.storePhone || '-'}`, startX, 36);

            doc.setFontSize(12); doc.text('INVOICE', 195, 22, { align: 'right' });
            doc.setFontSize(10); doc.text(order.invoiceNumber, 195, 30, { align: 'right' });
            doc.text(App.formatDate(order.createdAt), 195, 36, { align: 'right' });

            let y = 50;
            doc.line(15, y, 195, y); y += 10;

            // === CUSTOMER INFO (TANPA BINGKAI) ===
            doc.setFont('helvetica', 'bold');
            doc.text('Kepada:', 15, y);
            doc.setFont('helvetica', 'normal');
            doc.text(order.customerName, 40, y);
            y += 6;

            doc.text(order.customerPhone, 40, y);
            y += 6;

            // ALAMAT LANGSUNG DI BAWAH NO TELP (TANPA KOTAK)
            if (order.customerAddress) {
                doc.setFontSize(8); // Sedikit lebih kecil
                doc.setTextColor(80, 80, 80); // Warna gelap
                doc.text(order.customerAddress, 40, y);
                doc.setFontSize(9); // Reset ukuran
                doc.setTextColor(0, 0, 0); // Reset warna
                y += 8;
            }

            y += 4; // Spasi sebelum tabel

            // === ITEMS TABLE ===
            doc.setFillColor(245, 245, 245); doc.rect(15, y, 180, 8, 'F');
            doc.setFont('helvetica', 'bold');
            doc.text('Item', 17, y + 5.5);
            doc.text('Size', 70, y + 5.5);
            doc.text('Catatan', 95, y + 5.5);
            doc.text('Qty', 150, y + 5.5);
            doc.text('Jumlah', 190, y + 5.5, { align: 'right' });

            y += 12;
            doc.setFont('helvetica', 'normal');

            const items = order.items || [];
            items.forEach(item => {
                if (y > 240) { doc.addPage(); y = 20; }

                doc.text(item.productName || '-', 17, y);
                doc.text(item.size || '-', 70, y);

                let notes = item.notes || '-';
                if (notes.length > 20) notes = notes.substring(0, 20) + '..';
                doc.text(notes, 95, y);

                doc.text(String(item.quantity), 150, y);
                doc.text(this.formatRupiah(item.subtotal), 190, y, { align: 'right' });
                y += 7;
            });

            y += 5;
            doc.line(15, y, 195, y); y += 10;

            doc.text('Subtotal:', 140, y, { align: 'right' }); doc.text(this.formatRupiah(order.total), 190, y, { align: 'right' }); y += 7;
            doc.text('DP:', 140, y, { align: 'right' }); doc.text(this.formatRupiah(order.downPayment), 190, y, { align: 'right' }); y += 7;

            doc.setFillColor(0, 212, 170); doc.rect(110, y - 5, 85, 12, 'F');
            doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
            doc.text('SISA BAYAR:', 140, y + 2, { align: 'right' });
            doc.text(this.formatRupiah(order.remainingPayment), 190, y + 2, { align: 'right' });
            doc.setTextColor(0, 0, 0); // Reset

            // === KOLOM BIRU (INFO PEMBAYARAN) ===
            y += 20;

            const infoText = "Informasi Pembayaran\n\nSetelah barang diproses, kami mohon Bapak/Ibu segera melakukan pembayaran melalui transfer ke rekening berikut:\nNo. Rekening : 0044179532\nBank               : BNI\nAtas Nama     : Aris Fakhrudi\n\nSetelah pembayaran dilakukan, harap konfirmasi dengan mengirimkan bukti transfer kepada kami. Atas perhatian dan kerja samanya, kami ucapkan terima kasih.";

            doc.setFontSize(9);
            const infoLines = doc.splitTextToSize(infoText, 170);
            const boxH = (infoLines.length * 5) + 10;

            if (y + boxH > 280) { doc.addPage(); y = 20; }

            doc.setFillColor(235, 245, 255); // Biru muda background
            doc.roundedRect(15, y, 180, boxH, 3, 3, 'F');

            // Border biru
            doc.setDrawColor(0, 100, 200);
            doc.setLineWidth(0.5);
            doc.roundedRect(15, y, 180, boxH, 3, 3, 'S');

            // Tulis teks
            doc.setTextColor(0, 50, 100); // Biru tua untuk teks
            doc.text(infoLines, 20, y + 7);
            doc.setTextColor(0, 0, 0); // Reset
            doc.setLineWidth(0.2); // Reset line width

            doc.save(`Invoice_${order.invoiceNumber}.pdf`);
            Components.showToast('PDF diunduh', 'success');

        } catch (err) {
            console.error(err); Components.showToast('Gagal', 'danger');
        } finally { Components.hideLoading(); }
    },

    // 2. STRUK ADMIN (SYNC DENGAN DATA PRODUK TERBARU)
    async printAdminInvoice(orderId) {
        Components.showLoading('Generating...');
        try {
            const order = await Storage.get('orders', orderId);
            const logoBase64 = await this.getLogo();
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            if (logoBase64) { try { doc.addImage(logoBase64, 'PNG', 15, 8, 30, 30); } catch (e) { } }

            doc.setFontSize(18); doc.setFont('helvetica', 'bold');
            doc.text('INTERNAL MEMO', 105, 22, { align: 'center' });
            doc.setFontSize(10); doc.text(`No: ${order.invoiceNumber}`, 105, 30, { align: 'center' });

            let y = 50;

            // Info Customer (Tetap dari data pesanan)
            doc.setFillColor(240, 240, 240); doc.rect(15, y, 85, 35, 'F');
            doc.setFont('helvetica', 'bold'); doc.text('Customer:', 20, y + 7);
            doc.setFont('helvetica', 'normal');
            doc.text(`${order.customerName}`, 20, y + 14);
            doc.text(`${order.customerPhone}`, 20, y + 21);
            doc.text(`${order.customerAddress || '-'}`, 20, y + 28);

            y += 45;

            doc.setFont('helvetica', 'bold'); doc.text('Item:', 15, y); y += 7;
            doc.setFont('helvetica', 'normal');

            const items = order.items || [];
            let totalCost = 0;
            let calculatedProfit = 0;

            // LOOP ITEM DENGAN FETCH DATA PRODUK TERBARU
            for (const item of items) {
                // 1. Ambil data produk terbaru dari database berdasarkan ID
                const currentProduct = await Storage.get('products', item.productId);

                // 2. Gunakan nama produk terbaru jika ada, jika tidak pakai nama di pesanan
                const productName = currentProduct ? currentProduct.name : item.productName;
                // 3. Gunakan harga modal terbaru jika ada
                const currentCostPrice = currentProduct ? (currentProduct.costPrice || 0) : (item.pricePerUnit * 0.6);

                // Tampilkan Nama Produk & Ukuran
                doc.text(`${productName} (${item.size})`, 15, y); y += 5;

                // Tampilkan Catatan
                if (item.notes) {
                    doc.setFontSize(8); doc.setTextColor(100, 100, 100);
                    doc.text(`Catatan: ${item.notes}`, 15, y);
                    doc.setFontSize(9); doc.setTextColor(0, 0, 0); y += 5;
                }

                // Hitung Modal & Subtotal
                const itemCost = currentCostPrice * item.quantity;
                totalCost += itemCost;

                // Tampilkan Harga Jual & Modal per item
                doc.setFontSize(8); doc.setTextColor(100, 100, 100);
                doc.text(`Modal: Rp ${App.formatNumber(itemCost)}`, 150, y - (item.notes ? 0 : 5), { align: 'right' });
                doc.setTextColor(0, 0, 0);

                y += 5;
            }

            // Hitung Profit Final
            calculatedProfit = order.total - totalCost;

            y += 10;
            doc.setFillColor(20, 20, 30); doc.rect(15, y, 180, 28, 'F');
            doc.setTextColor(255, 255, 255);

            doc.text('ANALISIS KEUANGAN', 20, y + 10);
            doc.text(`Total Modal: ${this.formatRupiah(totalCost)}`, 20, y + 18);
            doc.setTextColor(0, 212, 170);
            doc.text(`Profit: ${this.formatRupiah(calculatedProfit)}`, 150, y + 18);

            doc.save(`Internal_${order.invoiceNumber}.pdf`);
            Components.showToast('PDF Admin diunduh', 'success');
        } catch (e) {
            console.error(e); Components.showToast('Gagal', 'danger');
        } finally { Components.hideLoading(); }
    },

    // 3. REKAP PENJAHIT
    async printWeeklyTailorSlip(orders, startDate, endDate) {
        Components.showLoading('Generating Rekap...');
        try {
            const logoBase64 = await this.getLogo();
            const { jsPDF } = window.jspdf;

            const doc = new jsPDF({ unit: 'mm', format: 'a4' });

            if (logoBase64) { try { doc.addImage(logoBase64, 'PNG', 87.5, 5, 35, 35); } catch (e) { } }

            doc.setFontSize(16); doc.setFont('helvetica', 'bold');
            doc.text('REKAP PRODUKSI MINGGUAN', 105, 48, { align: 'center' });

            doc.setFontSize(10); doc.setFont('helvetica', 'normal');
            doc.text(`Periode: ${App.formatDate(startDate)} - ${App.formatDate(endDate)}`, 105, 55, { align: 'center' });

            let y = 65;
            const colX = { no: 10, produk: 20, ukuran: 60, catatan: 80, qty: 160, checklist: 175 };
            const colWidth = { no: 10, produk: 40, ukuran: 20, catatan: 80, qty: 15, checklist: 25 };

            doc.setFillColor(30, 30, 40);
            doc.rect(10, y, 190, 10, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9); doc.setFont('helvetica', 'bold');
            doc.text("No", colX.no + 1, y + 7);
            doc.text("Produk", colX.produk + 1, y + 7);
            doc.text("Ukuran", colX.ukuran + 1, y + 7);
            doc.text("Catatan", colX.catatan + 1, y + 7);
            doc.text("Qty", colX.qty + 1, y + 7);
            doc.text("Cek", colX.checklist + 1, y + 7);

            y += 10;
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);

            let totalQty = 0;
            let rowCount = 0;
            const lineHeight = 5;

            orders.forEach((order) => {
                const items = order.items || [];
                items.forEach((item) => {
                    let notes = item.notes || '-';
                    const splitNotes = doc.splitTextToSize(notes, colWidth.catatan - 2);
                    const noteLines = splitNotes.length;
                    let rowHeight = 10;
                    const neededHeight = (noteLines * lineHeight) + 4;
                    if (neededHeight > rowHeight) rowHeight = neededHeight;

                    if (y + rowHeight > 280) {
                        doc.addPage(); y = 20;
                        doc.setFillColor(30, 30, 40);
                        doc.rect(10, y, 190, 10, 'F');
                        doc.setTextColor(255, 255, 255);
                        doc.setFont('helvetica', 'bold');
                        doc.text("No", colX.no + 1, y + 7);
                        doc.text("Produk", colX.produk + 1, y + 7);
                        doc.text("Ukuran", colX.ukuran + 1, y + 7);
                        doc.text("Catatan", colX.catatan + 1, y + 7);
                        doc.text("Qty", colX.qty + 1, y + 7);
                        doc.text("Cek", colX.checklist + 1, y + 7);
                        y += 10;
                        doc.setTextColor(0, 0, 0);
                        doc.setFont('helvetica', 'normal');
                    }

                    if (rowCount % 2 === 0) {
                        doc.setFillColor(250, 250, 250);
                        doc.rect(10, y, 190, rowHeight, 'F');
                    }

                    doc.setDrawColor(220, 220, 220);
                    doc.line(10, y + rowHeight, 200, y + rowHeight);

                    doc.setTextColor(0, 0, 0);
                    doc.text(String(rowCount + 1), colX.no + 1, y + (rowHeight / 2) + 1.5);

                    let name = item.productName || '-';
                    if (name.length > 20) name = name.substring(0, 20) + '..';
                    doc.text(name, colX.produk + 1, y + (rowHeight / 2) + 1.5);
                    doc.text(item.size || '-', colX.ukuran + 1, y + (rowHeight / 2) + 1.5);
                    doc.text(splitNotes, colX.catatan + 1, y + 4);
                    doc.text(String(item.quantity), colX.qty + 1, y + (rowHeight / 2) + 1.5);

                    let cekY = y + (rowHeight / 2) - 2.5;
                    doc.rect(colX.checklist + 1, cekY, 5, 5);
                    doc.rect(colX.checklist + 8, cekY, 5, 5);

                    totalQty += item.quantity;
                    y += rowHeight;
                    rowCount++;
                });
            });

            doc.setFillColor(0, 212, 170);
            doc.rect(10, y, 190, 10, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.text(`TOTAL: ${rowCount} Item | ${totalQty} Pcs`, 105, y + 7, { align: 'center' });

            y += 20;
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            doc.text('Tanda Tangan Penjahit:', 15, y);
            doc.line(60, y + 10, 140, y + 10);

            doc.save(`Rekap_Produksi_${startDate}.pdf`);
            Components.showToast('Rekap diunduh', 'success');

        } catch (e) {
            console.error(e); Components.showToast('Gagal', 'danger');
        } finally { Components.hideLoading(); }
    },

    formatRupiah(num) {
        return 'Rp ' + App.formatNumber(num);
    }
};
window.Invoice = Invoice;
