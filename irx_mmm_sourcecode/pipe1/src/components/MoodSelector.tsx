import { Smile, Meh, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MoodSelectorProps {
  selectedMood: number;
  onMoodChange: (mood: number) => void;
}

export const MoodSelector = ({ selectedMood, onMoodChange }: MoodSelectorProps) => {
  const moods = [
    { score: 1, icon: Frown, label: "Very Bad", color: "text-destructive" },
    { score: 3, icon: Frown, label: "Bad", color: "text-orange-500" },
    { score: 5, icon: Meh, label: "Okay", color: "text-secondary" },
    { score: 7, icon: Smile, label: "Good", color: "text-primary" },
    { score: 10, icon: Smile, label: "Great", color: "text-success" },
  ];

  return (
    <div className="flex items-center justify-between gap-2">
      {moods.map((mood) => {
        const Icon = mood.icon;
        const isSelected = selectedMood === mood.score;
        
        return (
          <Button
            key={mood.score}
            onClick={() => onMoodChange(mood.score)}
            variant="outline"
            className={`flex-1 h-20 flex flex-col gap-2 transition-all ${
              isSelected
                ? "border-primary bg-primary/10 shadow-medium"
                : "hover:border-primary/50"
            }`}
          >
            <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : mood.color}`} />
            <span className="text-xs">{mood.label}</span>
          </Button>
        );
      })}
    </div>
  );
};