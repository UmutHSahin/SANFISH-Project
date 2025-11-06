import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function RefrshHandler({ setIsAuthenticated }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      setIsAuthenticated(true);
      // Eğer kullanıcı zaten login olduysa, login sayfasına gitmesine izin verme
      if (location.pathname === '/login' || location.pathname === '/' || location.pathname === '/signup') {
        navigate('/home', { replace: true });
      }
    } else {
      setIsAuthenticated(false);
      // Eğer token yoksa, korumalı sayfadaysa login'e at
      if (location.pathname !== '/login' && location.pathname !== '/signup') {
        navigate('/login', { replace: true });
      }
    }
  }, [location, navigate, setIsAuthenticated]);

  return null;
}

export default RefrshHandler;
