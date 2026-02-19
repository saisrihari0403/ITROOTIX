import { Link, useLocation } from "react-router-dom";
import { Home, MessageSquare, BookOpen, Clock, BarChart3, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Navigation = () => {
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out successfully" });
  };

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/chat", icon: MessageSquare, label: "AI Companion" },
    { path: "/journal", icon: BookOpen, label: "Journal" },
    { path: "/productivity", icon: Clock, label: "Focus" },
    { path: "/insights", icon: BarChart3, label: "Insights" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed left-0 top-0 h-screen w-20 bg-card border-r border-border flex flex-col items-center py-6 gap-6 shadow-soft">
      <Link to="/dashboard" className="mb-4">
        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-medium">
          <span className="text-white font-bold text-xl">M</span>
        </div>
      </Link>

      <div className="flex flex-col gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group relative w-12 h-12 flex items-center justify-center rounded-xl transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="absolute left-16 px-3 py-2 bg-card border border-border rounded-lg shadow-medium text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <Button
        onClick={handleLogout}
        variant="ghost"
        size="icon"
        className="mt-auto w-12 h-12 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      >
        <LogOut className="w-5 h-5" />
      </Button>
    </nav>
  );
};