import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown, X } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";

export const Route = createFileRoute("/how-to-play")({
  head: () => ({ meta: [{ title: "How to Play — Queens" }] }),
  component: HowToPlay,
});

function HowToPlay() {
  return (
    <div>
      <AppHeader />
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <header>
          <h1 className="font-display text-3xl font-bold">How to Play</h1>
          <p className="text-muted-foreground text-sm mt-1">A pure-logic puzzle. No guessing required.</p>
        </header>

        <Section title="The goal">
          Place exactly one <Crown className="inline h-4 w-4 mb-0.5" fill="currentColor" /> queen on the board so that
          every row, every column, and every color region contains exactly one queen — and no two queens touch
          (not even diagonally).
        </Section>

        <Section title="Tap to cycle">
          Each cell cycles through three states: <em>empty</em> →
          <span className="inline-flex items-center mx-1 align-middle"><Crown className="h-4 w-4" fill="currentColor" /></span>
          queen →
          <span className="inline-flex items-center mx-1 align-middle"><X className="h-4 w-4" strokeWidth={3} /></span>
          mark → empty. Use marks to track squares you've ruled out.
        </Section>

        <Section title="Strategy">
          <ul className="list-disc pl-5 space-y-1.5 text-sm">
            <li>Start from the smallest region — fewer cells means fewer options.</li>
            <li>Eliminate cells a queen would attack: the entire row, column, region, and adjacent cells.</li>
            <li>If a row has only one open cell, that's where the queen goes.</li>
            <li>Use <em>Hint</em> for a logical nudge, not the answer.</li>
          </ul>
        </Section>

        <Section title="Conflicts">
          Invalid placements shake briefly. A queen sharing a row, column, region, or touching another queen will be
          highlighted so you know exactly what to fix.
        </Section>

        <div className="text-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-royal text-royal-foreground px-5 py-3 font-semibold shadow-soft hover:opacity-90"
          >
            Start playing
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl glass p-5 shadow-soft">
      <h2 className="font-display text-xl font-semibold mb-2">{title}</h2>
      <div className="text-sm leading-relaxed">{children}</div>
    </section>
  );
}
