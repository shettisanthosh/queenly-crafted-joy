import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { useSettings } from "@/hooks/useSettings";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { storage } from "@/game/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Queens" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, update, reset } = useSettings();
  return (
    <div>
      <AppHeader />
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        <h1 className="font-display text-3xl font-bold">Settings</h1>

        <Section title="Appearance">
          <Row label="Theme">
            <div className="flex gap-1.5">
              {(["light", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => update({ theme: t })}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${
                    settings.theme === t ? "bg-royal text-royal-foreground" : "glass"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Row>
          <Row label="High contrast colors" hint="Vivid region colors for accessibility">
            <Switch checked={settings.highContrast} onCheckedChange={(v) => update({ highContrast: v })} />
          </Row>
          <Row label="Animations">
            <Switch checked={settings.animations} onCheckedChange={(v) => update({ animations: v })} />
          </Row>
        </Section>

        <Section title="Audio">
          <Row label="Sound effects">
            <Switch checked={settings.sound} onCheckedChange={(v) => update({ sound: v })} />
          </Row>
        </Section>

        <Section title="Data">
          <Row label="Reset all progress" hint="Clears stats, achievements, saved game">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (confirm("Reset all progress? This cannot be undone.")) {
                  storage.reset();
                  reset();
                  toast("Progress reset");
                }
              }}
            >
              Reset
            </Button>
          </Row>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl glass p-5 shadow-soft">
      <h2 className="font-display text-lg font-semibold mb-3">{title}</h2>
      <div className="divide-y divide-border/50">{children}</div>
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
