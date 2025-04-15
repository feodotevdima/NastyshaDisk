import React, { useState, useEffect } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Dimensions, ScrollView, Vibration, ActivityIndicator} from 'react-native';
import getExtension from '../../../sheared/FileProvider';
import File from '../../../Entities/FileEntity';
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

const { height } = Dimensions.get('window');
const PageSize = 20;

const FileScreen: React.FC<FileScreenProps> = ({ longPress, setLongPress, SetPath }) => {
  const [Path, setPath] = useState<string[]>(['Главная']);
  const [visibleMenuId, setVisibleMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [fileNames, setfileNames] = useState<File[] | null>(null);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string | null>(null);
  const [oldPath, setOldPath] = useState<string>("");
  const [extension, setExtension] = useState<string>("");
  const [openImage, setOpenImage] = useState<boolean>(false);
  const [imagePath, setImagePath] = useState<string | null>(null);
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
    if(longPress?.length==0)
    {
      setLongPress(null)
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
    if(longPress != null)
    {
      if(longPress.includes(name))
      {
        const newArr : string[] = longPress.filter((i) => i !== name);
        setLongPress(newArr);
      }
      else
      {
        setLongPress([...longPress, name]);
      }
    }
    else
    {
      const extension = getExtension(name);
      if (extension == null)
        setPath([...Path, name]);
      else if (extension.toLowerCase() == 'img' || extension.toLowerCase() == 'jpeg' || extension.toLowerCase() == 'jpg')
      {
        if(GetPathString(Path).length > 1)
        {
          setImagePath(GetPathString(Path)+ '\\' + name)
        }
        else
          setImagePath(name)
          setOpenImage(true);
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
      if(getExtension(Name)!=null && menuY>700)
        menuY+=60;
      setVisibleMenuId(Name);
      setMenuPosition({ x: menuX, y: menuY });
    });
  };

  const handleMenuItemSelect = (item: string, Name: string) => {
    if(item=='Удалить')
    {
      const path = [GetPathString(Path) + Name];
      DelFiles(path, false)
    }
    else if(item=='Переименовать')
    {
      const path = GetPathString(Path) + Name;
      setOldPath(path);

      if(Name.includes('.'))
      {
        const arrNames = Name.split('.');
        setInputValue(arrNames[0]);
        setExtension(arrNames[arrNames.length-1]);
        console.log(arrNames)
      }
      else
      {
        console.log(inputValue)
        setInputValue(Name)
      }
      setModalVisible(true);
    }
    else if(item = 'Управление доступом')
    {
      navigation.navigate('Sheare', { path: GetPathString(Path) + Name});
    }
  };

  const renameFile = () =>{
    setModalVisible(false);
    let path = GetPathString(Path) + inputValue;
    if(extension.length>0)
      path += '.' + extension;
    ChangeFilaeName(oldPath, path, false);
    setInputValue('');
    setExtension('');
  }

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


  const ListItem = ({ name, owner, conectedUsers }: File) => {
    if(name==null)
      return null;
    let items = ['Переименовать', 'Удалить'];
    if(getExtension(name)==null)
    {
      items = [...items, 'Управление доступом'];
    }

    if(longPress == null)
    {
      return (
          <View style={styles.itemContainer}>
            <TouchableOpacity onPress={() => pressDir(name)} onLongPress={() => handleLongPress(name)} style={styles.touchableContainer}>
              <GetIcon name={name} />
              <Text style={styles.itemText}>{name}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() =>DownloadFile(GetPathString(Path), false)} style={styles.downloadIconContainer}>
              <Image
                  source={require('../../../../icons/download.png')}
                  style={styles.downloadIcon}
                  resizeMode="contain"
              />
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
    }

    else
    {
      return(
          <View style={[styles.itemContainer, longPress.includes(name)? {backgroundColor: '#ffddf1'} : {}]}>
            <TouchableOpacity onPress={() => pressDir(name)} onLongPress={() => handleLongPress(name)} style={styles.touchableContainer}>
              <GetIcon name={name} />
              <Text style={styles.itemText}>{name}</Text>

              <Image
                  source={ longPress.includes(name)? require('../../../../icons/check-mark.png') : require('../../../../icons/circle.png')}
                  style={[styles.menuIcon ,{marginRight: 25}]}
                  resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
      )
    }
  };

  return (
      <View style={styles.Container}>

        <ModalName modalVisible={modalVisible} setModalVisible={setModalVisible} inputValue={inputValue} setInputValue={setInputValue} handleSubmit={renameFile} />
        <ImageModal modalVisible={openImage} setModalVisible={setOpenImage} path={imagePath} />
        {longPress ? null : (
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
              <GetPath />
            </ScrollView>
        )}
        <View style={[styles.listContainer, { height: height * 0.88 }, {marginTop: longPress? 28 : 0}]}>
          <FlatList
              data={fileNames}
              renderItem={({ item }) => (
                  <View>
                    <ListItem name={item.name} owner={item.owner} conectedUsers={item.conectedUsers} />
                    <View style={styles.separator} />
                  </View>
              )}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.5}
              ListFooterComponent={isLoading? <ActivityIndicator /> : null}
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
    borderRadius: 10,
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
  },
  itemText: {
    fontSize: 16,
    paddingLeft: 10,
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
  downloadIcon: {
    width: 18,
    height: 18,
    marginLeft: 5,
  },
  menuIcon: {
    width: 30,
    height: 30,
  },
});

const pathStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 12,
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