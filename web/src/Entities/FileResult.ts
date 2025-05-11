interface FileResult {
    name: string;
    size?: number;
    file: File;
    mimeType?: string;
  }

  export default FileResult;