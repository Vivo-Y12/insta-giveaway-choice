import type { Entry, Rules, WinnerResult } from "./types";

/**
 * Apply the user's rules to a parsed entry list and return the qualified
 * entries that will be entered into the draw.
 *
 * - Filtering by hashtag / mention / keyword uses `matchMode` (ALL or ANY).
 * - `uniqueEntries` removes entries whose raw line was already seen.
 * - `uniqueParticipants` keeps only the first entry per username.
 *
 * The original entry order is preserved (so users can sanity-check).
 */
export function applyRules(entries: Entry[], rules: Rules): Entry[] {
  let pool = entries;

  if (rules.uniqueEntries) {
    const seen = new Set<string>();
    pool = pool.filter((e) => {
      const key = e.raw.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  if (rules.uniqueParticipants) {
    const seen = new Set<string>();
    pool = pool.filter((e) => {
      const key = e.username.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const hashtags = rules.hashtags.map((t) => t.toLowerCase().replace(/^#/, ""));
  const mentions = rules.mentions.map((t) => t.toLowerCase().replace(/^@/, ""));
  const keywords = rules.keywords.map((t) => t.toLowerCase());

  const hasHashtagFilter = hashtags.length > 0;
  const hasMentionFilter = mentions.length > 0;
  const hasKeywordFilter = keywords.length > 0;

  if (!hasHashtagFilter && !hasMentionFilter && !hasKeywordFilter) {
    return pool;
  }

  return pool.filter((e) => {
    const text = `${e.comment} ${e.raw}`.toLowerCase();
    const commentText = e.comment.toLowerCase();

    const hashtagOk = !hasHashtagFilter || matchTerms(commentText, hashtags, (t) => `#${t}`, rules.matchMode);
    const mentionOk = !hasMentionFilter || matchTerms(text, mentions, (t) => `@${t}`, rules.matchMode);
    const keywordOk = !hasKeywordFilter || matchTerms(commentText, keywords, (t) => t, rules.matchMode);

    return hashtagOk && mentionOk && keywordOk;
  });
}

function matchTerms(
  haystack: string,
  terms: string[],
  wrap: (t: string) => string,
  mode: "all" | "any",
): boolean {
  if (mode === "all") {
    return terms.every((t) => haystack.includes(wrap(t)));
  }
  return terms.some((t) => haystack.includes(wrap(t)));
}

/**
 * Cryptographically-strong unbiased integer in [0, max).
 * Uses rejection sampling so the result has no modulo bias.
 */
export function secureRandomInt(max: number): number {
  if (max <= 0) throw new Error("max must be > 0");
  if (max === 1) return 0;
  const u32Max = 0xffffffff;
  const limit = u32Max - (u32Max % max);
  const buf = new Uint32Array(1);
  // Rejection sampling: redraw until we get a value within the unbiased range.
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0] <= limit) return buf[0] % max;
  }
}

/** Fisher–Yates shuffle using crypto-strong randomness. Returns a new array. */
export function secureShuffle<T>(input: readonly T[]): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Pick `winnerCount` primary winners + `backupCount` backups from the
 * qualified pool. Backups are returned in priority order (first backup fills
 * the first vacancy, etc.).
 */
export function pickWinners(qualified: Entry[], rules: Rules): WinnerResult[] {
  const total = rules.winnerCount + rules.backupCount;
  if (qualified.length === 0 || total === 0) return [];

  const shuffled = secureShuffle(qualified);
  const chosen = shuffled.slice(0, Math.min(total, shuffled.length));

  const results: WinnerResult[] = chosen.map((entry, i) => ({
    entry,
    isBackup: i >= rules.winnerCount,
    rank: i + 1,
  }));
  return results;
}
