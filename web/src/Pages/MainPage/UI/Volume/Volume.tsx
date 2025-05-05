import React, { useEffect, useState } from 'react';
import GetVolume from '../../API/GetVolume';
import './Volume.css';

const VolumeLine = () => {
  const [usedVolume, setUsedVolume] = useState<number>(0);
  const [freeVolume, setFreeVolume] = useState<number>(0);
  const [usedWidth, setUsedWidth] = useState<string>('0%');

  useEffect(() => {
    const fetchVolumeData = async () => {
      try {
        const response = await GetVolume();
        const free = response.free / 10 ** 9;
        const used = response.used / 10 ** 9;
        
        setFreeVolume(free);
        setUsedVolume(used);
        
        const total = used + free;
        const widthPercentage = total > 0 ? (used / total) * 100 : 0;
        setUsedWidth(`${widthPercentage.toFixed(2)}%`);
      } catch (error) {
        console.error('Error fetching volume data:', error);
      }
    };

    fetchVolumeData();
  }, []);

  return (
    <div className="volume-container">
      <div className="volume-info">
        <span className="volume-text volume-title">Доступно: {freeVolume.toFixed(2)} ГБ</span>
      </div>
      
      <div className="volume-line">
        <div 
          className="volume-progress" 
          style={{
            width: usedWidth,
            backgroundColor: 'rgba(243, 61, 130, 0.5)'
          }}
        />
      </div>
      
      <div className="volume-info">
        <span className="volume-text">
          Использовано: {usedVolume.toFixed(2)}ГБ/{(usedVolume + freeVolume).toFixed(2)}ГБ
        </span>
      </div>
    </div>
  );
};

export default VolumeLine;