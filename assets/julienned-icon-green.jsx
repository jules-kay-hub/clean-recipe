import React from 'react';

const JuliennedIcon = ({ size = 120 }) => (
  <div style={{
    width: size,
    height: size,
    borderRadius: size * 0.22,
    background: 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(27, 67, 50, 0.35)'
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
      padding: '48px 24px',
      fontFamily: 'system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '48px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#1C1917', 
          margin: '0 0 8px' 
        }}>
          Julienned App Icon
        </h1>
        <p style={{ fontSize: '15px', color: '#78716C', margin: 0 }}>
          Forest Green Version
        </p>
      </div>
      
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
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        justifyContent: 'center'
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
            Spotlight
          </p>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <JuliennedIcon size={29} />
          <p style={{ marginTop: '12px', fontSize: '13px', color: '#78716C' }}>
            Settings
          </p>
        </div>
      </div>
      
      {/* Context comparisons */}
      <div style={{
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {/* Light background */}
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '32px 48px',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <JuliennedIcon size={80} />
          <p style={{ marginTop: '12px', fontSize: '13px', color: '#78716C' }}>
            Light background
          </p>
        </div>
        
        {/* Dark background */}
        <div style={{
          backgroundColor: '#1C1917',
          padding: '32px 48px',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <JuliennedIcon size={80} />
          <p style={{ marginTop: '12px', fontSize: '13px', color: '#A8A29E' }}>
            Dark background
          </p>
        </div>
      </div>
      
      {/* Home screen mockup */}
      <div style={{
        width: '280px',
        height: '200px',
        borderRadius: '24px',
        background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
        padding: '24px 16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'center',
        alignContent: 'flex-start',
        boxShadow: '0 12px 32px rgba(0,0,0,0.15)'
      }}>
        {/* Other app placeholders */}
        <div style={{ width: 50, height: 50, borderRadius: 11, background: '#34D399' }}/>
        <div style={{ width: 50, height: 50, borderRadius: 11, background: '#60A5FA' }}/>
        <JuliennedIcon size={50} />
        <div style={{ width: 50, height: 50, borderRadius: 11, background: '#FBBF24' }}/>
        <div style={{ width: 50, height: 50, borderRadius: 11, background: '#F472B6' }}/>
        <div style={{ width: 50, height: 50, borderRadius: 11, background: '#A78BFA' }}/>
        <div style={{ width: 50, height: 50, borderRadius: 11, background: '#FB923C' }}/>
        <div style={{ width: 50, height: 50, borderRadius: 11, background: '#4ADE80' }}/>
      </div>
      
      {/* Specs */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1C1917', margin: '0 0 16px' }}>
          Specifications
        </h3>
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
          <tbody>
            {[
              ['Gradient Start', '#2D6A4F'],
              ['Gradient End', '#1B4332'],
              ['Lines', '#FFFFFF'],
              ['Corner Radius', '22%'],
              ['Shadow', 'rgba(27, 67, 50, 0.35)']
            ].map(([label, value], i) => (
              <tr key={i} style={{ borderBottom: '1px solid #F5F5F4' }}>
                <td style={{ padding: '10px 0', color: '#78716C' }}>{label}</td>
                <td style={{ 
                  padding: '10px 0', 
                  color: '#1C1917', 
                  textAlign: 'right', 
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
