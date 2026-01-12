import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './SettingsSection.css';
import PartnerSettingsSection from '../../PartnerSettings/PartnerSettingsSection';

import { useTheme } from '../../../context/ThemeContext';

function SettingsSection() {
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        mail: '',
        phone: '',
        title: '',
        position: '',
        role: '',
        createdAt: '',
        is_active: true,
        email_verified: false,
        last_login: '',
        language: 'en'
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setProfileData({
                    ...data.data,
                    phone: data.data.phone || '',
                    title: data.data.title || '',
                    position: data.data.position || '',
                    language: data.data.preferences?.language || 'en'
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile data');
        }
    };

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const toggleEdit = () => {
        if (isEditing) {
            fetchProfile();
        }
        setIsEditing(!isEditing);
    };

    const onProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/auth/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    first_name: profileData.first_name,
                    last_name: profileData.last_name,
                    phone: profileData.phone,
                    title: profileData.title,
                    position: profileData.position,
                    preferences: {
                        language: profileData.language
                    }
                })
            });
            const data = await response.json();
            if (data.success) {
                toast.success(data.message);
                setIsEditing(false);
                fetchProfile();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const onPasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });
            const data = await response.json();
            if (data.success) {
                toast.success(data.message);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Error changing password');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString, includeTime = false) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="settings-container">
            <h2 className="section-title">Account Settings</h2>

            <div className="settings-tabs">
                <button
                    className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('appearance')}
                >
                    🎨 Appearance
                </button>
                {/* Security Tab (removed id for brevity in target) */}
                <button
                    className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    🔒 Security
                </button>
                {profileData.role === 'partner' && (
                    <button
                        className={`tab-btn ${activeTab === 'partner' ? 'active' : ''}`}
                        onClick={() => setActiveTab('partner')}
                    >
                        🏢 Company Info
                    </button>
                )}
            </div>

            <div className="settings-content">
                {activeTab === 'profile' ? (
                    <form onSubmit={onProfileSubmit} className="settings-form">
                        <div className="form-grid">
                            {/* Read-Only Info Banner */}
                            <div className="form-group full-width info-banner">
                                <div className="info-item">
                                    <label>Email Address</label>
                                    <span>{profileData.mail}</span>
                                </div>
                                <div className="info-item">
                                    <label>Role</label>
                                    <span className="capitalize">{profileData.role}</span>
                                </div>
                                <div className="info-item">
                                    <label>Status</label>
                                    <span className={`status-pill ${profileData.is_active ? 'active' : 'inactive'}`}>
                                        {profileData.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <label>Email Verified</label>
                                    <span>{profileData.email_verified ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="info-item">
                                    <label>Member Since</label>
                                    <span>{formatDate(profileData.createdAt)}</span>
                                </div>
                            </div>

                            {/* Editable Fields */}
                            <div className="form-group">
                                <label>First Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={profileData.first_name}
                                        onChange={handleProfileChange}
                                        placeholder="Enter first name"
                                    />
                                ) : (
                                    <div className="read-only-field">{profileData.first_name}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Last Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={profileData.last_name}
                                        onChange={handleProfileChange}
                                        placeholder="Enter last name"
                                    />
                                ) : (
                                    <div className="read-only-field">{profileData.last_name}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="phone"
                                        value={profileData.phone}
                                        onChange={handleProfileChange}
                                        placeholder="Enter phone number"
                                    />
                                ) : (
                                    <div className="read-only-field">{profileData.phone || 'Not set'}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Title (Mr/Mrs)</label>
                                {isEditing ? (
                                    <select name="title" value={profileData.title} onChange={handleProfileChange}>
                                        <option value="">Select Title</option>
                                        <option value="Mr">Mr</option>
                                        <option value="Mrs">Mrs</option>
                                    </select>
                                ) : (
                                    <div className="read-only-field">{profileData.title || 'Not set'}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Language</label>
                                {isEditing ? (
                                    <select name="language" value={profileData.language} onChange={handleProfileChange}>
                                        <option value="en">English</option>
                                        <option value="tr">Turkish</option>
                                    </select>
                                ) : (
                                    <div className="read-only-field">{profileData.language === 'tr' ? 'Turkish' : 'English'}</div>
                                )}
                            </div>

                            <div className="form-group full-width">
                                <label>Job Position</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="position"
                                        value={profileData.position}
                                        onChange={handleProfileChange}
                                        placeholder="e.g. Senior Marine Biologist"
                                    />
                                ) : (
                                    <div className="read-only-field">{profileData.position || 'Not set'}</div>
                                )}
                            </div>
                        </div>

                        <div className="form-actions">
                            {isEditing ? (
                                <>
                                    <button type="button" className="btn-secondary" onClick={toggleEdit} style={{ marginRight: '10px' }}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="save-btn" disabled={loading}>
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </>
                            ) : (
                                <button type="button" className="save-btn" onClick={toggleEdit}>
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </form>

                ) : activeTab === 'partner' ? (
                    <div className="embedded-partner-settings">
                        <PartnerSettingsSection />
                    </div>
                ) : activeTab === 'appearance' ? (
                    <div className="settings-section-content">
                        <div className="appearance-card">
                            <div className="appearance-header">
                                <h3>Theme Preferences</h3>
                                <p>Customize your viewing experience</p>
                            </div>

                            <div className="theme-options">
                                <div
                                    className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                                    onClick={() => theme !== 'light' && toggleTheme()}
                                >
                                    <div className="theme-preview light-preview">
                                        <div className="preview-nav"></div>
                                        <div className="preview-content"></div>
                                    </div>
                                    <span>Light Mode</span>
                                </div>

                                <div
                                    className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                                    onClick={() => theme !== 'dark' && toggleTheme()}
                                >
                                    <div className="theme-preview dark-preview">
                                        <div className="preview-nav"></div>
                                        <div className="preview-content"></div>
                                    </div>
                                    <span>Dark Mode</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={onPasswordSubmit} className="settings-form">
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="save-btn warning-btn" disabled={loading}>
                                {loading ? 'Updating...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div >
    );
}

export default SettingsSection;
