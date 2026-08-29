import React from 'react';
import { Printer, X, FileText } from 'lucide-react';

// Helper to remove redundant "Say Macaroni - " or "Say Macaroni " from product names
function cleanProductName(rawName) {
  if (!rawName) return 'Makaroni Gurih';
  return rawName.replace(/^Say\s*Macaroni\s*[-–—]?\s*/i, '').trim();
}

export default function ReceiptModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const orderDate = new Date(order.created_at || Date.now());
  const dateStr = orderDate.toISOString().split('T')[0];
  const timeStr = orderDate.toTimeString().split(' ')[0];

  const items = order.items || [];
  const totalAmount = Number(order.total_amount || 0);

  return (
    <div className="receipt-modal-backdrop" onClick={onClose}>
      <div className="receipt-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Actions Header Bar (Hidden on Print) */}
        <div className="receipt-actions-bar no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--accent-gold, #ffb703)" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
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

        {/* Printable Thermal Paper Container */}
        <div className="receipt-paper" id="printable-receipt">
          {/* Top Circular Logo */}
          <div className="receipt-logo-wrap">
            <img 
              src="/images/say_macaroni_logo-removebg.png" 
              alt="Say Macaroni Logo" 
              className="receipt-logo"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          {/* Store Info */}
          <div className="receipt-header">
            <h2 className="receipt-store-name">Say Macaroni</h2>
            <div className="receipt-store-sub">Jl. Macaroni Raya No. 45</div>
            <div className="receipt-store-sub">Tlp 085797987872</div>
          </div>

          <div className="receipt-dashed-line" />

          {/* Transaction Metadata (2 Columns) */}
          <div className="receipt-meta-row">
            <div className="receipt-meta-col-left">
              <div>{dateStr}</div>
              <div>{timeStr}</div>
              <div>{order.order_code || '-'}</div>
            </div>
            <div className="receipt-meta-col-right">
              <div className="receipt-customer-name">{order.customer_name || 'Pelanggan'}</div>
              <div>{order.customer_phone || ''}</div>
              {order.customer_address && (
                <div className="receipt-address-trunc" title={order.customer_address}>
                  {order.customer_address.length > 25 ? order.customer_address.slice(0, 25) + '...' : order.customer_address}
                </div>
              )}
            </div>
          </div>

          <div className="receipt-dashed-line" />

          {/* Item List (Simplified: Direct Flavor + Level) */}
          <div className="receipt-items-list">
            {items.map((item, index) => {
              const cleanedName = cleanProductName(item.product_name || item.nama);
              const spicyLvl = item.spicy_level ?? item.level_pedas;
              const levelLabel = Number(spicyLvl) === 0 || spicyLvl === undefined
                ? '(Tanpa Pedas)'
                : `(Level ${spicyLvl})`;

              const itemPrice = Number(item.price || item.harga || 0);
              const itemQty = Number(item.quantity || 1);
              const subtotal = Number(item.subtotal || itemPrice * itemQty);

              return (
                <div key={index} className="receipt-item-entry">
                  <div className="receipt-item-title">
                    {cleanedName} {levelLabel}
                  </div>
                  <div className="receipt-item-math">
                    <span>{itemQty} x {itemPrice.toLocaleString('id-ID')}</span>
                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="receipt-dashed-line" />

          {/* Totals Section */}
          <div className="receipt-total-block">
            <div className="receipt-total-row">
              <span>Total</span>
              <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Notes if present */}
          {order.customer_notes && (
            <div className="receipt-notes-block">
              <span className="receipt-notes-label">Catatan:</span> {order.customer_notes}
            </div>
          )}

          {/* Payment Account Information */}
          <div className="receipt-payment-info">
            <div style={{ marginBottom: '4px', fontWeight: 600 }}>Pembayaran melalui Rek :</div>
            <div>BCA : 1234567890</div>
            <div>MANDIRI : 1310012948578</div>
            <div>BRI : 074901011451537</div>
            <div style={{ marginTop: '4px', fontWeight: 700 }}>A.N SAY MACARONI</div>
          </div>

          {/* Receipt Footer */}
          <div className="receipt-footer">
            <div className="receipt-thanks">Kriuk Lezat Bikin Nagih! 🍿</div>
            <div style={{ fontSize: '0.75rem', color: '#666' }}>Terima Kasih Telah Berbelanja</div>
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
          max-width: 440px;
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
          padding: 14px 20px;
          border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
          background: rgba(0, 0, 0, 0.2);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .receipt-paper {
          background: #ffffff;
          color: #000000;
          padding: 28px 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          font-size: 0.875rem;
          line-height: 1.35;
          margin: 16px auto;
          max-width: 360px;
          width: 100%;
          border-radius: 6px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .receipt-logo-wrap {
          text-align: center;
          margin-bottom: 8px;
        }

        .receipt-logo {
          width: 68px;
          height: 68px;
          object-fit: contain;
          border-radius: 50%;
          margin: 0 auto;
          display: block;
        }

        .receipt-header {
          text-align: center;
          margin-bottom: 12px;
        }

        .receipt-store-name {
          font-size: 1.2rem;
          font-weight: 800;
          margin: 0 0 2px 0;
          color: #000000;
        }

        .receipt-store-sub {
          font-size: 0.8rem;
          color: #333333;
          line-height: 1.3;
        }

        .receipt-dashed-line {
          border-top: 1px dashed #777777;
          margin: 10px 0;
        }

        .receipt-meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.825rem;
          color: #222222;
          line-height: 1.4;
        }

        .receipt-meta-col-left {
          text-align: left;
        }

        .receipt-meta-col-right {
          text-align: right;
        }

        .receipt-customer-name {
          font-weight: 700;
          color: #000000;
        }

        .receipt-address-trunc {
          font-size: 0.75rem;
          color: #555555;
          max-width: 170px;
        }

        .receipt-items-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 4px 0;
        }

        .receipt-item-entry {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .receipt-item-title {
          font-weight: 700;
          font-size: 0.875rem;
          color: #000000;
        }

        .receipt-item-math {
          display: flex;
          justify-content: space-between;
          font-size: 0.825rem;
          color: #222222;
        }

        .receipt-total-block {
          margin: 4px 0;
        }

        .receipt-total-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
          font-weight: 700;
          color: #000000;
        }

        .receipt-notes-block {
          background: #f4f4f4;
          border-radius: 4px;
          padding: 6px 10px;
          font-size: 0.775rem;
          color: #333333;
          margin: 8px 0;
        }

        .receipt-notes-label {
          font-weight: 600;
        }

        .receipt-payment-info {
          text-align: center;
          font-size: 0.8rem;
          color: #222222;
          margin-top: 16px;
          line-height: 1.45;
        }

        .receipt-footer {
          text-align: center;
          margin-top: 14px;
          padding-top: 8px;
          border-top: 1px dashed #dddddd;
        }

        .receipt-thanks {
          font-weight: 700;
          font-size: 0.85rem;
          margin-bottom: 2px;
          color: #000000;
        }

        /* PRINT STYLES FOR CLEAN PDF / THERMAL GENERATION */
        @media print {
          @page {
            size: auto;
            margin: 8mm 10mm;
          }

          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Hide everything except printable receipt */
          body > #root > div > *:not(.main-content),
          .sidebar,
          .header,
          .page-header,
          .stat-grid,
          .card,
          .table-container,
          .receipt-actions-bar,
          .btn,
          .no-print {
            display: none !important;
          }

          .receipt-modal-backdrop {
            position: static !important;
            display: block !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            width: 100% !important;
            height: auto !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
          }

          .receipt-modal-container {
            position: static !important;
            display: block !important;
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
            max-width: 100% !important;
            width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .receipt-paper {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-width: 380px !important;
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
            page-break-inside: avoid !important;
          }

          .receipt-paper,
          .receipt-paper * {
            visibility: visible !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />
    </div>
  );
}
