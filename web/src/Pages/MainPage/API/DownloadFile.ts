import { Ip, getToken } from "../../../Shered/TokenProvider";

const DownloadFile = async (
  path: string, 
  isPublic: boolean,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const token = await getToken();
    const url = Ip + ":7003/Files/download?isPublic="+isPublic+"&path="+path;
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
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);

    console.log(`Файл "${filename}" загружен`);

    return downloadUrl;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

export default DownloadFile;