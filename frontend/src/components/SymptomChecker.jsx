/**
 * SymptomChecker Component
 * Main component that handles symptom input, analysis, and doctor search
 */
import React, { useState, useCallback } from 'react';
import { analyzeSymptoms, findNearbyDoctors, getCurrentLocation, healthCheck } from '../services/apiService';
import './SymptomChecker.css';

const SymptomChecker = () => {
  // State for symptom form
  const [symptoms, setSymptoms] = useState(['']);
  const [patientInfo, setPatientInfo] = useState({
    age: '',
    gender: '',
    medical_history: [],
    allergies: ''
  });

  // State for API responses and UI
  const [loading, setLoading] = useState(false);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [nearbyDoctors, setNearbyDoctors] = useState(null);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);

  // Check backend server status on component mount
  React.useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    const result = await healthCheck();
    setServerStatus(result);
  };

  // Handle symptom input changes
  const handleSymptomChange = (index, value) => {
    const newSymptoms = [...symptoms];
    newSymptoms[index] = value;
    setSymptoms(newSymptoms);
  };

  // Add new symptom input field
  const addSymptom = () => {
    setSymptoms([...symptoms, '']);
  };

  // Remove symptom input field
  const removeSymptom = (index) => {
    if (symptoms.length > 1) {
      const newSymptoms = symptoms.filter((_, i) => i !== index);
      setSymptoms(newSymptoms);
    }
  };

  // Handle patient info changes
  const handlePatientInfoChange = (field, value) => {
    setPatientInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Submit symptoms for analysis
  const handleAnalyzeSymptoms = useCallback(async () => {
    // Validate input
    const validSymptoms = symptoms.filter(s => s.trim() !== '');
    if (validSymptoms.length === 0) {
      setError('Please enter at least one symptom.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // Prepare symptoms data
      const symptomsData = validSymptoms.map(symptom => ({
        name: symptom.trim(),
        severity: 'moderate', // Default severity
        duration: null
      }));

      // Prepare patient info
      const patientData = {
        age: patientInfo.age ? parseInt(patientInfo.age) : null,
        gender: patientInfo.gender || null,
        medical_history: patientInfo.medical_history || [],
        allergies: patientInfo.allergies || null
      };

      console.log('🔍 Analyzing symptoms:', { symptomsData, patientData });

      const result = await analyzeSymptoms(symptomsData, patientData);

      if (result.success) {
        setAnalysisResult(result.data);
        console.log('✅ Analysis completed:', result.data);
      } else {
        setError(result.error);
        console.error('❌ Analysis failed:', result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred during analysis.');
      console.error('❌ Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  }, [symptoms, patientInfo]);

  // Find nearby doctors
  const handleFindDoctors = useCallback(async () => {
    setDoctorLoading(true);
    setError(null);
    setNearbyDoctors(null);

    try {
      // Get user's current location
      console.log('📍 Getting current location...');
      const location = await getCurrentLocation();
      console.log('📍 Location obtained:', location);

      // Search for nearby doctors
      const result = await findNearbyDoctors(
        location.latitude,
        location.longitude,
        10 // 10km radius
      );

      if (result.success) {
        setNearbyDoctors(result.data);
        console.log('🏥 Doctors found:', result.data);
      } else {
        setError(result.error);
        console.error('❌ Doctor search failed:', result.error);
      }
    } catch (err) {
      setError(`Location error: ${err.message}`);
      console.error('❌ Location error:', err);
    } finally {
      setDoctorLoading(false);
    }
  }, []);

  return (
    <div className="symptom-checker">
      <div className="container">
        <h1>🏥 Health Beacon - Symptom Checker</h1>
        
        {/* Server Status Indicator */}
        <div className={`server-status ${serverStatus?.success ? 'online' : 'offline'}`}>
          <span className="status-indicator"></span>
          Backend Server: {serverStatus?.success ? 'Online' : 'Offline'}
        </div>

        {/* Symptom Input Form */}
        <div className="form-section">
          <h2>📝 Enter Your Symptoms</h2>
          
          <div className="symptoms-container">
            {symptoms.map((symptom, index) => (
              <div key={index} className="symptom-input-row">
                <input
                  type="text"
                  value={symptom}
                  onChange={(e) => handleSymptomChange(index, e.target.value)}
                  placeholder={`Symptom ${index + 1} (e.g., headache, fever, nausea)`}
                  className="symptom-input"
                />
                {symptoms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSymptom(index)}
                    className="remove-btn"
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addSymptom}
              className="add-symptom-btn"
            >
              ➕ Add Another Symptom
            </button>
          </div>

          {/* Patient Information */}
          <div className="patient-info">
            <h3>👤 Patient Information (Optional)</h3>
            <div className="patient-inputs">
              <input
                type="number"
                value={patientInfo.age}
                onChange={(e) => handlePatientInfoChange('age', e.target.value)}
                placeholder="Age"
                className="patient-input"
                min="1"
                max="120"
              />
              <select
                value={patientInfo.gender}
                onChange={(e) => handlePatientInfoChange('gender', e.target.value)}
                className="patient-input"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input
                type="text"
                value={patientInfo.allergies}
                onChange={(e) => handlePatientInfoChange('allergies', e.target.value)}
                placeholder="Known allergies (optional)"
                className="patient-input"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={handleAnalyzeSymptoms}
              disabled={loading || !serverStatus?.success}
              className="analyze-btn primary-btn"
            >
              {loading ? '🔄 Analyzing...' : '🔍 Analyze Symptoms'}
            </button>
            
            {analysisResult && (
              <button
                onClick={handleFindDoctors}
                disabled={doctorLoading}
                className="doctors-btn secondary-btn"
              >
                {doctorLoading ? '📍 Finding Doctors...' : '🏥 Find Nearby Doctors'}
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <h3>❌ Error</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="results-section">
            <h2>📊 Analysis Results</h2>
            
            <div className="analysis-overview">
              <div className="result-card">
                <h4>🎯 Model Used</h4>
                <p>{analysisResult.model_used || 'Unknown'}</p>
              </div>
              
              <div className="result-card">
                <h4>📈 Confidence</h4>
                <p>{analysisResult.confidence || 'Unknown'}%</p>
              </div>
              
              <div className="result-card">
                <h4>⚠️ Risk Level</h4>
                <p className={`risk-${analysisResult.risk_level || 'unknown'}`}>
                  {analysisResult.risk_level || 'Unknown'}
                </p>
              </div>
            </div>

            {/* Medical Conditions */}
            {analysisResult.conditions && analysisResult.conditions.length > 0 && (
              <div className="conditions-section">
                <h3>🏥 Possible Medical Conditions</h3>
                {analysisResult.conditions.slice(0, 5).map((condition, index) => (
                  <div key={index} className="condition-item">
                    <h4>{condition.name}</h4>
                    <p className="probability">Probability: {condition.probability}%</p>
                    {condition.description && (
                      <p className="description">{condition.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <div className="recommendations-section">
                <h3>📋 Recommendations</h3>
                <ul className="recommendations-list">
                  {analysisResult.recommendations.slice(0, 5).map((rec, index) => (
                    <li key={index} className="recommendation-item">
                      {typeof rec === 'object' ? rec.action || rec.description || JSON.stringify(rec) : rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specialist Recommendation */}
            {analysisResult.specialist && (
              <div className="specialist-section">
                <h3>👨‍⚕️ Specialist Recommendation</h3>
                <p><strong>Specialty:</strong> {analysisResult.specialist.specialty || 'General Medicine'}</p>
                <p><strong>Urgency:</strong> <span className={`urgency-${analysisResult.specialist.urgency}`}>
                  {analysisResult.specialist.urgency || 'Normal'}
                </span></p>
              </div>
            )}
          </div>
        )}

        {/* Nearby Doctors Results */}
        {nearbyDoctors && (
          <div className="doctors-section">
            <h2>🏥 Nearby Doctors</h2>
            
            {nearbyDoctors.doctors && nearbyDoctors.doctors.length > 0 ? (
              <div className="doctors-list">
                {nearbyDoctors.doctors.map((doctor, index) => (
                  <div key={index} className="doctor-card">
                    <h4>{doctor.name || `Doctor ${index + 1}`}</h4>
                    {doctor.specialty && <p><strong>Specialty:</strong> {doctor.specialty}</p>}
                    {doctor.address && <p><strong>Address:</strong> {doctor.address}</p>}
                    {doctor.distance && <p><strong>Distance:</strong> {doctor.distance.toFixed(2)} km</p>}
                    {doctor.phone && <p><strong>Phone:</strong> {doctor.phone}</p>}
                    {doctor.coordinates && (
                      <p><strong>Location:</strong> {doctor.coordinates.latitude.toFixed(4)}, {doctor.coordinates.longitude.toFixed(4)}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No doctors found in your area. Try expanding your search radius.</p>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="disclaimer">
          <p><strong>⚠️ Medical Disclaimer:</strong> This tool is for informational purposes only and should not replace professional medical advice. Always consult a healthcare professional for proper diagnosis and treatment.</p>
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;