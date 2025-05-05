import React, { useState, useEffect, useRef } from 'react';
import getExtension from '../../../../Shered/FileProvider';
import DropdownMenu from '../../../../Wigetes/Menu/DropdownMenu';
import GetIcon from '../GetIcon';
import GetFilesName from '../../API/GetFileNames';
import DelFiles from '../../API/DelFiles';
import GetPathString from '../../../../Shered/GetPathString';
import DownloadFile from '../../API/DownloadFile';
import ChangeFilaeName from "../../API/ChangeFilaeName";
import ModalName from '../ModalName/ModalName';
import ImageModal from '../ImageModal/ImageModal';
import { useNavigate } from 'react-router-dom';
import './FileScreen.css';
import Spinner from '../../../../Wigetes/Spinner/Spinner';

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
  const navigate = useNavigate();
  const itemRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

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

    // fileEventEmitter.on(FileEvents.FILES_UPDATED, handleFilesUpdated);

    // return () => {
    //   fileEventEmitter.off(FileEvents.FILES_UPDATED, handleFilesUpdated);
    // };
  }, [Path]);

  useEffect(() => {
    if (longPress?.length === 0) {
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
        const newArr = longPress.filter(i => i !== name);
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
            const pathPrefix = '/' + GetPathString(Path);
            return pathPrefix + item;
          }) || [];

        const currentIndex = imagePaths.findIndex(item => {
          const pathPrefix = '/' + GetPathString(Path);
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
        const newArr = longPress.filter(i => i !== name);
        setLongPress(newArr);
      } else {
        setLongPress([...longPress, name]);
      }
    }
  };

  const handleMenuPress = (e: React.MouseEvent, name: string) => {
    const element = itemRefs.current[name];
    if (element) {
      const rect = element.getBoundingClientRect();
      const menuX = rect.left - 180;
      let menuY = rect.top;
      if (getExtension(name) != null && menuY > 700) {
        menuY += 60;
      }
      setVisibleMenuId(name);
      setMenuPosition({ x: menuX, y: menuY });
    }
  };

  const handleMenuItemSelect = (item: string, name: string) => {
    if (item === 'Удалить') {
      const path = [GetPathString(Path) + name];
      DelFiles(path, false);
    } else if (item === 'Переименовать') {
      const path = GetPathString(Path) + name;
      setOldPath(path);

      if (name.includes('.')) {
        const arrNames = name.split('.');
        setInputValue(arrNames[0]);
        setExtension(arrNames[arrNames.length - 1]);
      } else {
        setInputValue(name);
      }
      setModalVisible(true);
    } else if (item === 'Управление доступом') {
      navigate('/share', { state: { path: GetPathString(Path) + name } });
    }
  };

  const renameFile = () => {
    setModalVisible(false);
    let path = '/' + GetPathString(Path) + inputValue;
    if (extension.length > 0) {
      path += '.' + extension;
    }
    ChangeFilaeName('/' + oldPath, path, false);
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
      await DownloadFile(
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
      <div className="path-container">
        {Path.map((value, index) => (
          <div key={index} className="path-item-container">
            <button 
              onClick={() => pressPath(index)}
              className="path-button"
            >
              {value}
            </button>
            {index !== Path.length - 1 && <span className="path-separator"> / </span>}
          </div>
        ))}
      </div>
    );
  };

  const ListItem: React.FC<ListItemProps> = ({ name }) => {
    if (!name || typeof name !== 'string') {
      return null;
    }
  
    const items = getExtension(name) ? 
      ['Переименовать', 'Удалить'] : 
      ['Переименовать', 'Удалить', 'Управление доступом'];
  
    return (
      <div className="list-item-wrapper">
        <div 
          className={`item-container ${longPress && longPress.includes(name) ? 'selected' : ''}`}
          ref={el => {
            itemRefs.current[name] = el;
          }}
        >
          <button
            onClick={() => pressDir(name)}
            onContextMenu={(e) => {
              e.preventDefault();
              longPress ? handleLongPress(name) : handleMenuPress(e, name);
            }}
            className="item-button"
          >
            <GetIcon name={name} />
            <span className="item-text">{name}</span>
            
            {!longPress && (
              <>
                <div className="item-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(name);
                    }}
                    className="download-button"
                    disabled={downloadStates[name]?.loading}
                  >
                    <div className="download-wrapper">
                      {downloadStates[name] ? (
                        <div className="circular-progress-container">
                          <div className="circular-progress-background" />
                          <div 
                            className="circular-progress-fill"
                            style={{
                              borderLeftColor: downloadStates[name].progress > 25 ? '#4CAF50' : 'transparent',
                              borderBottomColor: downloadStates[name].progress > 50 ? '#4CAF50' : 'transparent',
                              borderRightColor: downloadStates[name].progress > 75 ? '#4CAF50' : 'transparent',
                              borderTopColor: downloadStates[name].progress > 0 ? '#4CAF50' : 'transparent'
                            }}
                          />
                        </div>
                      ) : (
                        <img
                          src="/icons/download.png"
                          className="download-icon"
                          alt="Download"
                        />
                      )}
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuPress(e, name);
                    }}
                    className="menu-button"
                  >
                    <img
                      src="/icons/menu.png"
                      className="menu-icon"
                      alt="Menu"
                    />
                  </button>
                </div>
              </>
            )}
            
            {longPress && (
              <img
                src={longPress.includes(name) ? "/icons/check-mark.png" : "/icons/circle.png"}
                className="menu-icon check-icon"
                alt={longPress.includes(name) ? "Selected" : "Not selected"}
              />
            )}
          </button>
        </div>
        <div className="item-separator" />
        
        <DropdownMenu
          visible={visibleMenuId === name}
          onClose={() => setVisibleMenuId(null)}
          onSelect={(item) => handleMenuItemSelect(item, name)}
          menuItems={items}
          position={menuPosition}
        />
      </div>
    );
  };

  return (
    <div className="file-screen-container">
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

      {!longPress && (
        <div className="path-scroll-container">
          <GetPath />
        </div>
      )}

      <div className={`list-container ${longPress ? 'long-press-mode' : ''}`}>
        <div className="file-list">
          {fileNames?.map(item => (
            <ListItem key={item} name={item} />
          ))}
          {isLoading && <Spinner />}
        </div>
      </div>
    </div>
  );
};

export default FileScreen;