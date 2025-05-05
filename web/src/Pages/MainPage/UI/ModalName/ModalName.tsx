import React from 'react';
import './ModalName.css';

interface ModalNameProps {
  modalVisible: boolean | null;
  setModalVisible: (value: boolean) => void;
  inputValue: string | null;
  setInputValue: (value: string) => void;
  handleSubmit: () => void;
}

const ModalName: React.FC<ModalNameProps> = ({
  modalVisible,
  setModalVisible,
  inputValue,
  setInputValue,
  handleSubmit,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setModalVisible(false);
    }
  };

  if (!modalVisible) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={() => setModalVisible(false)}>
      <div className="modal-view" onClick={(e) => e.stopPropagation()}>
        <label className="modal-label">Введите имя:</label>
        <input
          type="text"
          className="modal-input"
          value={inputValue || ''}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите имя"
          autoFocus
        />

        <button 
          onClick={handleSubmit} 
          className="modal-button"
        >
          Продолжить
        </button>
      </div>
    </div>
  );
};

export default ModalName;