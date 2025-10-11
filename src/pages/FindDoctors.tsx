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
      <div className="container mx-auto px-4 py-8">
        <Link to="/results" state={{ symptoms: "" }}>
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Healthcare Providers Near You</h1>
            <p className="text-muted-foreground">
              {locationPermission === "granted" 
                ? "Based on your current location" 
                : "Showing general results (location access not available)"}
            </p>
          </div>

          {/* Location Permission Notice */}
          {locationPermission === "denied" && (
            <Card className="p-4 bg-accent/50 border-primary/20">
              <div className="flex items-start gap-3">
                <Navigation className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Enable location access in your browser for more accurate results based on your current location.
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
            <h2 className="text-2xl font-semibold text-foreground">Available Healthcare Providers</h2>
            {doctors.map((doctor, index) => (
              <Card key={index} className="p-6 hover:shadow-glow transition-all duration-300">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{doctor.name}</h3>
                      <p className="text-sm text-primary font-medium">{doctor.specialty}</p>
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {doctor.distance}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-primary" />
                      <span>{doctor.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 flex-shrink-0 text-primary" />
                      <a 
                        href={`tel:${doctor.phone}`} 
                        className="text-primary hover:underline"
                      >
                        {doctor.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="default" size="sm" className="flex-1">
                      View on Map
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Call Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Info Card */}
          <Card className="p-6 bg-accent/50">
            <h3 className="font-semibold text-foreground mb-2">Before Your Appointment</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Prepare a list of your symptoms and when they started</li>
              <li>• Bring any current medications you're taking</li>
              <li>• Have your insurance information ready</li>
              <li>• Write down any questions you want to ask</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FindDoctors;
