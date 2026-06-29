import { Pause, Play, Lightbulb, Undo2, Redo2, RotateCcw, Home } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { formatTime } from "@/hooks/useGame";

interface GameHUDProps {
  difficulty: string;
  size: number;
  elapsedMs: number;
  moves: number;
  hintsUsed: number;
  paused: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onPauseToggle: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onRestart: () => void;
  onHint: () => void;
}

export function GameHUD(props: GameHUDProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl glass shadow-soft hover:bg-accent transition"
            aria-label="Back to home"
          >
            <Home className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {props.difficulty} · {props.size}×{props.size}
            </p>
            <h1 className="truncate font-display text-xl font-semibold">Queens</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl glass px-3 py-2 shadow-soft">
          <div className="text-right leading-tight">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Time</p>
            <p className="font-mono text-lg font-semibold tabular-nums">
              {formatTime(props.elapsedMs)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={props.onPauseToggle}
            aria-label={props.paused ? "Resume" : "Pause"}
          >
            {props.paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Stat label="Moves" value={props.moves} />
        <Stat label="Hints" value={props.hintsUsed} />
        <Stat label="Size" value={`${props.size}²`} />
        <Stat label="Goal" value={`${props.size}♛`} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={props.onUndo}
          disabled={!props.canUndo}
          className="min-h-10"
        >
          <Undo2 className="h-4 w-4" /> Undo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={props.onRedo}
          disabled={!props.canRedo}
          className="min-h-10"
        >
          <Redo2 className="h-4 w-4" /> Redo
        </Button>
        <Button variant="outline" size="sm" onClick={props.onRestart} className="min-h-10">
          <RotateCcw className="h-4 w-4" /> Restart
        </Button>
        <Button size="sm" onClick={props.onHint} className="min-h-10 ml-auto bg-royal text-royal-foreground hover:opacity-90">
          <Lightbulb className="h-4 w-4" /> Hint
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl glass px-3 py-2 text-center shadow-soft">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-display text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
