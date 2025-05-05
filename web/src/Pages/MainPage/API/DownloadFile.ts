import { getToken } from "../../../Shered/TokenProvider";

const DownloadFile = async (
  path: string, 
  isPublic: boolean,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const token = await getToken();
    const url = `$http://localhost:7003/Files/download?isPublic=${isPublic}&path=${encodeURIComponent(path)}`;
    const filename = path.split('/').pop() || 'file';

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': '*/*'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentLength = response.headers.get('Content-Length');
    const totalBytes = contentLength ? parseInt(contentLength) : 0;
    const reader = response.body?.getReader();
    
    if (!reader) {
      throw new Error('Failed to get reader from response');
    }

    let receivedBytes = 0;
    const chunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      chunks.push(value);
      receivedBytes += value.length;
      
      if (onProgress && totalBytes > 0) {
        const progress = Math.round((receivedBytes / totalBytes) * 100);
        onProgress(progress);
      }
    }

    const blob = new Blob(chunks);
    const downloadUrl = window.URL.createObjectURL(blob);
    
    // Создаем временную ссылку для скачивания
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Очищаем
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);

    // Показываем уведомление (можно заменить на более красивый toast)
    console.log(`Файл "${filename}" загружен`);
    // Или использовать alert:
    // alert(`Файл "${filename}" успешно загружен`);

    return downloadUrl;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

export default DownloadFile;