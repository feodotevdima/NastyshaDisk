import { useState, useEffect, useRef } from 'react';
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { useLocation, useNavigate } from 'react-router-dom';
import GetPdf from './API/GetPdf';
import './Pdf.css';
import AddCurentPage from './API/AddCurentPage';
import Spinner from '../../Wigetes/Spinner/Spinner';

export const PDFViewer = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [initialPage, setInitialPage] = useState(0); // Теперь это состояние
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const viewerRef = useRef<any>(null);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const location = useLocation();
  const { path, isPublic } = location.state || {};

  const loadPdf = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!path) {
        throw new Error('Не указан путь к файлу');
      }
      
      const { blob, currentPage } = await GetPdf(isPublic, path);
      
      if (currentPage !== null) {
        setInitialPage(currentPage); // Обновляем состояние
      }

      if (!blob) {
        throw new Error('Не удалось загрузить PDF');
      }
      
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
      
      setPdfUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error('PDF load error:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке PDF');
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (path) {
      loadPdf();
    } else {
      setError('Не указан путь к файлу');
      navigate(-1);
    }

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [path, isPublic]);

  const handlePageChange = (e: { currentPage: number }) => {
    if (e.currentPage === 0) return;
    AddCurentPage(path, false, e.currentPage);
  };
  
  if (error) {
    return (
      <div className="pdf-error">
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Вернуться назад</button>
      </div>
    );
  }

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="custom-viewer-container">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        {pdfUrl && (
          <Viewer
            key={`${pdfUrl}-${initialPage}`} // Принудительный ререндер при изменении
            fileUrl={pdfUrl}
            plugins={[defaultLayoutPluginInstance]}
            ref={viewerRef}
            initialPage={initialPage}
            defaultScale={SpecialZoomLevel.PageFit}
            onPageChange={handlePageChange}
          />
        )}
      </Worker>
    </div>
  );
};

export default PDFViewer;