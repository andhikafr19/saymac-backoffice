import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'var(--accent-gold)' }) {
  return (
    <div className="card stat-card">
      <div>
        <span className="stat-label">{title}</span>
        <div className="stat-value">{value}</div>
        {subtitle && (
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {subtitle}
          </div>
        )}
      </div>
      <div 
        className="stat-icon" 
        style={{ 
          background: `${color}18`, 
          color: color 
        }}
      >
        <Icon size={26} />
      </div>
    </div>
  );
}
