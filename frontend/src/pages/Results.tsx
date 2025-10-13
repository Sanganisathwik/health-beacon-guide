import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, MapPin, Loader2, ArrowRight, Brain, TrendingUp } from "lucide-react";

interface Condition {
  name: string;
  description: string;
  severity: "mild" | "moderate" | "serious";
  probability?: number;
  source?: string;
}

interface MedicationInfo {
  treatment_approach: string;
  common_otc_classes: string;
  prescription_info: string;
}

interface AnalysisResult {
  model_used?: string;
  source?: string;
  confidence?: number;
  risk_level?: string;
  conditions?: Condition[];
  recommendations?: (string | { action?: string; description?: string })[];
  specialist?: {
    specialty?: string;
    urgency?: string;
  };
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const symptoms = location.state?.symptoms;
  const analysisResult: AnalysisResult | null = location.state?.analysisResult || null;

  const [isLoading, setIsLoading] = useState(true);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [medicationInfo, setMedicationInfo] = useState<MedicationInfo | null>(null);

  useEffect(() => {
    if (!symptoms) {
      navigate("/symptom-checker");
      return;
    }

    // If we have real analysis results, use them
    if (analysisResult) {
      setConditions(analysisResult.conditions || []);
      setIsLoading(false);
      return;
    }

    // Call the backend API for symptom analysis
    const analyzeSymptoms = async () => {
      try {
        setIsLoading(true);
        
        // Prepare symptoms data for API
        const symptomsArray = symptoms.split(',').map((symptom: string) => ({
          name: symptom.trim(),
          severity: "moderate", // Default severity
          duration: null,
          description: null
        }));

        const requestBody = {
          sessionId: "web-session",
          symptoms: symptomsArray,
          patientInfo: {}
        };

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/symptoms/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        console.log('API Request:', requestBody);
        console.log('API Response Status:', response.status);
        console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();
        console.log('API Response Data:', result);
        
        if (result.status === 'success' && result.data.analysis) {
          const analysis = result.data.analysis;
          
          // Convert API response to frontend format
          const conditionsFromAPI = analysis.possibleConditions?.map((condition: any) => ({
            name: condition.name,
            description: condition.description || "No description available",
            severity: analysis.riskLevel === "high" ? "serious" : analysis.riskLevel === "medium" ? "moderate" : "mild"
          })) || [];

          setConditions(conditionsFromAPI);
          
          // Set medication info from API response
          if (analysis.medicationSuggestions && analysis.medicationSuggestions.length > 0) {
            setMedicationInfo({
              treatment_approach: analysis.recommendations?.map((r: any) => r.action).join(', ') || "Follow general care guidelines",
              common_otc_classes: analysis.medicationSuggestions.map((med: any) => `${med.name} (${med.dosage})`).join(', '),
              prescription_info: analysis.specialistRecommendation?.recommended ? "Consult a specialist for prescription medication" : "Over-the-counter medications may be sufficient"
            });
          }
        } else {
          // If API doesn't return expected format, show error
          console.error('API returned unexpected format:', result);
          setConditions([
            {
              name: "API Response Error",
              description: "The API returned an unexpected response format. Please try again or consult a healthcare professional.",
              severity: "moderate"
            }
          ]);
        }
      } catch (error) {
        console.error('Error analyzing symptoms:', error);
        // Show actual error instead of mock data
        setConditions([
          {
            name: "Network Error",
            description: `Failed to connect to the medical API: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your internet connection and try again.`,
            severity: "moderate"
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    analyzeSymptoms();
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

          {/* AI Analysis Results - Show enhanced info if available */}
          {analysisResult && (
            <Card className="p-5 md:p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-blue-900">AI Analysis Insights</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analysisResult.model_used && (
                    <div className="bg-white/70 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">AI Model</div>
                      <div className="font-semibold text-blue-800">{analysisResult.model_used}</div>
                    </div>
                  )}
                  
                  {analysisResult.confidence && (
                    <div className="bg-white/70 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Confidence</div>
                      <div className="font-semibold text-green-700 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {analysisResult.confidence}%
                      </div>
                    </div>
                  )}
                  
                  {analysisResult.risk_level && (
                    <div className="bg-white/70 p-3 rounded-lg">
                      <div className="text-sm text-gray-600">Risk Level</div>
                      <div className={`font-semibold capitalize ${
                        analysisResult.risk_level === 'high' ? 'text-red-700' : 
                        analysisResult.risk_level === 'moderate' ? 'text-yellow-700' : 
                        'text-green-700'
                      }`}>
                        {analysisResult.risk_level}
                      </div>
                    </div>
                  )}
                </div>

                {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-blue-900 mb-2">AI Recommendations:</h3>
                    <ul className="space-y-1">
                      {analysisResult.recommendations.slice(0, 3).map((rec, index) => (
                        <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>
                            {typeof rec === 'object' && rec.action ? rec.action : 
                             typeof rec === 'object' && rec.description ? rec.description :
                             typeof rec === 'string' ? rec : 
                             JSON.stringify(rec)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResult.specialist && (
                  <div className="mt-4 bg-purple-100 p-3 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-1">Specialist Recommendation:</h3>
                    <div className="text-sm text-purple-800">
                      <span className="font-medium">Specialty:</span> {analysisResult.specialist.specialty || 'General Medicine'}
                      {analysisResult.specialist.urgency && (
                        <span className="ml-3">
                          <span className="font-medium">Urgency:</span> 
                          <span className={`ml-1 capitalize ${
                            analysisResult.specialist.urgency === 'emergency' ? 'text-red-600 font-bold' :
                            analysisResult.specialist.urgency === 'urgent' ? 'text-orange-600 font-semibold' :
                            'text-green-600'
                          }`}>
                            {analysisResult.specialist.urgency}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

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
