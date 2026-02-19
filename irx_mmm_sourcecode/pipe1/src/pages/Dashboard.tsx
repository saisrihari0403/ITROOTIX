import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoodSelector } from "@/components/MoodSelector";
import { useToast } from "@/hooks/use-toast";
import { Brain, Heart, Clock, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [selectedMood, setSelectedMood] = useState(5);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    moodAvg: 0,
    journalCount: 0,
    focusTime: 0,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/");
      } else {
        setUser(session.user);
        loadStats(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadStats = async (userId: string) => {
    const [moodData, journalData, focusData] = await Promise.all([
      supabase.from("mood_logs").select("mood_score").eq("user_id", userId).gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from("journal_entries").select("id").eq("user_id", userId),
      supabase.from("productivity_sessions").select("duration_minutes").eq("user_id", userId).gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

    setStats({
      moodAvg: moodData.data?.length ? Math.round(moodData.data.reduce((acc, m) => acc + m.mood_score, 0) / moodData.data.length) : 0,
      journalCount: journalData.data?.length || 0,
      focusTime: Math.round((focusData.data?.reduce((acc, s) => acc + s.duration_minutes, 0) || 0) / 60),
    });
  };

  const handleLogMood = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.from("mood_logs").insert({
        user_id: user.id,
        mood_score: selectedMood,
        stress_level: Math.ceil((11 - selectedMood) / 2),
        energy_level: Math.ceil(selectedMood / 2),
      });

      if (error) throw error;
      
      toast({ title: "Mood logged!", description: "Your emotional state has been recorded." });
      loadStats(user.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-calm">
      <Navigation />
      
      <main className="ml-20 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Welcome back, {user.user_metadata?.full_name || "Friend"}
            </h1>
            <p className="text-muted-foreground text-lg">
              Let's check in on your mental wellness today
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 shadow-medium hover:shadow-strong transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">7-Day Mood</p>
                  <p className="text-3xl font-bold text-foreground">{stats.moodAvg}/10</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-medium hover:shadow-strong transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Journal Entries</p>
                  <p className="text-3xl font-bold text-foreground">{stats.journalCount}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-medium hover:shadow-strong transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Focus Hours</p>
                  <p className="text-3xl font-bold text-foreground">{stats.focusTime}h</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-8 shadow-strong">
            <h2 className="text-2xl font-semibold text-foreground mb-6">How are you feeling today?</h2>
            <MoodSelector selectedMood={selectedMood} onMoodChange={setSelectedMood} />
            <Button
              onClick={handleLogMood}
              disabled={loading}
              className="mt-6 w-full h-12 bg-gradient-primary"
            >
              Log Mood
            </Button>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 shadow-medium hover:shadow-strong transition-all cursor-pointer" onClick={() => navigate("/chat")}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Talk to AI Companion</h3>
                  <p className="text-muted-foreground">Get personalized mental wellness support and guidance</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-medium hover:shadow-strong transition-all cursor-pointer" onClick={() => navigate("/journal")}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Journal & Reflect</h3>
                  <p className="text-muted-foreground">Write your thoughts and get AI-powered insights</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}