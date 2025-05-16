import React from 'react';
import axios from 'axios';
import { Ip, getToken} from '../../../Shered/TokenProvider';
import { FileEvents, fileEventEmitter } from '../../../Shered/UpdateFiles';
import FileResult from '../../../Entities/FileResult';

function AddFiles() {
  const downloadFile = async (Path: string | null, isPublic: boolean) => {
      const selectedFiles = await selectFile();
      uploadFiles(Path, isPublic, selectedFiles)
  };

  const uploadFiles = async (Path: string | null, isPublic: boolean, selectedFiles: FileResult[]) => {
    try {
      const token = await getToken();

      if (selectedFiles.length === 0) {
        return;
      }

      const formData = new FormData();

      selectedFiles.forEach((file) => {
        formData.append('files', file.file, file.name);
      });

      const response = await axios.post(
        Ip + ":7003/Files/upload?path=" + Path + "&isPublic=" + isPublic,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': "Bearer " + token,
          },
        }
      );

      if (response.status == 200) {
        fileEventEmitter.emit(FileEvents.FILES_UPDATED);
      }
    } catch (error) {
      alert('Ошибка: Не удалось загрузить файлы');
    }
  }

  const selectFile = (): Promise<FileResult[]> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.onchange = (e: Event) => {
        const files = (e.target as HTMLInputElement).files;
        if (!files || files.length === 0) {
          resolve([]);
          return;
        }

        const selectedFiles: FileResult[] = Array.from(files).map((file) => ({
          name: file.name,
          size: file.size,
          file: file,
          mimeType: file.type || 'application/octet-stream',
        }));

        resolve(selectedFiles);
      };
      input.click();
    });
  };

  return { downloadFile, uploadFiles };
}

export const { downloadFile, uploadFiles } = AddFiles();