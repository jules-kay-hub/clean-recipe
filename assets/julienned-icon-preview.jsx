import React from 'react';

const JuliennedIcon = ({ size = 120 }) => (
  <div style={{
    width: size,
    height: size,
    borderRadius: size * 0.22,
    background: 'linear-gradient(135deg, #B87333 0%, #CD8544 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(184, 115, 51, 0.3)'
  }}>
    <svg 
      width={size * 0.55} 
      height={size * 0.55} 
      viewBox="0 0 60 60" 
      fill="none"
    >
      <line x1="4" y1="32" x2="32" y2="4" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <line x1="8" y1="40" x2="40" y2="8" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <line x1="12" y1="48" x2="48" y2="12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <line x1="20" y1="52" x2="52" y2="20" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <line x1="28" y1="56" x2="56" y2="28" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  </div>
);

export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F5F5F4',
      padding: '48px',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '48px'
    }}>
      <h1 style={{ 
        fontSize: '24px', 
        fontWeight: '600', 
        color: '#1C1917', 
        margin: 0 
      }}>
        Julienned App Icon
      </h1>
      
      {/* Large preview */}
      <div style={{ textAlign: 'center' }}>
        <JuliennedIcon size={200} />
        <p style={{ marginTop: '16px', fontSize: '14px', color: '#78716C' }}>
          App Store (1024px)
        </p>
      </div>
      
      {/* Size variations */}
      <div style={{
        display: 'flex',
        gap: '40px',
        alignItems: 'flex-end'
      }}>
        <div style={{ textAlign: 'center' }}>
          <JuliennedIcon size={120} />
          <p style={{ marginTop: '12px', fontSize: '13px', color: '#78716C' }}>
            120px
          </p>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <JuliennedIcon size={60} />
          <p style={{ marginTop: '12px', fontSize: '13px', color: '#78716C' }}>
            Home Screen
          </p>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <JuliennedIcon size={40} />
          <p style={{ marginTop: '12px', fontSize: '13px', color: '#78716C' }}>
            40px
          </p>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <JuliennedIcon size={29} />
          <p style={{ marginTop: '12px', fontSize: '13px', color: '#78716C' }}>
            Settings
          </p>
        </div>
      </div>
      
      {/* On dark background */}
      <div style={{
        backgroundColor: '#1C1917',
        padding: '40px 60px',
        borderRadius: '16px',
        textAlign: 'center'
      }}>
        <JuliennedIcon size={80} />
        <p style={{ marginTop: '16px', fontSize: '13px', color: '#A8A29E' }}>
          On dark background
        </p>
      </div>
    </div>
  );
}
