import React, { useState, useEffect, useMemo } from 'react';
import { 
  fetchBackofficeOrders, 
  updateOrderStatus, 
  deleteOrder, 
  exportOrdersToCSV 
} from '../services/orderService';
import ReceiptModal from '../components/ReceiptModal';
import StatCard from '../components/StatCard';
import { 
  Search, 
  Download, 
  Printer, 
  MessageCircle, 
  RefreshCw, 
  Trash2, 
  Clock, 
  ShoppingBag, 
  DollarSign, 
  CheckCheck, 
  Layers,
  ChevronRight
} from 'lucide-react';

export default function Orders({ showToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Order for Receipt Printing Modal
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchBackofficeOrders({
        status: statusFilter,
        dateFilter: dateFilter,
        search: searchQuery,
      });
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders in backoffice:', err);
      if (showToast) showToast('Gagal memuat daftar pesanan', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, dateFilter]);

  // Handle Status Update
  const handleStatusChange = async (orderId, newStatus, newPaymentStatus = null) => {
    try {
      await updateOrderStatus(orderId, newStatus, newPaymentStatus);
      if (showToast) showToast(`Status pesanan berhasil diubah menjadi: ${newStatus}`, 'success');
      loadOrders();
    } catch (err) {
      if (showToast) showToast(`Gagal mengubah status: ${err.message}`, 'danger');
    }
  };

  // Handle Delete Order
  const handleDelete = async (orderId, orderCode) => {
    if (window.confirm(`Yakin ingin menghapus pesanan ${orderCode}?`)) {
      try {
        await deleteOrder(orderId);
        if (showToast) showToast(`Pesanan ${orderCode} berhasil dihapus`, 'info');
        loadOrders();
      } catch (err) {
        if (showToast) showToast(`Gagal menghapus pesanan: ${err.message}`, 'danger');
      }
    }
  };

  // Calculate KPI Stats
  const stats = useMemo(() => {
    const totalOmzet = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const totalOrdersCount = orders.length;
    const completedCount = orders.filter((o) => o.status === 'completed').length;
    const pendingCount = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;

    return { totalOmzet, totalOrdersCount, completedCount, pendingCount };
  }, [orders]);

  // Filtered orders with search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        (o.order_code && o.order_code.toLowerCase().includes(q)) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
        (o.customer_phone && o.customer_phone.toLowerCase().includes(q))
    );
  }, [orders, searchQuery]);

  // Helper WhatsApp Link to Customer
  const getCustomerWALink = (phone, orderCode, customerName) => {
    let cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    const msg = `Halo Kak ${customerName || ''}, kami dari Admin Say Macaroni ingin konfirmasi terkait pesanan Kakak (${orderCode}).`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Kelola Pesanan Masuk 📦</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Pantau antrean pesanan dari website, ubah status pemrosesan, cetak struk dapur, dan ekspor rekap penjualan.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => exportOrdersToCSV(filteredOrders)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem' }}
          >
            <Download size={16} /> Export Rekap Excel / CSV
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: '1.75rem' }}>
        <StatCard
          title="Total Omzet Penjualan"
          value={`Rp ${stats.totalOmzet.toLocaleString('id-ID')}`}
          icon={DollarSign}
          description="Total dari pesanan aktif"
          trend=""
          variant="gold"
        />
        <StatCard
          title="Total Pesanan Masuk"
          value={stats.totalOrdersCount}
          icon={ShoppingBag}
          description="Semua status transaksi"
          trend=""
          variant="blue"
        />
        <StatCard
          title="Perlu Diproses"
          value={stats.pendingCount}
          icon={Clock}
          description="Pending & Sedang dimasak"
          trend=""
          variant="warning"
        />
        <StatCard
          title="Pesanan Selesai"
          value={stats.completedCount}
          icon={CheckCheck}
          description="Tuntas dikirim ke pelanggan"
          trend=""
          variant="success"
        />
      </div>

      {/* Filter & Action Controls Card */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Cari Kode Pesanan, Nama, atau No WA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '38px', margin: 0, fontSize: '0.875rem' }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', margin: 0, padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              <option value="all">Semua Status</option>
              <option value="pending">Status: Baru (Pending)</option>
              <option value="processing">Status: Sedang Diproses</option>
              <option value="completed">Status: Selesai</option>
              <option value="cancelled">Status: Dibatalkan</option>
            </select>

            {/* Date Select */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', margin: 0, padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="week">7 Hari Terakhir</option>
              <option value="month">Bulan Ini</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={loadOrders}
              title="Refresh Data"
              className="btn btn-secondary"
              style={{ padding: '0.625rem 0.875rem' }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredOrders.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Layers size={48} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Tidak Ada Data Pesanan</h3>
            <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {searchQuery ? 'Tidak ada pesanan yang sesuai dengan kata kunci pencarian Anda.' : 'Belum ada pesanan masuk yang tersimpan di sistem.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ width: '100%', fontSize: '0.875rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '1rem 1.25rem' }}>KODE & WAKTU</th>
                  <th style={{ padding: '1rem 1.25rem' }}>PELANGGAN</th>
                  <th style={{ padding: '1rem 1.25rem' }}>RINCIAN ITEM</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>TOTAL</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>STATUS PESANAN</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>AKSI & STRUK</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const formattedDate = new Date(order.created_at).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  // Badge color per status
                  let badgeClass = 'badge-warning';
                  if (order.status === 'processing') badgeClass = 'badge-info';
                  if (order.status === 'completed') badgeClass = 'badge-success';
                  if (order.status === 'cancelled') badgeClass = 'badge-danger';

                  return (
                    <tr key={order.id || order.order_code}>
                      {/* 1. Code & Date */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 800, color: 'var(--accent-gold)', fontSize: '0.95rem' }}>
                          {order.order_code}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                          {formattedDate} WIB
                        </div>
                      </td>

                      {/* 2. Customer details */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          {order.customer_name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{order.customer_phone}</span>
                          <a
                            href={getCustomerWALink(order.customer_phone, order.order_code, order.customer_name)}
                            target="_blank"
                            rel="noreferrer"
                            title="Chat WhatsApp Pelanggan"
                            style={{ color: '#25D366', display: 'inline-flex', alignItems: 'center' }}
                          >
                            <MessageCircle size={15} />
                          </a>
                        </div>
                        {order.customer_address && (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', maxWidth: '240px', lineHeight: 1.3 }}>
                            📍 {order.customer_address}
                          </div>
                        )}
                        {order.customer_notes && (
                          <div style={{ color: 'var(--accent-orange)', fontSize: '0.75rem', fontStyle: 'italic', marginTop: '0.25rem' }}>
                            📝 "{order.customer_notes}"
                          </div>
                        )}
                      </td>

                      {/* 3. Items Summary */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {(order.items || []).map((it, i) => {
                            const lvl = it.spicy_level === 0 || it.level_pedas === 0 ? 'Tanpa Pedas' : `Lvl ${it.spicy_level ?? it.level_pedas}`;
                            return (
                              <div key={i} style={{ fontSize: '0.8rem', lineHeight: 1.3 }}>
                                • <strong>{it.product_name || it.nama}</strong> ({lvl}) x{it.quantity}
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* 4. Total Amount */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top', textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                          Rp {Number(order.total_amount || 0).toLocaleString('id-ID')}
                        </div>
                        <div style={{ fontSize: '0.75rem', marginTop: '0.2rem', color: order.payment_status === 'paid' ? 'var(--status-success)' : 'var(--text-muted)' }}>
                          {order.payment_status === 'paid' ? '● LUNAS' : '○ Belum Lunas'}
                        </div>
                      </td>

                      {/* 5. Status Dropdown */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top', textAlign: 'center' }}>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`badge ${badgeClass}`}
                          style={{
                            border: 'none',
                            padding: '0.375rem 0.75rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            outline: 'none',
                            borderRadius: 'var(--radius-full)'
                          }}
                        >
                          <option value="pending" style={{ background: '#1c2541', color: '#fff' }}>Baru (Pending)</option>
                          <option value="processing" style={{ background: '#1c2541', color: '#fff' }}>Sedang Diproses</option>
                          <option value="completed" style={{ background: '#1c2541', color: '#fff' }}>Selesai</option>
                          <option value="cancelled" style={{ background: '#1c2541', color: '#fff' }}>Dibatalkan</option>
                        </select>
                      </td>

                      {/* 6. Action Buttons */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => setSelectedReceiptOrder(order)}
                            className="btn btn-secondary"
                            title="Cetak Struk Kasir / Bukti Dapur PDF"
                            style={{
                              padding: '0.375rem 0.75rem',
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <Printer size={14} /> Cetak Struk
                          </button>

                          <button
                            onClick={() => handleDelete(order.id, order.order_code)}
                            title="Hapus Pesanan"
                            className="btn btn-ghost"
                            style={{
                              padding: '0.375rem',
                              color: 'var(--text-muted)',
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Modal for Printing */}
      {selectedReceiptOrder && (
        <ReceiptModal
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
