import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symptoms.trim()) {
      toast.error("Please describe your symptoms");
      return;
    }

    if (symptoms.trim().length < 10) {
      toast.error("Please provide more detail about your symptoms");
      return;
    }

    setIsAnalyzing(true);

    try {
      // TODO: This will call Lovable Cloud edge function
      // For now, navigate to results with symptoms
      setTimeout(() => {
        navigate("/results", { state: { symptoms } });
      }, 1500);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Describe Your Symptoms
            </h1>
            <p className="text-lg text-muted-foreground">
              Be as detailed as possible. Include when symptoms started, severity, and any other relevant information.
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <label htmlFor="symptoms" className="text-sm font-medium text-foreground block">
                  Your Symptoms
                </label>
                <Textarea
                  id="symptoms"
                  placeholder="Example: I've been experiencing a persistent headache for the past 3 days, especially on the right side of my head. It gets worse in bright light and I feel slightly nauseous..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="min-h-[200px] resize-none rounded-xl border-2 focus:border-primary transition-colors"
                  disabled={isAnalyzing}
                />
                <p className="text-xs text-muted-foreground">
                  {symptoms.length} characters • Minimum 10 characters required
                </p>
              </div>

              <div className="bg-accent/50 rounded-xl p-4 text-sm text-muted-foreground">
                <strong className="text-accent-foreground">Reminder:</strong> This analysis is for educational 
                purposes only and cannot diagnose conditions. Always consult a healthcare professional.
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                disabled={isAnalyzing || symptoms.trim().length < 10}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Symptoms...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Analyze Symptoms
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Tips */}
          <Card className="p-6 bg-muted/30">
            <h3 className="font-semibold mb-3 text-foreground">Tips for Better Results</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Include when symptoms started</li>
              <li>• Describe the severity (mild, moderate, severe)</li>
              <li>• Mention any factors that make symptoms better or worse</li>
              <li>• Include any other relevant medical information</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;
