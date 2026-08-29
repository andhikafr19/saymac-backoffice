import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProductModal from './components/ProductModal';
import Toast from './components/Toast';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Campaigns from './pages/Campaigns';
import Contacts from './pages/Contacts';
import Settings from './pages/Settings';
import CampaignModal from './components/CampaignModal';

import { createProduct, updateProduct } from './services/backofficeService';
import { createCampaign, updateCampaign } from './services/campaignService';

const MainLayout = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Theme state (default 'dark')
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('saymac_admin_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('saymac_admin_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Toast feedback state
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Product Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const handleOpenCreateModal = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductToEdit(null);
  };

  const handleSaveProduct = async (formData) => {
    try {
      if (formData.id) {
        await updateProduct(formData.id, formData);
        showToast('Produk berhasil diperbarui!', 'success');
      } else {
        await createProduct(formData);
        showToast('Produk baru berhasil ditambahkan!', 'success');
      }
      setIsModalOpen(false);
      setProductToEdit(null);
      
      // Reload page state if needed
      window.dispatchEvent(new Event('saymac_products_updated'));
    } catch (err) {
      showToast(`Gagal menyimpan produk: ${err.message}`, 'danger');
    }
  };

  // Campaign Modal state
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignToEdit, setCampaignToEdit] = useState(null);

  const handleOpenCreateCampaignModal = () => {
    setCampaignToEdit(null);
    setIsCampaignModalOpen(true);
  };

  const handleOpenEditCampaignModal = (campaign) => {
    setCampaignToEdit(campaign);
    setIsCampaignModalOpen(true);
  };

  const handleCloseCampaignModal = () => {
    setIsCampaignModalOpen(false);
    setCampaignToEdit(null);
  };

  const handleSaveCampaign = async (formData) => {
    try {
      if (formData.id) {
        await updateCampaign(formData.id, formData);
        showToast('Banner promo berhasil diperbarui!', 'success');
      } else {
        await createCampaign(formData);
        showToast('Banner promo baru berhasil dibuat!', 'success');
      }
      setIsCampaignModalOpen(false);
      setCampaignToEdit(null);
      window.dispatchEvent(new Event('saymac_campaigns_updated'));
    } catch (err) {
      showToast(`Gagal menyimpan banner: ${err.message}`, 'danger');
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-main)',
        fontFamily: 'var(--font-body)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="brand-logo-badge" style={{ margin: '0 auto 1rem', width: 48, height: 48 }}>S!</div>
          <div>Memuat Say Macaroni Backoffice...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderPageContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            setCurrentPage={setCurrentPage}
            onOpenCreateModal={handleOpenCreateModal}
            onOpenEditModal={handleOpenEditModal}
            showToast={showToast}
          />
        );
      case 'orders':
        return (
          <Orders 
            showToast={showToast}
          />
        );
      case 'products':
        return (
          <Products 
            onOpenCreateModal={handleOpenCreateModal}
            onOpenEditModal={handleOpenEditModal}
            showToast={showToast}
          />
        );
      case 'categories':
        return (
          <Categories 
            onOpenCreateModal={handleOpenCreateModal}
          />
        );
      case 'campaigns':
        return (
          <Campaigns
            onOpenCreateModal={handleOpenCreateCampaignModal}
            onOpenEditModal={handleOpenEditCampaignModal}
            showToast={showToast}
          />
        );
      case 'contact':
        return (
          <Contacts 
            showToast={showToast}
          />
        );
      case 'settings':
        return (
          <Settings 
            showToast={showToast}
            setCurrentPage={setCurrentPage}
          />
        );
      default:
        return (
          <Dashboard 
            setCurrentPage={setCurrentPage}
            onOpenCreateModal={handleOpenCreateModal}
            onOpenEditModal={handleOpenEditModal}
            showToast={showToast}
          />
        );
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <Sidebar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Area */}
      <div className="admin-main">
        <Header 
          currentPage={currentPage}
          theme={theme}
          toggleTheme={toggleTheme}
          setMobileOpen={setMobileOpen}
        />

        <main className="content-container">
          {renderPageContent()}
        </main>
      </div>

      {/* Product Create/Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
      />

      {/* Campaign Create/Edit Modal */}
      <CampaignModal
        isOpen={isCampaignModalOpen}
        onClose={handleCloseCampaignModal}
        onSave={handleSaveCampaign}
        campaignToEdit={campaignToEdit}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="toast-container">
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
