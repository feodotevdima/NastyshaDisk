import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet} from 'react-native';


interface DropdownMenuProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (item: string) => void;
    menuItems: string[];
    position: { x: number; y: number };
  }

const DropdownMenu: React.FC<DropdownMenuProps> = ({ visible, onClose, onSelect, menuItems, position }) => {
    if (!visible) return null;
  
    let y = -10
    if(position.y>700)
      y = -195;
  
    return (
      <Modal transparent={true} visible={visible} onRequestClose={onClose}>
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={[styles.menuContainer, { top: position.y+y, left: position.x }]}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.menuItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

export default DropdownMenu;





  const styles = StyleSheet.create({
    menuOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuContainer: {
      position: 'absolute',
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 10,
      width: 200,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 5,
    },
    menuItem: {
      padding: 8,
    },
    menuItemText: {
      fontSize: 16,
    },
  });