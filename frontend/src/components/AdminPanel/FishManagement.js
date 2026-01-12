import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

function FishManagement() {
  const [fishData, setFishData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedFish, setSelectedFish] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchFishData();
  }, [sortBy, searchTerm]);

  const fetchFishData = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      if (sortBy) params.append('sort', sortBy);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`http://localhost:5001/api/admin/fish?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setFishData(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch fish data');
      }
    } catch (error) {
      console.error('Error fetching fish data:', error);
      toast.error('Failed to load fish data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewFish = async (fishId) => {
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
        setShowDetailModal(true);
      } else {
        toast.error(data.message || 'Failed to fetch fish details');
      }
    } catch (error) {
      console.error('Error fetching fish details:', error);
      toast.error('Failed to load fish details');
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedFish(null);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner">🔄</div>
        <p>Loading fish data...</p>
      </div>
    );
  }

  return (
    <div className="fish-management-container">
      {/* Header with filters */}
      <div className="fish-management-header">
        <div className="fish-filters">
          <input
            type="text"
            placeholder="🔍 Search by fish name, species..."
            className="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="admin-filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetic">Alphabetical (A-Z)</option>
            <option value="catch_date">By Catch Date</option>
          </select>

          <button className="refresh-btn" onClick={fetchFishData} title="Refresh">
            🔄
          </button>
        </div>
      </div>

      {/* Fish count */}
      <div className="fish-count">
        <p>Total Fish Records: <strong>{fishData.length}</strong></p>
      </div>

      {/* Fish Table */}
      {fishData.length === 0 ? (
        <div className="no-data-message">
          <p>No fish records found</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fish Name</th>
                <th>Species</th>
                <th>Submitted By</th>
                <th>Catch Date</th>
                <th>Location</th>
                <th>Diseases</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fishData.map(fish => (
                <tr key={fish._id}>
                  <td>
                    <div className="fish-name-cell">
                      <strong>{fish.fish_name || 'Unnamed Fish'}</strong>
                      {fish.common_name && (
                        <span className="fish-subtitle">{fish.common_name}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="species-cell">
                      <em>{fish.species_id?.scientific_name || 'N/A'}</em>
                      {fish.species_id?.common_name && (
                        <span className="species-common">{fish.species_id.common_name}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="submitter-cell">
                      <strong>
                        {fish.submitted_by?.first_name} {fish.submitted_by?.last_name}
                      </strong>
                      <span className="submitter-email">{fish.submitted_by?.mail}</span>
                      <span className={`role-badge ${fish.submitted_by?.role}`}>
                        {fish.submitted_by?.role}
                      </span>
                    </div>
                  </td>
                  <td>{new Date(fish.catch_date).toLocaleDateString()}</td>
                  <td>
                    {fish.location?.location_name || fish.location?.country || 'N/A'}
                    {fish.location?.country && fish.location?.location_name && (
                      <div className="location-subtitle">{fish.location.country}</div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {fish.disease_ids?.length || 0}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button
                      className="btn-sm btn-view"
                      onClick={() => handleViewFish(fish._id)}
                      title="View Details"
                    >
                      👁️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Fish Detail Modal */}
      {showDetailModal && selectedFish && (
        <FishDetailModal
          fish={selectedFish}
          onClose={closeDetailModal}
        />
      )}
    </div>
  );
}

// Fish Detail Modal Component
function FishDetailModal({ fish, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fish-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🐟 Fish Details</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

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
                <span>{fish.common_name || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <label>Scientific Name:</label>
                <span><em>{fish.scientific_name || 'Not specified'}</em></span>
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

          {/* Submitted By */}
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
                  <span className="role-badge">{fish.submitted_by.role}</span>
                </div>
              </div>
            </section>
          )}

          {/* Notes */}
          {fish.notes && (
            <section className="detail-section">
              <h3 className="section-title">📝 Notes</h3>
              <div className="notes-content">
                {fish.notes}
              </div>
            </section>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default FishManagement;

