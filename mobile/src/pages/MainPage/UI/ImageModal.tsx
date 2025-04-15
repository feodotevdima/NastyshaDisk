import React from 'react';
import { View, Image, Modal, StyleSheet } from 'react-native';
import { Ip } from '../../../sheared/TokenProvider';

interface ImageModalProps {
    modalVisible: boolean | null;
    setModalVisible: (value: boolean) => void;
    path: string | null;
}

const ImageModal: React.FC<ImageModalProps> = ({
    modalVisible,
    setModalVisible,
    path
}) => {

    return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible || false}
      onRequestClose={() => {
        setModalVisible(false);
      }}
    >
      <View style={styles.modalOverlay}>
        <Image 
                source={{ uri: Ip+":7003/Files/open_image/b8f0069c-785a-4867-82b0-b92381b01c78?isPublic=false&path="+path }} 
                style={styles.Image}
              />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(83, 81, 81, 0.5)',
  },
  Image: {
    width: 300,
    height: 400
  }

});

export default ImageModal;