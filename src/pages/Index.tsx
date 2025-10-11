import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, Shield, MapPin, Heart } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <header className="container mx-auto px-4 pt-20 pb-12">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full mb-4">
            <Heart className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-accent-foreground">Your Health Companion</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Welcome to <span className="text-primary">AURA</span>
            <br />
            Health Assistant
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A gentle, intelligent companion to help you understand your symptoms and find the right care.
          </p>

          {/* Safety Disclaimer */}
          <Card className="max-w-2xl mx-auto p-6 bg-accent/50 border-secondary/20">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
              <div className="text-left space-y-2">
                <h3 className="font-semibold text-accent-foreground">Important Safety Notice</h3>
                <p className="text-sm text-muted-foreground">
                  AURA provides educational health information only. It is <strong>not</strong> a substitute 
                  for professional medical advice, diagnosis, or treatment. Always consult a qualified 
                  healthcare provider for medical concerns.
                </p>
              </div>
            </div>
          </Card>

          <div className="pt-6">
            <Link to="/symptom-checker">
              <Button variant="hero" size="lg" className="shadow-glow">
                Start Symptom Check
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center space-y-4 hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 mx-auto bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg">Smart Symptom Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Describe your symptoms in plain language and receive AI-powered insights into possible conditions.
            </p>
          </Card>

          <Card className="p-6 text-center space-y-4 hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 mx-auto bg-secondary rounded-xl flex items-center justify-center shadow-soft">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg">Educational Information</h3>
            <p className="text-sm text-muted-foreground">
              Learn about treatment approaches and medication classes in clear, accessible language.
            </p>
          </Card>

          <Card className="p-6 text-center space-y-4 hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 mx-auto bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-lg">Find Specialists</h3>
            <p className="text-sm text-muted-foreground">
              Locate nearby healthcare providers based on your symptoms and condition.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t border-border">
        <p className="text-center text-sm text-muted-foreground">
          AURA Health Assistant • Built with care for your wellbeing
        </p>
      </footer>
    </div>
  );
};

export default Index;
