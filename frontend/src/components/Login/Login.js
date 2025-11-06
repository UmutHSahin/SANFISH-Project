import React, {useState} from 'react';
import './Login.css';
import {ToastContainer} from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom';
import {handleError, handleSuccess} from '../../utils'

function Login() {
  const navigate = useNavigate();
  const [loginInfo, setLoginInfo] = useState({
    mail: '',  // ✅ 'mail' olarak değiştir
    password_hash: ''  // ✅ 'password_hash' olarak değiştir
  })

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    const copyLoginInfo = { ...loginInfo };
    copyLoginInfo[name] = value;
    setLoginInfo(copyLoginInfo);
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    const { mail, password_hash } = loginInfo;
    if (!mail || !password_hash) {
      return handleError('Email and password are required')
    }
    try {
      const url = `http://localhost:8080/auth/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginInfo)
      });
      const result = await response.json();
      const { success, message, jwtToken, name, error } = result;
      if (success) {
        handleSuccess(message);
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('loggedInUser', name);
        setTimeout(() => {
          navigate('/home')
        }, 1000)
      } else if (error) {
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
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor='mail'>Email</label>
          <input 
            onChange={handleChange}
            type='email'
            name='mail'
            id='mail'
            value={loginInfo.mail}
            placeholder='Enter your e-mail...'
            autoFocus
          />
        </div>
        <div>
          <label htmlFor='password_hash'>Password</label>
          <input 
            onChange={handleChange}
            type='password'
            name='password_hash'
            id='password_hash'
            value={loginInfo.password_hash}
            placeholder='Enter your password...'
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <ToastContainer/>
    </div>
  );
}

export default Login;