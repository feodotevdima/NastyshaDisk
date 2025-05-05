import React, { useEffect } from 'react';
import './DropdownMenu.css';

interface DropdownMenuProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: string) => void;
  menuItems: string[];
  position: { x: number; y: number };
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ 
  visible, 
  onClose, 
  onSelect, 
  menuItems, 
  position 
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [visible, onClose]);

  if (!visible) return null;

  const calculatePosition = () => {
    const yOffset = position.y > 700 ? -195 : -10;
    return {
      top: `${position.y + yOffset}px`,
      left: `${position.x}px`
    };
  };

  return (
    <div className="dropdown-overlay" onClick={onClose}>
      <div 
        className="dropdown-container" 
        style={calculatePosition()}
        onClick={(e) => e.stopPropagation()}
      >
        {menuItems.map((item, index) => (
          <button
            key={index}
            className="dropdown-item"
            onClick={() => {
              onSelect(item);
              onClose();
            }}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DropdownMenu;