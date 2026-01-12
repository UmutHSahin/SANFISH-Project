import React, { useState } from 'react';
import { toast } from 'react-toastify';

/**
 * AnalysisSection Component
 * Balık için lab analizlerini gösterir ve yeni analiz ekleme formu sağlar
 */
function AnalysisSection({ fishId, analyses: initialAnalyses = [], onUpdate }) {
    const [showForm, setShowForm] = useState(false);
    const [analyses, setAnalyses] = useState(initialAnalyses);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        analysis_type: 'chemical',
        test_name: '',
        value: '',
        unit: '',
        result_status: 'normal',
        ref_min: '',
        ref_max: '',
        ref_standard: '',
        lab_name: '',
        lab_report_number: '',
        analysis_date: '',
        notes: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem('token');
            const payload = {
                analysis_type: formData.analysis_type,
                test_name: formData.test_name,
                value: parseFloat(formData.value),
                unit: formData.unit,
                result_status: formData.result_status,
                reference_range: {
                    min: formData.ref_min ? parseFloat(formData.ref_min) : undefined,
                    max: formData.ref_max ? parseFloat(formData.ref_max) : undefined,
                    standard: formData.ref_standard || undefined
                },
                laboratory: {
                    name: formData.lab_name || undefined,
                    report_number: formData.lab_report_number || undefined
                },
                analysis_date: formData.analysis_date || undefined,
                notes: formData.notes || undefined
            };

            const response = await fetch(`http://localhost:5001/api/fish-data/${fishId}/analyses`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Analiz başarıyla eklendi!');
                setAnalyses(prev => [data.data, ...prev]);
                setShowForm(false);
                setFormData({
                    analysis_type: 'chemical',
                    test_name: '',
                    value: '',
                    unit: '',
                    result_status: 'normal',
                    ref_min: '',
                    ref_max: '',
                    ref_standard: '',
                    lab_name: '',
                    lab_report_number: '',
                    analysis_date: '',
                    notes: ''
                });
                if (onUpdate) onUpdate();
            } else {
                toast.error(data.message || 'Analiz eklenemedi');
            }
        } catch (error) {
            console.error('Error adding analysis:', error);
            toast.error('Analiz eklenirken hata oluştu');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="detail-section">
            <div className="section-header-with-action">
                <h3 className="section-title">🔬 Lab Analizleri ({analyses.length})</h3>
                <button
                    className="btn-add-analysis"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? '✕ İptal' : '➕ Analiz Ekle'}
                </button>
            </div>

            {/* Analysis Form */}
            {showForm && (
                <form className="analysis-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Analiz Türü *</label>
                            <select name="analysis_type" value={formData.analysis_type} onChange={handleChange} required>
                                <option value="chemical">🧪 Kimyasal</option>
                                <option value="biological">🧬 Biyolojik</option>
                                <option value="physical">📏 Fiziksel</option>
                                <option value="microbiological">🦠 Mikrobiyolojik</option>
                                <option value="genetic">🧬 Genetik</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Test Adı *</label>
                            <input type="text" name="test_name" value={formData.test_name} onChange={handleChange} placeholder="örn: Civa Seviyesi" required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Değer *</label>
                            <input type="number" step="any" name="value" value={formData.value} onChange={handleChange} placeholder="0.05" required />
                        </div>
                        <div className="form-group">
                            <label>Birim *</label>
                            <input type="text" name="unit" value={formData.unit} onChange={handleChange} placeholder="mg/kg" required />
                        </div>
                        <div className="form-group">
                            <label>Sonuç Durumu</label>
                            <select name="result_status" value={formData.result_status} onChange={handleChange}>
                                <option value="normal">✅ Normal</option>
                                <option value="elevated">⚠️ Yüksek</option>
                                <option value="critical">🔴 Kritik</option>
                                <option value="below_normal">🔵 Düşük</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Ref. Min</label>
                            <input type="number" step="any" name="ref_min" value={formData.ref_min} onChange={handleChange} placeholder="0" />
                        </div>
                        <div className="form-group">
                            <label>Ref. Max</label>
                            <input type="number" step="any" name="ref_max" value={formData.ref_max} onChange={handleChange} placeholder="0.5" />
                        </div>
                        <div className="form-group">
                            <label>Standart</label>
                            <input type="text" name="ref_standard" value={formData.ref_standard} onChange={handleChange} placeholder="FDA, WHO" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Laboratuvar Adı</label>
                            <input type="text" name="lab_name" value={formData.lab_name} onChange={handleChange} placeholder="ABC Lab" />
                        </div>
                        <div className="form-group">
                            <label>Rapor No</label>
                            <input type="text" name="lab_report_number" value={formData.lab_report_number} onChange={handleChange} placeholder="LAB-2024-001" />
                        </div>
                        <div className="form-group">
                            <label>Analiz Tarihi</label>
                            <input type="date" name="analysis_date" value={formData.analysis_date} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label>Notlar</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Ek notlar..." rows="2" />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>İptal</button>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Ekleniyor...' : 'Analiz Ekle'}
                        </button>
                    </div>
                </form>
            )}

            {/* Analysis List */}
            {analyses.length > 0 ? (
                <div className="analysis-list">
                    {analyses.map((analysis, index) => (
                        <div key={analysis._id || index} className="analysis-card">
                            <div className="analysis-header">
                                <h4>{analysis.test_name}</h4>
                                <span className={`result-badge result-${analysis.result_status}`}>
                                    {analysis.result_status === 'normal' ? 'Normal' :
                                        analysis.result_status === 'elevated' ? 'Yüksek' :
                                            analysis.result_status === 'critical' ? 'Kritik' :
                                                analysis.result_status === 'below_normal' ? 'Düşük' : analysis.result_status}
                                </span>
                            </div>
                            <div className="analysis-body">
                                <div className="analysis-value">
                                    <strong>{analysis.value}</strong> {analysis.unit}
                                </div>
                                {analysis.reference_range && (analysis.reference_range.min || analysis.reference_range.max) && (
                                    <div className="analysis-reference">
                                        Referans: {analysis.reference_range.min || '—'} - {analysis.reference_range.max || '—'} {analysis.unit}
                                        {analysis.reference_range.standard && ` (${analysis.reference_range.standard})`}
                                    </div>
                                )}
                                <div className="analysis-type">
                                    <span className="analysis-type-badge">
                                        {analysis.analysis_type === 'chemical' ? '🧪 Kimyasal' :
                                            analysis.analysis_type === 'biological' ? '🧬 Biyolojik' :
                                                analysis.analysis_type === 'physical' ? '📏 Fiziksel' :
                                                    analysis.analysis_type === 'microbiological' ? '🦠 Mikrobiyolojik' :
                                                        analysis.analysis_type === 'genetic' ? '🧬 Genetik' : analysis.analysis_type}
                                    </span>
                                </div>
                                {analysis.laboratory?.name && (
                                    <div className="analysis-lab">
                                        Lab: {analysis.laboratory.name}
                                        {analysis.laboratory.report_number && ` (Rapor: ${analysis.laboratory.report_number})`}
                                    </div>
                                )}
                                {analysis.analysis_date && (
                                    <div className="analysis-date">
                                        Tarih: {new Date(analysis.analysis_date).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : !showForm && (
                <p className="no-analyses">Henüz analiz eklenmemiş. Yukarıdaki butona tıklayarak ekleyebilirsiniz.</p>
            )}
        </section>
    );
}

export default AnalysisSection;
