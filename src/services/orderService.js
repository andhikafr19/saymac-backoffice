import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_STORAGE_ORDERS_KEY = 'saymac_local_orders';

// Helper to get cached local orders
export function getLocalOrders() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read local orders:', err);
    return [];
  }
}

// Helper to save cached local orders
function saveLocalOrders(orders) {
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to save local orders:', err);
  }
}

/**
 * Fetch orders list for Backoffice CMS
 */
export async function fetchBackofficeOrders({ status = 'all', search = '', dateFilter = 'all' } = {}) {
  let combinedOrders = [];

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        combinedOrders = data.map((o) => ({
          ...o,
          items: Array.isArray(o.order_items) && o.order_items.length > 0
            ? o.order_items
            : o.items || [],
        }));
      } else if (error) {
        console.warn('Supabase fetch orders notice:', error.message);
      }
    } catch (err) {
      console.warn('Could not fetch orders from Supabase:', err);
    }
  }

  // Merge with local orders fallback (if tested in same browser)
  const localOrders = getLocalOrders();
  const existingCodes = new Set(combinedOrders.map((o) => o.order_code));
  localOrders.forEach((lo) => {
    if (!existingCodes.has(lo.order_code)) {
      combinedOrders.push(lo);
    }
  });

  // Filter in-memory if needed
  let results = [...combinedOrders];

  if (status && status !== 'all') {
    results = results.filter((o) => o.status === status);
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    results = results.filter(
      (o) =>
        (o.order_code && o.order_code.toLowerCase().includes(q)) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
        (o.customer_phone && o.customer_phone.toLowerCase().includes(q))
    );
  }

  if (dateFilter && dateFilter !== 'all') {
    const now = new Date();
    results = results.filter((o) => {
      const orderDate = new Date(o.created_at);
      if (dateFilter === 'today') {
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= weekAgo;
      } else if (dateFilter === 'month') {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }

  // Sort newest first
  results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return results;
}

/**
 * Update order status (pending -> processing -> completed -> cancelled)
 */
export async function updateOrderStatus(orderId, newStatus, paymentStatus = null) {
  // Update local cache
  const localOrders = getLocalOrders();
  const updatedLocal = localOrders.map((o) => {
    if (o.id === orderId || o.order_code === orderId) {
      return {
        ...o,
        status: newStatus,
        payment_status: paymentStatus || o.payment_status,
        updated_at: new Date().toISOString(),
      };
    }
    return o;
  });
  saveLocalOrders(updatedLocal);

  // Update in Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      if (paymentStatus) payload.payment_status = paymentStatus;

      const { error } = await supabase
        .from('orders')
        .update(payload)
        .eq('id', orderId);

      if (error) {
        // Try fallback update by order_code
        await supabase
          .from('orders')
          .update(payload)
          .eq('order_code', orderId);
      }
    } catch (err) {
      console.warn('Error updating order status in Supabase:', err);
    }
  }

  return true;
}

/**
 * Delete order
 */
export async function deleteOrder(orderId) {
  // Remove from local cache
  const localOrders = getLocalOrders();
  const filtered = localOrders.filter((o) => o.id !== orderId && o.order_code !== orderId);
  saveLocalOrders(filtered);

  // Remove from Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('orders').delete().eq('id', orderId);
    } catch (err) {
      console.warn('Error deleting order in Supabase:', err);
    }
  }

  return true;
}

/**
 * Export orders to CSV file for Excel Rekap Penjualan
 */
export function exportOrdersToCSV(orders) {
  if (!orders || orders.length === 0) {
    alert('Tidak ada data pesanan untuk diekspor.');
    return;
  }

  const headers = [
    'No',
    'Kode Pesanan',
    'Tanggal & Waktu',
    'Nama Pelanggan',
    'No. WhatsApp',
    'Alamat Pengiriman',
    'Catatan Khusus',
    'Rincian Menu & Level Pedas',
    'Total Item (Pcs)',
    'Total Pembayaran (Rp)',
    'Status Pesanan',
    'Status Bayar',
  ];

  const rows = orders.map((o, idx) => {
    const itemsSummary = (o.items || [])
      .map((it) => {
        const lvl = it.spicy_level === 0 || it.level_pedas === 0 ? 'Tanpa Pedas' : `Lvl ${it.spicy_level ?? it.level_pedas}`;
        return `${it.product_name || it.nama} (${lvl}) x${it.quantity}`;
      })
      .join('; ');

    const totalQty = (o.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);

    const formattedDate = new Date(o.created_at).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const escapeCSV = (val) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    return [
      idx + 1,
      escapeCSV(o.order_code),
      escapeCSV(formattedDate),
      escapeCSV(o.customer_name),
      escapeCSV(o.customer_phone),
      escapeCSV(o.customer_address || '-'),
      escapeCSV(o.customer_notes || '-'),
      escapeCSV(itemsSummary),
      totalQty,
      o.total_amount,
      escapeCSV(o.status),
      escapeCSV(o.payment_status || 'unpaid'),
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const todayStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `Rekap_Penjualan_SayMacaroni_${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
