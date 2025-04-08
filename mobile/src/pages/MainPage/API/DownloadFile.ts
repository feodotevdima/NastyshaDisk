import * as FileSystem from 'expo-file-system';
import { Ip, getToken } from "../../../shared/TokenProvider";

const DownloadFile = async (path: string, isPublic: boolean): Promise<string> => {
  try {
    const token = await getToken();
    const url = `${Ip}:7003/Files/download?isPublic=${isPublic}&path=${encodeURIComponent(path)}`;
    const filename = path.split('/').pop() || 'file';
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    console.log(`Starting download to: ${fileUri}`);

    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      fileUri,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': '*/*'
        }
      },
      ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
        const progress = totalBytesExpectedToWrite > 0 
          ? (totalBytesWritten / totalBytesExpectedToWrite) * 100 
          : 0;
        console.log(`Download progress: ${progress.toFixed(1)}%`);
      }
    );

    const result = await downloadResumable.downloadAsync();
    
    if (!result) {
      throw new Error('Download failed: no result');
    }

    // Безопасная проверка файла
    const fileInfo = await FileSystem.getInfoAsync(result.uri);
    
    if (!fileInfo.exists) {
      throw new Error('File was not saved correctly');
    }

    if ('size' in fileInfo) {
      console.log('Download complete. File size:', fileInfo.size, 'bytes');
    } else {
      console.log('Download complete. Size information unavailable');
    }
    
    return result.uri;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

export default DownloadFile;