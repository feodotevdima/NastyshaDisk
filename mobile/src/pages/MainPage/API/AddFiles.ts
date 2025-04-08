import React, { useState } from 'react';
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ip, getToken } from "../../../shared/TokenProvider";
import axios from 'axios';
import { fileEventEmitter, FileEvents } from '../../../shared/UpdateFiles';

interface FileResult {
  name: string;
  size?: number;
  uri: string;
  mimeType?: string;
}

function AddFiles()
{
  const downloadFile = async ( Path : string | null, isPublic : boolean ) => {
    try
    {
      const token= await getToken();
      const selectedFiles = await selectFile();

      if (selectedFiles.length === 0)
      {
        return;
      }

      const formData = new FormData();
  
      selectedFiles.forEach((file) => {
        // @ts-ignore - React Native преобразует uri в нужный формат
        formData.append('files', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
        });
      });

      const response = await axios.post(Ip + ":7003/Files/upload?path="+Path+"&isPublic="+isPublic,
        formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': "Bearer " + token,
        },
      });  

      if (response.status == 200)
      {
        setTimeout(() => {
          fileEventEmitter.emit(FileEvents.FILES_UPDATED);
        }, 500);
      }
    } 
    catch (error) 
    {
      Alert.alert('Ошибка', 'Не удалось загрузить файлы');
    }
  }

  const selectFile = async (): Promise<FileResult[]> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',       
        multiple: true, 
        copyToCacheDirectory: true,  
      });
  
      if (!result.canceled && result.assets && result.assets.length > 0)
      {
        const selectedFiles = result.assets.map((file) => ({
          name: file.name,
          size: file.size,
          uri: file.uri,
          mimeType: file.mimeType,
        }));
  
        return selectedFiles;
      }
      return [];
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выбрать файлы');
      return [];
    }
  };

  return{downloadFile}
}
export const {downloadFile} = AddFiles();