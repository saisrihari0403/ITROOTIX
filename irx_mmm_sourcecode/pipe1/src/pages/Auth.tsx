import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart, Brain, Sparkles } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back!", description: "You've successfully logged in." });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        toast({ 
          title: "Account created!", 
          description: "Welcome to MindMate. Let's begin your wellness journey." 
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-calm flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              MindMate
            </h1>
            <p className="text-2xl text-foreground">Your AI Mental Wellness Companion</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">AI-Powered Support</h3>
                <p className="text-muted-foreground">Get personalized mental wellness guidance 24/7</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Track Your Journey</h3>
                <p className="text-muted-foreground">Monitor mood, stress, and emotional patterns</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Smart Productivity</h3>
                <p className="text-muted-foreground">Balance work and wellness with AI insights</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="p-8 shadow-strong">
          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-foreground">
                {isLogin ? "Welcome Back" : "Start Your Journey"}
              </h2>
              <p className="text-muted-foreground">
                {isLogin ? "Sign in to continue your wellness journey" : "Create your account to begin"}
              </p>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full h-12 bg-gradient-primary" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? "Sign In" : "Create Account"}
            </Button>

            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-sm text-primary hover:underline"
            >
              {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}