import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, MapPin, Loader2, ArrowRight } from "lucide-react";

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
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "moderate":
        return "bg-primary/10 text-primary border-primary/20";
      case "serious":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getSeverityEmoji = (severity: string) => {
    switch (severity) {
      case "mild":
        return "😌";
      case "moderate":
        return "🤔";
      case "serious":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="p-8 md:p-12 text-center space-y-6 max-w-md animate-scale-in">
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-full flex items-center justify-center animate-pulse">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold">Reading your symptoms...</h2>
            <p className="text-muted-foreground">This will just take a moment ✨</p>
          </div>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-6 md:py-10">
        <Link to="/symptom-checker">
          <Button variant="ghost" size="sm" className="mb-4 hover-scale">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </Link>

        {/* Progress Indicator */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-primary">Step 2 of 3</span>
            <span className="text-muted-foreground">Understanding your symptoms</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-primary transition-all duration-300" style={{ width: '66%' }}></div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground">Here's what we found</h1>
            <p className="text-lg text-muted-foreground">Based on what you told us</p>
          </div>

          {/* Safety Warning - Simpler */}
          <Card className="p-5 bg-accent/50 border-2 border-secondary/20">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">⚠️</span>
              <div className="space-y-1">
                <h3 className="font-semibold text-accent-foreground">Important Reminder</h3>
                <p className="text-sm text-muted-foreground">
                  This is information to help you learn, <strong>not a diagnosis</strong>. 
                  Only a real doctor can tell you what's wrong. If you feel very sick, see a doctor right away!
                </p>
              </div>
            </div>
          </Card>

          {/* Possible Conditions */}
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground flex items-center gap-2">
              🔍 What it might be
            </h2>
            {conditions.map((condition, index) => (
              <Card key={index} className="p-5 md:p-6 space-y-4 hover:shadow-glow transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <h3 className="text-lg font-semibold text-foreground flex-1">{condition.name}</h3>
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full border-2 ${getSeverityColor(condition.severity)} capitalize flex items-center gap-1.5 whitespace-nowrap`}>
                    <span>{getSeverityEmoji(condition.severity)}</span>
                    {condition.severity}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{condition.description}</p>
              </Card>
            ))}
          </div>

          {/* Treatment Information */}
          {medicationInfo && (
            <Card className="p-5 md:p-6 space-y-5">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground flex items-center gap-2">
                💊 What can help
              </h2>

              <div className="space-y-5">
                <div className="p-4 bg-muted/30 rounded-xl">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span>🎯</span> General Advice
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">{medicationInfo.treatment_approach}</p>
                </div>

                <div className="p-4 bg-secondary/5 rounded-xl border-2 border-secondary/20">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span>🏪</span> Things you can get without a prescription
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">{medicationInfo.common_otc_classes}</p>
                </div>

                <div className="p-4 bg-primary/5 rounded-xl border-2 border-primary/20">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <span>📋</span> About prescription medicine
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">{medicationInfo.prescription_info}</p>
                </div>

                <div className="bg-accent/50 rounded-xl p-4 text-sm text-muted-foreground border-2 border-secondary/20">
                  <p className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">💡</span>
                    <span><strong className="text-accent-foreground">Always ask first:</strong> Talk to a doctor 
                    or pharmacist before taking ANY medicine. They'll make sure it's safe for you and tell you how much to take.</span>
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Find Doctor CTA */}
          <Card className="p-6 md:p-10 text-center space-y-5 bg-gradient-primary shadow-glow animate-scale-in">
            <div className="space-y-3">
              <div className="text-5xl">👨‍⚕️</div>
              <h3 className="text-2xl md:text-3xl font-bold text-white">
                Ready to talk to a doctor?
              </h3>
              <p className="text-white/90 max-w-xl mx-auto text-lg">
                We can help you find qualified doctors near you who can help with your symptoms.
              </p>
            </div>
            <Link to="/find-doctors" state={{ conditions }}>
              <Button variant="secondary" size="lg" className="text-base px-8 hover-scale">
                <MapPin className="w-5 h-5 mr-2" />
                Find Doctors Near Me
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Results;
