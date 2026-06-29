import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Lock } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { ACHIEVEMENTS } from "@/game/achievements";
import { storage } from "@/game/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/achievements")({
  head: () => ({ meta: [{ title: "Achievements — Queens" }] }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const [earned, setEarned] = useState<Set<string>>(new Set());
  useEffect(() => setEarned(new Set(storage.getAchievements())), []);

  const pct = Math.round((earned.size / ACHIEVEMENTS.length) * 100);

  return (
    <div>
      <AppHeader />
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Achievements</h1>
          <p className="text-sm text-muted-foreground">{earned.size}/{ACHIEVEMENTS.length} unlocked · {pct}%</p>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-royal" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {ACHIEVEMENTS.map((a) => {
            const got = earned.has(a.id);
            return (
              <div key={a.id} className={cn("rounded-2xl glass p-4 shadow-soft flex items-start gap-3", !got && "opacity-60")}>
                <div className={cn(
                  "grid h-12 w-12 place-items-center rounded-xl shadow-soft shrink-0",
                  got ? "bg-royal text-royal-foreground" : "bg-muted text-muted-foreground",
                )}>
                  {got ? <Trophy className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
