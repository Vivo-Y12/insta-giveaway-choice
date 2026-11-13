"use client";

import { create } from "zustand";
import {
  applyRules,
  pickWinners,
  secureShuffle,
} from "./picker";
import { parseEntries } from "./parser";
import { DEFAULT_RULES, type DrawPhase, type Entry, type Rules, type WinnerResult } from "./types";

interface GiveawayState {
  /** Raw paste from the textarea (kept so users can switch tabs without losing input). */
  rawInput: string;
  /** Parsed entries derived from `rawInput`. */
  entries: Entry[];
  /** Active rules. */
  rules: Rules;
  /** Entries remaining after applying rules. */
  qualified: Entry[];
  /** Whether the rules step is currently being edited (used to lazily recompute qualified pool). */
  results: WinnerResult[];
  phase: DrawPhase;
  /** The pool that was used for the most recent draw (so we can re-spin without re-applying rules). */
  lastPool: Entry[];

  setRawInput: (raw: string) => void;
  setRules: (patch: Partial<Rules>) => void;
  resetRules: () => void;
  loadSample: () => void;
  clearEntries: () => void;
  recomputeQualified: () => void;
  startDraw: () => void;
  finishDraw: () => void;
  drawAgain: () => void;
  resetDraw: () => void;
}

export const useGiveawayStore = create<GiveawayState>((set, get) => ({
  rawInput: "",
  entries: [],
  rules: { ...DEFAULT_RULES },
  qualified: [],
  results: [],
  phase: "idle",
  lastPool: [],

  setRawInput: (raw) => {
    const entries = parseEntries(raw);
    set({ rawInput: raw, entries });
    // Recompute qualified pool lazily so step 2 always shows fresh numbers.
    const { rules } = get();
    const qualified = applyRules(entries, rules);
    set({ qualified, results: [], phase: "idle" });
  },

  setRules: (patch) => {
    const rules = { ...get().rules, ...patch };
    const qualified = applyRules(get().entries, rules);
    set({ rules, qualified, results: [], phase: "idle" });
  },

  resetRules: () => {
    const rules = { ...DEFAULT_RULES };
    const qualified = applyRules(get().entries, rules);
    set({ rules, qualified, results: [], phase: "idle" });
  },

  loadSample: () => {
    // Use dynamic import to avoid bundling sample data eagerly on the server.
    const raw = sampleRaw;
    const entries = parseEntries(raw);
    const qualified = applyRules(entries, get().rules);
    set({ rawInput: raw, entries, qualified, results: [], phase: "idle" });
  },

  clearEntries: () => {
    set({
      rawInput: "",
      entries: [],
      qualified: [],
      results: [],
      phase: "idle",
      lastPool: [],
    });
  },

  recomputeQualified: () => {
    const { entries, rules } = get();
    const qualified = applyRules(entries, rules);
    set({ qualified });
  },

  startDraw: () => {
    const { qualified } = get();
    if (qualified.length === 0) return;
    // Snapshot the pool so re-spins during the same session draw from the
    // same population (avoids surprising shifts if entries change).
    set({ phase: "spinning", lastPool: qualified.slice() });
  },

  finishDraw: () => {
    const { lastPool, rules } = get();
    if (lastPool.length === 0) return;
    const results = pickWinners(lastPool, rules);
    set({ results, phase: "done" });
  },

  drawAgain: () => {
    const { lastPool, rules } = get();
    if (lastPool.length === 0) return;
    const results = pickWinners(lastPool, rules);
    set({ results, phase: "done" });
  },

  resetDraw: () => {
    set({ results: [], phase: "idle", lastPool: [] });
  },
}));

/** Internal: produce one new re-shuffle of the pool (used by the spinning reel animation). */
export function spinSnapshot(pool: Entry[], count: number): Entry[] {
  if (pool.length === 0) return [];
  const shuffled = secureShuffle(pool);
  return shuffled.slice(0, Math.max(count, 1));
}

const sampleRaw = `alex_w: Love this! @sarah_j @mikey_p #giveaway #win
sarah_j: Fingers crossed! #giveaway
mikey_p: Would love to win this #giveaway #luckyme
emma.codes: Count me in! @friend_one @friend_two #win
the_real_dan: Awesome giveaway! #giveaway
lily.q: @alex_w you should enter too! #giveaway
_jordan_: First time entering, super excited #giveaway #firsttime
kira.dev: This would make my year #giveaway
sam_99: Please pick me! @bestie_1 #win
nora.k: Entered! #giveaway #win
tomy: Wow this looks amazing #giveaway
priya_m: @sister_22 @bro_11 join this! #giveaway
max.power: Let's goooo #win #giveaway
ava.l: Such a generous giveaway! #giveaway
leo.codes: Following & shared! #giveaway #win
chloe_m: @hubby_99 enter this pls #giveaway
drew.dev: Pick me pick me! #giveaway
mia_88: Fingers crossed! @bff_4ever #win
zack.r: Hyped for this one #giveaway
ivy.q: Would be thrilled to win #giveaway #win
noah_b: @wifey_22 let's enter together #giveaway
rose.m: First comment ever! #giveaway #win
ken.c: Let me win please! #win
dana_x: Shared with friends! #giveaway #win
harper_w: @sis_7 @bro_7 @cousin_7 #giveaway
finn.dev: Entering! #giveaway
quinn.m: Such a cool prize #win #giveaway
Remi.q: @mom_dad_99 #giveaway
sienna.l: Crossing everything! #giveaway #win
owen.r: @team_mate_1 #giveaway #win`;
