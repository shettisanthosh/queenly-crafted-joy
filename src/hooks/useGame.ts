import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CellState, GameState, Move, Puzzle } from "@/game/types";
import { findConflicts, isComplete } from "@/game/validation";
import { storage } from "@/game/storage";

function emptyBoard(n: number): CellState[][] {
  return Array.from({ length: n }, () => new Array<CellState>(n).fill("empty"));
}

const nextState = (s: CellState): CellState =>
  s === "empty" ? "queen" : s === "queen" ? "mark" : "empty";

export function useGame(puzzle: Puzzle, initial?: GameState | null) {
  const [state, setState] = useState<GameState>(() => {
    if (initial && initial.puzzleId === puzzle.id) return initial;
    return {
      puzzleId: puzzle.id,
      board: emptyBoard(puzzle.size),
      history: [],
      future: [],
      startedAt: Date.now(),
      elapsedMs: 0,
      hintsUsed: 0,
      paused: false,
      completed: false,
    };
  });
  const [tick, setTick] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (state.paused || state.completed) return;
    tickRef.current = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [state.paused, state.completed]);

  // Persist
  useEffect(() => {
    if (state.completed) {
      storage.setActive(null);
    } else {
      storage.setActive(state);
    }
  }, [state]);

  const elapsedMs = useMemo(
    () =>
      state.completed || state.paused
        ? state.elapsedMs
        : state.elapsedMs + (Date.now() - state.startedAt),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, tick],
  );

  const conflicts = useMemo(() => findConflicts(state.board, puzzle), [state.board, puzzle]);

  const cycleCell = useCallback(
    (row: number, col: number) => {
      setState((prev) => {
        if (prev.completed || prev.paused) return prev;
        const from = prev.board[row][col];
        const to = nextState(from);
        const board = prev.board.map((r) => r.slice());
        board[row][col] = to;
        const move: Move = { row, col, from, to };
        const completed = isComplete(board, puzzle);
        return {
          ...prev,
          board,
          history: [...prev.history, move],
          future: [],
          completed,
          elapsedMs: completed
            ? prev.elapsedMs + (Date.now() - prev.startedAt)
            : prev.elapsedMs,
        };
      });
    },
    [puzzle],
  );

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.history.length === 0 || prev.completed) return prev;
      const move = prev.history[prev.history.length - 1];
      const board = prev.board.map((r) => r.slice());
      board[move.row][move.col] = move.from;
      return {
        ...prev,
        board,
        history: prev.history.slice(0, -1),
        future: [move, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.future.length === 0 || prev.completed) return prev;
      const move = prev.future[0];
      const board = prev.board.map((r) => r.slice());
      board[move.row][move.col] = move.to;
      const completed = isComplete(board, puzzle);
      return {
        ...prev,
        board,
        history: [...prev.history, move],
        future: prev.future.slice(1),
        completed,
      };
    });
  }, [puzzle]);

  const restart = useCallback(() => {
    setState({
      puzzleId: puzzle.id,
      board: emptyBoard(puzzle.size),
      history: [],
      future: [],
      startedAt: Date.now(),
      elapsedMs: 0,
      hintsUsed: 0,
      paused: false,
      completed: false,
    });
  }, [puzzle]);

  const pause = useCallback(() => {
    setState((prev) =>
      prev.paused || prev.completed
        ? prev
        : {
            ...prev,
            paused: true,
            elapsedMs: prev.elapsedMs + (Date.now() - prev.startedAt),
          },
    );
  }, []);

  const resume = useCallback(() => {
    setState((prev) => (!prev.paused ? prev : { ...prev, paused: false, startedAt: Date.now() }));
  }, []);

  const useHint = useCallback(() => {
    setState((prev) => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
  }, []);

  return {
    state,
    elapsedMs,
    conflicts,
    cycleCell,
    undo,
    redo,
    restart,
    pause,
    resume,
    useHint,
    setState,
  };
}

export function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
