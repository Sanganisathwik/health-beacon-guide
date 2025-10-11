import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, Phone, Loader2, Navigation } from "lucide-react";

interface Doctor {
  name: string;
  specialty: string;
  address: string;
  phone: string;
  distance: string;
}

const FindDoctors = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const conditions = location.state?.conditions;

  const [isLoading, setIsLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [locationPermission, setLocationPermission] = useState<"pending" | "granted" | "denied">("pending");

  useEffect(() => {
    if (!conditions) {
      navigate("/");
      return;
    }

    // Request location permission
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationPermission("granted");
          // Simulate finding doctors - will be replaced with actual map API
          simulateFindDoctors();
        },
        (error) => {
          console.error("Location error:", error);
          setLocationPermission("denied");
          // Still show mock results even without location
          simulateFindDoctors();
        }
      );
    } else {
      setLocationPermission("denied");
      simulateFindDoctors();
    }
  }, [conditions, navigate]);

  const simulateFindDoctors = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock data - will be replaced with real map API results
    setDoctors([
      {
        name: "Dr. Sarah Johnson",
        specialty: "Family Medicine",
        address: "123 Medical Plaza, Suite 200, Your City, ST 12345",
        phone: "(555) 123-4567",
        distance: "0.8 mi"
      },
      {
        name: "Dr. Michael Chen",
        specialty: "Internal Medicine",
        address: "456 Healthcare Center, Building B, Your City, ST 12345",
        phone: "(555) 234-5678",
        distance: "1.2 mi"
      },
      {
        name: "Dr. Emily Rodriguez",
        specialty: "General Practice",
        address: "789 Wellness Drive, Your City, ST 12345",
        phone: "(555) 345-6789",
        distance: "2.1 mi"
      }
    ]);

    setIsLoading(false);
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
            <div className="h-full bg-gradient-primary transition-all duration-300" style={{ width: '100%' }}></div>
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

          {/* Map Placeholder */}
          <Card className="h-[300px] overflow-hidden bg-muted">
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <MapPin className="w-12 h-12 mx-auto text-primary" />
                <p className="text-sm">Map integration will be added here</p>
                <p className="text-xs">Showing list of doctors below</p>
              </div>
            </div>
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
                      <p className="text-sm text-primary font-medium">{doctor.specialty}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/10 rounded-full border-2 border-secondary/20 whitespace-nowrap">
                      <MapPin className="w-3 h-3 text-secondary" />
                      <span className="text-sm font-medium text-secondary">{doctor.distance}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-start gap-2.5 p-3 bg-muted/30 rounded-lg">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                      <span className="text-muted-foreground">{doctor.address}</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-3 bg-muted/30 rounded-lg">
                      <Phone className="w-4 h-4 flex-shrink-0 text-primary" />
                      <a 
                        href={`tel:${doctor.phone}`} 
                        className="text-primary hover:underline font-medium"
                      >
                        {doctor.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="default" size="sm" className="flex-1 hover-scale">
                      📍 View on Map
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1 hover-scale">
                      📞 Call Now
                    </Button>
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
