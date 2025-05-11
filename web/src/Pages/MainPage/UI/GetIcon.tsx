import React from 'react';
import getExtension from '../../../Shered/FileProvider';

interface GetIconProps {
  name: string;
}

const GetIconPath = (name: string) => {
  const ext = getExtension(name);

  if (!ext) return '../../../../../icons/folder.png';
    
  const lowerExt = ext.toLowerCase();
    
  const iconMap: Record<string, string> = {
    'img': '/icons/image.png',
    'jpeg': '/icons/image.png',
    'jpg': '/icons/image.png',
    'png': '/icons/image.png',
    'pdf': '/icons/pdf.png',
    'xls': '/icons/excel.png',
    'xlsx': '/icons/excel.png',
    'docx': '/icons/word.png',
    'mp4': '/icons/video.png',
    'avi': '/icons/video.png',
    'mov': '/icons/video.png',
    'txt': '/icons/txt.png',
    'pptx': '/icons/powerpoint.png',
    'mp3': '/icons/mp3.png',
    'wav': '/icons/mp3.png',
  };
  return iconMap[lowerExt] || '/icons/file.png';
};


const GetIcon: React.FC<GetIconProps> = ({ name }) => {
  const extension = getExtension(name);
  const iconStyle = {
    width: '25px',
    height: '25px',
    marginLeft: '12px',
  };

  return (
    <img 
      src={GetIconPath(name)} 
      style={iconStyle}
    />
  );
};

export { GetIcon, GetIconPath };
