import React from 'react';
import {Image, StyleSheet} from 'react-native';
import getExtension from '../../../shared/FileProvider';


interface GetIconProps {
    name: string;
  }


const GetIcon: React.FC<GetIconProps>  = ({name}) => {
    const extension = getExtension(name);
      if(extension == null)
        return(
          <Image
            source={require('../../../../icons/folder.png')} 
            style={styles.image}
            resizeMode="contain"
          />)
      else if(extension.toLowerCase() == "img" || extension.toLowerCase() == "jpeg" || extension.toLowerCase() == "jpg")
        return(
          <Image
            source={require('../../../../icons/image.png')} 
            style={styles.image}
            resizeMode="contain"
          />)
      else if(extension.toLowerCase() == "pdf")
        return(
          <Image
            source={require('../../../../icons/pdf.png')} 
            style={styles.image}
            resizeMode="contain"
          />)
      else if(extension.toLowerCase() == "xls" || extension.toLowerCase() == "xlsx")
        return(
          <Image
            source={require('../../../../icons/excel.png')} 
            style={styles.image}
            resizeMode="contain"
          />)
      else if(extension.toLowerCase() == "docx")
        return(
          <Image
            source={require('../../../../icons/word.png')} 
            style={styles.image}
            resizeMode="contain"
          />)
      else if(extension.toLowerCase() == "mp4" || extension.toLowerCase() == "avi" || extension.toLowerCase() == "mov")
        return(
          <Image
            source={require('../../../../icons/video.png')} 
            style={styles.image}
            resizeMode="contain"
          />)
      else if(extension.toLowerCase() == "txt")
        return(
          <Image
            source={require('../../../../icons/txt.png')} 
            style={styles.image}
            resizeMode="contain"
          />)
      else if(extension.toLowerCase() == "pptx")
        return(
          <Image
            source={require('../../../../icons/powerpoint.png')} 
            style={styles.image}
            resizeMode="contain"
          />)
      else if(extension.toLowerCase() == "mp3" || extension.toLowerCase() == "wav")
        return(
          <Image
            source={require('../../../../icons/mp3.png')} 
            style={styles.image}
            resizeMode="contain"
          />)
      else
        return(
          <Image
            source={require('../../../../icons/file.png')} 
            style={styles.image}
            resizeMode="contain"
          />)
  }

  export default GetIcon;

  
  const styles = StyleSheet.create({
    image: {
      width: 25,
      height: 25,
      marginLeft: 12,
    },
  });