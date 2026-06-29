import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { Crown } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Queens" }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <AppHeader />
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-royal text-royal-foreground shadow-elevated">
          <Crown className="h-8 w-8" fill="currentColor" />
        </div>
        <h1 className="font-display text-4xl font-bold mt-4">Queens</h1>
        <p className="text-muted-foreground mt-2">
          A premium, modern take on the classic queen-placement logic puzzle. Built with care for clarity, calm, and craft.
        </p>
        <p className="text-xs text-muted-foreground mt-6">
          All puzzles are generated deterministically and verified to have a single unique solution.
        </p>
      </div>
    </div>
  );
}
