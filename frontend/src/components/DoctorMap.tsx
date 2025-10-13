import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different types of medical facilities
const createCustomIcon = (type: string) => {
  const iconMap = {
    doctor: '👨‍⚕️',
    clinic: '🏥',
    hospital: '🏥',
    pharmacy: '💊',
    user: '📍'
  };
  
  return L.divIcon({
    html: `<div style="
      background: white;
      border: 2px solid #3b82f6;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    ">${iconMap[type as keyof typeof iconMap] || '👨‍⚕️'}</div>`,
    className: 'custom-div-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

interface Doctor {
  name: string;
  specialty?: string | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  coordinates: { latitude: number; longitude: number };
  distance_km?: number | null;
}

interface MapComponentProps {
  center: { latitude: number; longitude: number };
  doctors: Doctor[];
  userLocation?: { latitude: number; longitude: number } | null;
  zoom?: number;
}

const MapUpdater = ({ center, zoom }: { center: { latitude: number; longitude: number }; zoom: number }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([center.latitude, center.longitude], zoom);
  }, [center.latitude, center.longitude, zoom, map]);
  
  return null;
};

const DoctorMap = ({ center, doctors, userLocation, zoom = 13 }: MapComponentProps) => {
  const mapRef = useRef<L.Map | null>(null);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border-2 border-primary/20">
      <MapContainer
        center={[center.latitude, center.longitude]}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater center={center} zoom={zoom} />
        
        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.latitude, userLocation.longitude]} 
            icon={createCustomIcon('user')}
          >
            <Popup>
              <div className="text-center">
                <strong>📍 Your Location</strong>
                <br />
                <small>Lat: {userLocation.latitude.toFixed(4)}, Lng: {userLocation.longitude.toFixed(4)}</small>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Doctor markers */}
        {doctors.map((doctor, index) => (
          <Marker
            key={index}
            position={[doctor.coordinates.latitude, doctor.coordinates.longitude]}
            icon={createCustomIcon(
              doctor.specialty?.toLowerCase().includes('hospital') ? 'hospital' :
              doctor.specialty?.toLowerCase().includes('clinic') ? 'clinic' : 'doctor'
            )}
          >
            <Popup maxWidth={300}>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{doctor.name}</h3>
                {doctor.specialty && (
                  <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                )}
                {doctor.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                    <p className="text-sm text-gray-600">{doctor.address}</p>
                  </div>
                )}
                {doctor.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">📞</span>
                    <a 
                      href={`tel:${doctor.phone}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {doctor.phone}
                    </a>
                  </div>
                )}
                {doctor.distance_km !== null && doctor.distance_km !== undefined && (
                  <p className="text-xs text-gray-500">
                    Distance: {doctor.distance_km.toFixed(1)} km away
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
                    Get Directions
                  </button>
                  {doctor.phone && (
                    <button className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600">
                      Call Now
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DoctorMap;