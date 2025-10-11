import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, Pill, MapPin, Loader2 } from "lucide-react";

interface Condition {
  name: string;
  description: string;
  severity: "mild" | "moderate" | "serious";
}

interface MedicationInfo {
  treatment_approach: string;
  common_otc_classes: string;
  prescription_info: string;
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const symptoms = location.state?.symptoms;

  const [isLoading, setIsLoading] = useState(true);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [medicationInfo, setMedicationInfo] = useState<MedicationInfo | null>(null);

  useEffect(() => {
    if (!symptoms) {
      navigate("/symptom-checker");
      return;
    }

    // Simulate AI analysis - will be replaced with actual Lovable Cloud function
    const simulateAnalysis = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data - will be replaced with real AI analysis
      setConditions([
        {
          name: "Common Cold (Viral Upper Respiratory Infection)",
          description: "A viral infection affecting the nose and throat, typically causing congestion, runny nose, and mild discomfort.",
          severity: "mild"
        },
        {
          name: "Tension Headache",
          description: "The most common type of headache, often caused by stress or muscle tension in the neck and scalp.",
          severity: "mild"
        },
        {
          name: "Sinusitis",
          description: "Inflammation or infection of the sinus cavities, causing facial pressure, congestion, and headache.",
          severity: "moderate"
        }
      ]);

      setMedicationInfo({
        treatment_approach: "For most mild viral infections and tension headaches, treatment focuses on managing symptoms and supporting your body's natural healing process. Rest, hydration, and over-the-counter medications can provide relief.",
        common_otc_classes: "Pain relievers (acetaminophen, ibuprofen) for headaches and discomfort; Decongestants for nasal congestion; Antihistamines if allergies are suspected",
        prescription_info: "Prescription medication is typically not needed for common colds or tension headaches. If symptoms persist beyond 10 days, worsen significantly, or you develop high fever, consult a healthcare provider."
      });

      setIsLoading(false);
    };

    simulateAnalysis();
  }, [symptoms, navigate]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "text-secondary";
      case "moderate":
        return "text-primary";
      case "serious":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="p-8 text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <h2 className="text-xl font-semibold">Analyzing Your Symptoms</h2>
          <p className="text-muted-foreground">Please wait while we process your information...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <Link to="/symptom-checker">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            New Symptom Check
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Analysis Results</h1>
            <p className="text-muted-foreground">Based on the symptoms you described</p>
          </div>

          {/* Safety Warning */}
          <Card className="p-6 bg-accent/50 border-secondary/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
              <div className="space-y-1">
                <h3 className="font-semibold text-accent-foreground">This is not a diagnosis</h3>
                <p className="text-sm text-muted-foreground">
                  These are possible conditions based on your symptoms. Only a qualified healthcare 
                  professional can provide an accurate diagnosis. If symptoms are severe or worsening, 
                  seek immediate medical attention.
                </p>
              </div>
            </div>
          </Card>

          {/* Possible Conditions */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Possible Conditions</h2>
            {conditions.map((condition, index) => (
              <Card key={index} className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold text-foreground">{condition.name}</h3>
                  <span className={`text-sm font-medium ${getSeverityColor(condition.severity)} capitalize`}>
                    {condition.severity}
                  </span>
                </div>
                <p className="text-muted-foreground">{condition.description}</p>
              </Card>
            ))}
          </div>

          {/* Treatment Information */}
          {medicationInfo && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">Treatment Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">General Approach</h4>
                  <p className="text-muted-foreground">{medicationInfo.treatment_approach}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Over-the-Counter Options</h4>
                  <p className="text-muted-foreground">{medicationInfo.common_otc_classes}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Prescription Medications</h4>
                  <p className="text-muted-foreground">{medicationInfo.prescription_info}</p>
                </div>

                <div className="bg-accent/50 rounded-lg p-4 text-sm text-muted-foreground mt-4">
                  <strong className="text-accent-foreground">Important:</strong> Always consult a doctor 
                  or pharmacist before taking any medication, even over-the-counter options. They can 
                  advise on proper dosage, potential interactions, and whether the medication is appropriate 
                  for your specific situation.
                </div>
              </div>
            </Card>
          )}

          {/* Find Doctor CTA */}
          <Card className="p-8 text-center space-y-4 bg-gradient-subtle">
            <MapPin className="w-12 h-12 text-primary mx-auto" />
            <h3 className="text-2xl font-semibold text-foreground">Ready to See a Specialist?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find qualified healthcare providers near you who can properly diagnose and treat your condition.
            </p>
            <Link to="/find-doctors" state={{ conditions }}>
              <Button variant="hero" size="lg">
                <MapPin className="w-4 h-4 mr-2" />
                Find Doctors Nearby
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Results;
