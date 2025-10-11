import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, ArrowRight, Sparkles } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Logo/Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-3xl shadow-glow mb-4 animate-scale-in">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              How are you<br />feeling today?
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Tell us what's bothering you, and we'll help you understand it better.
            </p>
          </div>

          {/* Main CTA */}
          <div className="pt-4">
            <Link to="/symptom-checker">
              <Button variant="hero" size="lg" className="text-lg px-10 py-6 h-auto hover-scale">
                <MessageSquare className="w-5 h-5 mr-3" />
                Talk to AURA
                <ArrowRight className="w-5 h-5 ml-3" />
              </Button>
            </Link>
          </div>

          {/* Quick Info */}
          <div className="pt-8 max-w-md mx-auto">
            <div className="bg-accent/30 rounded-2xl p-6 text-left space-y-3 border-2 border-secondary/20">
              <p className="text-sm font-medium text-accent-foreground flex items-center gap-2">
                <span className="text-2xl">💡</span> 
                Quick & Simple
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-secondary font-bold">1.</span>
                  <span>Describe how you feel in your own words</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary font-bold">2.</span>
                  <span>Get helpful information about possible causes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary font-bold">3.</span>
                  <span>Find doctors near you who can help</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Safety Note - Simplified */}
          <div className="pt-8">
            <p className="text-xs text-muted-foreground max-w-xl mx-auto">
              💚 <strong>Important:</strong> AURA gives health information for learning. 
              Always see a real doctor for medical advice.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="pb-16"></div>
    </div>
  );
};

export default Index;
