import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { useState, useEffect } from 'react';
import Login from './components/Login/Login';
import Home from './components/Home/Home.js';
import CreateFishDataForm from './components/CreateFish/createFishDataForm.js';
import AdminPanel from './components/AdminPanel/AdminPanel';
import DeveloperDashboard from './components/Developer/DeveloperDashboard';
import RefrshHandler from './RefrshHandler';

// ========================================
// ANA UYGULAMA BİLEŞENİ (APP COMPONENT)
// Tüm sayfa rotalarını ve yetkilendirmeyi yönetir
// ========================================
function App() {
  // Kullanıcının giriş yapıp yapmadığını kontrol et
  // Token varsa giriş yapmış demektir
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // ========================================
  // ÖZEL ROTA KORUMASI (PRIVATE ROUTE)
  // Sadece giriş yapmış kullanıcılar erişebilir
  // Token yoksa login sayfasına yönlendirir
  // ========================================
  const PrivateRoute = ({ element, allowedRoles }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = localStorage.getItem('userRole');
      if (!allowedRoles.includes(userRole)) {
        // Rol yetkisi yoksa anasayfaya (veya uygun bir yere) yönlendir
        // Eğer kullanıcı 'admin' ise ve developer sayfasına girmeye çalışıyorsa izin verilebilir (opsiyonel)
        // Ancak kullanıcı "sadece kendine ayrılan yer" dediği için strict yapıyoruz.
        return <Navigate to="/home" replace />;
      }
    }

    return element;
  };

  const [announcement, setAnnouncement] = useState({ message: '', is_active: false });

  // Fetch announcement on load (admin-only)
  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');

      // Only fetch if user is admin (endpoint is protected)
      if (token && userRole === 'admin') {
        try {
          const res = await fetch('http://localhost:5001/api/admin/settings', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data.announcement) {
              setAnnouncement(data.data.announcement);
            }
          }
        } catch (error) {
          // Silently handle errors
        }
      }
    };

    if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated]);

  return (
    <div className="App">
      {/* Announcement Banner */}
      {announcement.is_active && announcement.message && (
        <div className="announcement-banner">
          📢 {announcement.message}
        </div>
      )}

      {/* Sayfa yenilendiğinde token kontrolü yapan bileşen */}
      <RefrshHandler setIsAuthenticated={setIsAuthenticated} />

      {/* SAYFA ROTALARI */}
      <Routes>
        {/* Ana sayfa: login'e yönlendir */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Giriş sayfası - Herkese açık */}
        <Route path="/login" element={<Login />} />

        {/* 🔒 KORUNAN SAYFALAR - Sadece giriş yapmış kullanıcılar */}
        <Route path="/home" element={<PrivateRoute element={<Home />} allowedRoles={['user', 'admin', 'developer', 'partner']} />} />
        <Route path="/fish-data-create" element={<PrivateRoute element={<CreateFishDataForm />} allowedRoles={['user', 'admin', 'partner']} />} />

        {/* 🛡️ ADMİN PANELİ - Sadece admin kullanıcılar erişebilir */}
        <Route path="/admin" element={<PrivateRoute element={<AdminPanel />} allowedRoles={['admin']} />} />

        {/* 🔧 DEVELOPER DASHBOARD - Sadece Developer kullanıcılar için */}
        <Route path="/developer" element={<PrivateRoute element={<DeveloperDashboard />} allowedRoles={['developer']} />} />

      </Routes>
    </div>
  );
}

export default App;
