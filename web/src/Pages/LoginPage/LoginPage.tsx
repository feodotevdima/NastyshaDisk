import React, { useState } from 'react';
import './Login.css'; 
import { getToken, Login } from '../../Shered/TokenProvider';
import Spinner from '../../Wigetes/Spinner/Spinner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Ошибка: Пожалуйста, заполните все поля');
      return;
    }
    
    const pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    // if(!email.match(pattern)) {е
    //     alert('Ошибка: Пожалуйста, введите корректный email');
    //     return;
    // }
        
    setLoading(true);
    const response: number = await Login(email, password);
    if(response === 200) {
    //   await checkAuth();
    }

    setLoading(false);
    if((response === 400) || (response === 401)) {
      alert("Неверный логин или пароль");
    } else if(response !== 200) {
      alert("Ошибка сервера");
    }
    return response;
  };

  if (loading) {
    return (
      <Spinner />
    );
  }

  return (
    <div className="container">
      <h1 className="title">Вход в приложение</h1>

      <input
        className="input"
        type="email"
        placeholder="Введите вашу почту"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoCapitalize="off"
      />

      <input
        className="input"
        type="password"
        placeholder="Введите ваш пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        className="button"
      >
        Вход
      </button>
    </div>
  );
};

export default LoginPage;