export interface Entry {
  /** Stable id assigned during parsing (index-based). */
  id: string;
  /** Instagram handle without the leading @. */
  username: string;
  /** Raw comment text the user posted (may be empty if only username was given). */
  comment: string;
  /** Original raw line from the input, kept for transparency / export. */
  raw: string;
}

export interface Rules {
  /** Number of primary winners to draw (>=1). */
  winnerCount: number;
  /** Number of backup winners to draw (>=0). */
  backupCount: number;
  /** Hashtags that must appear in the comment (without #). Empty = no filter. */
  hashtags: string[];
  /** @usernames that must be mentioned in the comment (without @). Empty = no filter. */
  mentions: string[];
  /** Keywords that must appear in the comment. Empty = no filter. */
  keywords: string[];
  /** When multiple filter terms of a kind are set, require ALL (AND) or ANY (OR). */
  matchMode: "all" | "any";
  /** Drop entries that share a username with an earlier entry. */
  uniqueParticipants: boolean;
  /** Drop exact-duplicate comment lines. */
  uniqueEntries: boolean;
}

export type DrawPhase = "idle" | "spinning" | "done";

export interface WinnerResult {
  entry: Entry;
  isBackup: boolean;
  rank: number; // 1-based; primary winners first, then backups.
}

export const DEFAULT_RULES: Rules = {
  winnerCount: 1,
  backupCount: 1,
  hashtags: [],
  mentions: [],
  keywords: [],
  matchMode: "any",
  uniqueParticipants: true,
  uniqueEntries: true,
};
