import type { Entry } from "./types";

/**
 * Parse a free-form paste of Instagram comments / usernames into structured
 * entries.
 *
 * Supported line formats (one entry per non-empty line):
 *   1. `username`
 *   2. `@username`
 *   3. `username: comment text`
 *   4. `@username comment text`
 *   5. `username | comment text`
 *   6. CSV: `username,comment` (extra columns ignored)
 *
 * Lines that cannot be resolved to a username (e.g. blank or only punctuation)
 * are skipped. Whitespace is trimmed.
 */
export function parseEntries(raw: string): Entry[] {
  if (!raw) return [];
  const lines = raw.split(/\r?\n/);
  const out: Entry[] = [];
  let idx = 0;

  for (const original of lines) {
    const line = original.trim();
    if (!line) continue;

    const entry = parseLine(line, idx);
    if (entry) {
      out.push(entry);
      idx++;
    }
  }
  return out;
}

function parseLine(line: string, idx: number): Entry | null {
  // Try CSV first: `username,comment[,ignored...]` — but only if the slice
  // before the first comma is a clean handle. Otherwise the comma is just
  // punctuation inside a comment (e.g. "user: hi, guys").
  if (line.includes(",")) {
    const firstComma = line.indexOf(",");
    const left = line.slice(0, firstComma).trim();
    const username = cleanHandle(left);
    if (username) {
      const comment = line.slice(firstComma + 1).trim();
      return {
        id: `e-${idx}`,
        username,
        comment,
        raw: line,
      };
    }
  }

  // Pipe separator: `username | comment`
  if (line.includes("|")) {
    const [left, ...rest] = line.split("|");
    const username = cleanHandle(left);
    if (!username) return null;
    const comment = rest.join("|").trim();
    return { id: `e-${idx}`, username, comment, raw: line };
  }

  // Colon separator: `username: comment` — only if the slice before the first
  // colon is a handle and contains no spaces.
  const colonIdx = line.indexOf(":");
  if (colonIdx > 0 && !line.slice(0, colonIdx).includes(" ")) {
    const left = line.slice(0, colonIdx);
    const username = cleanHandle(left);
    if (username) {
      const comment = line.slice(colonIdx + 1).trim();
      return { id: `e-${idx}`, username, comment, raw: line };
    }
  }

  // Leading @handle followed by comment text
  const mentionMatch = line.match(/^@([A-Za-z0-9._]+)\s*(.*)$/);
  if (mentionMatch) {
    const username = mentionMatch[1];
    const comment = mentionMatch[2].trim();
    return { id: `e-${idx}`, username, comment, raw: line };
  }

  // Bare leading token (treat as username + optional trailing comment)
  const spaceIdx = line.indexOf(" ");
  if (spaceIdx > 0) {
    const left = line.slice(0, spaceIdx);
    if (isHandle(left)) {
      const username = cleanHandle(left)!;
      const comment = line.slice(spaceIdx + 1).trim();
      return { id: `e-${idx}`, username, comment, raw: line };
    }
  }

  // Just a username token
  if (isHandle(line)) {
    return {
      id: `e-${idx}`,
      username: line.replace(/^@/, ""),
      comment: "",
      raw: line,
    };
  }

  return null;
}

function cleanHandle(token: string): string | null {
  if (!token) return null;
  const t = token.trim().replace(/^@/, "");
  return isHandle(t) ? t : null;
}

function isHandle(token: string): boolean {
  // Instagram handles: letters, digits, dot, underscore; 1-30 chars.
  return /^[A-Za-z0-9._]{1,30}$/.test(token);
}

/** Build a human-readable sample dataset for the "Try with sample data" button. */
export function sampleDataset(): string {
  const comments: Array<[string, string]> = [
    ["alex_w", "Love this! @sarah_j @mikey_p #giveaway #win"],
    ["sarah_j", "Fingers crossed! #giveaway"],
    ["mikey_p", "Would love to win this 🤞 #giveaway #luckyme"],
    ["emma.codes", "Count me in! @friend_one @friend_two #win"],
    ["the_real_dan", "Awesome giveaway! #giveaway"],
    ["lily.q", "@alex_w you should enter too! #giveaway"],
    ["_jordan_", "First time entering, super excited #giveaway #firsttime"],
    ["kira.dev", "This would make my year #giveaway"],
    ["sam_99", "Please pick me! @bestie_1 #win"],
    ["nora.k", "Entered! #giveaway #win"],
    ["tomy", "Wow this looks amazing #giveaway"],
    ["priya_m", "@sister_22 @bro_11 join this! #giveaway"],
    ["max.power", "Let's goooo #win #giveaway"],
    ["ava.l", "Such a generous giveaway! #giveaway"],
    ["leo.codes", "Following & shared! #giveaway #win"],
    ["chloe_m", "@hubby_99 enter this pls #giveaway"],
    ["drew.dev", "Pick me pick me! #giveaway"],
    ["mia_88", "Fingers crossed! @bff_4ever #win"],
    ["zack.r", "Hyped for this one #giveaway"],
    ["ivy.q", "Would be thrilled to win #giveaway #win"],
    ["noah_b", "@wifey_22 let's enter together #giveaway"],
    ["rose.m", "First comment ever! #giveaway #win"],
    ["ken.c", "Let me win please! #win"],
    ["dana_x", "Shared with friends! #giveaway #win"],
    ["harper_w", "@sis_7 @bro_7 @cousin_7 #giveaway"],
    ["finn.dev", "Entering! #giveaway"],
    ["quinn.m", "Such a cool prize #win #giveaway"],
    ["Remi.q", "@mom_dad_99 #giveaway"],
    ["sienna.l", "Crossing everything! #giveaway #win"],
    ["owen.r", "@team_mate_1 #giveaway #win"],
  ];
  return comments.map(([u, c]) => `${u}: ${c}`).join("\n");
}
