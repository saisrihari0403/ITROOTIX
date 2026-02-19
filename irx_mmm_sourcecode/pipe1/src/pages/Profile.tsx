import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User, Save } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/");
      } else {
        setUser(session.user);
        setFullName(session.user.user_metadata?.full_name || "");
      }
    });
  }, [navigate]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      if (error) throw error;

      toast({ title: "Profile updated!", description: "Your changes have been saved." });
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
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Profile</h1>
            <p className="text-muted-foreground text-lg">Manage your account settings</p>
          </div>

          <Card className="p-8 shadow-strong">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center shadow-medium">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground">{fullName || "User"}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input value={user.email} disabled className="bg-muted" />
              </div>

              <Button
                onClick={handleSave}
                disabled={loading}
                className="w-full h-12 bg-gradient-primary"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </Button>
            </div>
          </Card>

          <Card className="p-6 shadow-medium">
            <h3 className="text-lg font-semibold text-foreground mb-3">About MindMate</h3>
            <p className="text-muted-foreground leading-relaxed">
              MindMate is your AI-powered mental wellness companion designed to support your emotional
              health journey. Track your mood, reflect through journaling, stay productive, and receive
              personalized insights to improve your mental well-being.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}