import React, { useState } from 'react';
import './Login.css';
import { ToastContainer } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom';
import { handleError, handleSuccess } from '../../utils'

// ========================================
// GİRİŞ SAYFASI BİLEŞENİ (LOGIN COMPONENT)
// Kullanıcı email ve şifre ile giriş yapar
// Admin kullanıcılar admin paneline, diğerleri ana sayfaya yönlendirilir
// ========================================
function Login() {
  const navigate = useNavigate();

  // Giriş formu için state - email ve şifre bilgilerini tutar
  const [loginInfo, setLoginInfo] = useState({
    mail: '',
    password_hash: ''
  })

  // Form alanları değiştiğinde çağrılır
  // Her input değişikliğinde loginInfo state'ini günceller
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    const copyLoginInfo = { ...loginInfo };
    copyLoginInfo[name] = value;
    setLoginInfo(copyLoginInfo);
  }

  // Giriş formunu gönderme işlemi
  // Backend'e istek atar, başarılı olursa token ve kullanıcı bilgilerini kaydeder
  const handleLogin = async (e) => {
    e.preventDefault();
    const { mail, password_hash } = loginInfo;

    // Email ve şifre boş bırakılamaz kontrolü
    if (!mail || !password_hash) {
      return handleError('Email and password are required')
    }

    try {
      // Backend'e giriş isteği gönder
      const url = `http://localhost:5001/auth/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginInfo)
      });

      const result = await response.json();
      const { success, message, jwtToken, name, userId, partnerId, role, error } = result;

      if (success) {
        handleSuccess(message);
        // Kullanıcı bilgilerini localStorage'a kaydet
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('loggedInUser', name);
        localStorage.setItem('userId', userId);
        localStorage.setItem('partnerId', partnerId || '');
        localStorage.setItem('userRole', role);

        setTimeout(() => {
          // Admin kullanıcıları admin paneline, developer kullanıcıları developer dashboard'a yönlendir
          if (role === 'admin') {
            navigate('/admin');
          } else if (role === 'developer') {
            navigate('/developer');
          } else {
            navigate('/home');
          }
        }, 1000)
      } else if (error) {
        // Validasyon hatası varsa detayı göster
        const details = error?.details[0].message;
        handleError(details);
      } else if (!success) {
        handleError(message);
      }
      console.log(result);
    } catch (err) {
      handleError(err);
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-header">
          <div className="logo-square">
            <span className="logo-text-small">AquaData</span>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor='mail'>Email Address</label>
            <input
              onChange={handleChange}
              type='email'
              name='mail'
              id='mail'
              value={loginInfo.mail}
              placeholder='name@company.com'
              autoFocus
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor='password_hash'>Password</label>
            <input
              onChange={handleChange}
              type='password'
              name='password_hash'
              id='password_hash'
              value={loginInfo.password_hash}
              placeholder='••••••••'
              className="form-input"
            />
          </div>

          <button type="submit" className="btn-login">
            Sign In
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Login;