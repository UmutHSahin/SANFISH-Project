import React, { useEffect, useState } from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import CreateSpeciesForm from '../CreateSpecies/createSpeciesForm';
import CreateFishDataForm from '../CreateFish/createFishDataForm';
import AnalysisSection from '../Analysis/AnalysisSection';
import ConfirmModal from '../shared/ConfirmModal';
import SettingsSection from './Settings/SettingsSection';

function Home() {
  const [loggedInUser, setLoggedInUser] = useState('');
  const [userRole, setUserRole] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard'); // Aktif sayfa bölümünü tutar: dashboard, addFish veya viewFish olabilir
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobil cihazlarda yan menünün açık/kapalı durumunu kontrol eder
  const navigate = useNavigate();
  // Dark mode state initialization
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    // Apply theme class to document element
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  useEffect(() => {
    setLoggedInUser(localStorage.getItem('loggedInUser'));

    setLoggedInUser(localStorage.getItem('loggedInUser'));
    const role = localStorage.getItem('userRole');
    setUserRole(role);

    // Admin kullanıcıları otomatik olarak admin paneline yönlendir
    // Normal kullanıcılar bu sayfada kalır, adminler /admin sayfasına gider
    // const userRole = localStorage.getItem('userRole');
    if (role === 'admin') {
      toast.info('Admin users should use the admin panel');
      navigate('/admin');
    }
  }, [navigate]);

  const handleSuccess = () => {
    toast.success("Logout successful!");
  };

  const handleLogout = (e) => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    handleSuccess('User Loggedout');
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  // Yan menüyü açıp kapatma fonksiyonu (mobil için)
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Navigasyon butonuna tıklandığında çağrılır
  // Aktif bölümü değiştirir ve mobilde yan menüyü kapatır
  const handleNavClick = (section) => {
    setActiveSection(section);
    setSidebarOpen(false); // Mobil cihazlarda navigasyon sonrası yan menüyü kapat
  };

  return (
    <div className="home-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
      {/* Mobil Overlay - Yan menü açıkken arka planı karartır ve tıklandığında menüyü kapatır */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      {/* Sol Yan Menü - Navigasyon Linkleri */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-square">
              <span className="logo-text-small">AquaData</span>
            </div>
            <div className="logo-content">
              <h2 className="logo-title">AquaData</h2>
              <p className="dashboard-subtitle">Partner Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('dashboard')}
          >
            <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
              <rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
              <rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
              <rect x="13" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${activeSection === 'addFish' ? 'active' : ''}`}
            onClick={() => handleNavClick('addFish')}
          >
            <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
              <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Submit Data</span>
          </button>


          <button
            className={`nav-item ${activeSection === 'viewFish' ? 'active' : ''}`}
            onClick={() => handleNavClick('viewFish')}
          >
            <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
              <line x1="8" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="15" x2="13" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>My Submissions</span>
          </button>

          <button
            className={`nav-item ${activeSection === 'species' ? 'active' : ''}`}
            onClick={() => handleNavClick('species')}
          >
            <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6.5 12C5.5 12 5 10 5 8.5C5 7 6 6 7 6C8 6 9 7 9 8.5C9 10 8.5 12 7.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M17.5 12C18.5 12 19 10 19 8.5C19 7 18 6 17 6C16 6 15 7 15 8.5C15 10 15.5 12 16.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <ellipse cx="12" cy="15" rx="4" ry="3" stroke="currentColor" strokeWidth="2" />
              <line x1="12" y1="6" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span>Fish Data</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button
            className={`nav-item footer-item ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => handleNavClick('settings')}
            title="Profile Settings"
          >
            <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              <path d="M12 1v3m0 14v3M21 12h-3M6 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M18.364 5.636l-2.121 2.121m-8.486 8.486l-2.121 2.121m12.728 0l-2.121-2.121m-8.486-8.486l-2.121-2.121" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Profile Settings</span>
          </button>
          <button className="nav-item footer-item logout-item" onClick={handleLogout}>
            <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="content-header">
          {/* Mobil Menü Butonu - Hamburger ikonu */}
          <button className="mobile-menu-btn" onClick={toggleSidebar}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>

          <div className="header-content">
            <h1>
              {activeSection === 'dashboard' && 'Dashboard'}
              {activeSection === 'addFish' && 'Submit Fish Data'}
              {activeSection === 'viewFish' && 'My Submissions'}
              {activeSection === 'species' && 'Fish Data'}
              {activeSection === 'settings' && 'Profile Settings'}
            </h1>
          </div>

          {/* Kullanıcı Bilgileri Bölümü - Bildirimler ve profil */}
          <div className="header-user-section">
            <button className="notification-btn" onClick={toggleTheme} title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} style={{ marginRight: '8px' }}>
              {darkMode ? (
                // Sun Icon
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                // Moon Icon
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
            <button className="notification-btn" title="Notifications">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>

            <div className="user-info-display">
              <div className="user-avatar">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="user-text-info">
                <div className="user-name">{loggedInUser || 'User'}</div>
                <div className="user-role">
                  {localStorage.getItem('userRole') === 'partner' ? 'Marine Biologist' :
                    localStorage.getItem('userRole') === 'admin' ? 'Administrator' : 'Developer'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="content-body">
          {activeSection === 'dashboard' && <DashboardSection />}
          {activeSection === 'addFish' && <AddFishSection />}
          {activeSection === 'viewFish' && <ViewFishSection />}
          {activeSection === 'species' && <SpeciesSection />}
          {activeSection === 'settings' && <SettingsSection />}
        </div>
      </main>
    </div>
  );
}

// ========================================
// DASHBOARD BÖLÜMÜ
// Ana sayfa içeriği - Harita ve son eklenen balıklar
// ========================================
function DashboardSection() {
  const [fishData, setFishData] = useState([]);
  const [allFishData, setAllFishData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    name: '',
    role: ''
  });

  useEffect(() => {
    // Kullanıcı bilgilerini localStorage'dan al
    const loggedInUser = localStorage.getItem('loggedInUser');
    const userRole = localStorage.getItem('userRole');
    setUserInfo({
      name: loggedInUser || 'User',
      role: userRole || 'partner'
    });

    // Kullanıcının balık verilerini konum bilgileriyle birlikte getir
    fetchFishData();
  }, []);

  const fetchFishData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/fish-data', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        // Tüm balıkları tarihe göre sırala (en yeni en üstte)
        const sortedFish = data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Tüm balıkları liste için sakla
        setAllFishData(sortedFish);

        // Sadece geçerli koordinatları olan balıkları harita için filtrele
        const fishWithCoords = sortedFish.filter(fish =>
          fish.location?.coordinates?.latitude &&
          fish.location?.coordinates?.longitude
        );

        setFishData(fishWithCoords);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching fish data:', error);
      setLoading(false);
    }
  };

  // Rol adını kullanıcı dostu şekilde göster
  const getRoleDisplay = (role) => {
    const roleMap = {
      'partner': 'Marine Biologist',
      'developer': 'Developer',
      'admin': 'Administrator'
    };
    return roleMap[role] || 'Partner';
  };

  const recentFish = allFishData.slice(0, 5); // Son eklenen 5 balığı al

  return (
    <div className="new-dashboard">
      {/* Harita Bölümü - Balık konumlarını gösterir */}
      <div className="dashboard-map-section">
        {loading ? (
          <div className="map-loading">
            <div className="loading-spinner">🐟</div>
            <p>Harita yükleniyor...</p>
          </div>
        ) : (
          <FishMap fishData={fishData} />
        )}
      </div>

      {/* Son Eklenen Balık Verileri Bölümü */}
      <div className="recently-added-section">
        <h2 className="section-title">Recently Added Fish Data</h2>

        {recentFish.length === 0 ? (
          <div className="no-recent-fish">
            <p>No fish data added yet</p>
          </div>
        ) : (
          <div className="fish-cards-grid">
            {recentFish.map((fish, index) => (
              <div key={fish._id || index} className="fish-card">
                <div className="fish-card-header">
                  <h3 className="fish-card-title">{fish.fish_name || 'Unnamed Fish'}</h3>
                </div>

                <div className="fish-card-body">
                  <p className="fish-card-label">common name</p>
                  <p className="fish-card-info">{fish.species_id?.common_name || fish.common_name || 'N/A'}</p>
                  <p className="fish-card-label">location</p>
                  <p className="fish-card-info">{fish.location?.location_name || fish.location?.country || 'N/A'}</p>
                  <p className="fish-card-date">catch date: {new Date(fish.catch_date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                </div>

                <div className="fish-card-footer">
                  <span className="fish-card-species">{fish.species_id?.common_name || fish.species_id?.scientific_name || 'Unknown species'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ========================================
// FISH MAP COMPONENT
// ========================================
function FishMap({ fishData }) {
  const mapInstanceRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const [mapReady, setMapReady] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const initMap = () => {
      if (!isMounted) return;

      // Only load Leaflet if not already loaded
      if (!window.L) {
        // Import Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          link.id = 'leaflet-css';
          document.head.appendChild(link);
        }

        // Import Leaflet JS
        if (!document.getElementById('leaflet-js')) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
          script.crossOrigin = '';
          script.id = 'leaflet-js';
          script.async = true;

          script.onload = () => {
            if (isMounted) {
              setTimeout(() => initializeMap(), 100);
            }
          };

          document.head.appendChild(script);
        }
      } else {
        // Leaflet already loaded
        setTimeout(() => initializeMap(), 100);
      }
    };

    const initializeMap = () => {
      if (!isMounted) return;

      const L = window.L;
      if (!L) return;

      const mapContainer = document.getElementById('fish-map');
      if (!mapContainer) return;

      try {
        // Remove existing map instance if it exists
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.off();
            mapInstanceRef.current.remove();
          } catch (e) {
            console.warn('Error removing old map:', e);
          }
          mapInstanceRef.current = null;
        }

        // Clear container and reset Leaflet's internal ID
        mapContainer.innerHTML = '';
        if (mapContainer._leaflet_id) {
          delete mapContainer._leaflet_id;
        }

        // Initialize new map with error handling
        const map = L.map('fish-map', {
          zoomControl: true,
          attributionControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          touchZoom: true
        }).setView([20, 0], 2);

        mapInstanceRef.current = map;

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          minZoom: 1
        }).addTo(map);

        // Custom fish icon
        const fishIcon = L.divIcon({
          html: '<div style="background: #3b82f6; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">🐟</div>',
          className: 'custom-fish-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        });

        // Add markers for each fish
        const bounds = [];
        fishData.forEach((fish) => {
          if (fish.location?.coordinates?.latitude && fish.location?.coordinates?.longitude) {
            const lat = parseFloat(fish.location.coordinates.latitude);
            const lng = parseFloat(fish.location.coordinates.longitude);

            if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
              try {
                const marker = L.marker([lat, lng], { icon: fishIcon }).addTo(map);
                bounds.push([lat, lng]);

                // Create popup content
                const popupContent = `
                  <div style="padding: 8px; min-width: 200px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
                      ${fish.fish_name || 'Unnamed Fish'}
                    </h3>
                    <p style="margin: 4px 0; font-size: 14px; color: #6b7280;">
                      <strong>Species:</strong> ${fish.species_id?.scientific_name || 'Unknown'}
                    </p>
                    <p style="margin: 4px 0; font-size: 14px; color: #6b7280;">
                      <strong>Catch Date:</strong> ${new Date(fish.catch_date).toLocaleDateString()}
                    </p>
                    <button 
                      onclick="alert('Fish details page coming soon!')"
                      style="margin-top: 12px; width: 100%; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;"
                    >
                      See More
                    </button>
                  </div>
                `;

                marker.bindPopup(popupContent);
              } catch (markerError) {
                console.warn('Error creating marker:', markerError);
              }
            }
          }
        });

        // Fit bounds to show all markers if there are any
        if (bounds.length > 0) {
          try {
            map.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 10,
              animate: false // Disable animation to prevent transition errors
            });
          } catch (boundsError) {
            console.warn('Error fitting bounds:', boundsError);
          }
        }

        // Force map to invalidate size after a short delay
        setTimeout(() => {
          if (mapInstanceRef.current && isMounted) {
            try {
              mapInstanceRef.current.invalidateSize();
            } catch (e) {
              console.warn('Error invalidating map size:', e);
            }
          }
        }, 200);

        setMapReady(true);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      // Cleanup map instance when component unmounts
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn('Error during cleanup:', e);
        }
        mapInstanceRef.current = null;
      }
    };
  }, [fishData]);

  return (
    <div className="fish-map-container" ref={containerRef}>
      {fishData.length === 0 ? (
        <div className="map-placeholder">
          <div className="map-info">
            <h3>🗺️ No Fish Locations Yet</h3>
            <p>Add fish data with coordinates to see them on the map</p>
          </div>
        </div>
      ) : (
        <div id="fish-map" style={{ width: '100%', height: '100%' }}></div>
      )}
    </div>
  );
}

// ========================================
// ADD FISH SECTION
// ========================================
function AddFishSection() {
  return (
    <div className="add-fish-container">
      <CreateFishDataForm embedded={true} />
    </div>
  );
}

// ========================================
// FISH DETAIL MODAL
// ========================================
function FishDetailModal({ fish, loading, onClose }) {
  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content fish-detail-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-loading">
            <div className="loading-spinner">🐟</div>
            <p>Loading fish details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!fish) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fish-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2>🐟 Fish Details</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Basic Information */}
          <section className="detail-section">
            <h3 className="section-title">📋 Basic Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Fish Name:</label>
                <span>{fish.fish_name || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <label>Common Name:</label>
                <span>{fish.species_id?.common_name || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <label>Scientific Name:</label>
                <span><em>{fish.species_id?.scientific_name || 'Not specified'}</em></span>
              </div>
              <div className="detail-item">
                <label>Catch Date:</label>
                <span>{new Date(fish.catch_date).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <label>Submission Date:</label>
                <span>{new Date(fish.submission_date).toLocaleDateString()}</span>
              </div>
            </div>
          </section>

          {/* Species Information */}
          {fish.species_id && (
            <section className="detail-section">
              <h3 className="section-title">🐠 Species Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Scientific Name:</label>
                  <span><em>{fish.species_id.scientific_name || 'N/A'}</em></span>
                </div>
                <div className="detail-item">
                  <label>Common Name:</label>
                  <span>{fish.species_id.common_name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Family:</label>
                  <span>{fish.species_id.family || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <label>Genus:</label>
                  <span>{fish.species_id.genus || 'Not specified'}</span>
                </div>
              </div>
            </section>
          )}

          {/* Physical Characteristics */}
          {fish.physical_characteristics && (
            <section className="detail-section">
              <h3 className="section-title">📏 Physical Characteristics</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Length:</label>
                  <span>{fish.physical_characteristics.length ? `${fish.physical_characteristics.length} cm` : 'Not measured'}</span>
                </div>
                <div className="detail-item">
                  <label>Weight:</label>
                  <span>{fish.physical_characteristics.weight ? `${fish.physical_characteristics.weight} g` : 'Not measured'}</span>
                </div>
                <div className="detail-item">
                  <label>Age:</label>
                  <span>{fish.physical_characteristics.age ? `${fish.physical_characteristics.age} years` : 'Unknown'}</span>
                </div>
                <div className="detail-item">
                  <label>Sex:</label>
                  <span>{fish.physical_characteristics.sex || 'Unknown'}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Color Pattern:</label>
                  <span>{fish.physical_characteristics.color_pattern || 'Not described'}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Body Condition:</label>
                  <span>{fish.physical_characteristics.body_condition || 'Not assessed'}</span>
                </div>
                <div className="detail-item">
                  <label>Scales Condition:</label>
                  <span>{fish.physical_characteristics.scales_condition || 'Not assessed'}</span>
                </div>
                <div className="detail-item">
                  <label>Fins Condition:</label>
                  <span>{fish.physical_characteristics.fins_condition || 'Not assessed'}</span>
                </div>
              </div>
            </section>
          )}

          {/* Location Information */}
          {fish.location && (
            <section className="detail-section">
              <h3 className="section-title">📍 Location Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Location Name:</label>
                  <span>{fish.location.location_name || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <label>Location Type:</label>
                  <span>{fish.location.location_type || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <label>Country:</label>
                  <span>{fish.location.country || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <label>Region:</label>
                  <span>{fish.location.region || 'Not specified'}</span>
                </div>
                {fish.location.coordinates && (fish.location.coordinates.latitude || fish.location.coordinates.longitude) && (
                  <>
                    <div className="detail-item">
                      <label>Latitude:</label>
                      <span>{fish.location.coordinates.latitude || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Longitude:</label>
                      <span>{fish.location.coordinates.longitude || 'N/A'}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Water Conditions */}
              {fish.location.water_conditions && Object.keys(fish.location.water_conditions).length > 0 && (
                <>
                  <h4 className="subsection-title">💧 Water Conditions</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Temperature:</label>
                      <span>{fish.location.water_conditions.temperature ? `${fish.location.water_conditions.temperature}°C` : 'Not recorded'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Salinity:</label>
                      <span>{fish.location.water_conditions.salinity ? `${fish.location.water_conditions.salinity} ppt` : 'Not recorded'}</span>
                    </div>
                    <div className="detail-item">
                      <label>pH:</label>
                      <span>{fish.location.water_conditions.pH || 'Not recorded'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Dissolved Oxygen:</label>
                      <span>{fish.location.water_conditions.dissolved_oxygen ? `${fish.location.water_conditions.dissolved_oxygen} mg/L` : 'Not recorded'}</span>
                    </div>
                  </div>
                </>
              )}
            </section>
          )}

          {/* Catch Details */}
          {fish.catch_details && Object.keys(fish.catch_details).length > 0 && (
            <section className="detail-section">
              <h3 className="section-title">🎣 Catch Details</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Fishing Method:</label>
                  <span>{fish.catch_details.fishing_method || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <label>Depth:</label>
                  <span>{fish.catch_details.depth ? `${fish.catch_details.depth} m` : 'Not recorded'}</span>
                </div>
                <div className="detail-item">
                  <label>Time of Day:</label>
                  <span>{fish.catch_details.time_of_day || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <label>Weather:</label>
                  <span>{fish.catch_details.weather_conditions || 'Not recorded'}</span>
                </div>
                <div className="detail-item">
                  <label>Water Temperature:</label>
                  <span>{fish.catch_details.water_temperature ? `${fish.catch_details.water_temperature}°C` : 'Not recorded'}</span>
                </div>
              </div>
            </section>
          )}

          {/* Diseases */}
          {fish.disease_ids && fish.disease_ids.length > 0 && (
            <section className="detail-section">
              <h3 className="section-title">🏥 Diseases ({fish.disease_ids.length})</h3>
              <div className="disease-list">
                {fish.disease_ids.map((disease, index) => (
                  <div key={disease._id || index} className="disease-card">
                    <h4>{disease.disease_name}</h4>
                    {disease.disease_code && <p className="disease-code">Code: {disease.disease_code}</p>}
                    <div className="disease-info">
                      <span className={`severity-badge severity-${disease.severity}`}>
                        {disease.severity || 'unknown'}
                      </span>
                      <span className={`status-badge status-${disease.status}`}>
                        {disease.status || 'unknown'}
                      </span>
                    </div>
                    {disease.symptoms && disease.symptoms.length > 0 && (
                      <div className="disease-symptoms">
                        <strong>Symptoms:</strong> {disease.symptoms.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Lab Analizleri - AnalysisSection Component */}
          <AnalysisSection fishId={fish._id} analyses={fish.analysis_ids || []} />

          {/* Images */}
          {fish.images && fish.images.length > 0 && (
            <section className="detail-section">
              <h3 className="section-title">📷 Images ({fish.images.length})</h3>
              <div className="image-grid">
                {fish.images.map((imageUrl, index) => (
                  <img
                    key={index}
                    src={imageUrl.startsWith('http') ? imageUrl : `http://localhost:5001${imageUrl}`}
                    alt={`Fish ${index + 1}`}
                    className="fish-image"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Notlar Bölümü */}
          {fish.notes && (
            <section className="detail-section">
              <h3 className="section-title">📝 Notes</h3>
              <div className="notes-content">
                {fish.notes}
              </div>
            </section>
          )}

          {/* Gönderen Kişi Bilgileri */}
          {fish.submitted_by && (
            <section className="detail-section">
              <h3 className="section-title">👤 Submitted By</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Name:</label>
                  <span>{fish.submitted_by.first_name} {fish.submitted_by.last_name}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{fish.submitted_by.mail}</span>
                </div>
                <div className="detail-item">
                  <label>Role:</label>
                  <span className="role-badge">{fish.submitted_by_role || fish.submitted_by.role}</span>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Modal Alt Bilgi - Butonlar */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-primary" onClick={() => toast.info('Edit feature coming soon')}>Edit</button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// BALIK KAYITLARI BÖLÜMÜ (VIEW FISH SECTION)
// Kullanıcının eklediği balık verilerini listeler ve yönetir
// ========================================
function ViewFishSection() {
  const [fishRecords, setFishRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Active filters (applied)
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  // Temp filters (in popover before apply)
  const [tempSpeciesFilter, setTempSpeciesFilter] = useState('');
  const [tempStatusFilter, setTempStatusFilter] = useState('');
  const [tempSortBy, setTempSortBy] = useState('date_desc');
  const [selectedFish, setSelectedFish] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Confirm Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [fishToDelete, setFishToDelete] = useState(null);

  useEffect(() => {
    fetchFishRecords();
  }, []);

  // Filter handlers
  const openFilterPopover = () => {
    setTempSpeciesFilter(speciesFilter);
    setTempStatusFilter(statusFilter);
    setTempSortBy(sortBy);
    setShowFilterPopover(true);
  };

  const applyFilters = () => {
    setSpeciesFilter(tempSpeciesFilter);
    setStatusFilter(tempStatusFilter);
    setSortBy(tempSortBy);
    setShowFilterPopover(false);
  };

  const clearFilters = () => {
    setTempSpeciesFilter('');
    setTempStatusFilter('');
    setTempSortBy('date_desc');
    setSpeciesFilter('');
    setStatusFilter('');
    setSortBy('date_desc');
    setSearchTerm('');
    setShowFilterPopover(false);
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/fish-data/export/csv', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fish-data-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('CSV Export successful');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export CSV');
    }
  };

  const handleExportPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/fish-data/export/pdf', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fish-report-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF Export successful');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF');
    }
  };

  const hasActiveFilters = speciesFilter || statusFilter || sortBy !== 'date_desc' || searchTerm;

  const fetchFishRecords = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Please login to view your fish records');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5001/api/fish-data', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setFishRecords(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch fish records');
        toast.error(data.message || 'Failed to fetch fish records');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching fish records:', error);
      setError('Failed to load fish records. Please try again.');
      toast.error('Failed to load fish records');
      setLoading(false);
    }
  };

  // Separate drafts and published fish
  const draftFish = fishRecords.filter(fish => fish.status === 'draft');
  const publishedFish = fishRecords.filter(fish => fish.status !== 'draft');

  // Filter fish records based on search term
  const filteredPublishedFish = publishedFish.filter(fish => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      fish.fish_name?.toLowerCase().includes(searchLower) ||
      fish.species_id?.scientific_name?.toLowerCase().includes(searchLower) ||
      fish.species_id?.common_name?.toLowerCase().includes(searchLower) ||
      fish.location?.country?.toLowerCase().includes(searchLower) ||
      fish.location?.location_name?.toLowerCase().includes(searchLower)
    );
  });

  const filteredDraftFish = draftFish.filter(fish => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      fish.fish_name?.toLowerCase().includes(searchLower) ||
      fish.species_id?.scientific_name?.toLowerCase().includes(searchLower) ||
      fish.species_id?.common_name?.toLowerCase().includes(searchLower)
    );
  });

  const handleViewFish = async (fishId) => {
    setDetailLoading(true);
    setShowDetailModal(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/fish-data/${fishId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        setShowDetailModal(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setSelectedFish(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch fish details');
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error fetching fish details:', error);
      toast.error('Failed to load fish details');
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleEditFish = async (fishId) => {
    setDetailLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/fish-data/${fishId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSelectedFish(data.data);
        setShowEditModal(true);
      } else {
        toast.error(data.message || 'Failed to fetch fish details');
      }
    } catch (error) {
      console.error('Error fetching fish details:', error);
      toast.error('Failed to load fish details');
    } finally {
      setDetailLoading(false);
    }
  };

  // Open confirm modal for delete
  const handleDeleteFish = (fishId, fishName) => {
    setFishToDelete({ id: fishId, name: fishName });
    setShowConfirmModal(true);
  };

  // Actually delete after confirmation
  const confirmDeleteFish = async () => {
    if (!fishToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/fish-data/${fishToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Fish data deleted successfully!');
        fetchFishRecords(); // Refresh the list
      } else {
        toast.error(data.message || 'Delete operation failed');
      }
    } catch (error) {
      console.error('Error deleting fish:', error);
      toast.error('Delete operation failed');
    } finally {
      setShowConfirmModal(false);
      setFishToDelete(null);
    }
  };

  const cancelDeleteFish = () => {
    setShowConfirmModal(false);
    setFishToDelete(null);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedFish(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedFish(null);
    fetchFishRecords(); // Refresh after edit
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🐟</div>
        <p>Loading your fish records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={fetchFishRecords} className="retry-btn">Try Again</button>
      </div>
    );
  }

  return (
    <>
      <div className="submissions-container">
        {/* Stats Cards */}
        <div className="submissions-stats-cards">
          <div className="stat-card">
            <div className="stat-card-content">
              <span className="stat-label">Total Submissions</span>
              <span className="stat-value">{fishRecords.length}</span>
            </div>
            <div className="stat-icon stat-icon-blue">📁</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-content">
              <span className="stat-label">With Diseases</span>
              <span className="stat-value">{fishRecords.filter(f => f.disease_ids?.length > 0).length}</span>
            </div>
            <div className="stat-icon stat-icon-yellow">🏥</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-content">
              <span className="stat-label">With Location</span>
              <span className="stat-value">{fishRecords.filter(f => f.location?.location_name).length}</span>
            </div>
            <div className="stat-icon stat-icon-green">📍</div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="submissions-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search by fish name or species..."
              className="filter-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-popover-wrapper">
            <div className="export-wrapper">
              <button
                className={`filter-toggle-btn export-btn ${showExportMenu ? 'active' : ''}`}
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                📥 Export
              </button>

              {showExportMenu && (
                <>
                  <div className="fixed-backdrop" onClick={() => setShowExportMenu(false)} />
                  <div className="export-menu">
                    <button onClick={() => { handleExportCSV(); setShowExportMenu(false); }}>
                      📊 Export as CSV
                    </button>
                    <button onClick={() => { handleExportPDF(); setShowExportMenu(false); }}>
                      📄 Export as PDF
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              className={`filter-toggle-btn ${hasActiveFilters ? 'has-filters' : ''}`}
              onClick={openFilterPopover}
            >
              🔧 Filter & Sort
              {hasActiveFilters && <span className="filter-badge">●</span>}
            </button>

            {showFilterPopover && (
              <>
                <div className="filter-popover-backdrop" onClick={() => setShowFilterPopover(false)} />
                <div className="filter-popover">
                  <div className="filter-popover-arrow" />
                  <div className="filter-popover-content">
                    <h4 className="filter-popover-title">Filter & Sort</h4>

                    <div className="filter-popover-section">
                      <label>Species</label>
                      <select
                        value={tempSpeciesFilter}
                        onChange={(e) => setTempSpeciesFilter(e.target.value)}
                      >
                        <option value="">All Species</option>
                        {[...new Set(fishRecords.map(f => f.species_id?.common_name).filter(Boolean))].map(species => (
                          <option key={species} value={species}>{species}</option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-popover-section">
                      <label>Status</label>
                      <select
                        value={tempStatusFilter}
                        onChange={(e) => setTempStatusFilter(e.target.value)}
                      >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>

                    <div className="filter-popover-section">
                      <label>Sort By</label>
                      <select
                        value={tempSortBy}
                        onChange={(e) => setTempSortBy(e.target.value)}
                      >
                        <option value="date_desc">Date (Newest → Oldest)</option>
                        <option value="date_asc">Date (Oldest → Newest)</option>
                        <option value="name_asc">Name (A → Z)</option>
                        <option value="name_desc">Name (Z → A)</option>
                        <option value="disease_desc">Diseases (Most → Least)</option>
                        <option value="disease_asc">Diseases (Least → Most)</option>
                      </select>
                    </div>

                    <div className="filter-popover-actions">
                      <button className="filter-clear-btn" onClick={clearFilters}>
                        Clear
                      </button>
                      <button className="filter-apply-btn" onClick={applyFilters}>
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {hasActiveFilters && (
            <button className="filter-clear-all-btn" onClick={clearFilters}>
              ✕ Clear Filters
            </button>
          )}
        </div>

        {/* Data Table */}
        {fishRecords.length === 0 ? (
          <div className="no-data-container">
            <div className="no-data-icon">🐟</div>
            <h3>No Fish Records Yet</h3>
            <p>You haven't added any fish records yet. Start by adding your first fish!</p>
          </div>
        ) : (
          <div className="submissions-table-container">
            <table className="submissions-table">
              <thead>
                <tr>
                  <th>SUBMISSION ID</th>
                  <th>SPECIES</th>
                  <th>SUBMITTED DATE</th>
                  <th>LOCATION</th>
                  <th>DISEASES</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {fishRecords
                  .filter(fish => {
                    // Search filter
                    if (searchTerm) {
                      const searchLower = searchTerm.toLowerCase();
                      const matchesSearch =
                        fish.fish_name?.toLowerCase().includes(searchLower) ||
                        fish._id?.toLowerCase().includes(searchLower) ||
                        fish.species_id?.scientific_name?.toLowerCase().includes(searchLower) ||
                        fish.species_id?.common_name?.toLowerCase().includes(searchLower);
                      if (!matchesSearch) return false;
                    }
                    // Species filter
                    if (speciesFilter && fish.species_id?.common_name !== speciesFilter) {
                      return false;
                    }
                    // Status filter
                    if (statusFilter && fish.status !== statusFilter) {
                      return false;
                    }
                    return true;
                  })
                  .sort((a, b) => {
                    switch (sortBy) {
                      case 'date_asc':
                        return new Date(a.createdAt || a.catch_date) - new Date(b.createdAt || b.catch_date);
                      case 'date_desc':
                        return new Date(b.createdAt || b.catch_date) - new Date(a.createdAt || a.catch_date);
                      case 'name_asc':
                        return (a.fish_name || '').localeCompare(b.fish_name || '');
                      case 'name_desc':
                        return (b.fish_name || '').localeCompare(a.fish_name || '');
                      case 'disease_desc':
                        return (b.disease_ids?.length || 0) - (a.disease_ids?.length || 0);
                      case 'disease_asc':
                        return (a.disease_ids?.length || 0) - (b.disease_ids?.length || 0);
                      default:
                        return 0;
                    }
                  })
                  .map(fish => (
                    <tr key={fish._id}>
                      <td>
                        <span className="submission-id">{fish.fish_name || `SUB-${fish._id.slice(-6).toUpperCase()}`}</span>
                      </td>
                      <td>
                        <span className="species-name">{fish.species_id?.scientific_name || 'N/A'}</span>
                      </td>
                      <td>{new Date(fish.createdAt || fish.catch_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td>{fish.location?.location_name || fish.location?.country || 'N/A'}</td>
                      <td>
                        <span className={`disease-count ${fish.disease_ids?.length > 0 ? 'has-diseases' : ''}`}>
                          {fish.disease_ids?.length || 0}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="action-link action-view"
                          onClick={() => handleViewFish(fish._id)}
                        >
                          View Details
                        </button>
                        <button
                          className="action-link action-edit"
                          onClick={() => handleEditFish(fish._id)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-link action-delete"
                          onClick={() => handleDeleteFish(fish._id, fish.fish_name || 'Unnamed Fish')}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Pagination Info */}
            <div className="table-footer">
              <span className="results-info">Showing {fishRecords.length} results</span>
            </div>
          </div>
        )}
      </div>

      {/* Fish Detail Modal */}
      {showDetailModal && (
        <FishDetailModal
          fish={selectedFish}
          loading={detailLoading}
          onClose={closeDetailModal}
        />
      )}

      {/* Fish Edit Modal */}
      {showEditModal && selectedFish && (
        <FishEditModal
          fish={selectedFish}
          onClose={closeEditModal}
        />
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={confirmDeleteFish}
        onCancel={cancelDeleteFish}
        title="Delete Fish Data"
        message={`Are you sure you want to delete "${fishToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        theme="partner"
        type="danger"
      />
    </>
  );
}

// ========================================
// FISH EDIT MODAL
// ========================================
function FishEditModal({ fish, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fish-edit-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2>✏️ {fish.status === 'draft' ? 'Edit Draft and Publish' : 'Edit Fish'}</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-edit">
          <CreateFishDataForm
            embedded={true}
            initialData={{
              ...fish,
              species_id: fish.species_id?._id || fish.species_id,
              location_data: {
                location_name: fish.location?.location_name || '',
                coordinates: {
                  lat: fish.location?.coordinates?.latitude || '',
                  lng: fish.location?.coordinates?.longitude || ''
                },
                location_type: fish.location?.location_type || 'ocean',
                water_conditions: {
                  temperature: fish.location?.water_conditions?.temperature || '',
                  ph: fish.location?.water_conditions?.pH || fish.location?.water_conditions?.ph || '',
                  salinity: fish.location?.water_conditions?.salinity || '',
                  dissolved_oxygen: fish.location?.water_conditions?.dissolved_oxygen || ''
                },
                environmental_data: fish.location?.environmental_data || {
                  air_temperature: '',
                  wind_speed: '',
                  season: 'summer'
                },
                region: fish.location?.region || '',
                country: fish.location?.country || 'Türkiye'
              },
              diseases: fish.disease_ids || []
            }}
            onSuccess={onClose}
          />
        </div>
      </div>
    </div>
  );
}

// ========================================
// SPECIES SECTION
// ========================================
function SpeciesSection() {
  const [speciesList, setSpeciesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Confirm Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [speciesToDelete, setSpeciesToDelete] = useState(null);

  useEffect(() => {
    fetchSpecies();
  }, []);

  const fetchSpecies = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        toast.error('Please log in');
        return;
      }

      const response = await fetch('http://localhost:5001/api/fish-species', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('userId');
        localStorage.removeItem('partnerId');
        localStorage.removeItem('userRole');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setSpeciesList(data.data);
      } else {
        toast.error(data.message || 'Failed to load species');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching species:', error);
      toast.error('Server connection error');
      setLoading(false);
    }
  };

  const handleSpeciesCreated = (newSpecies) => {
    setSpeciesList(prev => [newSpecies, ...prev]);
    setShowCreateForm(false);
  };

  const handleSpeciesUpdated = (updatedSpecies) => {
    setSpeciesList(prev => prev.map(s => s._id === updatedSpecies._id ? updatedSpecies : s));
    setShowEditModal(false);
    setSelectedSpecies(null);
  };

  const handleViewDetails = (species) => {
    setSelectedSpecies(species);
    setShowDetailModal(true);
  };

  const handleEdit = (species) => {
    setSelectedSpecies(species);
    setShowEditModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedSpecies(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedSpecies(null);
  };

  // Open confirm modal for delete
  const handleDelete = (species) => {
    setSpeciesToDelete(species);
    setShowConfirmModal(true);
  };

  // Actually delete after confirmation
  const confirmDeleteSpecies = async () => {
    if (!speciesToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/fish-species/${speciesToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Species deleted successfully!');
        setSpeciesList(prev => prev.filter(s => s._id !== speciesToDelete._id));
      } else {
        toast.error(data.message || 'Failed to delete species');
      }
    } catch (error) {
      console.error('Error deleting species:', error);
      toast.error('Failed to delete species');
    } finally {
      setShowConfirmModal(false);
      setSpeciesToDelete(null);
    }
  };

  const cancelDeleteSpecies = () => {
    setShowConfirmModal(false);
    setSpeciesToDelete(null);
  };

  const filteredSpecies = speciesList.filter(species =>
    species.scientific_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    species.common_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    species.family?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading species...</div>;
  }

  return (
    <div className="species-container">
      <div className="species-header">
        <input
          type="text"
          placeholder="Search species..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-btn" onClick={() => setShowCreateForm(true)}>
          + Add New Species
        </button>
      </div>

      <div className="species-grid">
        {filteredSpecies.length === 0 ? (
          <div className="no-data">
            <p>No species added yet or no results found.</p>
          </div>
        ) : (
          filteredSpecies.map(species => (
            <div key={species._id} className="species-card">
              <div className="species-card-header">
                <h3>{species.scientific_name}</h3>
                {species.common_name && (
                  <p className="common-name">{species.common_name}</p>
                )}
              </div>
              <div className="species-card-body">
                {species.family && (
                  <p><strong>Family:</strong> {species.family}</p>
                )}
                {species.genus && (
                  <p><strong>Genus:</strong> {species.genus}</p>
                )}
                {species.characteristics?.habitat && (
                  <p><strong>Habitat:</strong> {species.characteristics.habitat}</p>
                )}
                {species.conservation_status?.iucn_status && (
                  <span className={`conservation-badge ${species.conservation_status.iucn_status}`}>
                    {species.conservation_status.iucn_status}
                  </span>
                )}
              </div>
              <div className="species-card-footer">
                <button className="btn-sm btn-view" onClick={() => handleViewDetails(species)}>
                  Details
                </button>
                <button className="btn-sm btn-edit" onClick={() => handleEdit(species)}>
                  Edit
                </button>
                <button className="btn-sm btn-delete" onClick={() => handleDelete(species)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Species Form Modal */}
      {showCreateForm && (
        <CreateSpeciesForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleSpeciesCreated}
        />
      )}

      {/* Species Detail Modal */}
      {showDetailModal && selectedSpecies && (
        <SpeciesDetailModal
          species={selectedSpecies}
          onClose={closeDetailModal}
        />
      )}

      {/* Species Edit Modal */}
      {showEditModal && selectedSpecies && (
        <SpeciesEditModal
          species={selectedSpecies}
          onClose={closeEditModal}
          onSuccess={handleSpeciesUpdated}
        />
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={confirmDeleteSpecies}
        onCancel={cancelDeleteSpecies}
        title="Delete Species"
        message={`Are you sure you want to delete "${speciesToDelete?.scientific_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        theme="partner"
        type="danger"
      />
    </div>
  );
}

// ========================================
// SPECIES DETAIL MODAL
// ========================================
function SpeciesDetailModal({ species, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fish-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2>🐟 {species.scientific_name}</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Basic Information */}
          <section className="detail-section">
            <h3 className="section-title">📋 Basic Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Scientific Name:</label>
                <span><em>{species.scientific_name}</em></span>
              </div>
              <div className="detail-item">
                <label>Common Name:</label>
                <span>{species.common_name || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Family:</label>
                <span>{species.family || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Genus:</label>
                <span>{species.genus || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Species:</label>
                <span>{species.species || 'N/A'}</span>
              </div>
              {species.aliases && species.aliases.length > 0 && (
                <div className="detail-item full-width">
                  <label>Alternative Names:</label>
                  <span>{species.aliases.join(', ')}</span>
                </div>
              )}
            </div>
          </section>

          {/* Characteristics */}
          {species.characteristics && (
            <section className="detail-section">
              <h3 className="section-title">🔬 Physical Characteristics</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Max Length:</label>
                  <span>{species.characteristics.max_length ? `${species.characteristics.max_length} cm` : 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Max Weight:</label>
                  <span>{species.characteristics.max_weight ? `${species.characteristics.max_weight} kg` : 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Max Age:</label>
                  <span>{species.characteristics.max_age ? `${species.characteristics.max_age} years` : 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Body Shape:</label>
                  <span>{species.characteristics.body_shape || 'N/A'}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Habitat:</label>
                  <span>{species.characteristics.habitat || 'N/A'}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Diet:</label>
                  <span>{species.characteristics.diet || 'N/A'}</span>
                </div>
                {species.characteristics.color_description && (
                  <div className="detail-item full-width">
                    <label>Color Description:</label>
                    <span>{species.characteristics.color_description}</span>
                  </div>
                )}
                {species.characteristics.behavior && (
                  <div className="detail-item full-width">
                    <label>Behavior:</label>
                    <span>{species.characteristics.behavior}</span>
                  </div>
                )}
                {species.characteristics.reproduction && (
                  <div className="detail-item full-width">
                    <label>Reproduction:</label>
                    <span>{species.characteristics.reproduction}</span>
                  </div>
                )}
                {species.characteristics.distinctive_features && (
                  <div className="detail-item full-width">
                    <label>Distinctive Features:</label>
                    <span>{species.characteristics.distinctive_features}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Typical Locations */}
          {species.typical_locations && species.typical_locations.length > 0 && (
            <section className="detail-section">
              <h3 className="section-title">📍 Typical Locations</h3>
              <div className="tags-display">
                {species.typical_locations.map((location, index) => (
                  <span key={index} className="tag-display">{location}</span>
                ))}
              </div>
            </section>
          )}

          {/* Known Diseases */}
          {species.known_diseases && species.known_diseases.length > 0 && (
            <section className="detail-section">
              <h3 className="section-title">🏥 Known Diseases</h3>
              <div className="tags-display">
                {species.known_diseases.map((disease, index) => (
                  <span key={index} className="tag-display">{disease}</span>
                ))}
              </div>
            </section>
          )}

          {/* Conservation Status */}
          {species.conservation_status && (
            <section className="detail-section">
              <h3 className="section-title">🌍 Conservation Status</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>IUCN Status:</label>
                  {species.conservation_status.iucn_status ? (
                    <span className={`conservation-badge ${species.conservation_status.iucn_status}`}>
                      {species.conservation_status.iucn_status}
                    </span>
                  ) : (
                    <span>N/A</span>
                  )}
                </div>
                <div className="detail-item">
                  <label>Population Trend:</label>
                  <span>{species.conservation_status.population_trend || 'N/A'}</span>
                </div>
              </div>
            </section>
          )}

          {/* Description */}
          {species.description && (
            <section className="detail-section">
              <h3 className="section-title">📝 Description</h3>
              <div className="notes-content">
                {species.description}
              </div>
            </section>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ========================================
// SPECIES EDIT MODAL
// ========================================
function SpeciesEditModal({ species, onClose, onSuccess }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <CreateSpeciesForm
          onClose={onClose}
          onSuccess={onSuccess}
          initialData={species}
          isEditing={true}
        />
      </div>
    </div>
  );
}


export default Home;