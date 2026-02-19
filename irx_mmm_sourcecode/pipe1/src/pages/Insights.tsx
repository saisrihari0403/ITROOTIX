import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function Insights() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [insights, setInsights] = useState<any>({
    moodTrend: [],
    avgStress: 0,
    avgEnergy: 0,
    totalSessions: 0,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/");
      } else {
        setUser(session.user);
        loadInsights(session.user.id);
      }
    });
  }, [navigate]);

  const loadInsights = async (userId: string) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [moodData, sessionsData] = await Promise.all([
      supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: true }),
      supabase
        .from("productivity_sessions")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", thirtyDaysAgo),
    ]);

    if (moodData.data) {
      const avgStress =
        moodData.data.reduce((acc, m) => acc + (m.stress_level || 0), 0) / (moodData.data.length || 1);
      const avgEnergy =
        moodData.data.reduce((acc, m) => acc + (m.energy_level || 0), 0) / (moodData.data.length || 1);

      setInsights({
        moodTrend: moodData.data.map((m) => ({
          date: new Date(m.created_at).toLocaleDateString(),
          mood: m.mood_score,
        })),
        avgStress: avgStress.toFixed(1),
        avgEnergy: avgEnergy.toFixed(1),
        totalSessions: sessionsData.data?.length || 0,
      });
    }
  };

  const getMoodTrend = () => {
    if (insights.moodTrend.length < 2) return "stable";
    const recent = insights.moodTrend.slice(-7);
    const firstHalf = recent.slice(0, Math.ceil(recent.length / 2));
    const secondHalf = recent.slice(Math.ceil(recent.length / 2));
    
    const avgFirst = firstHalf.reduce((acc: number, m: any) => acc + m.mood, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((acc: number, m: any) => acc + m.mood, 0) / secondHalf.length;
    
    if (avgSecond > avgFirst + 0.5) return "improving";
    if (avgSecond < avgFirst - 0.5) return "declining";
    return "stable";
  };

  const trend = getMoodTrend();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-calm">
      <Navigation />
      
      <main className="ml-20 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Insights & Analytics</h1>
            <p className="text-muted-foreground text-lg">Understanding your mental wellness patterns</p>
          </div>

          <Card className="p-8 shadow-strong">
            <h2 className="text-2xl font-semibold text-foreground mb-6">30-Day Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">Mood Trend</p>
                <div className="flex items-center justify-center gap-2">
                  {trend === "improving" && <TrendingUp className="w-8 h-8 text-success" />}
                  {trend === "declining" && <TrendingDown className="w-8 h-8 text-destructive" />}
                  {trend === "stable" && <Minus className="w-8 h-8 text-secondary" />}
                  <span className="text-3xl font-bold text-foreground capitalize">{trend}</span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-muted-foreground">Avg Stress</p>
                <p className="text-3xl font-bold text-foreground">{insights.avgStress}/5</p>
              </div>

              <div className="text-center space-y-2">
                <p className="text-muted-foreground">Avg Energy</p>
                <p className="text-3xl font-bold text-foreground">{insights.avgEnergy}/5</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 shadow-medium">
              <h3 className="text-xl font-semibold text-foreground mb-4">Mood History</h3>
              <div className="space-y-3">
                {insights.moodTrend.slice(-7).reverse().map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{item.date}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-primary"
                          style={{ width: `${(item.mood / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-foreground font-semibold w-8">{item.mood}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 shadow-medium">
              <h3 className="text-xl font-semibold text-foreground mb-4">Productivity Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-muted-foreground mb-2">Focus Sessions</p>
                  <p className="text-4xl font-bold text-foreground">{insights.totalSessions}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2">Total Focus Time</p>
                  <p className="text-4xl font-bold text-foreground">
                    {Math.round((insights.totalSessions * 25) / 60)}h
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}