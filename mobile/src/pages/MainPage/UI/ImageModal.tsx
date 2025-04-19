import React, {useState, useEffect} from 'react';
import { View, Image, Modal, StyleSheet } from 'react-native';
import { Ip } from '../../../sheared/TokenProvider';
import { getToken } from '../../../sheared/TokenProvider';
import axios from 'axios';

interface ImageModalProps {
  modalVisible: boolean;
  setModalVisible: (value: boolean) => void;
  path: string | null;
}

const ImageModal: React.FC<ImageModalProps> = ({
  modalVisible,
  setModalVisible,
  path
}) => {
  const [id, setId] = useState<string | null>(null);
  
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
        if (response.status == 200)
        {
            let json = await response.data;
            setId(json.id)
        }      
      };
      
      fetchId();
  }, []);

  if (!path || !id) {
      return null;
  }

  const imageUri = `${Ip}:7003/Files/open_image/${id}?isPublic=false&path=${encodeURIComponent(path)}`;

  return (
      <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
      >
          <View style={styles.modalOverlay}>
              <Image 
                  source={{ uri: imageUri }} 
                  style={styles.Image}
                  resizeMode="contain"
                  onError={(e) => console.error("Image load error:", e.nativeEvent.error)}
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
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  Image: {
      width: '90%',
      height: '80%',
  },
});
export default ImageModal;