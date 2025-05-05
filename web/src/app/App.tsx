import React, {useEffect, useState} from 'react';
import './App.css';
import LoginPage from '../Pages/LoginPage/LoginPage';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getToken } from '../Shered/TokenProvider';
import Spinner from '../Wigetes/Spinner/Spinner';
import MainPage from '../Pages/MainPage/MainPage';

function App() {
  const [access, setAccess] = useState<string | null | undefined>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try{
      const token = await getToken()
      setAccess(token)
    }
    finally{
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Spinner />
    );
  }

  else if(!loading && access == null)
  return (
      <div className='app'>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      </div>
  );

  else if(!loading && access != null)
    return (
        <div className='app'>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainPage />} />
            {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
          </Routes>
        </BrowserRouter>
        </div>
    );

  return (<div></div>)
}

export default App;
