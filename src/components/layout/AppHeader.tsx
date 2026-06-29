import { Link } from "@tanstack/react-router";
import { Crown, Moon, Sun, Monitor, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettings } from "@/hooks/useSettings";

export function AppHeader() {
  const { settings, update } = useSettings();
  const ThemeIcon =
    settings.theme === "dark" ? Moon : settings.theme === "light" ? Sun : Monitor;
  return (
    <header className="sticky top-0 z-30 w-full">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="flex items-center gap-3 rounded-2xl glass px-3 py-2 shadow-soft">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-royal text-royal-foreground shadow-soft">
              <Crown className="h-5 w-5" fill="currentColor" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-lg font-bold leading-none">Queens</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Royal Logic Puzzle
              </p>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Theme">
                  <ThemeIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => update({ theme: "light" })}>
                  <Sun className="h-4 w-4" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => update({ theme: "dark" })}>
                  <Moon className="h-4 w-4" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => update({ theme: "system" })}>
                  <Monitor className="h-4 w-4" /> System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild variant="ghost" size="icon" aria-label="Settings">
              <Link to="/settings">
                <SettingsIcon className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
