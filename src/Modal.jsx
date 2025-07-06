import React from 'react'
import ReactDom from 'react-dom'

const MODAL_STYLES = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  backgroundColor: 'rgb(34,34,34)',
  transform: 'translate(-50%, -50%)',
  zIndex: 1050,
  height: '95vh',
  width: '95vw',
  maxWidth: '1200px',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
}

const OVERLAY_STYLES = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, .8)',
  zIndex: 1040,
  backdropFilter: 'blur(4px)'
}

const CLOSE_BUTTON_STYLES = {
  position: 'absolute',
  top: '10px',
  right: '20px',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: 'none',
  backgroundColor: '#dc3545',
  color: 'white',
  fontSize: '18px',
  fontWeight: 'bold',
  cursor: 'pointer',
  zIndex: 1060,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)'
}

const MODAL_CONTENT_STYLES = {
  height: '100%',
  overflow: 'auto',
  padding: '20px',
  paddingTop: '60px' // Space for close button
}

export default function Modal({ children, onClose }) {
  
  // Close modal when clicking overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  // Close modal on Escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return ReactDom.createPortal(
    <>
      <div style={OVERLAY_STYLES} onClick={handleOverlayClick} />
      <div style={MODAL_STYLES}>
        <button 
          style={CLOSE_BUTTON_STYLES}
          onClick={onClose}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#c82333';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#dc3545';
            e.target.style.transform = 'scale(1)';
          }}
          aria-label="Close cart"
        >
          ×
        </button>
        <div style={MODAL_CONTENT_STYLES}>
          {children}
        </div>
      </div>
    </>,
    document.getElementById('cart-root')
  )
}