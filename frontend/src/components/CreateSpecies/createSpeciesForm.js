import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import '../CreateSpecies/createSpeciesForm.css';

function CreateSpeciesForm({ onClose, onSuccess, initialData = null, isEditing = false }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialData || {
    scientific_name: '',
    common_name: '',
    family: '',
    genus: '',
    species: '',
    aliases: [],
    characteristics: {
      max_length: '',
      max_weight: '',
      max_age: '',
      body_shape: '',
      color_description: '',
      habitat: '',
      diet: '',
      behavior: '',
      reproduction: '',
      distinctive_features: ''
    },
    typical_locations: [],
    known_diseases: [],
    conservation_status: {
      iucn_status: '',
      population_trend: 'unknown'
    }
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const [aliasInput, setAliasInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [diseaseInput, setDiseaseInput] = useState('');

  // Handle basic field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle characteristics changes
  const handleCharacteristicChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      characteristics: {
        ...prev.characteristics,
        [field]: value
      }
    }));
  };

  // Handle conservation status changes
  const handleConservationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      conservation_status: {
        ...prev.conservation_status,
        [field]: value
      }
    }));
  };

  // Add alias
  const addAlias = () => {
    if (aliasInput.trim()) {
      setFormData(prev => ({
        ...prev,
        aliases: [...prev.aliases, aliasInput.trim()]
      }));
      setAliasInput('');
    }
  };

  // Remove alias
  const removeAlias = (index) => {
    setFormData(prev => ({
      ...prev,
      aliases: prev.aliases.filter((_, i) => i !== index)
    }));
  };

  // Add location
  const addLocation = () => {
    if (locationInput.trim()) {
      setFormData(prev => ({
        ...prev,
        typical_locations: [...prev.typical_locations, locationInput.trim()]
      }));
      setLocationInput('');
    }
  };

  // Remove location
  const removeLocation = (index) => {
    setFormData(prev => ({
      ...prev,
      typical_locations: prev.typical_locations.filter((_, i) => i !== index)
    }));
  };

  // Add disease
  const addDisease = () => {
    if (diseaseInput.trim()) {
      setFormData(prev => ({
        ...prev,
        known_diseases: [...prev.known_diseases, diseaseInput.trim()]
      }));
      setDiseaseInput('');
    }
  };

  // Remove disease
  const removeDisease = (index) => {
    setFormData(prev => ({
      ...prev,
      known_diseases: prev.known_diseases.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data for API
      const apiData = {
        ...formData,
        characteristics: {
          ...formData.characteristics,
          max_length: formData.characteristics.max_length ? parseFloat(formData.characteristics.max_length) : undefined,
          max_weight: formData.characteristics.max_weight ? parseFloat(formData.characteristics.max_weight) : undefined,
          max_age: formData.characteristics.max_age ? parseInt(formData.characteristics.max_age) : undefined
        }
      };

      const url = isEditing && initialData?._id
        ? `http://localhost:5001/api/fish-species/${initialData._id}`
        : 'http://localhost:5001/api/fish-species';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(apiData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(isEditing ? 'Fish species updated successfully!' : 'Fish species added successfully!');
        onSuccess && onSuccess(data.data);
        onClose && onClose();
      } else {
        toast.error(data.message || 'Error occurred during save');
        if (data.errors) {
          data.errors.forEach(err => {
            toast.error(`${err.field}: ${err.message}`);
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Server error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content fish-detail-modal">
        <div className="modal-header">
          <h2>🐠 {isEditing ? 'Edit Fish Species' : 'Add New Fish Species'}</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="species-form">
            {/* SECTION 1: Basic Information */}
            <div className="form-section">
              <h3>📋 Basic Information</h3>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Scientific Name *</label>
                  <input
                    type="text"
                    name="scientific_name"
                    value={formData.scientific_name}
                    onChange={handleChange}
                    placeholder="E.g., Salmo trutta"
                    required
                  />
                  <small>At least two words (Genus species format)</small>
                </div>

                <div className="form-group">
                  <label>Common Name</label>
                  <input
                    type="text"
                    name="common_name"
                    value={formData.common_name}
                    onChange={handleChange}
                    placeholder="E.g., Trout"
                  />
                </div>

                <div className="form-group">
                  <label>Family</label>
                  <input
                    type="text"
                    name="family"
                    value={formData.family}
                    onChange={handleChange}
                    placeholder="E.g., Salmonidae"
                  />
                </div>

                <div className="form-group">
                  <label>Genus</label>
                  <input
                    type="text"
                    name="genus"
                    value={formData.genus}
                    onChange={handleChange}
                    placeholder="E.g., Salmo"
                  />
                </div>

                <div className="form-group">
                  <label>Species</label>
                  <input
                    type="text"
                    name="species"
                    value={formData.species}
                    onChange={handleChange}
                    placeholder="E.g., trutta"
                  />
                </div>
              </div>

              {/* Aliases */}
              <div className="form-group">
                <label>Alternative Names (Aliases)</label>
                <div className="tag-input-group">
                  <input
                    type="text"
                    value={aliasInput}
                    onChange={(e) => setAliasInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addAlias();
                      }
                    }}
                    placeholder="Add alternative name and press Enter"
                  />
                  <button type="button" onClick={addAlias} className="btn-primary">
                    + Add
                  </button>
                </div>
                <div className="tags-list">
                  {formData.aliases.map((alias, index) => (
                    <span key={index} className="tag">
                      {alias}
                      <button type="button" onClick={() => removeAlias(index)}>✕</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 2: Characteristics */}
            <div className="form-section">
              <h3>📏 Physical Characteristics</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label>Maximum Length (cm)</label>
                  <input
                    type="number"
                    value={formData.characteristics.max_length}
                    onChange={(e) => handleCharacteristicChange('max_length', e.target.value)}
                    placeholder="120"
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label>Maximum Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.characteristics.max_weight}
                    onChange={(e) => handleCharacteristicChange('max_weight', e.target.value)}
                    placeholder="25"
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label>Maximum Age (years)</label>
                  <input
                    type="number"
                    value={formData.characteristics.max_age}
                    onChange={(e) => handleCharacteristicChange('max_age', e.target.value)}
                    placeholder="15"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Body Shape</label>
                  <input
                    type="text"
                    value={formData.characteristics.body_shape}
                    onChange={(e) => handleCharacteristicChange('body_shape', e.target.value)}
                    placeholder="Fusiform, elongated"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Color Description</label>
                  <textarea
                    value={formData.characteristics.color_description}
                    onChange={(e) => handleCharacteristicChange('color_description', e.target.value)}
                    rows="2"
                    placeholder="Back gray-green, sides silvery..."
                  />
                </div>

                <div className="form-group">
                  <label>Habitat</label>
                  <input
                    type="text"
                    value={formData.characteristics.habitat}
                    onChange={(e) => handleCharacteristicChange('habitat', e.target.value)}
                    placeholder="Freshwater, rivers"
                  />
                </div>

                <div className="form-group">
                  <label>Diet</label>
                  <input
                    type="text"
                    value={formData.characteristics.diet}
                    onChange={(e) => handleCharacteristicChange('diet', e.target.value)}
                    placeholder="Carnivore, insects, small fish"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Behavior</label>
                  <input
                    type="text"
                    value={formData.characteristics.behavior}
                    onChange={(e) => handleCharacteristicChange('behavior', e.target.value)}
                    placeholder="Migratory, moves to rivers during breeding"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Reproduction</label>
                  <input
                    type="text"
                    value={formData.characteristics.reproduction}
                    onChange={(e) => handleCharacteristicChange('reproduction', e.target.value)}
                    placeholder="Fall-winter, gravel river beds"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Distinctive Features</label>
                  <textarea
                    value={formData.characteristics.distinctive_features}
                    onChange={(e) => handleCharacteristicChange('distinctive_features', e.target.value)}
                    rows="2"
                    placeholder="Black spots on dorsal fin..."
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: Typical Locations */}
            <div className="form-section">
              <h3>📍 Typical Locations</h3>

              <div className="form-group">
                <div className="tag-input-group">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addLocation();
                      }
                    }}
                    placeholder="Add location and press Enter"
                  />
                  <button type="button" onClick={addLocation} className="btn-primary">
                    + Add
                  </button>
                </div>
                <div className="tags-list">
                  {formData.typical_locations.map((location, index) => (
                    <span key={index} className="tag">
                      {location}
                      <button type="button" onClick={() => removeLocation(index)}>✕</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 4: Known Diseases */}
            <div className="form-section">
              <h3>🏥 Known Diseases</h3>

              <div className="form-group">
                <div className="tag-input-group">
                  <input
                    type="text"
                    value={diseaseInput}
                    onChange={(e) => setDiseaseInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addDisease();
                      }
                    }}
                    placeholder="Add disease name and press Enter"
                  />
                  <button type="button" onClick={addDisease} className="btn-primary">
                    + Add
                  </button>
                </div>
                <div className="tags-list">
                  {formData.known_diseases.map((disease, index) => (
                    <span key={index} className="tag">
                      {disease}
                      <button type="button" onClick={() => removeDisease(index)}>✕</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 5: Conservation Status */}
            <div className="form-section">
              <h3>🌍 Conservation Status</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label>IUCN Status</label>
                  <select
                    value={formData.conservation_status.iucn_status}
                    onChange={(e) => handleConservationChange('iucn_status', e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="EX">EX - Extinct</option>
                    <option value="EW">EW - Extinct in the Wild</option>
                    <option value="CR">CR - Critically Endangered</option>
                    <option value="EN">EN - Endangered</option>
                    <option value="VU">VU - Vulnerable</option>
                    <option value="NT">NT - Near Threatened</option>
                    <option value="LC">LC - Least Concern</option>
                    <option value="DD">DD - Data Deficient</option>
                    <option value="NE">NE - Not Evaluated</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Population Trend</label>
                  <select
                    value={formData.conservation_status.population_trend}
                    onChange={(e) => handleConservationChange('population_trend', e.target.value)}
                  >
                    <option value="unknown">Unknown</option>
                    <option value="increasing">Increasing</option>
                    <option value="stable">Stable</option>
                    <option value="decreasing">Decreasing</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (isEditing ? 'Updating...' : 'Saving...') : (isEditing ? '💾 Update' : '💾 Save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateSpeciesForm;