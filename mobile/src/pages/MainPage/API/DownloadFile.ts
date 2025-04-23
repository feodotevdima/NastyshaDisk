import * as FileSystem from 'expo-file-system';
import { Ip, getToken } from "../../../sheared/TokenProvider";
import { ToastAndroid, Platform } from 'react-native';

const DownloadFile = async (
  path: string, 
  isPublic: boolean,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const token = await getToken();
    const url = `${Ip}:7003/Files/download?isPublic=${isPublic}&path=${encodeURIComponent(path)}`;
    const filename = path.split('/').pop() || 'file';
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

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
          ? Math.round((totalBytesWritten / totalBytesExpectedToWrite) * 100)
          : 0;
        onProgress?.(progress);
      }
    );

    const result = await downloadResumable.downloadAsync();
    
    if (!result) {
      throw new Error('Download failed: no result');
    }

    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravityAndOffset(
        `Файл "${filename}" загружен`,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        0,
        50
      );
    }

    return result.uri;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

export default DownloadFile;