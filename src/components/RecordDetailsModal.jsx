import React from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';

export default function RecordDetailsModal({ record, onClose }) {
  if (!record) return null;

  // Helper to format values based on data type
  const formatValue = (value) => {
    if (value === null || value === undefined) return <span style={{ color: 'var(--text-secondary)' }}>N/A</span>;
    if (typeof value === 'boolean') {
      return (
        <span className={`badge ${value ? 'badge-success' : 'badge-danger'}`}>
          {value ? 'True' : 'False'}
        </span>
      );
    }
    if (typeof value === 'object') {
      return (
        <pre style={{ 
          background: 'rgba(0,0,0,0.1)', 
          padding: '0.5rem', 
          borderRadius: '4px', 
          fontSize: '0.875rem',
          overflowX: 'auto',
          margin: 0
        }}>
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    if (typeof value === 'string') {
      // Check for URL or Image
      if (value.startsWith('http')) {
        if (value.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
          return <img src={value} alt="Preview" style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '150px' }} />;
        }
        return <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)' }}>{value}</a>;
      }
      // Check for date string
      const date = new Date(value);
      if (!isNaN(date.getTime()) && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
        return format(date, 'PPpp');
      }
    }
    return String(value);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '2rem'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
        >
          <X size={24} />
        </button>

        <h2 style={{ marginBottom: '1.5rem', paddingRight: '2rem' }}>Record Details</h2>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {Object.entries(record).map(([key, value]) => (
            <div key={key} style={{ 
              background: 'var(--bg-secondary)', 
              padding: '1rem', 
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <p style={{ 
                fontSize: '0.75rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                color: 'var(--text-secondary)',
                marginBottom: '0.5rem',
                fontWeight: 600
              }}>
                {key.replace(/_/g, ' ')}
              </p>
              <div style={{ wordBreak: 'break-word', fontSize: '0.95rem' }}>
                {formatValue(value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
