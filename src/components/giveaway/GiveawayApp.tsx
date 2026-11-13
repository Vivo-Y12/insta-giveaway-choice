"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, ArrowRight, ArrowLeft, ListChecks, Settings2, Trophy, Github } from "lucide-react";
import { useGiveawayStore } from "@/lib/giveaway/store";
import { EntriesStep } from "./EntriesStep";
import { RulesStep } from "./RulesStep";
import { DrawStep } from "./DrawStep";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StepId = "entries" | "rules" | "draw";

const STEPS: Array<{ id: StepId; label: string; icon: React.ReactNode }> = [
  { id: "entries", label: "Entries", icon: <ListChecks className="h-4 w-4" /> },
  { id: "rules", label: "Rules", icon: <Settings2 className="h-4 w-4" /> },
  { id: "draw", label: "Draw", icon: <Trophy className="h-4 w-4" /> },
];

export function GiveawayApp() {
  const [step, setStep] = useState<StepId>("entries");
  const entriesCount = useGiveawayStore((s) => s.entries.length);
  const qualifiedCount = useGiveawayStore((s) => s.qualified.length);
  const rules = useGiveawayStore((s) => s.rules);
  const phase = useGiveawayStore((s) => s.phase);

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const totalToPick = rules.winnerCount + rules.backupCount;
  const canGoEntriesToRules = entriesCount > 0;
  const canGoRulesToDraw = qualifiedCount >= totalToPick && qualifiedCount > 0;

  const goNext = () => {
    if (step === "entries" && canGoEntriesToRules) setStep("rules");
    else if (step === "rules" && canGoRulesToDraw) setStep("draw");
  };
  const goBack = () => {
    if (step === "rules") setStep("entries");
    else if (step === "draw" && phase !== "spinning") setStep("rules");
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <Header />

      <Stepper current={step} onNavigate={(id) => {
        // Allow free navigation as long as prerequisites are met.
        if (id === "entries") setStep("entries");
        else if (id === "rules" && canGoEntriesToRules) setStep("rules");
        else if (id === "draw" && canGoRulesToDraw) setStep("draw");
      }} stepIndex={stepIndex} />

      <main className="mt-8 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {step === "entries" && <EntriesStep />}
            {step === "rules" && <RulesStep />}
            {step === "draw" && <DrawStep />}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer
        step={step}
        onBack={goBack}
        onNext={goNext}
        canBack={step !== "entries"}
        canNext={
          (step === "entries" && canGoEntriesToRules) ||
          (step === "rules" && canGoRulesToDraw)
        }
        nextLabel={step === "rules" ? "Go to draw" : "Continue"}
        hideNext={step === "draw"}
      />
    </div>
  );
}

function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-amber-500 shadow-sm">
          <Instagram className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">
            Insta Giveaway Choice
          </h1>
          <p className="text-xs text-muted-foreground">
            Pick fair, random Instagram giveaway winners in seconds.
          </p>
        </div>
      </div>
      <a
        href="https://github.com/BS-Ji-007/insta-giveaway-choice"
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex h-9 items-center gap-1.5 rounded-md border bg-card px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
      >
        <Github className="h-4 w-4" /> Repo
      </a>
    </header>
  );
}

function Stepper({
  current,
  stepIndex,
  onNavigate,
}: {
  current: StepId;
  stepIndex: number;
  onNavigate: (id: StepId) => void;
}) {
  return (
    <nav aria-label="Progress" className="mt-6">
      <ol className="flex items-center gap-2 sm:gap-3">
        {STEPS.map((s, i) => {
          const active = s.id === current;
          const done = i < stepIndex;
          return (
            <li key={s.id} className="flex flex-1 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => onNavigate(s.id)}
                className={cn(
                  "group flex flex-1 items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors",
                  active
                    ? "border-fuchsia-500/40 bg-fuchsia-500/5"
                    : done
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-border bg-card hover:bg-muted/40",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    active
                      ? "bg-gradient-to-br from-fuchsia-500 to-amber-500 text-white"
                      : done
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className={cn("text-sm font-medium", active ? "text-foreground" : "text-muted-foreground")}>
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <span className="hidden h-px w-4 bg-border sm:block" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function Footer({
  step,
  onBack,
  onNext,
  canBack,
  canNext,
  nextLabel,
  hideNext,
}: {
  step: StepId;
  onBack: () => void;
  onNext: () => void;
  canBack: boolean;
  canNext: boolean;
  nextLabel: string;
  hideNext: boolean;
}) {
  return (
    <footer className="mt-auto flex items-center justify-between gap-3 border-t pt-5">
      <Button variant="ghost" onClick={onBack} disabled={!canBack} className={step === "entries" ? "invisible" : ""}>
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
      </Button>
      {!hideNext && (
        <Button onClick={onNext} disabled={!canNext} className="bg-gradient-to-r from-fuchsia-600 via-pink-600 to-amber-500 text-white hover:opacity-95">
          {nextLabel} <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      )}
    </footer>
  );
}
