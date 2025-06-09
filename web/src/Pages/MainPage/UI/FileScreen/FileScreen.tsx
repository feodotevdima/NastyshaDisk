import React, { useState, useEffect, useRef, useCallback } from 'react';
import getExtension from '../../../../Shered/FileProvider';
import DropdownMenu from '../../../../Wigetes/Menu/DropdownMenu';
import { GetIcon, GetIconPath } from '../GetIcon';
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
import { FileEvents, fileEventEmitter } from '../../../../Shered/UpdateFiles';
import { uploadFiles } from '../../API/AddFiles';
import FileResult from '../../../../Entities/FileResult';
import NewDir from '../../API/NewDir';
import UnionFiles from '../../API/UnionFiles';
import { isMobile } from 'react-device-detect';
import path from 'path';

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

interface DragData {
  path: string;
  name: string;
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
  const [isDragging, setIsDragging] = useState(false);
  const [isModalUnion, setIsModalUnion] = useState(false);
  const [unionInput, setUnionInput] = useState<string | null>(null);
  const [unionPath, setUnionPath] = useState<string | null>(null);
  const [unionNames, setUnionNames] = useState<string[] | null>(null);
  const [downloadStates, setDownloadStates] = useState<DownloadState>({});
  const navigate = useNavigate();
  const fileListRef = useRef<HTMLDivElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    if (longPress?.length === 0) {
      setLongPress(null);
    }
  }, [longPress]);

  const loadMoreData = async (currentPage: number, isInitialLoad: boolean = false) => {
    if (isLoading && !isInitialLoad) return;
    if (!hasMore && !isInitialLoad) return;

    setIsLoading(true);
    const path = GetPathString(Path);
    const response = await GetFilesName(path, currentPage, PageSize, false);

    setfileNames(prevNames =>
      currentPage === 1 ? response.data : [...(prevNames || []), ...response.data]
    );

    SetPath(path);
    setTotalCount(response.totalCount);
    setHasMore(response.data.length === PageSize);

    if (isInitialLoad && response.data.length === PageSize) {
      setPage(2);
    } else if (!isInitialLoad) {
      setPage(prevPage => prevPage + 1);
    }

    setIsLoading(false);
  };

  const handleScroll = useCallback(() => {
    if (fileListRef.current && !isLoading && hasMore) {
      const { scrollTop, scrollHeight, clientHeight } = fileListRef.current;

      if (scrollHeight - (scrollTop + clientHeight) < 100) {
        loadMoreData(page);
      }
    }
  }, [isLoading, hasMore, page, loadMoreData]);

  useEffect(() => {
    const fileList = fileListRef.current;
    if (fileList) {
      fileList.addEventListener('scroll', handleScroll);
      return () => {
        fileList.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  const handleFilesUpdated = () => {
    setPage(1);
    setfileNames(null);
    setHasMore(true);
    loadMoreData(1, true);
  };

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      const isInternalDrag = e.dataTransfer.types.includes('application/json'); 
        if (isInternalDrag) 
          return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    }, [Path]);
  
    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setIsDragging(false);
      }
    }, [Path]);
  
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
  
      const files = Array.from(e.dataTransfer.files);

      const selectedFiles: FileResult[] = Array.from(files).map((file) => ({
        name: file.name,
        size: file.size,
        file: file,
        mimeType: file.type || 'application/octet-stream',
      }));
      uploadFiles(GetPathString(Path), false, selectedFiles);
    }, [Path]);

    const handleFileMove = useCallback(async (sourcePath: string, sourceName: string, targetPath: string, targetName?: string) => {
      try {
        if (targetName) {
          setUnionNames([sourceName, targetName]);
          setUnionPath(sourcePath);
          setIsModalUnion(true);
        } else {
          await ChangeFilaeName(`${sourcePath}${sourceName}`, `${targetPath}${sourceName}`, false);
        }
        fileEventEmitter.emit(FileEvents.FILES_UPDATED);
      } catch (error) {
        console.error('Ошибка при перемещении файла:', error);
      }
    }, [Path]);

    const union = async () => {
      if(unionPath != null && unionNames != null && unionInput != null)
      {
        setIsModalUnion(false);
        await UnionFiles(unionPath, unionNames, unionInput, false)
        setUnionNames(null);
        setUnionPath(null);
        setUnionInput(null);
      }
    }




  const pressPath = (index: number) => {
    setPath(Path.slice(0, index + 1)); 
  };

  const pressDir = (name: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.ctrlKey) {
      if(longPress == null)
      {
        setLongPress([name]);
        return;
      }
      if (longPress.includes(name)) {
        const newArr = longPress.filter(i => i !== name);
        setLongPress(newArr);
      } 
      else 
        setLongPress([...longPress, name]);
    } 
    else {
      if(longPress != null)
      {
        if(isMobile)
        {
          if (longPress.includes(name)) {
            const newArr = longPress.filter(i => i !== name);
            setLongPress(newArr);
          } 
          else 
            setLongPress([...longPress, name]);
        }
        else
          setLongPress(null);

        return;
      }
      const extension = getExtension(name);
      if (extension == null) {
        setPath([...Path, name]);
      } 
      else if (['img', 'jpeg', 'jpg', 'png'].includes(extension.toLowerCase())) {
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
      else if(extension.toLocaleLowerCase() == 'pdf')
      {
        navigate('/pdf', { state: { path: GetPathString(Path) + name, isPublic: false} });
      }
    }
  };

  const handleMenuPress = (e: React.MouseEvent, name: string) => {
    const menuX =  e.clientX - 220;
    let menuY =  e.clientY + 20;
    if(window.innerHeight - e.clientY < 150)
    {
      if(getExtension(name) == null)
        menuY -= 150;
      else
        menuY -= 120;
    }

    setVisibleMenuId(name);
    setMenuPosition({ x: menuX, y: menuY });
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

  const toMobile = (file: string) =>{
    if(isMobile)
    {
      const maxLength = 10;
      if (file.length > maxLength) 
      {    
        let ext = getExtension(file)
        if(ext == null)
          ext = '';
        return file.slice(0, maxLength) + '...'+ext;  
      }
      else 
        return file;
    }
    else
    {
      return file;
    }
  }
  const handleDownload = async (fileName: string) => {
    if (downloadStates[fileName]?.loading) 
      return;
    if (getExtension(fileName) == null || getExtension(fileName) == "") 
      return;

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
    const [isDragOver, setIsDragOver] = useState(false);
    const currentPath = GetPathString(Path);
  
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      const isInternalDrag = e.dataTransfer.types.includes('application/json'); 
      if (!isInternalDrag) return;
      
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setIsDragOver(true);
    };
  
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      setIsDragOver(false);
    };
  
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, value: string, index: number) => {
      e.preventDefault();
      setIsDragOver(false);
      
      try {
        const data: DragData = JSON.parse(e.dataTransfer.getData('application/json'));
        
        if (data.path === currentPath && data.name === value) return;

        console.log(index)
        handleFileMove(data.path, data.name, `${GetPathString(Path.slice(0, index + 1))}/`);
      } catch (error) {
        console.error('Ошибка при обработке перетаскивания:', error);
      }
    };
  
    return (
      <div className="path-container">
        {Path.map((value, index) => (
          <div 
            key={index} 
            className="path-item-container"
            draggable={false}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, value, index)}
          >
            <button 
              onClick={() => pressPath(index)}
              className={`path-button ${isDragOver ? 'drag-over' : ''}`}
            >
              {toMobile(value)}
            </button>
            {index !== Path.length - 1 && <span className="path-separator"> / </span>}
          </div>
        ))}
      </div>
    );
  };

  const ListItem: React.FC<ListItemProps> = ({ name }) => {  
    const items = getExtension(name) ? 
      ['Переименовать', 'Удалить'] : 
      ['Переименовать', 'Удалить', 'Управление доступом'];


      const [isDragOver, setIsDragOver] = useState(false);
      const currentPath = GetPathString(Path);
  
      const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        if (longPress) return;
        
        const data: DragData = {
          path: currentPath,
          name: name,
        };
        
        e.dataTransfer.setData('application/json', JSON.stringify(data));
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.style.opacity = '0.4';
      
        const dragPreview = document.createElement('div');
        dragPreview.className = 'drag-preview';
        
        dragPreview.innerHTML = `
          <div class="drag-preview-content">
             <img src="${GetIconPath(name)}" alt="${name}" class="drag-icon"/>
            <span>${name}</span>
          </div>
        `;
        
        dragPreview.style.opacity = '1';
        dragPreview.style.position = 'absolute';
        dragPreview.style.left = '-9999px';
        document.body.appendChild(dragPreview);
        
        e.dataTransfer.setDragImage(dragPreview, 0, 40);
        
        setTimeout(() => document.body.removeChild(dragPreview), 0);
      };
  
      const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = '1';
      };
  
      const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        const isInternalDrag = e.dataTransfer.types.includes('application/json'); 
        if (!isInternalDrag) 
          return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
      };
  
      const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDragOver(false);
        }
      };
  
      const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        
        try {
          const data: DragData = JSON.parse(e.dataTransfer.getData('application/json'));
          
          if (data.path === currentPath && data.name === name) return;
  
          if (getExtension(name) === null) {
            handleFileMove(data.path, data.name, `${currentPath}${name}/`);
          } else {
            handleFileMove(data.path, data.name, currentPath, name);
          }
        } catch (error) {
          console.error('Ошибка при обработке перетаскивания:', error);
        }
      };
  
      if (!name || typeof name !== 'string') {
        return null;
      }

    return (
      <div 
        className={`list-item-wrapper ${isDragOver ? 'drag-over' : ''}`}
        draggable={!isMobile && !longPress}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div 
          className={`item-container ${longPress && longPress.includes(name) ? 'selected' : ''}`}
        >
          <button
            onClick={(e) => pressDir(name, e)}
            onContextMenu={(e) => {
              if(!isMobile)
              {
                e.preventDefault();
                handleMenuPress(e, name);
              }
              else{
                if(longPress == null)
                  setLongPress([name]);
                else
                  setLongPress([...longPress, name]);
                if ('vibrate' in navigator) 
                  navigator.vibrate(100);
              }
            }}
            className="item-button"
          >
            <GetIcon name={name} />
            <span className="item-text">{toMobile(name)}</span>
            
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
    <div 
      className="file-screen-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}>

      <ModalName
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSubmit={renameFile}
      />

      <ModalName
        modalVisible={isModalUnion}
        setModalVisible={setIsModalUnion}
        inputValue={unionInput}
        setInputValue={setUnionInput}
        handleSubmit={union}
      />

      <ImageModal
        modalVisible={openImage}
        setModalVisible={setOpenImage}
        images={imagesPath}
        currentIndex={index || 0}
      />

      {!longPress? (
        <div>
          <GetPath />
        </div>
      ): <div className="path-long-press-container"/>}

      <div className={`list-container ${longPress ? 'long-press-mode' : ''}${isDragging ? 'dragging' : ''}`}>
        <div 
          ref={fileListRef}
          className="file-list"
        >
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