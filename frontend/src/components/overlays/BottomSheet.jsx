import { useEffect, useRef } from 'react';

const BottomSheet = ({ isOpen, onClose, title, children }) => {
  const sheetRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="bottomsheet-backdrop" onClick={onClose || undefined}>
      <div
        ref={sheetRef}
        className={`bottomsheet ${isOpen ? 'open' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bottomsheet-handle">
          <div className="bottomsheet-handle-bar"></div>
        </div>
        {title && (
          <div className="bottomsheet-header">
            <h3>{title}</h3>
            {onClose && (
              <button className="bottomsheet-close" onClick={onClose}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>
        )}
        <div className="bottomsheet-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;
