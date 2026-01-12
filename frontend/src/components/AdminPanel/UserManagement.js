import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ConfirmModal from '../shared/ConfirmModal';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFishData, setUserFishData] = useState([]);

  // Confirm Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, searchTerm]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`http://localhost:5001/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setShowViewModal(true);

    // Fetch user's fish data
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/admin/users/${user._id}/fish`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setUserFishData(data.data);
      }
    } catch (error) {
      console.error('Error fetching user fish data:', error);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  // Open confirm modal for user deactivation
  const handleDeleteUser = (userId, userName) => {
    setUserToDelete({ id: userId, name: userName });
    setShowConfirmModal(true);
  };

  // Actually deactivate after confirmation
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('User deactivated successfully');
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to deactivate user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to deactivate user');
    } finally {
      setShowConfirmModal(false);
      setUserToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner">🔄</div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      {/* Header with filters and actions */}
      <div className="user-management-header">
        <div className="user-filters">
          <input
            type="text"
            placeholder="🔍 Search users by name or email..."
            className="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="admin-filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="partner">Partner</option>
            <option value="developer">Developer</option>
          </select>

          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button className="refresh-btn" onClick={fetchUsers} title="Refresh">
            🔄
          </button>
        </div>

        <button className="admin-add-btn" onClick={() => setShowAddModal(true)}>
          ➕ Add New User
        </button>
      </div>

      {/* User count */}
      <div className="user-count">
        <p>Total Users: <strong>{users.length}</strong></p>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="no-data-message">
          <p>No users found</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Phone</th>
                <th>Created</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>
                    <div className="user-name-cell">
                      <strong>{user.first_name} {user.last_name}</strong>
                      {user.title && <span className="user-title">{user.title}</span>}
                    </div>
                  </td>
                  <td>{user.mail}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{user.phone || '-'}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td>
                  <td className="action-buttons">
                    <button
                      className="btn-sm btn-view"
                      onClick={() => handleViewUser(user)}
                      title="View Details"
                    >
                      👁️
                    </button>
                    <button
                      className="btn-sm btn-edit"
                      onClick={() => handleEditUser(user)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-sm btn-delete"
                      onClick={() => handleDeleteUser(user._id, `${user.first_name} ${user.last_name}`)}
                      title="Deactivate"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchUsers}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={fetchUsers}
        />
      )}

      {showViewModal && selectedUser && (
        <ViewUserModal
          user={selectedUser}
          fishData={userFishData}
          onClose={() => {
            setShowViewModal(false);
            setSelectedUser(null);
            setUserFishData([]);
          }}
        />
      )}

      {/* Delete/Deactivate Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={confirmDeleteUser}
        onCancel={() => {
          setShowConfirmModal(false);
          setUserToDelete(null);
        }}
        title="Deactivate User"
        message={`Are you sure you want to deactivate "${userToDelete?.name}"? The user will lose access to the system.`}
        confirmText="Deactivate"
        cancelText="Cancel"
        theme="admin"
        type="danger"
      />
    </div>
  );
}

// Add User Modal
function AddUserModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    mail: '',
    password_hash: '',
    role: 'developer',
    first_name: '',
    last_name: '',
    title: 'Mr',
    position: '',
    phone: '',
    is_active: true,
    // Partner fields
    company_name: '',
    company_address: '',
    tax_number: '',
    business_type: '',
    website: '',
    contact_person: '',
    contact_email: '',
    contact_phone: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('User created successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ Add New User</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="modal-body">
            {/* Basic Information */}
            <div className="form-section">
              <h3>📋 Basic Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="mail"
                    value={formData.mail}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    name="password_hash"
                    value={formData.password_hash}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <select name="title" value={formData.title} onChange={handleChange}>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Role *</label>
                  <select name="role" value={formData.role} onChange={handleChange} required>
                    <option value="developer">Developer</option>
                    <option value="partner">Partner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  Active User
                </label>
              </div>
            </div>

            {/* Partner Information (only if role is partner) */}
            {formData.role === 'partner' && (
              <div className="form-section">
                <h3>🤝 Partner Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Company Name</label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Business Type</label>
                    <input
                      type="text"
                      name="business_type"
                      value={formData.business_type}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Company Address</label>
                  <textarea
                    name="company_address"
                    value={formData.company_address}
                    onChange={handleChange}
                    rows="2"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tax Number</label>
                    <input
                      type="text"
                      name="tax_number"
                      value={formData.tax_number}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Person</label>
                    <input
                      type="text"
                      name="contact_person"
                      value={formData.contact_person}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Email</label>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Phone</label>
                    <input
                      type="text"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit User Modal (similar to Add, but with existing data)
function EditUserModal({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    title: user.title || 'Mr',
    position: user.position || '',
    phone: user.phone || '',
    role: user.role || 'developer',
    is_active: user.is_active !== undefined ? user.is_active : true,
    // Partner fields
    company_name: user.partner_info?.company_name || '',
    company_address: user.partner_info?.company_address || '',
    tax_number: user.partner_info?.tax_number || '',
    business_type: user.partner_info?.business_type || '',
    website: user.partner_info?.website || '',
    contact_person: user.partner_info?.contact_person || '',
    contact_email: user.partner_info?.contact_email || '',
    contact_phone: user.partner_info?.contact_phone || ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/admin/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('User updated successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Edit User</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="modal-body">
            {/* Basic Information */}
            <div className="form-section">
              <h3>📋 Basic Information</h3>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={user.mail} disabled />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <select name="title" value={formData.title} onChange={handleChange}>
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="developer">Developer</option>
                    <option value="partner">Partner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Position</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  Active User
                </label>
              </div>
            </div>

            {/* Partner Information */}
            {formData.role === 'partner' && (
              <div className="form-section">
                <h3>🤝 Partner Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Company Name</label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Business Type</label>
                    <input
                      type="text"
                      name="business_type"
                      value={formData.business_type}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Company Address</label>
                  <textarea
                    name="company_address"
                    value={formData.company_address}
                    onChange={handleChange}
                    rows="2"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tax Number</label>
                    <input
                      type="text"
                      name="tax_number"
                      value={formData.tax_number}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Person</label>
                    <input
                      type="text"
                      name="contact_person"
                      value={formData.contact_person}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Email</label>
                    <input
                      type="email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Phone</label>
                    <input
                      type="text"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// View User Modal
function ViewUserModal({ user, fishData, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content admin-modal view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 User Details</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* User Information */}
          <div className="view-section">
            <h3>📋 Basic Information</h3>
            <div className="view-grid">
              <div className="view-item">
                <label>Name:</label>
                <span>{user.title} {user.first_name} {user.last_name}</span>
              </div>
              <div className="view-item">
                <label>Email:</label>
                <span>{user.mail}</span>
              </div>
              <div className="view-item">
                <label>Role:</label>
                <span className={`role-badge ${user.role}`}>{user.role}</span>
              </div>
              <div className="view-item">
                <label>Status:</label>
                <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="view-item">
                <label>Position:</label>
                <span>{user.position || 'Not specified'}</span>
              </div>
              <div className="view-item">
                <label>Phone:</label>
                <span>{user.phone || 'Not specified'}</span>
              </div>
              <div className="view-item">
                <label>Created:</label>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="view-item">
                <label>Last Login:</label>
                <span>{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</span>
              </div>
            </div>
          </div>

          {/* Partner Information */}
          {user.role === 'partner' && user.partner_info && (
            <div className="view-section">
              <h3>🤝 Partner Information</h3>
              <div className="view-grid">
                <div className="view-item">
                  <label>Company:</label>
                  <span>{user.partner_info.company_name || 'Not specified'}</span>
                </div>
                <div className="view-item">
                  <label>Business Type:</label>
                  <span>{user.partner_info.business_type || 'Not specified'}</span>
                </div>
                <div className="view-item full-width">
                  <label>Address:</label>
                  <span>{user.partner_info.company_address || 'Not specified'}</span>
                </div>
                <div className="view-item">
                  <label>Tax Number:</label>
                  <span>{user.partner_info.tax_number || 'Not specified'}</span>
                </div>
                <div className="view-item">
                  <label>Website:</label>
                  <span>
                    {user.partner_info.website ? (
                      <a href={user.partner_info.website} target="_blank" rel="noopener noreferrer">
                        {user.partner_info.website}
                      </a>
                    ) : 'Not specified'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Fish Data */}
          <div className="view-section">
            <h3>🐟 Fish Records ({fishData.length})</h3>
            {fishData.length === 0 ? (
              <p className="no-data">No fish records submitted by this user</p>
            ) : (
              <div className="fish-list">
                {fishData.map(fish => (
                  <div key={fish._id} className="fish-item">
                    <div className="fish-item-icon">🐟</div>
                    <div className="fish-item-info">
                      <strong>{fish.fish_name || 'Unnamed Fish'}</strong>
                      <span className="fish-species">
                        {fish.species_id?.scientific_name || 'Species not specified'}
                      </span>
                      <span className="fish-date">
                        Catch Date: {new Date(fish.catch_date).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`status-badge ${fish.status}`}>
                      {fish.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;

