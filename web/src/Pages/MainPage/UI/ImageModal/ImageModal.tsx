import React, { useState, useEffect, useCallback } from 'react';
import { getToken } from '../../../../Shered/TokenProvider';
import axios from 'axios';
import './ImageModal.css';

interface ImageModalProps {
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  images?: string[];
  currentIndex?: number;
}

const ImageModal: React.FC<ImageModalProps> = ({
  modalVisible,
  setModalVisible,
  images = [],
  currentIndex = 0
}) => {
  const [id, setId] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);

  useEffect(() => {
    const fetchId = async () => {
      const token = await getToken();
      const query = `http://localhost:7001/User/token`;
      const response = await axios.get(query, {
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setId(response.data.id);
      }
    };
    
    fetchId();
  }, []);

  useEffect(() => {
    setCurrentImageIndex(currentIndex);
  }, [currentIndex]);

  const handlePrev = useCallback(() => {
    if (images.length > 0 && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  }, [images.length, currentImageIndex]);

  const handleNext = useCallback(() => {
    if (images.length > 0 && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  }, [images.length, currentImageIndex]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setModalVisible(false);
    } else if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  }, [setModalVisible, handlePrev, handleNext]);

  useEffect(() => {
    if (modalVisible) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [modalVisible, handleKeyDown]);

  if (!id || !modalVisible) {
    return null;
  }

  const getImageUri = (imgPath: string) => {
    return `http://localhost:7003/Files/open_image/${id}?isPublic=false&path=${encodeURIComponent(imgPath)}`;
  };

  const currentPath = images.length > 0 ? images[currentImageIndex] : null;
  if (!currentPath) return null;

  return (
    <div className={`modal-overlay ${modalVisible ? 'visible' : ''}`}>
      <button 
        className="close-button"
        onClick={() => setModalVisible(false)}
      >
        ×
      </button>

      {images.length > 1 && currentImageIndex > 0 && (
        <button 
          className="arrow-button left-arrow"
          onClick={handlePrev}
        >
          ‹
        </button>
      )}

      <img 
        src={getImageUri(currentPath)} 
        className="modal-image"
        alt="Просмотр изображения"
        onError={(e) => console.error("Image load error:", e)}
      />

      {images.length > 1 && currentImageIndex < images.length - 1 && (
        <button 
          className="arrow-button right-arrow"
          onClick={handleNext}
        >
          ›
        </button>
      )}
    </div>
  );
};

export default ImageModal;