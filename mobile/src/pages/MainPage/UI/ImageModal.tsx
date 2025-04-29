import React, {useState, useEffect} from 'react';
import { View, Image, Modal, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ip } from '../../../sheared/TokenProvider';
import { getToken } from '../../../sheared/TokenProvider';
import axios from 'axios';

interface ImageModalProps {
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  // path: string | null;
  images?: string[];
  currentIndex?: number; 
}

const ImageModal: React.FC<ImageModalProps> = ({
  modalVisible,
  setModalVisible,
  // path = "",
  images = [],
  currentIndex = 0 
}) => {
  const [id, setId] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const path = "";
  useEffect(() => {
      const fetchId = async () => {
        const token = await getToken();
        const query = Ip + ":7001/User/token";
        const response = await axios.get(
          query,
          {
            headers: {
              'Accept': '*/*',
              'Content-Type': 'application/json',
              'Authorization': "Bearer " + token,
            },
          }
        );
        if (response.status == 200) {
            let json = await response.data;
            setId(json.id);
        }      
      };
      
      fetchId();
  }, []);

  useEffect(() => {
    setCurrentImageIndex(currentIndex);
  }, [currentIndex]);

  if (!id) {
      return null;
  }

  const getImageUri = (imgPath: string) => {
    return `${Ip}:7003/Files/open_image/${id}?isPublic=false&path=${encodeURIComponent(imgPath)}`;
  };

  const currentPath = images.length > 0 ? images[currentImageIndex] : path;
  if (!currentPath) return null;

  const handlePrev = () => {
    if (images.length > 0 && currentImageIndex > 0) {
      setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : prev));
    }
  };

  const handleNext = () => {
    if (images.length > 0 && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : prev));
    }
  };

  return (
      <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
      >
          <View style={styles.modalOverlay}>

              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                  <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>

              {(images.length > 1 && currentImageIndex > 0) && (
                <TouchableOpacity 
                  style={[styles.arrowButton, styles.leftArrow]}
                  onPress={handlePrev}
                >
                    <Text style={styles.arrowText}>‹</Text>
                </TouchableOpacity>
              )}

              <Image 
                  source={{ uri: getImageUri(currentPath) }} 
                  style={styles.Image}
                  resizeMode="contain"
                  onError={(e) => console.error("Image load error:", e.nativeEvent.error)}
              />

              {(images.length > 1 && currentImageIndex < images.length -1) && (
                <TouchableOpacity 
                  style={[styles.arrowButton, styles.rightArrow]}
                  onPress={handleNext}
                >
                    <Text style={styles.arrowText}>›</Text>
                </TouchableOpacity>
              )}
          </View>
      </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  Image: {
      width: '90%',
      height: '80%',
  },
  closeButton: {
      position: 'absolute',
      top: 40,
      right: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
  },
  closeButtonText: {
      color: 'white',
      fontSize: 30,
      lineHeight: 36,
  },
  arrowButton: {
      position: 'absolute',
      backgroundColor: 'rgba(128, 123, 123, 0.48)',
      borderRadius: 30,
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
  },
  leftArrow: {
      left: 20,
  },
  rightArrow: {
      right: 20,
  },
  arrowText: {
      color: 'white',
      fontSize: 40,
      lineHeight: 46,
  },
});

export default ImageModal;