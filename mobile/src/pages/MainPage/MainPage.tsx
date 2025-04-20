import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image, Dimensions, Modal, TextInput, Button } from 'react-native';
import FileScreen from './UI/FileScreen';
import { downloadFile } from './API/AddFiles';
import DelFiles from './API/DelFiles';
import GetPathString from '../../sheared/GetPathString';
import ModalName from './UI/ModalName';
import NewDir from './API/NewDir';
import VolumeLine from './UI/Volume';
import { Logout } from '../../sheared/TokenProvider';
import { fileEventEmitter, FileEvents } from '../../sheared/UpdateFiles';

const { width } = Dimensions.get('window');

const MainPage = () => {
  const [Path, SetPath] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [longPress, setLongPress] = useState<string[] | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const iconAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

   useEffect(() => {
          toggleIcon()
    }, [longPress]);

    const toggleAddMenu = () => {
      Animated.timing(addMenuAnim, {
        toValue: showAddMenu ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setShowAddMenu(!showAddMenu);
    };
  
    const addMenuTranslateY = addMenuAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [100, 0],
    });
  
    const handleDownload = () => {
      toggleAddMenu();
      downloadFile(Path, false);
    };

  const DeleteFiles = () =>{
    const paths=[];
    if(longPress!=null)
    {
      for (let i = 0; i < longPress.length; i++)
        paths.push(Path+longPress[i]);
      
      DelFiles(paths, false)
      setLongPress(null);
    }
  }

  const logout = async () => {
    toggleMenu(); 
    await Logout();
    fileEventEmitter.emit(FileEvents.CHECK_AUTH);
  }
  
  const handleSubmitCreateDir = () => {
    if(inputValue.includes('.') || inputValue=='' || inputValue==null)
      return;
    NewDir(Path+inputValue, false)
    setModalVisible(false);
    setInputValue('');
  };

  const toggleIcon = () => {
  Animated.parallel([
    Animated.timing(iconAnim, {
      toValue: !longPress ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }),
    Animated.timing(translateYAnim, {
      toValue: !longPress ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }),
  ]).start();
}


  const toggleMenu = () => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? -width : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();

    Animated.parallel([
      Animated.timing(iconAnim, {
        toValue: isOpen ? 0 : 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: isOpen ? 0 : 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    setIsOpen(!isOpen);
  };

  const rotateFirstLine = iconAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });
  const rotateSecondLine = iconAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-45deg'],
  });
  const opacityMiddleLine = iconAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const translateYFirstLine = translateYAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 5],
  });
  const translateYSecondLine = translateYAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [5, -5],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={longPress ? () => setLongPress(null) : toggleMenu}
        style={styles.burgerButton}
      >
        <View style={styles.iconContainer}>
          <Animated.View
            style={[
              styles.iconLine,
              {
                transform: [
                  { rotate: rotateFirstLine },
                  { translateY: translateYFirstLine },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.iconLine,
              { opacity: opacityMiddleLine },
            ]}
          />
          <Animated.View
            style={[
              styles.iconLine,
              {
                transform: [
                  { rotate: rotateSecondLine },
                  { translateY: translateYSecondLine },
                ],
              },
            ]}
          />
        </View>
      </TouchableOpacity>
      {longPress ? 
        <TouchableOpacity onPress={() => DeleteFiles()} style={styles.imageButton}>
          <Image
            source={require('../../../icons/del.png')}
            style={styles.menu3Icon}
            resizeMode="contain"
          />
        </TouchableOpacity> :
        <TouchableOpacity onPress={toggleAddMenu} style={styles.imageButton}>
          <Image
            source={require('../../../icons/plus.png')}
            style={styles.menu3Icon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      }

      <Animated.View style={[
        styles.addMenu,
        {
          transform: [{ translateY: addMenuTranslateY }],
          opacity: addMenuAnim,
        }
      ]}>
        <TouchableOpacity style={styles.addMenuItem} onPress={handleDownload}>
          <Text style={styles.addMenuText}>Загрузить файл</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.addMenuItem} onPress={() => {toggleAddMenu(); setModalVisible(true)}}>
          <Text style={styles.addMenuText}>Создать папку</Text>
        </TouchableOpacity>
      </Animated.View>

      {showAddMenu && (
        <TouchableOpacity 
          style={styles.overlay}
          onPress={toggleAddMenu}
          activeOpacity={0.5}
        />
      )}

      <ModalName modalVisible={modalVisible} setModalVisible={setModalVisible} inputValue={inputValue} setInputValue={setInputValue} handleSubmit={handleSubmitCreateDir} />


      <View style={styles.content}>
        <FileScreen longPress={longPress} setLongPress={setLongPress} SetPath={SetPath} />
      </View>


      <Animated.View style={[styles.menu,{transform: [{ translateX: slideAnim }],},]}>

        <VolumeLine />

        <TouchableOpacity style={[styles.menuItem, styles.logoutCunteyner]} onPress={logout}>
          <Text style={[styles.menuText, styles.logout]}>Выйти</Text>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    paddingTop: 40,
    paddingHorizontal: 10,
    backgroundColor: '#ffddf1',
  },
  burgerButton: {
    position: 'absolute',
    top: 60,
    left: 26,
    zIndex: 1,
  },
  iconContainer: {
    width: 35,
    height: 20,
  },

  iconLine: {
    width: '100%',
    height: 3,
    backgroundColor: 'black',
  },
  content: {
    marginTop: 50,
  },
  menu: {
    position: 'absolute',
    top: 40,
    left: 10,
    width: width * 0.7,
    height: '99%',
    backgroundColor: '#fbf8fa',
    borderRadius: 10,
    paddingTop: 70,
    paddingHorizontal: 16,
  },
  menuItem: {
    marginBottom: 20,
  },
  menuText: {
    fontSize: 18,
  },
  menu3Icon: {
    width: 30,
    height: 30,
    top: 40,
  },
  imageButton: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
  addMenu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  addMenuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addMenuText: {
    fontSize: 18,
    color: '#333',
  },
  overlay: {
    position: 'absolute',
    top: -100,
    left: -100,
    right: -100,
    bottom: 0,
    backgroundColor: 'rgba(83, 81, 81, 0.5)',
    zIndex: 5,
  },
  separator: {
    height: 2,
    backgroundColor: 'black',
    marginRight: 24,
  },
  logout: {
    color: 'rgb(255, 0, 76)',
    fontWeight: 500,
    textAlign: "center",
    marginHorizontal: 40, 
  },
  logoutCunteyner: {
    borderColor: 'rgb(255, 0, 76)',
    borderWidth: 2,
    borderRadius: 30,
    padding: 5,
    marginHorizontal: 40,
    marginTop: 500
  }
});

export default MainPage;