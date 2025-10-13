import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, Phone, Loader2, Navigation, Search } from "lucide-react";
import DoctorMap from "@/components/DoctorMap";

interface Doctor {
  name: string;
  specialty?: string | null;
  address?: string | null;
  phone?: string | null;
  distance?: string | null;
}

interface NearbyResponse {
  center: { latitude: number; longitude: number };
  radius_km: number;
  total: number;
  doctors: Array<{
    name: string;
    specialty?: string | null;
    phone?: string | null;
    website?: string | null;
    address?: string | null;
    coordinates: { latitude: number; longitude: number };
    distance_km?: number | null;
  }>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const FindDoctors = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const conditions = location.state?.conditions;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [apiDoctors, setApiDoctors] = useState<NearbyResponse['doctors']>([]);
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<"pending" | "granted" | "denied">("pending");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [limit, setLimit] = useState<number>(20);

  useEffect(() => {
    if (!conditions) {
      navigate("/");
      return;
    }

    // Try to get location automatically, but don't block manual search
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationPermission("granted");
          const { latitude, longitude } = position.coords;
          setCoords({ latitude, longitude });
          // Auto-fetch with coords
          void fetchDoctors({ latitude, longitude });
        },
        () => {
          setLocationPermission("denied");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationPermission("denied");
    }
  }, [conditions, navigate]);

  const fetchDoctors = async (payload: { latitude?: number; longitude?: number; address?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      const body = JSON.stringify({
        ...payload,
        radius_km: radiusKm,
        limit,
      });
      const res = await fetch(`${API_BASE_URL}/doctors/nearby`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `API error: ${res.status}`);
      }
      const data: NearbyResponse = await res.json();
      setMapCenter(data.center);
      setApiDoctors(data.doctors);
      const list: Doctor[] = data.doctors.map((d) => ({
        name: d.name,
        specialty: d.specialty ?? null,
        address: d.address ?? null,
        phone: d.phone ?? null,
        distance: d.distance_km != null ? `${d.distance_km.toFixed(1)} km` : null,
      }));
      setDoctors(list);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch nearby doctors");
      setDoctors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseMyLocation = async () => {
    if (!("geolocation" in navigator)) {
      setLocationPermission("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationPermission("granted");
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });
        void fetchDoctors({ latitude, longitude });
      },
      () => setLocationPermission("denied"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSearch = async () => {
    if (address.trim().length > 0) {
      await fetchDoctors({ address: address.trim() });
    } else if (coords) {
      await fetchDoctors(coords);
    } else {
      setError("Please enter an address or use your current location");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="p-8 text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <h2 className="text-xl font-semibold">Finding Doctors Near You</h2>
          <p className="text-muted-foreground">Searching for qualified healthcare providers...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-6 md:py-10">
        <Link to="/results" state={{ symptoms: "" }}>
          <Button variant="ghost" size="sm" className="mb-4 hover-scale">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        {/* Progress Indicator */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-primary">Step 3 of 3</span>
            <span className="text-muted-foreground">Find a doctor</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-full bg-gradient-primary transition-all duration-300"></div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground">
              Doctors near you
            </h1>
            <p className="text-lg text-muted-foreground">
              {locationPermission === "granted" 
                ? "📍 Based on your location" 
                : "Showing nearby doctors"}
            </p>
          </div>

          {/* Search Controls */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Type your address or area (e.g., Bangalore, India)"
                  className="w-full bg-background border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSearch} disabled={isLoading} className="hover-scale">Search</Button>
                <Button variant="secondary" onClick={handleUseMyLocation} className="hover-scale">Use My Location</Button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <label>Radius:</label>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                />
                <span>{radiusKm} km</span>
              </div>
              <div className="flex items-center gap-2">
                <label>Limit:</label>
                <select value={limit} onChange={(e) => setLimit(parseInt(e.target.value))} className="bg-background border rounded px-2 py-1">
                  {[10,20,25,50,100].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </Card>

          {/* Error Banner */}
          {error && (
            <Card className="p-4 bg-destructive/10 border-destructive">
              <p className="text-sm text-destructive">{error}</p>
            </Card>
          )}

          {/* Location Permission Notice */}
          {locationPermission === "denied" && (
            <Card className="p-4 bg-accent/50 border-2 border-primary/20">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">📍</span>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Tip:</strong> Turn on location in your browser to see doctors closest to you!
                </p>
              </div>
            </Card>
          )}

          {/* Interactive Map */}
          <Card className="h-[400px] overflow-hidden" data-doctor-map>
            {mapCenter && apiDoctors.length > 0 ? (
              <DoctorMap 
                center={mapCenter}
                doctors={apiDoctors}
                userLocation={coords}
                zoom={13}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                <div className="text-center space-y-2">
                  <MapPin className="w-12 h-12 mx-auto text-primary" />
                  <p className="text-sm">Search for doctors to see them on the map</p>
                  <p className="text-xs">Enter your location and click search</p>
                </div>
              </div>
            )}
          </Card>

          {/* Doctors List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              👨‍⚕️ Available doctors ({doctors.length})
            </h2>
            {doctors.map((doctor, index) => (
              <Card key={index} className="p-5 md:p-6 hover:shadow-glow transition-all duration-300 animate-fade-in hover-scale" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground mb-1">{doctor.name}</h3>
                      {doctor.specialty && (
                        <p className="text-sm text-primary font-medium">{doctor.specialty}</p>
                      )}
                    </div>
                    {doctor.distance && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 rounded-full border-2 border-secondary/20 whitespace-nowrap">
                        <MapPin className="w-3 h-3 text-secondary" />
                        <span className="text-sm font-medium text-secondary">{doctor.distance}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5 text-sm">
                    {doctor.address && (
                      <div className="flex items-start gap-2.5 p-3 bg-muted/30 rounded-lg">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                        <span className="text-muted-foreground">{doctor.address}</span>
                      </div>
                    )}
                    {doctor.phone && (
                      <div className="flex items-center gap-2.5 p-3 bg-muted/30 rounded-lg">
                        <Phone className="w-4 h-4 flex-shrink-0 text-primary" />
                        <a 
                          href={`tel:${doctor.phone}`} 
                          className="text-primary hover:underline font-medium"
                        >
                          {doctor.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1 hover-scale"
                      onClick={() => {
                        // Scroll to map and highlight this doctor
                        const mapElement = document.querySelector('[data-doctor-map]');
                        mapElement?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      📍 View on Map
                    </Button>
                    {doctor.phone && (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="flex-1 hover-scale"
                        onClick={() => window.open(`tel:${doctor.phone}`, '_self')}
                      >
                        📞 Call Now
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Info Card */}
          <Card className="p-5 md:p-6 bg-accent/50 border-2 border-secondary/20">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              📋 Before your visit
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-secondary font-bold">✓</span>
                <span>Write down your symptoms and when they started</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary font-bold">✓</span>
                <span>Bring your current medications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary font-bold">✓</span>
                <span>Have your insurance card ready</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary font-bold">✓</span>
                <span>List any questions you want to ask</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FindDoctors;
