import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, ArrowRight, Lightbulb, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { analyzeSymptoms, healthCheck } from "@/services/apiService";

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [serverStatus, setServerStatus] = useState<{ success: boolean } | null>(null);
  const navigate = useNavigate();

  // Check backend server status on component mount
  useEffect(() => {
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    const result = await healthCheck();
    setServerStatus(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symptoms.trim()) {
      toast.error("Please tell us how you're feeling");
      return;
    }

    if (symptoms.trim().length < 10) {
      toast.error("Please add a bit more detail (at least 10 characters)");
      return;
    }

    if (!serverStatus?.success) {
      toast.error("Backend server is not available. Please try again later.");
      return;
    }

    setIsAnalyzing(true);

    try {
      // Parse symptoms from text input
      const symptomsArray = symptoms
        .split(/[,\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(symptom => ({
          name: symptom,
          severity: "moderate",
          duration: null
        }));

      console.log('🔍 Analyzing symptoms:', symptomsArray);

      // Call the real API
      const result = await analyzeSymptoms(symptomsArray, {});

      if (result.success) {
        toast.success("Analysis completed successfully!");
        
        // Navigate to results with the analysis data
        navigate("/results", { 
          state: { 
            symptoms,
            analysisResult: result.data 
          } 
        });
      } else {
        toast.error(result.error || "Analysis failed. Please try again.");
        console.error('❌ Analysis failed:', result.error);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("❌ Unexpected error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exampleSymptoms = [
    "I have a headache and feel dizzy",
    "My throat is sore and I'm coughing",
    "I feel tired all the time and have no energy"
  ];

  const handleExampleClick = (example: string) => {
    setSymptoms(example);
    setIsFocused(true);
  };

  const progress = Math.min(100, (symptoms.length / 50) * 100);

  const Disclaimer = () => (
    <div className="p-4 mt-6 text-sm text-muted-foreground rounded-lg bg-muted">
      <strong>Disclaimer:</strong> The information provided by this tool is for educational purposes only and should not be considered medical advice. Always consult a healthcare professional for medical concerns.
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-6 md:py-10">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-4 hover-scale">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        {/* Server Status Indicator */}
        <div className="max-w-2xl mx-auto mb-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
            serverStatus?.success 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {serverStatus?.success ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            Backend Server: {serverStatus?.success ? 'Online' : 'Offline'}
            {!serverStatus?.success && (
              <span className="text-xs ml-2">(Real-time AI analysis unavailable)</span>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-primary">Step 1 of 3</span>
            <span className="text-muted-foreground">Tell us your symptoms</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-primary transition-all duration-300" style={{ width: '33%' }}></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground">
              What's bothering you?
            </h1>
            <p className="text-lg text-muted-foreground">
              Just type naturally - like you're talking to a friend 💬
            </p>
          </div>

          <Card className="p-6 md:p-8 shadow-glow">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-3">
                <div className="relative">
                  <Textarea
                    id="symptoms"
                    placeholder="For example: I've had a headache for 3 days. It hurts more when I'm in bright light..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    className={`min-h-[180px] text-base resize-none rounded-2xl border-2 transition-all duration-300 ${
                      isFocused ? 'border-primary shadow-glow' : ''
                    }`}
                    disabled={isAnalyzing}
                  />
                  
                  {/* Character Progress */}
                  {symptoms.length > 0 && (
                    <div className="absolute bottom-3 right-3">
                      <div className="relative w-10 h-10">
                        <svg className="w-10 h-10 transform -rotate-90">
                          <circle
                            cx="20"
                            cy="20"
                            r="16"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            className="text-muted"
                          />
                          <circle
                            cx="20"
                            cy="20"
                            r="16"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray={`${progress} ${100 - progress}`}
                            className="text-secondary transition-all duration-300"
                          />
                        </svg>
                        {symptoms.length >= 50 && (
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-secondary">
                            ✓
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {symptoms.length < 50 && symptoms.length > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 animate-fade-in">
                    <Lightbulb className="w-3 h-3" />
                    Add a bit more detail for better results ({50 - symptoms.length} more characters)
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                disabled={isAnalyzing || symptoms.trim().length < 10}
                className="w-full text-base hover-scale"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Example Symptoms - Only show when empty */}
          {symptoms.length === 0 && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-sm font-medium text-muted-foreground text-center">
                Not sure what to write? Try these examples:
              </p>
              <div className="grid gap-2">
                {exampleSymptoms.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleExampleClick(example)}
                    className="text-left p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-200 hover-scale text-sm text-muted-foreground hover:text-foreground"
                  >
                    💭 {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Reminder */}
          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">
              💚 This is for information only. Always see a doctor for real medical advice.
            </p>
          </div>

          {/* Disclaimer */}
          <Disclaimer />
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;
