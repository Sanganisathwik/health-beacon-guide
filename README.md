# Health Beacon Guide# Health Beacon Guide



A comprehensive health guidance application with AI-powered symptom analysis and nearby doctor location services.A modern AI-powered health guidance application built with React, TypeScript, and Vite.



## Architecture## 🏗️ Project Structure



- **Backend**: FastAPI with Python 3.12```

- **Frontend**: React with TypeScript and Vitehealth-beacon-guide/

- **AI Integration**: Google Gemini AI for symptom analysis├── frontend/           # React frontend application

- **Maps Integration**: Leaflet maps with OpenStreetMap│   ├── src/           # Source code

- **External APIs**: MeSH (Medical Subject Headings), OpenFDA, OpenStreetMap│   │   ├── components/ # Reusable UI components

│   │   ├── pages/     # Page components

## Features│   │   ├── hooks/     # Custom React hooks

│   │   └── lib/       # Utility functions

### 🔍 AI-Powered Symptom Analysis│   ├── public/        # Static assets

- Advanced symptom interpretation using Google Gemini AI (gemini-2.5-flash)│   └── package.json   # Frontend dependencies

- Confidence scoring and risk assessment└── README.md          # This file

- Personalized health recommendations```

- Medical terminology explanation

## 🚀 Getting Started

### 🗺️ Interactive Doctor Locator

- Real-time geolocation-based doctor search### Prerequisites

- Interactive maps with clinic markers

- Detailed clinic information and contact details- Node.js (v16 or higher)

- Distance calculation and routing- npm or yarn package manager



### 🔗 Real Medical Data Integration### Installation & Running

- MeSH medical subject headings

- FDA drug and device information1. **Clone the repository**

- Validated medical terminology   ```bash

- Real-time data updates   git clone <YOUR_GIT_URL>

   cd health-beacon-guide

## Project Structure   ```



```2. **Navigate to frontend directory**

health-beacon-guide/   ```bash

├── backend-fastapi/           # FastAPI backend server   cd frontend

│   ├── app/   ```

│   │   ├── models/           # Data models (doctor, patient, symptom_analysis)

│   │   ├── routers/          # API route handlers (health, nearby, patients, symptoms)3. **Install dependencies**

│   │   └── services/         # Business logic and AI integration (gemini_ai)   ```bash

│   ├── api/                  # API endpoints   npm install

│   ├── core/                 # Core configuration and database   ```

│   ├── models/              # Pydantic schemas

│   ├── main.py              # FastAPI application entry point4. **Start the development server**

│   ├── requirements.txt     # Python dependencies   ```bash

│   └── .env                 # Backend environment variables   npm run dev

├── frontend/                # React frontend application   ```

│   ├── src/

│   │   ├── components/      # Reusable UI components5. **Open your browser**

│   │   ├── pages/           # Application pages (SymptomChecker, Results, FindDoctors)   - Local: http://localhost:8080/

│   │   ├── services/        # API communication services (apiService.js)   - The application will auto-reload when you make changes

│   │   └── lib/             # Utility functions

│   ├── public/              # Static assets### Available Scripts

│   ├── package.json         # Node.js dependencies

│   └── .env                 # Frontend environment variablesIn the `frontend` directory, you can run:

├── start-backend-8001.bat   # Backend startup script

├── start-dev.bat           # Development server startup- `npm run dev` - Start development server

└── README.md               # Project documentation- `npm run build` - Build for production

```- `npm run preview` - Preview production build

- `npm run lint` - Run ESLint

## Quick Start

## 🎨 Features

### Prerequisites

- Python 3.12+- **Interactive UI**: Beautiful animations and smooth transitions

- Node.js 18+- **Responsive Design**: Works on desktop, tablet, and mobile

- Google Gemini API key- **AI Health Guidance**: Powered by AURA AI assistant

- **Modern Stack**: React 18, TypeScript, Vite, Tailwind CSS

### 1. Environment Setup- **Component Library**: Shadcn/ui components



Create environment files:## 🛠️ Tech Stack



**Backend (.env in backend-fastapi/):**- **Frontend**: React 18, TypeScript

```- **Build Tool**: Vite

GEMINI_API_KEY=your_gemini_api_key_here- **Styling**: Tailwind CSS

```- **UI Components**: Radix UI, Shadcn/ui

- **Icons**: Lucide React

**Frontend (.env in frontend/):**- **Routing**: React Router

```- **State Management**: React Query

VITE_API_URL=http://localhost:8001

```## 📝 Development



### 2. Backend Setup### Working with Lovable



```bashYou can edit this project using [Lovable](https://lovable.dev/projects/2d3f23d5-f26c-4928-8c7e-ad31b23d1d32). Changes made via Lovable will be automatically committed to this repository.

cd backend-fastapi

python -m venv .venv### Local Development

.venv\Scripts\activate

pip install -r requirements.txt1. Make sure you're in the `frontend` directory

```2. Run `npm run dev` to start the development server

3. Make your changes and see them reflected immediately

### 3. Frontend Setup4. Commit and push your changes to update the Lovable project

- Edit files directly within the Codespace and commit and push your changes once you're done.

```bash

cd frontend## What technologies are used for this project?

npm install

```This project is built with:



### 4. Development- Vite

- TypeScript

Start both servers with the convenient batch script:- React

```bash- shadcn-ui

start-dev.bat- Tailwind CSS

```

## How can I deploy this project?

Or start them separately:

Simply open [Lovable](https://lovable.dev/projects/2d3f23d5-f26c-4928-8c7e-ad31b23d1d32) and click on Share -> Publish.

**Backend:**

```bash## Can I connect a custom domain to my Lovable project?

start-backend-8001.bat

```Yes, you can!



**Frontend:**To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

```bash

cd frontendRead more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8001
- API Documentation: http://localhost:8001/docs

## API Endpoints

### Core Endpoints
- `GET /health` - Health check and server status
- `POST /analyze-symptoms` - AI-powered symptom analysis with Gemini AI
- `GET /nearby-doctors` - Find nearby healthcare providers with geolocation

### Response Examples

**Symptom Analysis:**
```json
{
  "analysis": {
    "confidence": 85,
    "risk_level": "moderate",
    "recommendations": ["See a healthcare provider", "Monitor symptoms"],
    "ai_insights": "Based on the symptoms, this could indicate..."
  }
}
```

**Nearby Doctors:**
```json
{
  "doctors": [
    {
      "name": "Dr. Smith Medical Center",
      "address": "123 Health St, City",
      "phone": "+1-555-0123",
      "distance": 2.5,
      "coordinates": [lat, lng]
    }
  ]
}
```

## Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for Python
- **Google Gemini AI**: Advanced language model (gemini-2.5-flash)
- **Pydantic**: Data validation and settings management
- **Uvicorn**: ASGI server for production

### Frontend
- **React 18**: Component-based UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and development server
- **Axios**: HTTP client for API communication
- **Leaflet**: Interactive maps library
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives

### External APIs
- **MeSH API**: Medical Subject Headings
- **OpenFDA API**: FDA drug and device information
- **OpenStreetMap Nominatim**: Geocoding and place search

## Configuration

### Backend Configuration
- **Port**: 8001
- **CORS**: Enabled for frontend integration
- **Environment**: Development with auto-reload
- **AI Model**: gemini-2.5-flash (latest stable version)

### Frontend Configuration
- **Port**: 5173 (Vite default)
- **Proxy**: Configured for API communication
- **Hot reload**: Enabled for development
- **TypeScript**: Strict mode enabled

## Development Features

- 🔄 Auto-reload for both frontend and backend
- 🛠️ TypeScript support with strict type checking
- 🎨 Tailwind CSS for rapid UI development
- 📱 Responsive design for mobile compatibility
- 🔍 Real-time API integration with comprehensive error handling
- 🗺️ Interactive maps with geolocation services
- 🤖 AI-powered symptom analysis with confidence scoring
- 📊 Server status monitoring and health checks

## File Overview

### Key Backend Files
- `main.py`: FastAPI application with proper environment loading
- `app/services/gemini_ai.py`: Gemini AI integration service
- `app/routers/symptoms.py`: Symptom analysis endpoints
- `app/routers/nearby.py`: Doctor location endpoints

### Key Frontend Files
- `src/services/apiService.js`: Centralized API client
- `src/pages/SymptomChecker.tsx`: Main symptom input interface
- `src/pages/Results.tsx`: AI analysis results display
- `src/components/DoctorMap.tsx`: Interactive map component

## Production Deployment

1. **Environment Variables**: Set production API keys and URLs
2. **Frontend Build**: `npm run build`
3. **Server Configuration**: Configure nginx/apache for static files
4. **HTTPS Setup**: Enable SSL/TLS certificates
5. **Database**: Configure production database if needed
6. **Monitoring**: Set up logging and error tracking

## Troubleshooting

### Common Issues
- **Environment Variables**: Ensure GEMINI_API_KEY is set in backend/.env
- **CORS Errors**: Check that frontend URL is allowed in backend CORS settings
- **API Key**: Verify Gemini API key is valid and has proper permissions
- **Port Conflicts**: Ensure ports 8001 and 5173 are available

### Development Tips
- Check browser console for frontend errors
- Monitor backend logs for API issues
- Use `start-dev.bat` for quick development setup
- Access API docs at http://localhost:8001/docs for testing

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with proper testing
4. Ensure all tests pass and code follows standards
5. Submit a pull request with detailed description

## License

This project is licensed under the MIT License.