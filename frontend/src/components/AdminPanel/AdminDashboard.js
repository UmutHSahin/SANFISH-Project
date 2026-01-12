import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        toast.error('Access denied');
        return;
      }

      if (data.success) {
        setStats(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner">🔄</div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-error">
        <p>Failed to load dashboard statistics</p>
        <button onClick={fetchAdminStats} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* User Statistics */}
      <div className="admin-stats-section">
        <h2>👥 User Statistics</h2>
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{stats.users.total}</h3>
              <p>Total Users</p>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon">🛡️</div>
            <div className="stat-info">
              <h3>{stats.users.admin}</h3>
              <p>Admin Users</p>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon">🤝</div>
            <div className="stat-info">
              <h3>{stats.users.partner}</h3>
              <p>Partners</p>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon">💻</div>
            <div className="stat-info">
              <h3>{stats.users.developer}</h3>
              <p>Developers</p>
            </div>
          </div>

          <div className="admin-stat-card active">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats.users.active}</h3>
              <p>Active Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fish Data Statistics */}
      <div className="admin-stats-section">
        <h2>🐟 Fish Data Statistics</h2>
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-icon">🐟</div>
            <div className="stat-info">
              <h3>{stats.fish.total}</h3>
              <p>Total Fish Records</p>
            </div>
          </div>


        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-recent-section">
        <div className="admin-recent-card">
          <h3>👥 Recent Users</h3>
          <div className="admin-recent-list">
            {stats.recent.users.length === 0 ? (
              <p className="no-data">No recent users</p>
            ) : (
              stats.recent.users.map(user => (
                <div key={user._id} className="admin-recent-item">
                  <div className="recent-item-icon">👤</div>
                  <div className="recent-item-info">
                    <strong>{user.first_name} {user.last_name}</strong>
                    <span className="recent-item-detail">{user.mail}</span>
                    <span className={`role-badge ${user.role}`}>{user.role}</span>
                  </div>
                  <div className="recent-item-time">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="admin-recent-card">
          <h3>🐟 Recent Fish Records</h3>
          <div className="admin-recent-list">
            {stats.recent.fish.length === 0 ? (
              <p className="no-data">No recent fish records</p>
            ) : (
              stats.recent.fish.map(fish => (
                <div key={fish._id} className="admin-recent-item">
                  <div className="recent-item-icon">🐟</div>
                  <div className="recent-item-info">
                    <strong>{fish.fish_name || 'Unnamed Fish'}</strong>
                    <span className="recent-item-detail">
                      {fish.species_id?.scientific_name || 'Species not specified'}
                    </span>
                    <span className="recent-item-submitter">
                      By: {fish.submitted_by?.first_name} {fish.submitted_by?.last_name}
                    </span>
                  </div>
                  <div className="recent-item-time">
                    {new Date(fish.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

