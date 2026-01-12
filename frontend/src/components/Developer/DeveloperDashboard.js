import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './DeveloperDashboard.css';
import ConfirmModal from '../shared/ConfirmModal';

const DeveloperDashboard = () => {
    const [species, setSpecies] = useState([]);
    const navigate = useNavigate();
    const [endpoints, setEndpoints] = useState([]);
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(true);
    const [previewCount, setPreviewCount] = useState(null);
    const [creating, setCreating] = useState(false);
    const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' or 'settings'

    // Confirm Modal State
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmModalConfig, setConfirmModalConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => { },
        confirmText: 'Confirm'
    });

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [filters, setFilters] = useState({
        name: '',
        speciesId: '',
        dateFrom: '',
        dateTo: '',
        country: '',
        region: '',
        locationType: '',
        status: 'active',
    });

    const API_BASE = 'http://localhost:5001';

    // Fetch initial data
    useEffect(() => {
        fetchSpecies();
        fetchEndpoints();
        fetchApiKey();
    }, []);

    const fetchSpecies = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/fish-species`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setSpecies(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching species:', error);
        }
    };

    const fetchEndpoints = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/dev/endpoints`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setEndpoints(data.data || []);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching endpoints:', error);
            setLoading(false);
        }
    };

    const fetchApiKey = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/dev/api-key`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setApiKey(data.apiKey);
            }
        } catch (error) {
            console.error('Error fetching API key:', error);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPreviewCount(null); // Reset preview when filters change
    };

    const handlePreview = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/dev/preview`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ filters })
            });
            const data = await res.json();
            if (data.success) {
                setPreviewCount(data.count);
                toast.info(`Found ${data.count} matching records`);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Error previewing data');
        }
    };

    const handleCreateEndpoint = async () => {
        if (!filters.name.trim()) {
            toast.error('Please enter a name for this endpoint');
            return;
        }

        setCreating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/dev/endpoints`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: filters.name,
                    filters: {
                        speciesId: filters.speciesId || undefined,
                        dateFrom: filters.dateFrom || undefined,
                        dateTo: filters.dateTo || undefined,
                        country: filters.country || undefined,
                        region: filters.region || undefined,
                        locationType: filters.locationType || undefined,
                        status: filters.status || 'active',
                    }
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Endpoint created successfully!');
                setApiKey(data.data.apiKey);
                fetchEndpoints();
                // Reset form
                setFilters({
                    name: '',
                    speciesId: '',
                    dateFrom: '',
                    dateTo: '',
                    country: '',
                    region: '',
                    locationType: '',
                    status: 'active',
                });
                setPreviewCount(null);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Error creating endpoint');
        }
        setCreating(false);
    };

    // Show confirm modal for endpoint deletion
    const handleDeleteEndpoint = (id) => {
        setConfirmModalConfig({
            title: 'Delete Endpoint',
            message: 'Are you sure you want to delete this endpoint? This action cannot be undone.',
            confirmText: 'Delete',
            onConfirm: async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_BASE}/api/dev/endpoints/${id}`, {
                        method: 'DELETE',
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data.success) {
                        toast.success('Endpoint deleted');
                        fetchEndpoints();
                    } else {
                        toast.error(data.message);
                    }
                } catch (error) {
                    toast.error('Error deleting endpoint');
                }
                setShowConfirmModal(false);
            }
        });
        setShowConfirmModal(true);
    };

    // Show confirm modal for key regeneration
    const handleRegenerateKey = () => {
        setConfirmModalConfig({
            title: 'Regenerate API Key',
            message: 'This will invalidate all existing links. Are you sure you want to continue?',
            confirmText: 'Regenerate',
            onConfirm: async () => {
                try {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_BASE}/api/dev/regenerate-key`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data.success) {
                        setApiKey(data.apiKey);
                        toast.success('API key regenerated');
                    } else {
                        toast.error(data.message);
                    }
                } catch (error) {
                    toast.error('Error regenerating key');
                }
                setShowConfirmModal(false);
            }
        });
        setShowConfirmModal(true);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const getFullUrl = (slug) => {
        return `${API_BASE}/api/dev/data/${slug}?key=${apiKey}`;
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        toast.success('Çıkış yapıldı');
        navigate('/login');
    };

    const handleSettings = () => {
        setViewMode('settings');
    };

    const handleBackToDashboard = () => {
        setViewMode('dashboard');
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError(''); // Clear previous errors
        setPasswordSuccess('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            const msg = 'New passwords do not match!';
            setPasswordError(msg);
            // toast.error(msg); // Optional: keep or remove based on preference
            return;
        }

        if (passwordData.newPassword.length < 6) {
            const msg = 'Password must be at least 6 characters';
            setPasswordError(msg);
            toast.error(msg);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/dev/change-password`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });
            const data = await res.json();

            if (data.success) {
                const msg = 'Password changed successfully! ✅';
                setPasswordSuccess(msg);
                toast.success(msg);
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                setPasswordError(data.message);
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Password change error:', error);
            toast.error('Failed to change password');
        }
    };

    if (loading) {
        return <div className="developer-loading">Loading...</div>;
    }

    return (
        <div className="developer-dashboard">
            <div className="dev-header">
                <div className="header-buttons">
                    {viewMode === 'dashboard' ? (
                        <>
                            <button onClick={handleSettings} className="btn-settings-header" title="Settings">
                                ⚙️ Settings
                            </button>
                            <button onClick={handleLogout} className="btn-logout-header" title="Logout">
                                🚪 Logout
                            </button>
                        </>
                    ) : (
                        <button onClick={handleBackToDashboard} className="btn-back-header" title="Back">
                            ⬅️ Back
                        </button>
                    )}
                </div>
                <h1>🔧 Developer Dashboard</h1>
                <p>{viewMode === 'dashboard' ? 'Create custom API endpoints to fetch fish data programmatically' : 'Manage your developer account settings'}</p>
            </div>

            {viewMode === 'settings' ? (
                <div className="dev-section settings-section">
                    <h2>⚙️ Developer Settings</h2>

                    <div className="settings-form-container">
                        <h3>Change Password</h3>
                        <form onSubmit={handlePasswordChange}>
                            <div className="filter-group">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter current password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="filter-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="filter-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>

                            {passwordError && (
                                <div className="error-message" style={{ color: '#ef4444', marginTop: '10px', fontWeight: 'bold' }}>
                                    ⚠️ {passwordError}
                                </div>
                            )}

                            {passwordSuccess && (
                                <div className="success-message" style={{ color: '#10b981', marginTop: '10px', fontWeight: 'bold' }}>
                                    {passwordSuccess}
                                </div>
                            )}

                            <button type="submit" className="btn-create" style={{ marginTop: '20px' }}>
                                🔐 Update Password
                            </button>
                        </form>
                    </div>
                </div >
            ) : (
                <>
                    {/* API Key Section */}

                    {/* API Key Section */}
                    <div className="dev-section api-key-section">
                        <h2>🔑 Your API Key</h2>
                        <div className="api-key-display">
                            <code>{apiKey || 'Generating...'}</code>
                            <button onClick={() => copyToClipboard(apiKey)} className="btn-copy">📋 Copy</button>
                            <button onClick={handleRegenerateKey} className="btn-regenerate">🔄 Regenerate</button>
                        </div>
                        <small>Use this key in all your API requests. Keep it secret!</small>
                    </div>

                    {/* Create Endpoint Section */}
                    <div className="dev-section create-section">
                        <h2>➕ Create New Endpoint</h2>

                        <div className="filter-grid">
                            <div className="filter-group">
                                <label>Endpoint Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={filters.name}
                                    onChange={handleFilterChange}
                                    placeholder="e.g., Atlantic Cod Data"
                                />
                                <small>Give this endpoint a descriptive name</small>
                            </div>

                            <div className="filter-group">
                                <label>Species</label>
                                <select name="speciesId" value={filters.speciesId} onChange={handleFilterChange}>
                                    <option value="">All Species</option>
                                    {species.map(s => (
                                        <option key={s._id} value={s._id}>
                                            {s.common_name} ({s.scientific_name})
                                        </option>
                                    ))}
                                </select>
                                <small>Filter by fish species</small>
                            </div>

                            <div className="filter-group">
                                <label>Date From</label>
                                <input
                                    type="date"
                                    name="dateFrom"
                                    value={filters.dateFrom}
                                    onChange={handleFilterChange}
                                />
                            </div>

                            <div className="filter-group">
                                <label>Date To</label>
                                <input
                                    type="date"
                                    name="dateTo"
                                    value={filters.dateTo}
                                    onChange={handleFilterChange}
                                />
                            </div>

                            <div className="filter-group">
                                <label>Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={filters.country}
                                    onChange={handleFilterChange}
                                    placeholder="e.g., Turkey"
                                />
                            </div>

                            <div className="filter-group">
                                <label>Region</label>
                                <input
                                    type="text"
                                    name="region"
                                    value={filters.region}
                                    onChange={handleFilterChange}
                                    placeholder="e.g., Marmara"
                                />
                            </div>

                            <div className="filter-group">
                                <label>Location Type</label>
                                <select name="locationType" value={filters.locationType} onChange={handleFilterChange}>
                                    <option value="">All Types</option>
                                    <option value="ocean">Ocean</option>
                                    <option value="river">River</option>
                                    <option value="lake">Lake</option>
                                    <option value="farm">Farm</option>
                                    <option value="coastal">Coastal</option>
                                    <option value="deep_sea">Deep Sea</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>Status</label>
                                <select name="status" value={filters.status} onChange={handleFilterChange}>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="archived">Archived</option>
                                    <option value="">All</option>
                                </select>
                            </div>
                        </div>

                        <div className="action-buttons">
                            <button onClick={handlePreview} className="btn-preview">
                                🔍 Check Match Count
                            </button>
                            {previewCount !== null && (
                                <span className="preview-count">
                                    Found <strong>{previewCount}</strong> records
                                </span>
                            )}
                            <button
                                onClick={handleCreateEndpoint}
                                className="btn-create"
                                disabled={creating || !filters.name.trim()}
                            >
                                {creating ? '⏳ Creating...' : '🚀 Generate API Link'}
                            </button>
                        </div>
                    </div>

                    {/* Existing Endpoints */}
                    <div className="dev-section endpoints-section">
                        <h2>📋 My Endpoints ({endpoints.length})</h2>

                        {endpoints.length === 0 ? (
                            <p className="no-endpoints">No endpoints created yet. Create one above!</p>
                        ) : (
                            <div className="endpoints-list">
                                {endpoints.map(ep => (
                                    <div key={ep._id} className="endpoint-card">
                                        <div className="endpoint-info">
                                            <h3>{ep.name}</h3>
                                            <div className="endpoint-meta">
                                                <span>📊 {ep.matchCount} records</span>
                                                <span>👁️ {ep.accessCount} accesses</span>
                                                <span>📅 Created: {new Date(ep.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="endpoint-url">
                                                <code>{getFullUrl(ep.endpointSlug)}</code>
                                                <button
                                                    onClick={() => copyToClipboard(getFullUrl(ep.endpointSlug))}
                                                    className="btn-copy-small"
                                                >
                                                    📋
                                                </button>
                                            </div>
                                        </div>
                                        <div className="endpoint-actions">
                                            <a
                                                href={getFullUrl(ep.endpointSlug)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-test"
                                            >
                                                🧪 Test
                                            </a>
                                            <button
                                                onClick={() => handleDeleteEndpoint(ep._id)}
                                                className="btn-delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={showConfirmModal}
                onConfirm={confirmModalConfig.onConfirm}
                onCancel={() => setShowConfirmModal(false)}
                title={confirmModalConfig.title}
                message={confirmModalConfig.message}
                confirmText={confirmModalConfig.confirmText}
                cancelText="Cancel"
                theme="developer"
                type="danger"
            />
        </div >
    );
};

export default DeveloperDashboard;
