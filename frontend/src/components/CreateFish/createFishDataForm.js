import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './createFishDataForm.css';

/**
 * Convert DMS (Degrees Minutes Seconds) to Decimal Degrees
 * Accepts formats like: 32°57'49.7"N, 32 57 49.7 N, 32°57'49.7"
 * @param {string} dms - DMS string
 * @returns {number|null} - Decimal degrees or null if invalid
 */
function dmsToDecimal(dms) {
    if (!dms) return null;

    // Convert to string if it's a number
    const dmsStr = String(dms).trim();

    // If it's already a valid decimal number, return it
    const asNumber = parseFloat(dmsStr);
    if (!isNaN(asNumber) && !dmsStr.match(/[°'"NSEW]/i)) {
        return asNumber;
    }

    // DMS regex pattern - more flexible
    // Matches formats like: 32°57'49.7"N, 32 57 49.7 N, 16°27'34.0"W
    const dmsPattern = /^(-?)(\d+)[°\s]+(\d+)['′\s]+([0-9.]+)["″]?\s*([NSEW]?)$/i;
    const match = dmsStr.match(dmsPattern);

    if (!match) {
        console.warn('DMS pattern did not match:', dmsStr);
        return null;
    }

    const sign = match[1];
    const degrees = parseFloat(match[2]);
    const minutes = parseFloat(match[3]);
    const seconds = parseFloat(match[4]);
    const direction = match[5] ? match[5].toUpperCase() : '';

    // Validate ranges
    if (minutes >= 60 || seconds >= 60) {
        console.warn('Invalid DMS values:', { degrees, minutes, seconds });
        return null;
    }

    // Calculate decimal degrees
    let decimal = degrees + (minutes / 60) + (seconds / 3600);

    // Apply direction (S and W are negative)
    if (direction === 'S' || direction === 'W' || sign === '-') {
        decimal = -Math.abs(decimal);
    }

    console.log(`DMS conversion: "${dmsStr}" → ${decimal}`);
    return decimal;
}

// Helper to safely merge initial data with defaults
const getSafeFormData = (initial = null) => {
    const defaults = {
        partner_id: localStorage.getItem('partnerId') || '',
        submitted_by: localStorage.getItem('userId') || '',
        species_id: '',
        fish_name: '',
        catch_date: '',
        notes: '',

        catch_details: {
            fishing_method: '',
            depth: '',
            time_of_day: '',
            water_temperature: '',
            weather_conditions: ''
        },

        physical_characteristics: {
            length: '',
            weight: '',
            age: '',
            sex: 'unknown',
            color_pattern: '',
            body_condition: '',
            scales_condition: '',
            fins_condition: ''
        },

        location_data: {
            location_name: '',
            coordinates: {
                lat: '',
                lng: ''
            },
            location_type: 'ocean',
            water_conditions: {
                temperature: '',
                ph: '',
                salinity: '',
                dissolved_oxygen: ''
            },
            environmental_data: {
                air_temperature: '',
                wind_speed: '',
                season: 'summer'
            },
            region: '',
            country: 'Türkiye'
        },

        diseases: []
    };

    if (!initial) return defaults;

    // Deep merge logic to ensure nested objects exist
    return {
        ...defaults,
        ...initial,
        catch_details: { ...defaults.catch_details, ...(initial.catch_details || {}) },
        physical_characteristics: { ...defaults.physical_characteristics, ...(initial.physical_characteristics || {}) },
        location_data: {
            ...defaults.location_data,
            ...(initial.location_data || {}),
            coordinates: { ...defaults.location_data.coordinates, ...(initial.location_data?.coordinates || {}) },
            water_conditions: { ...defaults.location_data.water_conditions, ...(initial.location_data?.water_conditions || {}) },
            environmental_data: { ...defaults.location_data.environmental_data, ...(initial.location_data?.environmental_data || {}) }
        },
        // Ensure arrays are arrays
        diseases: Array.isArray(initial.diseases) ? initial.diseases : defaults.diseases
    };
};

function CreateFishDataForm({ embedded = false, initialData = null, onSuccess = null }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [speciesList, setSpeciesList] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [expandedSections, setExpandedSections] = useState({
        species: true,
        location: false,
        catchDetails: false,
        physical: false,
        diseases: false,
        images: false,
        notes: false
    });

    // Form State
    // Form State
    const [formData, setFormData] = useState(() => {
        const data = getSafeFormData(initialData);
        // Ensure date format on mount if needed
        if (data.catch_date && data.catch_date.includes('T')) {
            try {
                data.catch_date = new Date(data.catch_date).toISOString().split('T')[0];
            } catch (e) {
                console.error('Invalid date format:', data.catch_date);
            }
        }
        return data;
    });

    // Fetch species list on mount
    useEffect(() => {
        fetchSpecies();
    }, []);

    // Update form when initialData changes
    useEffect(() => {
        if (initialData) {
            const safeData = getSafeFormData(initialData);

            if (safeData.catch_date && safeData.catch_date.includes('T')) {
                // Convert ISO date to yyyy-MM-dd format
                try {
                    const date = new Date(safeData.catch_date);
                    safeData.catch_date = date.toISOString().split('T')[0];
                } catch (e) {
                    console.error('Invalid date in update:', safeData.catch_date);
                }
            }

            setFormData(safeData);
            // Load existing images for edit mode
            if (initialData.images && initialData.images.length > 0) {
                setExistingImages(initialData.images);
            }
        }
    }, [initialData]);

    const fetchSpecies = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/fish-species', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setSpeciesList(data.data);
            }
        } catch (error) {
            console.error('Error fetching species:', error);
            toast.error('Failed to load fish species');
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Handle basic field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle nested object changes
    const handleNestedChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    // Handle deeply nested changes (location water conditions)
    const handleDeepNestedChange = (section, subsection, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [subsection]: {
                    ...prev[section][subsection],
                    [field]: value
                }
            }
        }));
    };

    // Add new disease
    const addDisease = () => {
        setFormData(prev => ({
            ...prev,
            diseases: [
                ...prev.diseases,
                {
                    disease_name: '',
                    disease_code: '',
                    severity: 'medium',
                    detected_date: new Date().toISOString().split('T')[0],
                    detection_method: 'visual_inspection',
                    symptoms: [],
                    treatment: {
                        method: '',
                        medication: '',
                        dosage: '',
                        duration: ''
                    },
                    status: 'active',
                    images: []
                }
            ]
        }));
    };

    // Remove disease
    const removeDisease = (index) => {
        setFormData(prev => ({
            ...prev,
            diseases: prev.diseases.filter((_, i) => i !== index)
        }));
    };

    // Update disease field
    const updateDisease = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            diseases: prev.diseases.map((disease, i) =>
                i === index ? { ...disease, [field]: value } : disease
            )
        }));
    };

    // Add symptom to disease
    const addSymptom = (diseaseIndex, symptom) => {
        if (!symptom.trim()) return;

        setFormData(prev => ({
            ...prev,
            diseases: prev.diseases.map((disease, i) =>
                i === diseaseIndex
                    ? { ...disease, symptoms: [...disease.symptoms, symptom] }
                    : disease
            )
        }));
    };

    // Remove symptom from disease
    const removeSymptom = (diseaseIndex, symptomIndex) => {
        setFormData(prev => ({
            ...prev,
            diseases: prev.diseases.map((disease, i) =>
                i === diseaseIndex
                    ? { ...disease, symptoms: disease.symptoms.filter((_, si) => si !== symptomIndex) }
                    : disease
            )
        }));
    };

    // Clear form handler
    const handleClearForm = () => {
        setFormData(getSafeFormData());
        setImageFiles([]);
        setImagePreviews([]);
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + imageFiles.length > 10) {
            toast.warning('Maximum 10 images allowed');
            return;
        }

        // Validate file types and sizes
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not an image file`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} is larger than 5MB`);
                return false;
            }
            return true;
        });

        setImageFiles(prev => [...prev, ...validFiles]);

        // Create previews
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreviews(prev => [...prev, { file, url: e.target.result }]);
            };
            reader.readAsDataURL(file);
        });
    };

    // Remove new image (before upload)
    const removeImage = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Remove existing image (mark for deletion)
    const removeExistingImage = (imageUrl) => {
        setExistingImages(prev => prev.filter(url => url !== imageUrl));
        setImagesToDelete(prev => [...prev, imageUrl]);
        toast.info('Image marked for deletion. Save to confirm.');
    };

    // Save draft handler
    const handleSaveDraft = async (e) => {
        e.preventDefault();
        await handleSubmit(e, true);
    };

    // Handle form submission
    const handleSubmit = async (e, isDraft = false) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Prepare data for API - fix field names to match backend expectations
            const partnerId = localStorage.getItem('partnerId');
            const userId = localStorage.getItem('userId');

            // Validate required fields
            if (!userId) {
                toast.error('User information not found. Please log in again.');
                setLoading(false);
                return;
            }

            if (!formData.species_id) {
                toast.error('Please select a fish species');
                setLoading(false);
                return;
            }

            if (!formData.catch_date) {
                toast.error('Please enter catch date');
                setLoading(false);
                return;
            }

            const apiData = {
                partner_id: partnerId && partnerId !== 'null' ? partnerId : null,
                submitted_by: userId,
                species_id: formData.species_id,
                ...(formData.fish_name && { fish_name: formData.fish_name }),
                catch_date: formData.catch_date,
                ...(formData.notes && { notes: formData.notes }),
                status: isDraft ? 'draft' : 'pending',
                catch_details: {
                    ...(formData.catch_details.fishing_method && { fishing_method: formData.catch_details.fishing_method }),
                    ...(formData.catch_details.depth && { depth: parseFloat(formData.catch_details.depth) }),
                    ...(formData.catch_details.time_of_day && { time_of_day: formData.catch_details.time_of_day }),
                    ...(formData.catch_details.water_temperature && { water_temperature: parseFloat(formData.catch_details.water_temperature) }),
                    ...(formData.catch_details.weather_conditions && { weather_conditions: formData.catch_details.weather_conditions })
                },
                physical_characteristics: {
                    ...(formData.physical_characteristics.length && { length: parseFloat(formData.physical_characteristics.length) }),
                    ...(formData.physical_characteristics.weight && { weight: parseFloat(formData.physical_characteristics.weight) }),
                    ...(formData.physical_characteristics.age && { age: parseInt(formData.physical_characteristics.age) }),
                    sex: formData.physical_characteristics.sex || 'unknown',
                    ...(formData.physical_characteristics.color_pattern && { color_pattern: formData.physical_characteristics.color_pattern }),
                    ...(formData.physical_characteristics.body_condition && { body_condition: formData.physical_characteristics.body_condition }),
                    ...(formData.physical_characteristics.scales_condition && { scales_condition: formData.physical_characteristics.scales_condition }),
                    ...(formData.physical_characteristics.fins_condition && { fins_condition: formData.physical_characteristics.fins_condition })
                },
                location: {
                    ...(formData.location_data.location_name && { location_name: formData.location_data.location_name }),
                    coordinates: formData.location_data.coordinates.lat && formData.location_data.coordinates.lng ? {
                        latitude: (() => {
                            const lat = formData.location_data.coordinates.lat;
                            const decimal = dmsToDecimal(lat);
                            return decimal !== null ? decimal : parseFloat(lat);
                        })(),
                        longitude: (() => {
                            const lng = formData.location_data.coordinates.lng;
                            const decimal = dmsToDecimal(lng);
                            return decimal !== null ? decimal : parseFloat(lng);
                        })()
                    } : {},
                    location_type: formData.location_data.location_type || 'ocean',
                    water_conditions: {
                        ...(formData.location_data.water_conditions.temperature && { temperature: parseFloat(formData.location_data.water_conditions.temperature) }),
                        ...(formData.location_data.water_conditions.ph && { pH: parseFloat(formData.location_data.water_conditions.ph) }),
                        ...(formData.location_data.water_conditions.salinity && { salinity: parseFloat(formData.location_data.water_conditions.salinity) }),
                        ...(formData.location_data.water_conditions.dissolved_oxygen && { dissolved_oxygen: parseFloat(formData.location_data.water_conditions.dissolved_oxygen) })
                    },
                    environmental_data: {
                        ...(formData.catch_details.depth && { depth: parseFloat(formData.catch_details.depth) })
                    },
                    ...(formData.location_data.region && { region: formData.location_data.region }),
                    ...(formData.location_data.country && { country: formData.location_data.country })
                },
                diseases: formData.diseases.map(disease => {
                    // Clean up disease data - remove empty strings
                    const cleanedDisease = {
                        disease_name: disease.disease_name,
                        severity: disease.severity || 'medium',
                        detected_date: disease.detected_date || new Date().toISOString().split('T')[0],
                        detection_method: disease.detection_method || 'visual_inspection',
                        symptoms: disease.symptoms || [],
                        status: disease.status || 'active',
                        images: disease.images || []
                    };

                    // Only add disease_code if it's not empty
                    if (disease.disease_code && disease.disease_code.trim() !== '') {
                        cleanedDisease.disease_code = disease.disease_code;
                    }

                    // Only add treatment if any field has a value
                    if (disease.treatment && (
                        disease.treatment.method ||
                        disease.treatment.medication ||
                        disease.treatment.dosage ||
                        disease.treatment.duration
                    )) {
                        cleanedDisease.treatment = disease.treatment;
                    }

                    return cleanedDisease;
                })
            };

            // Add images to delete if any
            if (imagesToDelete.length > 0) {
                apiData.imagesToDelete = imagesToDelete;
            }

            // Add new images as base64 (from previews which already contain data URLs)
            if (imagePreviews.length > 0) {
                apiData.newImages = imagePreviews.map(preview => preview.url);
                console.log('📷 New images to add:', apiData.newImages.length);
            }

            // Keep existing images that weren't deleted
            apiData.existingImages = existingImages;

            console.log('Sending data with', apiData.newImages?.length || 0, 'new images');

            const url = initialData?._id
                ? `http://localhost:5001/api/fish-data/${initialData._id}`
                : 'http://localhost:5001/api/fish-data/create-with-all-data';

            const method = initialData?._id ? 'PUT' : 'POST';

            // Send as JSON (base64 images included)
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(apiData)
            });

            // Get response text first, then try to parse as JSON
            const responseText = await response.text();
            console.log('Response status:', response.status);
            console.log('Response text (first 200 chars):', responseText.substring(0, 200));

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse response as JSON:', parseError);
                console.error('Full response:', responseText);
                toast.error('Server returned an unexpected response. Check the console.');
                setLoading(false);
                return;
            }

            console.log('Response data:', data);

            if (data.success) {
                if (isDraft) {
                    toast.success('Draft saved successfully!');
                } else if (initialData?._id) {
                    toast.success('Fish data published successfully!');
                } else {
                    toast.success('Fish data saved successfully!');
                }

                if (onSuccess) {
                    onSuccess();
                } else if (!embedded) {
                    setTimeout(() => {
                        navigate('/home');
                    }, 1500);
                } else {
                    // Reset form when embedded
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                }
            } else {
                toast.error(data.message || 'Error occurred during save');
                if (data.errors) {
                    console.error('Validation errors:', data.errors);
                    // Log each error in detail
                    data.errors.forEach(err => {
                        console.error(`Field: ${err.field}, Message: ${err.message}, Value:`, err.value);
                    });
                    data.errors.forEach((err, index) => {
                        setTimeout(() => {
                            toast.error(`${err.field}: ${err.message}`, {
                                autoClose: 5000
                            });
                        }, index * 100);
                    });
                }
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.message === 'Failed to fetch') {
                toast.error('Could not connect to backend server. Please make sure the backend is running.');
            } else {
                toast.error('Server error: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-fish-form-container">
            {!embedded && (
                <div className="form-header">
                    <button className="back-btn" onClick={() => navigate('/home')}>
                        ← Back
                    </button>
                    <h1>🐟 {initialData ? 'Edit Fish Data' : 'Add New Fish Data'}</h1>
                </div>
            )}

            <form onSubmit={handleSubmit} className="fish-form">
                {/* SECTION 1: Species Identification */}
                <div className={`accordion-section ${expandedSections.species ? 'expanded' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleSection('species')}>
                        <h3>1. Species Identification</h3>
                        <span className="expand-icon">{expandedSections.species ? '▲' : '▼'}</span>
                    </div>
                    {expandedSections.species && (
                        <div className="accordion-content">
                            <p className="section-description">Enter the species name and common name of the fish.</p>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fish Species <span className="required">*</span></label>
                                    <select
                                        name="species_id"
                                        value={formData.species_id}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Species</option>
                                        {speciesList.map(species => (
                                            <option key={species._id} value={species._id}>
                                                {species.scientific_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Common Name</label>
                                    <input
                                        type="text"
                                        name="fish_name"
                                        value={formData.fish_name}
                                        onChange={handleChange}
                                        placeholder="E.g., Trout #42"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Catch Date <span className="required">*</span></label>
                                <input
                                    type="date"
                                    name="catch_date"
                                    value={formData.catch_date}
                                    onChange={handleChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* SECTION 2: Catch Location */}
                <div className={`accordion-section ${expandedSections.location ? 'expanded' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleSection('location')}>
                        <h3>2. Catch Location</h3>
                        <span className="expand-icon">{expandedSections.location ? '▲' : '▼'}</span>
                    </div>
                    {expandedSections.location && (
                        <div className="accordion-content">
                            <p className="section-description">Enter geographic coordinates and a short description of the location.</p>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Location Name</label>
                                    <input
                                        type="text"
                                        value={formData.location_data.location_name}
                                        onChange={(e) => handleNestedChange('location_data', 'location_name', e.target.value)}
                                        placeholder="Black Sea - Trabzon"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Location Type</label>
                                    <select
                                        value={formData.location_data.location_type}
                                        onChange={(e) => handleNestedChange('location_data', 'location_type', e.target.value)}
                                    >
                                        <option value="ocean">Ocean</option>
                                        <option value="river">River</option>
                                        <option value="lake">Lake</option>
                                        <option value="farm">Farm</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Latitude</label>
                                    <input
                                        type="text"
                                        value={formData.location_data.coordinates.lat}
                                        onChange={(e) => {
                                            // Just save the value as-is (DMS or decimal)
                                            handleDeepNestedChange('location_data', 'coordinates', 'lat', e.target.value);
                                        }}
                                        placeholder="41.0082 veya 32°57'49.7&quot;N"
                                    />
                                    <small style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                                        You can enter in decimal (41.0082) or DMS (32°57'49.7"N) format
                                    </small>
                                </div>

                                <div className="form-group">
                                    <label>Longitude</label>
                                    <input
                                        type="text"
                                        value={formData.location_data.coordinates.lng}
                                        onChange={(e) => {
                                            // Just save the value as-is (DMS or decimal)
                                            handleDeepNestedChange('location_data', 'coordinates', 'lng', e.target.value);
                                        }}
                                        placeholder="39.7178 veya 16°27'34.0&quot;W"
                                    />
                                    <small style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                                        You can enter in decimal (39.7178) or DMS (16°27'34.0"W) format
                                    </small>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Region</label>
                                    <input
                                        type="text"
                                        value={formData.location_data.region}
                                        onChange={(e) => handleNestedChange('location_data', 'region', e.target.value)}
                                        placeholder="Black Sea Region"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Country</label>
                                    <input
                                        type="text"
                                        value={formData.location_data.country}
                                        onChange={(e) => handleNestedChange('location_data', 'country', e.target.value)}
                                        placeholder="Turkey"
                                    />
                                </div>
                            </div>

                            <h4 className="subsection-title">💧 Water Conditions</h4>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Water Temperature (°C)</label>
                                    <input
                                        type="number"
                                        value={formData.location_data.water_conditions.temperature}
                                        onChange={(e) => handleDeepNestedChange('location_data', 'water_conditions', 'temperature', e.target.value)}
                                        placeholder="18"
                                        step="0.1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>pH</label>
                                    <input
                                        type="number"
                                        value={formData.location_data.water_conditions.ph}
                                        onChange={(e) => handleDeepNestedChange('location_data', 'water_conditions', 'ph', e.target.value)}
                                        placeholder="8.1"
                                        step="0.1"
                                        min="0"
                                        max="14"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Salinity (ppt)</label>
                                    <input
                                        type="number"
                                        value={formData.location_data.water_conditions.salinity}
                                        onChange={(e) => handleDeepNestedChange('location_data', 'water_conditions', 'salinity', e.target.value)}
                                        placeholder="35"
                                        step="0.1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Dissolved Oxygen (mg/L)</label>
                                    <input
                                        type="number"
                                        value={formData.location_data.water_conditions.dissolved_oxygen}
                                        onChange={(e) => handleDeepNestedChange('location_data', 'water_conditions', 'dissolved_oxygen', e.target.value)}
                                        placeholder="7.5"
                                        step="0.1"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* SECTION 3: Catch Details */}
                <div className={`accordion-section ${expandedSections.catchDetails ? 'expanded' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleSection('catchDetails')}>
                        <h3>3. Catch Details</h3>
                        <span className="expand-icon">{expandedSections.catchDetails ? '▲' : '▼'}</span>
                    </div>
                    {expandedSections.catchDetails && (
                        <div className="accordion-content">
                            <p className="section-description">Enter information about fishing method and catch conditions.</p>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fishing Method</label>
                                    <input
                                        type="text"
                                        value={formData.catch_details.fishing_method}
                                        onChange={(e) => handleNestedChange('catch_details', 'fishing_method', e.target.value)}
                                        placeholder="E.g., Net, Rod"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Depth (m)</label>
                                    <input
                                        type="number"
                                        value={formData.catch_details.depth}
                                        onChange={(e) => handleNestedChange('catch_details', 'depth', e.target.value)}
                                        placeholder="25"
                                        step="0.1"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Time of Day</label>
                                    <select
                                        value={formData.catch_details.time_of_day}
                                        onChange={(e) => handleNestedChange('catch_details', 'time_of_day', e.target.value)}
                                    >
                                        <option value="">Select</option>
                                        <option value="morning">Morning</option>
                                        <option value="noon">Noon</option>
                                        <option value="evening">Evening</option>
                                        <option value="night">Night</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Water Temperature (°C)</label>
                                    <input
                                        type="number"
                                        value={formData.catch_details.water_temperature}
                                        onChange={(e) => handleNestedChange('catch_details', 'water_temperature', e.target.value)}
                                        placeholder="18"
                                        step="0.1"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Weather</label>
                                    <input
                                        type="text"
                                        value={formData.catch_details.weather_conditions}
                                        onChange={(e) => handleNestedChange('catch_details', 'weather_conditions', e.target.value)}
                                        placeholder="Sunny, Cloudy, Rainy, etc."
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* SECTION 4: Physical Characteristics */}
                <div className={`accordion-section ${expandedSections.physical ? 'expanded' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleSection('physical')}>
                        <h3>4. Physical Characteristics</h3>
                        <span className="expand-icon">{expandedSections.physical ? '▲' : '▼'}</span>
                    </div>
                    {expandedSections.physical && (
                        <div className="accordion-content">
                            <p className="section-description">Enter the physical measurements of the fish.</p>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Length (cm)</label>
                                    <input
                                        type="number"
                                        value={formData.physical_characteristics.length}
                                        onChange={(e) => handleNestedChange('physical_characteristics', 'length', e.target.value)}
                                        placeholder="45"
                                        step="0.1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Weight (g)</label>
                                    <input
                                        type="number"
                                        value={formData.physical_characteristics.weight}
                                        onChange={(e) => handleNestedChange('physical_characteristics', 'weight', e.target.value)}
                                        placeholder="1200"
                                        step="1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Age</label>
                                    <input
                                        type="number"
                                        value={formData.physical_characteristics.age}
                                        onChange={(e) => handleNestedChange('physical_characteristics', 'age', e.target.value)}
                                        placeholder="3"
                                        min="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Sex</label>
                                    <select
                                        value={formData.physical_characteristics.sex}
                                        onChange={(e) => handleNestedChange('physical_characteristics', 'sex', e.target.value)}
                                    >
                                        <option value="unknown">Unknown</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Color Pattern</label>
                                    <input
                                        type="text"
                                        value={formData.physical_characteristics.color_pattern}
                                        onChange={(e) => handleNestedChange('physical_characteristics', 'color_pattern', e.target.value)}
                                        placeholder="Silver, spotted, etc."
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Body Condition</label>
                                    <input
                                        type="text"
                                        value={formData.physical_characteristics.body_condition}
                                        onChange={(e) => handleNestedChange('physical_characteristics', 'body_condition', e.target.value)}
                                        placeholder="Good, fair, poor"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Scales Condition</label>
                                    <input
                                        type="text"
                                        value={formData.physical_characteristics.scales_condition}
                                        onChange={(e) => handleNestedChange('physical_characteristics', 'scales_condition', e.target.value)}
                                        placeholder="Good, damaged, missing"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Fins Condition</label>
                                    <input
                                        type="text"
                                        value={formData.physical_characteristics.fins_condition}
                                        onChange={(e) => handleNestedChange('physical_characteristics', 'fins_condition', e.target.value)}
                                        placeholder="Good, torn, missing"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* SECTION 5: Diseases */}
                <div className={`accordion-section ${expandedSections.diseases ? 'expanded' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleSection('diseases')}>
                        <h3>5. Disease Information</h3>
                        <span className="expand-icon">{expandedSections.diseases ? '▲' : '▼'}</span>
                    </div>
                    {expandedSections.diseases && (
                        <div className="accordion-content">
                            <div className="section-header-inline">
                                <p className="section-description">Add any detected diseases.</p>
                                <button type="button" className="add-disease-btn-small" onClick={addDisease}>
                                    + Add Disease
                                </button>
                            </div>

                            {formData.diseases.length === 0 && (
                                <p className="no-diseases">No diseases added yet.</p>
                            )}

                            {formData.diseases.map((disease, index) => (
                                <div key={index} className="disease-card-compact">
                                    <div className="disease-header-compact">
                                        <h4>Hastalık #{index + 1}</h4>
                                        <button type="button" className="remove-btn-small" onClick={() => removeDisease(index)}>
                                            ✕
                                        </button>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Disease Name *</label>
                                            <input
                                                type="text"
                                                value={disease.disease_name}
                                                onChange={(e) => updateDisease(index, 'disease_name', e.target.value)}
                                                placeholder="White Spot Disease"
                                                required={formData.diseases.length > 0}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Severity</label>
                                            <select
                                                value={disease.severity}
                                                onChange={(e) => updateDisease(index, 'severity', e.target.value)}
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="critical">Critical</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* SECTION 6: Fish Images */}
                <div className={`accordion-section ${expandedSections.images ? 'expanded' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleSection('images')}>
                        <h3>6. Fish Images</h3>
                        <span className="expand-icon">{expandedSections.images ? '▲' : '▼'}</span>
                    </div>
                    {expandedSections.images && (
                        <div className="accordion-content">
                            <p className="section-description">Add photos of the fish (max 10 images, 5MB each).</p>

                            {/* Existing Images (Edit Mode) */}
                            {existingImages.length > 0 && (
                                <div className="existing-images-section">
                                    <h4 className="subsection-title">Current Images</h4>
                                    <div className="image-preview-grid">
                                        {existingImages.map((imageUrl, index) => (
                                            <div key={`existing-${index}`} className="image-preview-item existing">
                                                <img
                                                    src={imageUrl.startsWith('http') ? imageUrl : `http://localhost:5001${imageUrl}`}
                                                    alt={`Current ${index + 1}`}
                                                />
                                                <button
                                                    type="button"
                                                    className="remove-image-btn"
                                                    onClick={() => removeExistingImage(imageUrl)}
                                                    title="Remove image"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Upload New Images */}
                            <div className="image-upload-section">
                                <label className="image-upload-btn">
                                    📷 {existingImages.length > 0 ? 'Add More Images' : 'Select Images'}
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                                <span className="image-count">
                                    {existingImages.length + imageFiles.length}/10 images
                                    {imagesToDelete.length > 0 && ` (${imagesToDelete.length} pending deletion)`}
                                </span>
                            </div>

                            {/* New Image Previews */}
                            {imagePreviews.length > 0 && (
                                <>
                                    <h4 className="subsection-title">New Images to Upload</h4>
                                    <div className="image-preview-grid">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="image-preview-item new">
                                                <img src={preview.url} alt={`Preview ${index + 1}`} />
                                                <button
                                                    type="button"
                                                    className="remove-image-btn"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* SECTION 7: Additional Notes */}
                <div className={`accordion-section ${expandedSections.notes ? 'expanded' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleSection('notes')}>
                        <h3>7. Additional Notes</h3>
                        <span className="expand-icon">{expandedSections.notes ? '▲' : '▼'}</span>
                    </div>
                    {expandedSections.notes && (
                        <div className="accordion-content">
                            <p className="section-description">Add any other information not included in the fields above.</p>

                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Additional information..."
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Form Actions */}
                <div className="form-actions-new">
                    {!initialData?._id && (
                        <button type="button" className="btn-clear" onClick={handleClearForm}>
                            Clear Form
                        </button>
                    )}
                    {!initialData?._id && (
                        <button type="button" className="btn-draft" onClick={handleSaveDraft} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Draft'}
                        </button>
                    )}
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Saving...' : (initialData?._id ? 'Publish' : 'Submit')}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateFishDataForm;