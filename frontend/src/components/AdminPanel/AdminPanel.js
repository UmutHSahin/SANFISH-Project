import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './AdminPanel.css';
import UserManagement from './UserManagement';
import FishManagement from './FishManagement';
import AdminDashboard from './AdminDashboard';

function AdminPanel() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [adminName, setAdminName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const userRole = localStorage.getItem('userRole');
    const loggedInUser = localStorage.getItem('loggedInUser');

    console.log('Admin Panel - User Role:', userRole); // Debug log

    if (!userRole || userRole !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/home');
      return;
    }

    setAdminName(loggedInUser || 'Admin');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    toast.success('Logout successful');
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  return (
    <div className="admin-panel-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>🛡️ Admin Panel</h2>
          <p className="admin-user-info">Welcome, {adminName}</p>
        </div>

        <nav className="admin-sidebar-nav">
          <button
            className={`admin-nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            <span className="admin-nav-icon">📊</span>
            Dashboard
          </button>

          <button
            className={`admin-nav-item ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            <span className="admin-nav-icon">👥</span>
            User Management
          </button>

          <button
            className={`admin-nav-item ${activeSection === 'fish' ? 'active' : ''}`}
            onClick={() => setActiveSection('fish')}
          >
            <span className="admin-nav-icon">🐟</span>
            All Fish Data
          </button>

          <button
            className={`admin-nav-item ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveSection('settings')}
          >
            <span className="admin-nav-icon">⚙️</span>
            Settings
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <span className="admin-nav-icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        <header className="admin-content-header">
          <h1>
            {activeSection === 'dashboard' && '📊 Dashboard'}
            {activeSection === 'users' && '👥 User Management'}
            {activeSection === 'fish' && '🐟 All Fish Data'}
            {activeSection === 'settings' && '⚙️ Settings'}
          </h1>
        </header>

        <div className="admin-content-body">
          {activeSection === 'dashboard' && <AdminDashboard />}
          {activeSection === 'users' && <UserManagement />}
          {activeSection === 'fish' && <FishManagement />}
          {activeSection === 'settings' && <SettingsSection />}
        </div>
      </main>
    </div>
  );
}

// Settings Section Component
function SettingsSection() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    allow_registration: true,
    contact_email: '',
    items_per_page: 10,
    announcement: {
      message: '',
      is_active: false
    }
  });
  const [loading, setLoading] = useState(true);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('announcement.')) {
      const field = name.split('.')[1];
      setSettings(prev => ({
        ...prev,
        announcement: {
          ...prev.announcement,
          [field]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const saveSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Settings saved successfully');
      } else {
        toast.error(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/admin/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const handleExport = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/admin/export/${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export ${type}`);
    }
  };

  if (loading) return <div className="loading-spinner">Loading settings...</div>;

  return (
    <div className="admin-settings-container">
      <div className="settings-tabs">
        <button
          className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          ⚙️ General
        </button>
        <button
          className={`tab-btn ${activeTab === 'announcement' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcement')}
        >
          📢 Announcement
        </button>
        <button
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          🔐 Security
        </button>
        <button
          className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          💾 Data Management
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'general' && (
          <div className="settings-card">
            <h3>General Settings</h3>
            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                name="contact_email"
                value={settings.contact_email}
                onChange={handleSettingChange}
                className="form-control"
              />
              <small>System notifications will be sent from/to this address.</small>
            </div>
            <div className="form-group">
              <label>Items Per Page (Admin Tables)</label>
              <input
                type="number"
                name="items_per_page"
                value={settings.items_per_page}
                onChange={handleSettingChange}
                className="form-control"
                min="5"
                max="100"
              />
              <small>Number of rows to display in User and Fish Management tables.</small>
            </div>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="maintenance_mode"
                  checked={settings.maintenance_mode}
                  onChange={handleSettingChange}
                />
                Maintenance Mode (Only admins can login)
              </label>
              <small><b>Warning:</b> Prevents all non-admin users from accessing the system.</small>
            </div>
            <button className="btn-save" onClick={saveSettings}>Save General Settings</button>
          </div>
        )}

        {activeTab === 'announcement' && (
          <div className="settings-card">
            <h3>Global Announcement</h3>
            <div className="form-group">
              <label>Announcement Message</label>
              <textarea
                name="announcement.message"
                value={settings.announcement?.message || ''}
                onChange={handleSettingChange}
                className="form-control"
                rows="3"
                placeholder="Enter message to display to all users..."
              />
              <small>This message will appear in an orange banner at the top of every page.</small>
            </div>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="announcement.is_active"
                  checked={settings.announcement?.is_active || false}
                  onChange={handleSettingChange}
                />
                Activate Announcement Banner
              </label>
              <small>Toggle to show/hide the banner on the live site.</small>
            </div>
            <button className="btn-save" onClick={saveSettings}>Update Announcement</button>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="settings-card">
            <h3>Security Settings</h3>

            <div className="security-section">
              <h4>Registration Control</h4>
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="allow_registration"
                    checked={settings.allow_registration}
                    onChange={handleSettingChange}
                  />
                  Allow New User Registrations
                </label>
                <small>Uncheck this to disable the signup page for new users.</small>
              </div>
              <button className="btn-save" onClick={saveSettings}>Save Security Settings</button>
            </div>

            <hr className="settings-divider" />

            <div className="security-section">
              <h4>Change Admin Password</h4>
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <button type="submit" className="btn-warning">Change Password</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="settings-card">
            <h3>Data Management</h3>
            <p className="description">Export system data for backup or analysis purposes.</p>

            <div className="export-actions">
              <div className="export-item">
                <div className="export-info">
                  <h4>Users Data</h4>
                  <p>Export all user records including roles and status.</p>
                </div>
                <button className="btn-export" onClick={() => handleExport('users')}>
                  📥 Export CSV
                </button>
              </div>

              <div className="export-item">
                <div className="export-info">
                  <h4>Fish Data</h4>
                  <p>Export all fish records including species and location.</p>
                </div>
                <button className="btn-export" onClick={() => handleExport('fish')}>
                  📥 Export CSV
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;

