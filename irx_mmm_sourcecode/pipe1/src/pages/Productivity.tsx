import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function Productivity() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [sessionType, setSessionType] = useState<"focus" | "break">("focus");
  const [taskDescription, setTaskDescription] = useState("");
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/");
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleSessionComplete = async () => {
    setIsRunning(false);
    
    if (user && sessionType === "focus") {
      await supabase.from("productivity_sessions").insert({
        user_id: user.id,
        session_type: "pomodoro",
        duration_minutes: 25,
        task_description: taskDescription || "Focus session",
        completed: true,
      });
    }

    toast({
      title: sessionType === "focus" ? "Focus session complete!" : "Break time over!",
      description: sessionType === "focus" ? "Great work! Time for a break." : "Ready to focus again?",
    });

    setSessionType(sessionType === "focus" ? "break" : "focus");
    setTimeLeft(sessionType === "focus" ? 5 * 60 : 25 * 60);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(sessionType === "focus" ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-calm">
      <Navigation />
      
      <main className="ml-20 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Productivity Timer</h1>
            <p className="text-muted-foreground text-lg">Focus sessions balanced with mindful breaks</p>
          </div>

          <Card className="p-12 shadow-strong text-center space-y-8">
            <div className="inline-flex gap-2 p-1 bg-muted rounded-xl">
              <Button
                onClick={() => {
                  setSessionType("focus");
                  setTimeLeft(25 * 60);
                  setIsRunning(false);
                }}
                variant={sessionType === "focus" ? "default" : "ghost"}
                className={sessionType === "focus" ? "bg-gradient-primary" : ""}
              >
                Focus (25min)
              </Button>
              <Button
                onClick={() => {
                  setSessionType("break");
                  setTimeLeft(5 * 60);
                  setIsRunning(false);
                }}
                variant={sessionType === "break" ? "default" : "ghost"}
                className={sessionType === "break" ? "bg-gradient-primary" : ""}
              >
                Break (5min)
              </Button>
            </div>

            <div className="relative">
              <div className="w-64 h-64 mx-auto rounded-full bg-gradient-primary flex items-center justify-center shadow-strong">
                <span className="text-7xl font-bold text-white">{formatTime(timeLeft)}</span>
              </div>
            </div>

            {sessionType === "focus" && !isRunning && (
              <Input
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="What are you working on?"
                className="max-w-md mx-auto"
              />
            )}

            <div className="flex gap-4 justify-center">
              <Button
                onClick={toggleTimer}
                size="lg"
                className="h-14 px-8 bg-gradient-primary"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button onClick={resetTimer} size="lg" variant="outline" className="h-14 px-8">
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>
          </Card>

          <Card className="p-6 shadow-medium">
            <h3 className="text-lg font-semibold text-foreground mb-3">How it works</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Work in focused 25-minute sessions</li>
              <li>• Take 5-minute breaks between sessions</li>
              <li>• Stay present and minimize distractions</li>
              <li>• Your sessions are tracked for insights</li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
}