/**
 * API Service for connecting React frontend to FastAPI backend
 * Handles all communication with the backend API
 */
import axios from 'axios';

// Get the API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for AI processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Analyze symptoms using the FastAPI backend
 * @param {Array} symptoms - Array of symptom objects with name, severity, duration
 * @param {Object} patientInfo - Patient information (age, gender, etc.)
 * @returns {Promise} - API response with symptom analysis
 */
export const analyzeSymptoms = async (symptoms, patientInfo = {}) => {
  try {
    const payload = {
      symptoms: symptoms.map(symptom => ({
        name: symptom.name || symptom,
        severity: symptom.severity || 'moderate',
        duration: symptom.duration || null,
        description: symptom.description || null
      })),
      patientInfo: {
        age: patientInfo.age || null,
        gender: patientInfo.gender || null,
        medical_history: patientInfo.medical_history || [],
        allergies: patientInfo.allergies || null,
        medical_conditions: patientInfo.medical_conditions || null
      }
    };

    console.log('📤 Sending symptom analysis request:', payload);
    
    const response = await apiClient.post('/symptoms/analyze', payload);
    
    // Extract the analysis data from the nested response structure
    const analysisData = response.data?.data?.analysis || response.data;
    
    return {
      success: true,
      data: analysisData
    };
  } catch (error) {
    console.error('❌ Symptom analysis failed:', error);
    
    // Handle different error scenarios
    if (error.response?.status === 400) {
      return {
        success: false,
        error: 'Invalid symptoms provided. Please check your input.',
        details: error.response.data
      };
    } else if (error.response?.status === 500) {
      return {
        success: false,
        error: 'Server error occurred during symptom analysis.',
        details: error.response.data
      };
    } else if (error.code === 'ECONNREFUSED') {
      return {
        success: false,
        error: 'Cannot connect to the backend server. Please ensure the server is running.',
        details: 'Connection refused'
      };
    } else {
      return {
        success: false,
        error: error.message || 'An unexpected error occurred.',
        details: error.response?.data || error
      };
    }
  }
};

/**
 * Find nearby doctors based on location
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude  
 * @param {number} radius - Search radius in kilometers (default: 10)
 * @param {string} specialty - Medical specialty filter (optional)
 * @returns {Promise} - API response with nearby doctors
 */
export const findNearbyDoctors = async (latitude, longitude, radius = 10, specialty = null) => {
  try {
    const payload = {
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      radius: radius,
      ...(specialty && { specialty })
    };

    console.log('📍 Searching for nearby doctors:', payload);
    
    const response = await apiClient.post('/doctors/nearby', payload);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Nearby doctors search failed:', error);
    
    if (error.response?.status === 400) {
      return {
        success: false,
        error: 'Invalid location coordinates provided.',
        details: error.response.data
      };
    } else if (error.response?.status === 500) {
      return {
        success: false,
        error: 'Server error occurred while searching for doctors.',
        details: error.response.data
      };
    } else if (error.code === 'ECONNREFUSED') {
      return {
        success: false,
        error: 'Cannot connect to the backend server. Please ensure the server is running.',
        details: 'Connection refused'
      };
    } else {
      return {
        success: false,
        error: error.message || 'An unexpected error occurred.',
        details: error.response?.data || error
      };
    }
  }
};

/**
 * Get user's current location using browser geolocation API
 * @returns {Promise} - Promise resolving to {latitude, longitude}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location access denied by user.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information is unavailable.'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out.'));
            break;
          default:
            reject(new Error('An unknown error occurred while retrieving location.'));
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

/**
 * Health check endpoint to verify backend connectivity
 * @returns {Promise} - API response indicating server status
 */
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: 'Backend server is not responding',
      details: error.message
    };
  }
};

export default {
  analyzeSymptoms,
  findNearbyDoctors,
  getCurrentLocation,
  healthCheck
};