# React + FastAPI Integration Guide

## 🚀 Complete Setup Guide

This guide shows you how to connect your React.js frontend to your FastAPI backend running at `http://localhost:8001`.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Running FastAPI backend on port 8001

## 1. 📦 Install Dependencies

```bash
cd frontend
npm install axios
```

## 2. 🔧 Environment Configuration

Create or update `.env` file in your React project root:

```env
# API Configuration  
VITE_API_BASE_URL=http://localhost:8001/api
REACT_APP_API_URL=http://localhost:8001

# Environment
NODE_ENV=development
```

## 3. 📁 File Structure

```
frontend/
├── src/
│   ├── services/
│   │   └── apiService.js         # ✅ Created - API client
│   ├── components/
│   │   ├── SymptomChecker.jsx    # ✅ Created - Complete component
│   │   └── SymptomChecker.css    # ✅ Created - Styles
│   ├── pages/
│   │   ├── SymptomChecker.tsx    # ✅ Updated - Enhanced with real API
│   │   └── Results.tsx           # ✅ Updated - Shows AI analysis
│   └── App.tsx                   # ✅ Already configured with routing
├── .env                          # ✅ Updated - Port 8001
└── package.json
```

## 4. 🔌 API Endpoints Integration

### Backend API Endpoints:
- `POST /api/symptoms/analyze` - Analyze symptoms with AI
- `POST /api/doctors/nearby` - Find nearby doctors
- `GET /api/health` - Health check

### Request/Response Examples:

#### Symptom Analysis
```javascript
// Request
const response = await apiClient.post('/api/symptoms/analyze', {
  symptoms: [
    { name: "headache", severity: "severe", duration: "2 days" },
    { name: "fever", severity: "high", duration: "1 day" }
  ],
  patientInfo: {
    age: 28,
    gender: "female",
    medical_history: []
  }
});

// Response
{
  "status": "success",
  "data": {
    "analysis": {
      "model_used": "Gemini AI",
      "source": "Google Gemini AI",
      "confidence": 90,
      "risk_level": "moderate",
      "conditions": [...],
      "recommendations": [...],
      "specialist": {...}
    }
  }
}
```

#### Find Nearby Doctors
```javascript
// Request
const response = await apiClient.post('/api/doctors/nearby', {
  coordinates: {
    latitude: 12.9716,
    longitude: 77.5946
  },
  radius: 10
});

// Response
{
  "doctors": [
    {
      "name": "Shanti Hospital",
      "coordinates": { "latitude": 12.9235, "longitude": 77.5857 },
      "distance": 5.43,
      "specialty": "General Medicine"
    }
  ]
}
```

## 5. ✨ Key Features Implemented

### ✅ API Service (`apiService.js`)
- **Centralized API management** with axios
- **Error handling** for all scenarios (network, server, validation)
- **Request/response interceptors** for logging
- **Environment variable configuration**
- **Location services** integration
- **Health check** functionality

### ✅ Enhanced Symptom Checker
- **Real-time server status** indicator
- **Symptom input validation** with user feedback
- **Patient information** collection (age, gender, allergies)
- **Loading states** with user-friendly messages
- **Error handling** with actionable error messages
- **Integration with existing UI** components and styling

### ✅ AI-Enhanced Results Page
- **Gemini AI insights** display (model used, confidence, risk level)
- **AI recommendations** with priority indicators
- **Specialist suggestions** with urgency levels
- **Fallback to mock data** when backend is unavailable
- **Responsive design** for mobile and desktop

### ✅ Error Handling & UX
- **Backend connectivity** monitoring
- **Graceful degradation** when APIs are unavailable
- **User-friendly error messages** with clear next steps
- **Loading indicators** for better user experience
- **Toast notifications** for success/error feedback

## 6. 🚦 Backend Server Status

The frontend automatically detects backend availability:

- 🟢 **Online**: Full AI analysis with Gemini
- 🔴 **Offline**: Graceful fallback to mock data

## 7. 🎯 Usage Examples

### Basic Usage
```javascript
import { analyzeSymptoms, findNearbyDoctors } from '@/services/apiService';

// Analyze symptoms
const result = await analyzeSymptoms([
  { name: "headache", severity: "severe" }
], { age: 25, gender: "male" });

// Find doctors
const doctors = await findNearbyDoctors(12.9716, 77.5946, 10);
```

### With Error Handling
```javascript
const handleAnalysis = async () => {
  const result = await analyzeSymptoms(symptoms, patientInfo);
  
  if (result.success) {
    setAnalysisResult(result.data);
    toast.success("Analysis completed!");
  } else {
    setError(result.error);
    toast.error(result.error);
  }
};
```

## 8. 🔧 Testing the Integration

1. **Start Backend Server:**
   ```bash
   cd backend-fastapi
   .\.venv\Scripts\activate
   set GEMINI_API_KEY=your_api_key_here
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8001
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Application:**
   - Navigate to `http://localhost:8080`
   - Check server status indicator
   - Test symptom analysis
   - Test doctor search

## 9. 🚨 Troubleshooting

### Common Issues:

**Backend Server Offline:**
- Check if backend is running on port 8001
- Verify GEMINI_API_KEY environment variable
- Check backend logs for errors

**CORS Errors:**
- Ensure backend CORS is configured for frontend port
- Check `.env` file has correct API URL

**API Response Errors:**
- Check network tab in browser dev tools
- Verify request payload format
- Check backend API logs

**Environment Variables Not Loading:**
- Restart development server after changing `.env`
- Ensure variables start with `REACT_APP_` or `VITE_`

## 10. 🎉 Success Indicators

✅ Server status shows "Online"  
✅ Symptom analysis returns real AI results  
✅ Confidence scores > 85%  
✅ Risk levels displayed correctly  
✅ Nearby doctors load with real coordinates  
✅ No console errors  
✅ Toast notifications work  
✅ Loading states display properly

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify backend server is running and accessible
3. Test API endpoints directly with curl or Postman
4. Check that all environment variables are set correctly

---

**✨ You now have a fully integrated React + FastAPI application with real AI-powered medical analysis!**