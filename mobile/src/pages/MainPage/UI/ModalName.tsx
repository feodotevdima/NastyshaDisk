import React from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, TouchableOpacity } from 'react-native';

interface GetModalNameProps {
  modalVisible: boolean | null;
  setModalVisible: (value: boolean) => void;
  inputValue: string | null;
  setInputValue: (value: string) => void;
  handleSubmit: () => void;
}

const ModalName: React.FC<GetModalNameProps> = ({
  modalVisible,
  setModalVisible,
  inputValue,
  setInputValue,
  handleSubmit,
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
        <View style={styles.modalView}>
          <Text style={styles.text}>Введите имя:</Text>
          <TextInput
            style={styles.input}
            value={inputValue || ''}
            onChangeText={setInputValue}
            placeholder="Введите имя"
          />

          <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                  <Text>Создать</Text>
          </TouchableOpacity>
        </View>
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
  modalView: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
  },
  input: {
    height: 40,
    borderColor: '#cecfd0',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  button :{
    backgroundColor: "#f38bc8",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text :{
    marginLeft: 8,
    marginBottom: 8,
  },
});

export default ModalName;