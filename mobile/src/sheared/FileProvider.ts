
const getExtension = (filename : string) => {

    const lastDotIndex = filename.lastIndexOf('.');

    if (lastDotIndex > 0 && lastDotIndex < filename.length - 1) {
      return filename.slice(lastDotIndex + 1); 
    }
  
    return null; 
  };

export default getExtension