import React, { useState, useEffect } from 'react';
import './PartnerSettingsSection.css';
import { toast } from 'react-toastify';

const PartnerSettingsSection = () => {
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [formData, setFormData] = useState({
        company_name: '',
        company_address: '',
        tax_number: '',
        business_type: '',
        website: '',
        contact_person: '',
        contact_email: '',
        contact_phone: ''
    });
    const [profileCompleted, setProfileCompleted] = useState(false);

    useEffect(() => {
        fetchPartnerProfile();
    }, []);

    const fetchPartnerProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/api/partner/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setFormData({
                        company_name: result.data.company_name || '',
                        company_address: result.data.company_address || '',
                        tax_number: result.data.tax_number || '',
                        business_type: result.data.business_type || '',
                        website: result.data.website || '',
                        contact_person: result.data.contact_person || '',
                        contact_email: result.data.contact_email || '',
                        contact_phone: result.data.contact_phone || ''
                    });
                    setProfileCompleted(result.data.profile_completed);

                    // Show welcome modal if first login not completed
                    if (!result.data.first_login_completed) {
                        setShowWelcomeModal(true);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching partner profile:', error);
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleWelcomeComplete = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:5001/api/partner/complete-first-login', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setShowWelcomeModal(false);
            setIsEditing(true); // Open edit mode automatically
        } catch (error) {
            console.error('Error completing first login:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/api/partner/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success('Profile updated successfully');
                setProfileCompleted(true);
                setIsEditing(false);
            } else {
                toast.error(result.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('An error occurred while saving');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !formData.company_name) {
        return <div className="loading-spinner">Loading...</div>;
    }

    return (
        <div className="partner-settings-container">
            {showWelcomeModal && (
                <div className="welcome-modal-overlay">
                    <div className="welcome-modal">
                        <div className="welcome-icon">👋</div>
                        <h2 className="welcome-title">Welcome Partner!</h2>
                        <p className="welcome-text">
                            We're excited to have you on board. Please verify your company details to complete your profile setup.
                        </p>
                        <button className="welcome-btn" onClick={handleWelcomeComplete}>
                            Complete Profile Setup
                        </button>
                    </div>
                </div>
            )}

            <div className="settings-header">
                <h1 className="settings-title">Partner Profile</h1>
                <p className="settings-subtitle">Manage your company information and contact details</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-title">
                            <span className="section-icon">🏢</span>
                            Company Information
                            {profileCompleted ?
                                <span className="status-badge complete">Verified</span> :
                                <span className="status-badge incomplete">Incomplete</span>
                            }
                        </div>
                        {!isEditing && (
                            <button type="button" className="edit-btn" onClick={() => setIsEditing(true)}>
                                ✏️ Edit Details
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label className="form-label">Company Name *</label>
                                <input
                                    type="text"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                    placeholder="Enter company name"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">Address</label>
                                <input
                                    type="text"
                                    name="company_address"
                                    value={formData.company_address}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Full business address"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Tax Number</label>
                                <input
                                    type="text"
                                    name="tax_number"
                                    value={formData.tax_number}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Tax ID / VAT Number"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Business Type</label>
                                <select
                                    name="business_type"
                                    value={formData.business_type}
                                    onChange={handleChange}
                                    className="form-input"
                                >
                                    <option value="">Select Type</option>
                                    <option value="Fishery">Fishery</option>
                                    <option value="Research Institute">Research Institute</option>
                                    <option value="Processor">Seafood Processor</option>
                                    <option value="Distributor">Distributor</option>
                                    <option value="Retailer">Retailer</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">Website</label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="info-display">
                            <div className="info-item">
                                <div className="info-label">Company Name</div>
                                <div className={`info-value ${!formData.company_name ? 'empty' : ''}`}>
                                    {formData.company_name || 'Not set'}
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Tax Number</div>
                                <div className={`info-value ${!formData.tax_number ? 'empty' : ''}`}>
                                    {formData.tax_number || 'Not set'}
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Business Type</div>
                                <div className={`info-value ${!formData.business_type ? 'empty' : ''}`}>
                                    {formData.business_type || 'Not set'}
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Website</div>
                                <div className={`info-value ${!formData.website ? 'empty' : ''}`}>
                                    {formData.website || 'Not set'}
                                </div>
                            </div>
                            <div className="info-item" style={{ gridColumn: 'span 2' }}>
                                <div className="info-label">Address</div>
                                <div className={`info-value ${!formData.company_address ? 'empty' : ''}`}>
                                    {formData.company_address || 'Not set'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-title">
                            <span className="section-icon">👤</span>
                            Contact Person
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    name="contact_person"
                                    value={formData.contact_person}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Primary contact name"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    name="contact_phone"
                                    value={formData.contact_phone}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="+1 234 567 8900"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    name="contact_email"
                                    value={formData.contact_email}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="contact@company.com"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="info-display">
                            <div className="info-item">
                                <div className="info-label">Contact Person</div>
                                <div className={`info-value ${!formData.contact_person ? 'empty' : ''}`}>
                                    {formData.contact_person || 'Not set'}
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Phone</div>
                                <div className={`info-value ${!formData.contact_phone ? 'empty' : ''}`}>
                                    {formData.contact_phone || 'Not set'}
                                </div>
                            </div>
                            <div className="info-item" style={{ gridColumn: 'span 2' }}>
                                <div className="info-label">Email</div>
                                <div className={`info-value ${!formData.contact_email ? 'empty' : ''}`}>
                                    {formData.contact_email || 'Not set'}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {isEditing && (
                    <div className="form-actions">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => {
                                setIsEditing(false);
                                fetchPartnerProfile(); // Reset changes
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="save-btn"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default PartnerSettingsSection;
