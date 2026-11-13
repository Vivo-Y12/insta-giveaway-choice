"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Crown,
  RefreshCw,
  Copy,
  Download,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { useGiveawayStore, spinSnapshot } from "@/lib/giveaway/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Confetti } from "./Confetti";
import type { Entry, WinnerResult } from "@/lib/giveaway/types";
import { useToast } from "@/hooks/use-toast";

const SPIN_MS = 3200;

export function DrawStep() {
  const phase = useGiveawayStore((s) => s.phase);
  const results = useGiveawayStore((s) => s.results);
  const qualified = useGiveawayStore((s) => s.qualified);
  const lastPool = useGiveawayStore((s) => s.lastPool);
  const rules = useGiveawayStore((s) => s.rules);
  const startDraw = useGiveawayStore((s) => s.startDraw);
  const finishDraw = useGiveawayStore((s) => s.finishDraw);
  const drawAgain = useGiveawayStore((s) => s.drawAgain);
  const resetDraw = useGiveawayStore((s) => s.resetDraw);

  const [reel, setReel] = useState<Entry[]>([]);
  const [fireConfetti, setFireConfetti] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  const pool = lastPool.length > 0 ? lastPool : qualified;
  const totalToPick = rules.winnerCount + rules.backupCount;

  // Drive the spinning reel: swap usernames rapidly, then settle.
  useEffect(() => {
    if (phase !== "spinning") return;
    if (pool.length === 0) return;

    setReel(spinSnapshot(pool, Math.max(rules.winnerCount, 1)));
    intervalRef.current = setInterval(() => {
      setReel(spinSnapshot(pool, Math.max(rules.winnerCount, 1)));
    }, 80);

    timerRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      finishDraw();
    }, SPIN_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase]);

  // Trigger confetti when results land.
  useEffect(() => {
    if (phase === "done" && results.length > 0) {
      setFireConfetti(false);
      // Flip true on next tick so the burst retriggers cleanly.
      const id = setTimeout(() => setFireConfetti(true), 60);
      return () => clearTimeout(id);
    } else {
      setFireConfetti(false);
    }
  }, [phase, results]);

  const canDraw = qualified.length >= totalToPick && qualified.length > 0;

  if (phase === "idle") {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-pink-500 to-amber-500 shadow-lg shadow-fuchsia-500/30">
          <Trophy className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to draw</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          We&apos;ll randomly pick{" "}
          <strong className="text-foreground">{rules.winnerCount}</strong>{" "}
          {rules.winnerCount === 1 ? "winner" : "winners"}
          {rules.backupCount > 0 && (
            <>
              {" "}and <strong className="text-foreground">{rules.backupCount}</strong>{" "}
              {rules.backupCount === 1 ? "backup" : "backups"}
            </>
          )}
          {" "}from <strong className="text-foreground">{qualified.length}</strong> qualified entries.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Button
            size="lg"
            onClick={startDraw}
            disabled={!canDraw}
            className="h-14 px-10 text-base font-semibold bg-gradient-to-r from-fuchsia-600 via-pink-600 to-amber-500 text-white shadow-lg shadow-fuchsia-500/30 hover:opacity-95"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Pick {rules.winnerCount} {rules.winnerCount === 1 ? "winner" : "winners"}
          </Button>
          {!canDraw && qualified.length > 0 && (
            <p className="flex items-center gap-1.5 text-xs text-amber-600">
              <AlertCircle className="h-3.5 w-3.5" />
              Not enough qualified entries for {totalToPick} picks. Adjust winners/backups in step 2.
            </p>
          )}
          {qualified.length === 0 && (
            <p className="flex items-center gap-1.5 text-xs text-amber-600">
              <AlertCircle className="h-3.5 w-3.5" />
              No qualified entries yet. Add entries and check your filters.
            </p>
          )}
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Drawn with cryptographically-secure randomness (no modulo bias).
          </p>
        </div>
      </div>
    );
  }

  if (phase === "spinning") {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight">Drawing…</h2>
        <p className="mt-1 text-sm text-muted-foreground">Shuffling {pool.length} entries</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {reel.map((entry, i) => (
            <motion.div
              key={`${i}-${entry.id}-${Math.random()}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.08 }}
              className="min-w-[180px] rounded-xl border-2 border-fuchsia-500/30 bg-white px-5 py-4 shadow-sm dark:bg-card"
            >
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Winner {i + 1}
              </div>
              <div className="mt-1 truncate text-lg font-semibold text-foreground">
                @{entry.username}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mx-auto mt-8 h-1.5 w-64 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-gradient-to-r from-fuchsia-500 to-amber-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: SPIN_MS / 1000, ease: "easeInOut" }}
          />
        </div>
      </div>
    );
  }

  // phase === "done"
  return (
    <DrawResults
      results={results}
      fireConfetti={fireConfetti}
      onDrawAgain={drawAgain}
      onReset={resetDraw}
      winnerCount={rules.winnerCount}
      toast={toast}
    />
  );
}

function DrawResults({
  results,
  fireConfetti,
  onDrawAgain,
  onReset,
  winnerCount,
  toast,
}: {
  results: WinnerResult[];
  fireConfetti: boolean;
  onDrawAgain: () => void;
  onReset: () => void;
  winnerCount: number;
  toast: ReturnType<typeof useToast>["toast"];
}) {
  const winners = results.filter((r) => !r.isBackup);
  const backups = results.filter((r) => r.isBackup);
  const winnersRef = useRef<HTMLDivElement>(null);

  const summary = useMemo(() => {
    const lines = winners.map((w, i) => `Winner #${i + 1}: @${w.entry.username}`);
    backups.forEach((b, i) => lines.push(`Backup #${i + 1}: @${b.entry.username}`));
    return lines.join("\n");
  }, [winners, backups]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      toast({ title: "Copied to clipboard", description: "Winners list is on your clipboard." });
    } catch {
      toast({ title: "Copy failed", description: "Your browser blocked clipboard access.", variant: "destructive" });
    }
  };

  const onExport = () => {
    const lines: string[] = [];
    lines.push("Instagram Giveaway — Results");
    lines.push(`Date: ${new Date().toLocaleString()}`);
    lines.push(`Total winners: ${winners.length}`);
    lines.push(`Total backups: ${backups.length}`);
    lines.push("");
    lines.push("== Winners ==");
    winners.forEach((w, i) => {
      lines.push(`#${i + 1} @${w.entry.username}`);
      if (w.entry.comment) lines.push(`    Comment: ${w.entry.comment}`);
    });
    if (backups.length) {
      lines.push("");
      lines.push("== Backups ==");
      backups.forEach((b, i) => {
        lines.push(`#${i + 1} @${b.entry.username}`);
        if (b.entry.comment) lines.push(`    Comment: ${b.entry.comment}`);
      });
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `giveaway-winners-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Confetti fire={fireConfetti} />

      <div className="text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-pink-500 to-fuchsia-600 shadow-lg shadow-pink-500/30"
        >
          <Crown className="h-8 w-8 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Winners announced</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {winners.length} {winners.length === 1 ? "winner" : "winners"}
          {backups.length > 0 && (
            <>
              {" · "}
              {backups.length} {backups.length === 1 ? "backup" : "backups"}
            </>
          )}
        </p>
      </div>

      <div ref={winnersRef} className="mt-8 grid gap-4 sm:grid-cols-2">
        <AnimatePresence>
          {winners.map((w, i) => (
            <motion.div
              key={w.entry.id}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.15, type: "spring", stiffness: 220, damping: 18 }}
            >
              <WinnerCard result={w} highlight />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {backups.length > 0 && (
        <Collapsible className="mt-8">
          <Card className="overflow-hidden">
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted/40">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Backup winners ({backups.length})</span>
                </div>
                <Badge variant="secondary">{backups.length}</Badge>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-t">
                <ScrollArea className="h-auto max-h-72">
                  <ul className="divide-y">
                    {backups.map((b, i) => (
                      <li key={b.entry.id} className="flex items-start gap-3 px-5 py-3 text-sm">
                        <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium">@{b.entry.username}</div>
                          {b.entry.comment && (
                            <div className="truncate text-xs text-muted-foreground">{b.entry.comment}</div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={onDrawAgain} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> Draw again
        </Button>
        <Button onClick={onCopy} variant="outline">
          <Copy className="mr-2 h-4 w-4" /> Copy results
        </Button>
        <Button onClick={onExport} variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export .txt
        </Button>
      </div>
    </div>
  );
}

function WinnerCard({
  result,
  highlight,
}: {
  result: WinnerResult;
  highlight?: boolean;
}) {
  return (
    <Card
      className={
        highlight
          ? "relative overflow-hidden border-0 bg-gradient-to-br from-fuchsia-500 via-pink-500 to-amber-500 p-[1.5px] shadow-lg shadow-pink-500/20"
          : "overflow-hidden"
      }
    >
      <div className={highlight ? "rounded-[calc(theme(borderRadius.xl)-1.5px)] bg-card p-5" : "p-5"}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Winner #{result.rank}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-amber-500 text-base font-bold uppercase text-white">
            {result.entry.username.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold">@{result.entry.username}</div>
            {result.entry.comment ? (
              <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {result.entry.comment}
              </div>
            ) : (
              <div className="mt-0.5 text-xs text-muted-foreground">No comment text</div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
