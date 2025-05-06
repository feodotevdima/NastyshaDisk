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

  if (!visible) return null;

  const calculatePosition = () => {
    return {
      top: `${position.y}px`,
      left: `${position.x}px`
    };
  };

  return (
    <div className="dropdown-overlay" onClick={onClose} onContextMenu={onClose}> 
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