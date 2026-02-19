import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Brain, Heart, Sparkles, TrendingUp } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-calm">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            MindMate
          </h1>
          <p className="text-2xl text-foreground max-w-2xl mx-auto">
            Your AI-Powered Mental Wellness & Productivity Platform
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="h-14 px-8 text-lg bg-gradient-primary shadow-strong"
          >
            Get Started Free
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { icon: Brain, title: "AI Companion", desc: "24/7 mental wellness support" },
            { icon: Heart, title: "Mood Tracking", desc: "Understand emotional patterns" },
            { icon: Sparkles, title: "Smart Journal", desc: "AI-powered insights" },
            { icon: TrendingUp, title: "Productivity", desc: "Focus timer & analytics" },
          ].map((feature, i) => (
            <div key={i} className="bg-card p-6 rounded-2xl shadow-medium text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-medium">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}