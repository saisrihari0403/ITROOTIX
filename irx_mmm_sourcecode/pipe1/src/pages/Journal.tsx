import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Sparkles, Loader2 } from "lucide-react";

export default function Journal() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/");
      } else {
        setUser(session.user);
        loadEntries(session.user.id);
      }
    });
  }, [navigate]);

  const loadEntries = async (userId: string) => {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setEntries(data);
    }
  };

  const handleSave = async () => {
    if (!user || !content.trim()) return;

    setAnalyzing(true);
    try {
      const analysisResponse = await supabase.functions.invoke("analyze-journal", {
        body: { content },
      });

      const { data, error } = await supabase.from("journal_entries").insert({
        user_id: user.id,
        title: title || "Untitled Entry",
        content,
        ai_analysis: analysisResponse.data,
        sentiment_score: analysisResponse.data?.sentiment_score,
      }).select();

      if (error) throw error;

      toast({ title: "Entry saved!", description: "Your journal has been analyzed and saved." });
      setTitle("");
      setContent("");
      setShowNew(false);
      loadEntries(user.id);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-calm">
      <Navigation />
      
      <main className="ml-20 p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Journal</h1>
              <p className="text-muted-foreground text-lg">Reflect on your thoughts and emotions</p>
            </div>
            <Button
              onClick={() => setShowNew(!showNew)}
              className="h-12 px-6 bg-gradient-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Entry
            </Button>
          </div>

          {showNew && (
            <Card className="p-8 shadow-strong">
              <div className="space-y-4">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Entry title (optional)"
                  className="text-lg"
                />
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind today?"
                  className="min-h-64 text-base"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={analyzing || !content.trim()}
                    className="flex-1 h-12 bg-gradient-primary"
                  >
                    {analyzing && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                    <Sparkles className="w-5 h-5 mr-2" />
                    Save & Analyze
                  </Button>
                  <Button
                    onClick={() => {
                      setShowNew(false);
                      setTitle("");
                      setContent("");
                    }}
                    variant="outline"
                    className="px-8"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id} className="p-6 shadow-medium hover:shadow-strong transition-all">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xl font-semibold text-foreground">{entry.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground line-clamp-3">{entry.content}</p>
                  {entry.ai_analysis && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-sm font-medium text-primary mb-2">AI Insights</p>
                      <p className="text-sm text-muted-foreground">{entry.ai_analysis.insights}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}