import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  ScrollView,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import getExtension from '../../../sheared/FileProvider';
import DropdownMenu from '../../../widgetes/DropdownMenu';
import GetIcon from './../UI/GetIcon';
import GetFilesName from '../API/GetFileNames';
import { fileEventEmitter, FileEvents } from '../../../sheared/UpdateFiles';
import DelFiles from '../API/DelFiles';
import GetPathString from '../../../sheared/GetPathString';
import DownloadFile from '../API/DownloadFile';
import ChangeFilaeName from "../API/ChangeFilaeName";
import ModalName from "./ModalName";
import ImageModal from './ImageModal';
import { RootStackParamList } from '../../../app/NavigationType';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface FileScreenProps {
  longPress: string[] | null;
  setLongPress: (value: string[] | null) => void;
  SetPath: (value: string | null) => void;
}

interface ListItemProps {
  name: string;
}

interface DownloadState {
  [key: string]: {
    progress: number;
    loading: boolean;
  };
}

const { height } = Dimensions.get('window');
const PageSize = 20;

const FileScreen: React.FC<FileScreenProps> = ({ longPress, setLongPress, SetPath }) => {
  const [Path, setPath] = useState<string[]>(['Главная']);
  const [visibleMenuId, setVisibleMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [fileNames, setfileNames] = useState<string[] | null>(null);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string | null>(null);
  const [oldPath, setOldPath] = useState<string>("");
  const [extension, setExtension] = useState<string>("");
  const [openImage, setOpenImage] = useState<boolean>(false);
  const [imagesPath, setImagesPath] = useState<string[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const [downloadStates, setDownloadStates] = useState<DownloadState>({});
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    setPage(1);
    setfileNames(null);
    setHasMore(true);
    setIsLoading(true);

    const fetchInitialData = async () => {
      await loadMoreData(1, true);
      setIsLoading(false);
    };

    fetchInitialData();

    fileEventEmitter.on(FileEvents.FILES_UPDATED, handleFilesUpdated);

    return () => {
      fileEventEmitter.off(FileEvents.FILES_UPDATED, handleFilesUpdated);
    };
  }, [Path]);

  useEffect(() => {
    if (longPress?.length == 0) {
      setLongPress(null);
    }
  }, [longPress]);

  const handleFilesUpdated = () => {
    setPage(1);
    setfileNames(null);
    setHasMore(true);
    loadMoreData(1, true);
  };

  const loadMoreData = async (currentPage: number, isInitialLoad: boolean = false) => {
    if (isLoading && !isInitialLoad) return;
    if (!hasMore && !isInitialLoad) return;

    setIsLoading(true);
    const path = GetPathString(Path);
    const response = await GetFilesName(path, currentPage, PageSize, false);

    setfileNames(prevNames =>
      currentPage === 1 ? response.data : [...(prevNames || []), ...response.data]
    );

    setTotalCount(response.totalCount);
    SetPath(path);
    setHasMore(response.data.length === PageSize);

    if (isInitialLoad && response.data.length === PageSize) {
      setPage(2);
    } else if (!isInitialLoad) {
      setPage(prevPage => prevPage + 1);
    }

    setIsLoading(false);
  };

  const handleEndReached = () => {
    if (!isLoading && hasMore) {
      loadMoreData(page);
    }
  };

  const pressPath = (index: number) => {
    setPath(Path.slice(0, index + 1));
  };

  const pressDir = (name: string) => {
    if (longPress != null) {
      if (longPress.includes(name)) {
        const newArr: string[] = longPress.filter((i) => i !== name);
        setLongPress(newArr);
      } else {
        setLongPress([...longPress, name]);
      }
    } else {
      const extension = getExtension(name);
      if (extension == null) {
        setPath([...Path, name]);
      } else if (['img', 'jpeg', 'jpg', 'png'].includes(extension.toLowerCase())) {
        const imagePaths = fileNames
          ?.filter(item => {
            const ext = getExtension(item)?.toLowerCase();
            return ext && ['img', 'jpeg', 'jpg', 'png'].includes(ext);
          })
          .map(item => {
            const pathPrefix = '\\' + GetPathString(Path);
            return pathPrefix + item;
          }) || [];

        const currentIndex = imagePaths.findIndex(item => {
          const pathPrefix = '\\' + GetPathString(Path);
          return item === pathPrefix + name;
        });

        if (currentIndex !== -1) {
          setImagesPath(imagePaths);
          setIndex(currentIndex);
          setOpenImage(true);
        }
      }
    }
  };

  const handleLongPress = (name: string) => {
    if (longPress == null) {
      setLongPress([name]);
    } else {
      if (longPress.includes(name)) {
        const newArr: string[] = longPress.filter((i) => i !== name);
        setLongPress(newArr);
      } else {
        setLongPress([...longPress, name]);
      }
    }
    Vibration.vibrate(90);
  };

  const handleMenuPress = (event: any, Name: string) => {
    event.target.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
      const menuX = pageX - 180;
      let menuY = pageY;
      if (getExtension(Name) != null && menuY > 700)
        menuY += 60;
      setVisibleMenuId(Name);
      setMenuPosition({ x: menuX, y: menuY });
    });
  };

  const handleMenuItemSelect = (item: string, Name: string) => {
    if (item == 'Удалить') {
      const path = [GetPathString(Path) + Name];
      DelFiles(path, false);
    } else if (item == 'Переименовать') {
      const path = GetPathString(Path) + Name;
      setOldPath(path);

      if (Name.includes('.')) {
        const arrNames = Name.split('.');
        setInputValue(arrNames[0]);
        setExtension(arrNames[arrNames.length - 1]);
      } else {
        setInputValue(Name);
      }
      setModalVisible(true);
    } else if (item == 'Управление доступом') {
      navigation.navigate('Sheare', { path: GetPathString(Path) + Name });
    }
  };

  const renameFile = () => {
    setModalVisible(false);
    let path = '\\'+GetPathString(Path) + inputValue;
    if (extension.length > 0)
      path += '.' + extension;
    ChangeFilaeName('\\'+oldPath, path, false);
    setInputValue('');
    setExtension('');
  };

  const handleDownload = async (fileName: string) => {
    if (downloadStates[fileName]?.loading) return;

    setDownloadStates(prev => ({
      ...prev,
      [fileName]: { progress: 0, loading: true }
    }));

    try {
      const uri = await DownloadFile(
        GetPathString(Path) + fileName,
        false,
        (progress) => {
          setDownloadStates(prev => ({
            ...prev,
            [fileName]: { ...prev[fileName], progress }
          }));
        }
      );

      setDownloadStates(prev => ({
        ...prev,
        [fileName]: { progress: 100, loading: false }
      }));

      setTimeout(() => {
        setDownloadStates(prev => {
          const newState = { ...prev };
          delete newState[fileName];
          return newState;
        });
      }, 2000);

    } catch (error) {
      setDownloadStates(prev => {
        const newState = { ...prev };
        delete newState[fileName];
        return newState;
      });
    }
  };

  const GetPath = () => {
    return (
      <View style={pathStyles.container}>
        {Path.map((value, index) => (
          <View key={index} style={pathStyles.itemContainer}>
            <TouchableOpacity onPress={() => pressPath(index)}>
              <Text style={pathStyles.text}>{value}</Text>
            </TouchableOpacity>
            {index !== Path.length - 1 && <Text style={pathStyles.separator}> \ </Text>}
          </View>
        ))}
      </View>
    );
  };

  const ListItem: React.FC<ListItemProps> = ({ name }) => {
    if (name == null || typeof name !== 'string') {
      return null;
    }

    let items = ['Переименовать', 'Удалить'];
    if (getExtension(name) == null) {
      items = [...items, 'Управление доступом'];
    }

    if (longPress == null) {
      return (
        <View style={styles.itemContainer}>
          <TouchableOpacity
            onPress={() => pressDir(name)}
            onLongPress={() => handleLongPress(name)}
            style={styles.touchableContainer}
          >
            <GetIcon name={name} />
            <Text style={styles.itemText}>{name}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDownload(name)}
            style={styles.downloadIconContainer}
            disabled={downloadStates[name]?.loading}
          >
            <View style={styles.downloadWrapper}>
              {downloadStates[name] ? (
                <View style={styles.circularProgressContainer}>

                  <View style={[
                    styles.circularProgressBackground,
                    {
                      borderColor: '#e0e0e0' 
                    }
                  ]} />
        
                  <View style={[
                    styles.circularProgressFill,
                    {
                      borderColor: '#4CAF50', 
                      transform: [
                        { rotate: '-90deg' }, 
                        { scaleY: -1 } 
                      ],
                      borderLeftColor: downloadStates[name].progress > 25 ? '#4CAF50' : 'transparent',
                      borderBottomColor: downloadStates[name].progress > 50 ? '#4CAF50' : 'transparent',
                      borderRightColor: downloadStates[name].progress > 75 ? '#4CAF50' : 'transparent',
                      borderTopColor: downloadStates[name].progress > 0 ? '#4CAF50' : 'transparent'
                      }
                    ]} />
                  </View>
              ) : (
                <Image
                  source={require('../../../../icons/download.png')}
                  style={styles.downloadIcon}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(event) => handleMenuPress(event, name)}
            style={styles.downloadIconContainer}
          >
            <Image
              source={require('../../../../icons/menu.png')}
              style={styles.menuIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <DropdownMenu
            visible={visibleMenuId === name}
            onClose={() => setVisibleMenuId(null)}
            onSelect={(item) => handleMenuItemSelect(item, name)}
            menuItems={items}
            position={menuPosition}
          />
          <View style={styles.separator} />
        </View>
      );
    } else {
      return (
        <View style={[styles.itemContainer, longPress.includes(name) ? { backgroundColor: '#ffddf1' } : {}]}>
          <TouchableOpacity
            onPress={() => pressDir(name)}
            onLongPress={() => handleLongPress(name)}
            style={styles.touchableContainer}
          >
            <GetIcon name={name} />
            <Text style={styles.itemText}>{name}</Text>
            <Image
              source={longPress.includes(name) ? require('../../../../icons/check-mark.png') : require('../../../../icons/circle.png')}
              style={[styles.menuIcon, { marginRight: 25 }]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <View style={styles.Container}>
      <ModalName
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSubmit={renameFile}
      />

      <ImageModal
        modalVisible={openImage}
        setModalVisible={setOpenImage}
        images={imagesPath}
        currentIndex={index || 0}
      />

      {longPress ? null : (
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <GetPath />
        </ScrollView>
      )}

      <View style={[styles.listContainer, { height: height * 0.89 }, { marginTop: longPress ? 28 : 0 }]}>
        <FlatList
          data={fileNames}
          renderItem={({ item }) => (
            <View>
              <ListItem name={item} />
              <View style={styles.separator} />
            </View>
          )}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isLoading ? <ActivityIndicator color='rgb(253, 93, 187)' /> : null}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  Container: {
    position: 'relative',
  },
  listContainer: {
    backgroundColor: '#fbf8fa',
    borderWidth: 1,
    borderColor: '#cecfd0',
    overflow: 'hidden',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    paddingTop: 8,
  },
  touchableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal:8,
  },
  itemText: {
    fontSize: 16,
    paddingHorizontal: 10,
    marginTop: 0,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#cecfd0',
  },
  downloadIconContainer: {
    marginRight: 12,
  },
  menuIcon: {
    width: 30,
    height: 30,
  },

  downloadWrapper: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgressContainer: {
    width: 30,
    height: 30,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgressBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  circularProgressFill: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 15,
    borderWidth: 2,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
  },
  downloadIcon: {
    width: 18,
    height: 18,
  },
});

const pathStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    marginLeft: 26,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
  separator: {
    fontSize: 18,
  },
});

export default FileScreen;