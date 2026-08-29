import React from 'react';
import { Printer, X, FileText } from 'lucide-react';

export default function ReceiptModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.created_at || Date.now()).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const items = order.items || [];
  const totalAmount = Number(order.total_amount || 0);

  return (
    <div className="receipt-modal-backdrop" onClick={onClose}>
      <div className="receipt-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Actions Header Bar (Hidden on Print) */}
        <div className="receipt-actions-bar no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--accent-gold, #ffb703)" />
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
              Struk & Bukti Pesanan Kasir
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handlePrint} 
              className="btn btn-primary" 
              style={{ padding: '8px 18px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={16} /> Cetak / Simpan PDF
            </button>
            <button 
              onClick={onClose} 
              className="btn btn-ghost" 
              style={{ padding: '8px 12px' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="receipt-paper" id="printable-receipt">
          {/* Header Brand */}
          <div className="receipt-header">
            <div className="receipt-brand-logo">SAY MACARONI</div>
            <div className="receipt-brand-tagline">Kriuk Lezat Bikin Nagih! • Bukti Pesanan Toko</div>
            <div className="receipt-store-info">
              Kompleks Ruko Primarasa, Blok B-10, Jl. Macaroni Raya No. 45, Jakarta Selatan<br />
              WhatsApp: +62 857-9798-7872 • Instagram: @saymacaroni
            </div>
          </div>

          <div className="receipt-divider" />

          {/* Metadata Grid */}
          <div className="receipt-meta-grid">
            <div>
              <div className="receipt-label">KODE PESANAN</div>
              <div className="receipt-value receipt-order-code">{order.order_code || '-'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="receipt-label">WAKTU PESANAN</div>
              <div className="receipt-value">{formattedDate} WIB</div>
            </div>
          </div>

          <div className="receipt-status-pill">
            <span>Status Pesanan: <strong>{String(order.status || 'PENDING').toUpperCase()}</strong></span>
            <span>Status Bayar: <strong>{String(order.payment_status || 'UNPAID').toUpperCase()}</strong></span>
          </div>

          <div className="receipt-divider-dashed" />

          {/* Customer & Delivery Box */}
          <div className="receipt-customer-box">
            <div className="receipt-section-title">DATA PENERIMA & PENGIRIMAN</div>
            <div className="receipt-info-row">
              <span className="receipt-label">Nama Pelanggan:</span>
              <span className="receipt-val-bold">{order.customer_name || '-'}</span>
            </div>
            <div className="receipt-info-row">
              <span className="receipt-label">No. WhatsApp:</span>
              <span>{order.customer_phone || '-'}</span>
            </div>
            <div className="receipt-info-row">
              <span className="receipt-label">Alamat Kirim:</span>
              <span>{order.customer_address || 'Ambil di Toko / Sesuai Kesepakatan WA'}</span>
            </div>
            {order.customer_notes && (
              <div className="receipt-info-row" style={{ marginTop: '4px' }}>
                <span className="receipt-label">Catatan:</span>
                <span style={{ fontStyle: 'italic' }}>"{order.customer_notes}"</span>
              </div>
            )}
          </div>

          <div className="receipt-divider-dashed" />

          {/* Items Table */}
          <table className="receipt-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Item & Level Pedas</th>
                <th style={{ textAlign: 'center', width: '50px' }}>Qty</th>
                <th style={{ textAlign: 'right', width: '90px' }}>Harga</th>
                <th style={{ textAlign: 'right', width: '100px' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const levelLabel = item.spicy_level === 0 || item.level_pedas === 0
                  ? 'Tanpa Pedas'
                  : `Lvl ${item.spicy_level ?? item.level_pedas}`;
                const itemPrice = Number(item.price || item.harga || 0);
                const itemQty = Number(item.quantity || 1);
                const subtotal = Number(item.subtotal || itemPrice * itemQty);

                return (
                  <tr key={index}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.product_name || item.nama}</div>
                      <div style={{ fontSize: '0.8rem', color: '#555' }}>
                        Pilihan: {levelLabel} ({item.weight || item.berat || '150g'})
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>x{itemQty}</td>
                    <td style={{ textAlign: 'right' }}>Rp {itemPrice.toLocaleString('id-ID')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>Rp {subtotal.toLocaleString('id-ID')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="receipt-divider-dashed" />

          {/* Totals */}
          <div className="receipt-totals">
            <div className="receipt-total-row">
              <span>Total Item ({items.reduce((s, it) => s + (it.quantity || 1), 0)} Pcs):</span>
              <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
            <div className="receipt-total-row">
              <span>Ongkos Kirim:</span>
              <span style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>Dikonfirmasi via WA</span>
            </div>
            <div className="receipt-divider-dashed" style={{ margin: '8px 0' }} />
            <div className="receipt-grand-total">
              <span>TOTAL ESTIMASI</span>
              <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="receipt-divider" />

          {/* Footer Note */}
          <div className="receipt-footer">
            <p style={{ fontWeight: 600, marginBottom: '4px' }}>Say Macaroni — Backoffice Order Receipt</p>
            <p style={{ fontSize: '0.75rem', color: '#666' }}>
              Bukti sah pesanan internal toko untuk arsip dapur, kasir & pengiriman.
            </p>
            <div className="receipt-barcode-visual">
              * {order.order_code} *
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .receipt-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow-y: auto;
        }

        .receipt-modal-container {
          background: var(--bg-secondary, #1c2541);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
          border-radius: var(--radius-lg, 16px);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
        }

        .receipt-actions-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
          background: rgba(0, 0, 0, 0.2);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .receipt-paper {
          background: #ffffff;
          color: #1a1a1a;
          padding: 32px 36px;
          font-family: 'Courier New', Courier, monospace, sans-serif;
          font-size: 0.9rem;
          line-height: 1.4;
          margin: 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .receipt-header {
          text-align: center;
        }

        .receipt-brand-logo {
          font-family: var(--font-heading, sans-serif);
          font-size: 1.6rem;
          font-weight: 900;
          letter-spacing: 2px;
          color: #d90429;
        }

        .receipt-brand-tagline {
          font-size: 0.85rem;
          font-weight: 600;
          color: #444;
          margin-top: 2px;
        }

        .receipt-store-info {
          font-size: 0.75rem;
          color: #666;
          margin-top: 6px;
          line-height: 1.3;
        }

        .receipt-divider {
          border-top: 2px solid #222;
          margin: 14px 0;
        }

        .receipt-divider-dashed {
          border-top: 1px dashed #777;
          margin: 12px 0;
        }

        .receipt-meta-grid {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }

        .receipt-label {
          font-size: 0.75rem;
          color: #666;
          text-transform: uppercase;
        }

        .receipt-value {
          font-weight: 700;
          color: #111;
        }

        .receipt-order-code {
          font-size: 1.1rem;
          color: #d90429;
          letter-spacing: 1px;
        }

        .receipt-status-pill {
          display: flex;
          justify-content: space-between;
          background: #f4f4f4;
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 0.75rem;
          margin-top: 8px;
        }

        .receipt-customer-box {
          font-size: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .receipt-section-title {
          font-weight: 700;
          font-size: 0.8rem;
          color: #333;
          margin-bottom: 4px;
          letter-spacing: 0.5px;
        }

        .receipt-info-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .receipt-val-bold {
          font-weight: 700;
          color: #111;
        }

        .receipt-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          margin: 8px 0;
        }

        .receipt-table th {
          border-bottom: 1px solid #333;
          padding: 6px 0;
          font-size: 0.8rem;
          color: #444;
        }

        .receipt-table td {
          padding: 8px 0;
          vertical-align: top;
          border-bottom: 1px dotted #ccc;
        }

        .receipt-totals {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.9rem;
        }

        .receipt-total-row {
          display: flex;
          justify-content: space-between;
        }

        .receipt-grand-total {
          display: flex;
          justify-content: space-between;
          font-size: 1.15rem;
          font-weight: 900;
          color: #d90429;
        }

        .receipt-footer {
          text-align: center;
          font-size: 0.8rem;
          margin-top: 14px;
        }

        .receipt-barcode-visual {
          margin-top: 12px;
          font-family: monospace;
          letter-spacing: 4px;
          font-size: 1rem;
          font-weight: 700;
          color: #444;
        }

        /* PRINT STYLES FOR CLEAN PDF GENERATION */
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-modal-backdrop {
            position: absolute !important;
            inset: 0 !important;
            background: transparent !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .receipt-modal-container {
            border: none !important;
            box-shadow: none !important;
            max-width: 100% !important;
            width: 100% !important;
            background: transparent !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
          }
          .receipt-paper, .receipt-paper * {
            visibility: visible !important;
          }
          .receipt-paper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 700px !important;
            margin: 0 auto !important;
            padding: 24px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}
