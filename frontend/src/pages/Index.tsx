import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, ArrowRight, Sparkles, Heart, Shield, Users } from "lucide-react";
import FloatingParticles from "@/components/ui/floating-particles";
import SubtleBackground from "@/components/ui/subtle-background";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Subtle Background Elements */}
      <SubtleBackground />
      <FloatingParticles />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            
            {/* Logo/Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-primary rounded-full shadow-glow flex items-center justify-center animate-scale-in">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse-medium"></div>
              </div>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                How are you
                <br />
                <span className="text-primary">feeling today?</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Tell us what's bothering you, and we'll help you understand it better with AI-powered health insights.
              </p>
            </div>

            {/* Main CTA */}
            <div className="pt-8 animate-slide-up">
              <Link to="/symptom-checker">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="text-lg px-12 py-6 h-auto relative group shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <MessageSquare className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                  Talk to AURA
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                  
                  {/* Button glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all duration-300 -z-10"></div>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 pb-20">
          <div className="max-w-4xl mx-auto">
            
            {/* How it works */}
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
                Simple. Fast. Helpful.
              </h2>
              <p className="text-muted-foreground">Get started in just a few steps</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  icon: MessageSquare,
                  title: "Describe",
                  description: "Tell us how you feel in your own words",
                  delay: "0.1s"
                },
                {
                  icon: Sparkles,
                  title: "Analyze", 
                  description: "AI provides insights about possible causes",
                  delay: "0.2s"
                },
                {
                  icon: Users,
                  title: "Connect",
                  description: "Find healthcare professionals near you",
                  delay: "0.3s"
                }
              ].map((step, index) => (
                <div 
                  key={index}
                  className="text-center group animate-slide-up"
                  style={{animationDelay: step.delay}}
                >
                  <div className="relative mb-6">
                    <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute inset-0 w-16 h-16 mx-auto rounded-2xl border-2 border-primary/20 group-hover:border-primary/40 transition-colors duration-300"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>

            {/* Trust indicators */}
            <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 border border-border/50 shadow-soft">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Safe & Private</h3>
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto">
                💚 <strong>Important:</strong> AURA provides health information for educational purposes only. 
                Always consult with a qualified healthcare professional for medical advice, diagnosis, or treatment.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-10 opacity-30">
          <Heart className="w-6 h-6 text-secondary animate-pulse" />
        </div>
        <div className="absolute top-1/3 right-10 opacity-20">
          <Shield className="w-5 h-5 text-primary animate-pulse" style={{animationDelay: '1s'}} />
        </div>
        <div className="absolute bottom-1/4 left-1/4 opacity-25">
          <Users className="w-5 h-5 text-secondary animate-pulse" style={{animationDelay: '2s'}} />
        </div>
      </div>
    </div>
  );
};

export default Index;
