import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 size={20} style={{ color: 'var(--status-success)' }} />;
      case 'warning': return <AlertTriangle size={20} style={{ color: 'var(--status-warning)' }} />;
      case 'danger': return <XCircle size={20} style={{ color: 'var(--status-danger)' }} />;
      default: return <Info size={20} style={{ color: 'var(--status-info)' }} />;
    }
  };

  return (
    <div className="toast">
      {getIcon()}
      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message}</span>
      <button 
        onClick={onClose} 
        style={{ 
          background: 'transparent', 
          border: 'none', 
          color: 'var(--text-muted)', 
          cursor: 'pointer',
          padding: '2px',
          marginLeft: '0.5rem'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
