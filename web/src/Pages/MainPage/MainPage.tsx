import React, { useRef, useState, useEffect } from 'react';
import FileScreen from './UI/FileScreen/FileScreen';
import { downloadFile } from './API/AddFiles';
import DelFiles from './API/DelFiles';
import GetPathString from '../../Shered/GetPathString';
import ModalName from './UI/ModalName/ModalName';
import NewDir from './API/NewDir';
import VolumeLine from './UI/Volume/Volume';
import { Logout } from '../../Shered/TokenProvider';
import './MainPage.css';

const MainPage = () => {
  const [Path, SetPath] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [longPress, setLongPress] = useState<string[] | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('resize', checkMobileView);
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

  const handleDownload = () => {
    setShowAddMenu(false);
    downloadFile(Path, false);
  };

  const DeleteFiles = () => {
    if (longPress && Path) {
      const paths = longPress.map(file => Path + file);
      DelFiles(paths, false);
      setLongPress(null);
    }
  };

  const logout = async () => {
    await Logout();
  };

  const handleSubmitCreateDir = () => {
    if (!inputValue || inputValue.includes('.')) return;
    if (Path) {
      NewDir(Path + inputValue, false);
      setModalVisible(false);
      setInputValue('');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleAddMenu = () => {
    setShowAddMenu(!showAddMenu);
  };

  return (
    <div className="main-container">
      {isMobileView && (
        <button
          onClick={toggleMobileMenu}
          className="mobile-menu-button"
        >
          <div className={`burger-icon ${isMobileMenuOpen ? 'open' : ''}`}>
            <span className="burger-line"></span>
            <span className="burger-line"></span>
            <span className="burger-line"></span>
          </div>
        </button>
      )}

      {longPress ? 
        <button onClick={DeleteFiles} className="action-button">
          <img src="/icons/del.png" className="action-icon-del" alt="Delete" />
        </button> :
        <button onClick={toggleAddMenu} className="action-button">
          <img src="/icons/plus.png" className="action-icon" alt="Add" />
        </button>
      }

      {showAddMenu && (
        <div ref={addMenuRef} className="add-menu">
          <button className="add-menu-item" onClick={handleDownload}>
            <span className="add-menu-text">Загрузить файл</span>
          </button>
          <button 
            className="add-menu-item" 
            onClick={() => {
              setShowAddMenu(false);
              setModalVisible(true);
            }}
          >
            <span className="add-menu-text">Создать папку</span>
          </button>
        </div>
      )}

      {(showAddMenu || (isMobileView && isMobileMenuOpen)) && (
        <div className="overlay" onClick={() => {
          setShowAddMenu(false);
          setIsMobileMenuOpen(false);
        }}></div>
      )}

      <ModalName 
        modalVisible={modalVisible} 
        setModalVisible={setModalVisible} 
        inputValue={inputValue} 
        setInputValue={setInputValue} 
        handleSubmit={handleSubmitCreateDir} 
      />

      <div className="content-wrapper">
        {(!isMobileView || isMobileMenuOpen) && (
          <div className={`side-panel ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <VolumeLine />
            <button className="logout-button" onClick={logout}>
              <span className="logout-text">Выйти</span>
            </button>
          </div>
        )}

        <div className="content">
          <FileScreen longPress={longPress} setLongPress={setLongPress} SetPath={SetPath} />
        </div>
      </div>
    </div>
  );
};

export default MainPage;