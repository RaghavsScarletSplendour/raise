export type Cue = { start: number; text: string };

export type Decision = {
  kind: "yank" | "refuse" | "answer";
  t?: number;
  cite?: string;
  line?: string;
  text: string;
};

const STOP = new Set(
  "the a an and or of to in on for with from is are was were be being been it this that these those you we they i he she do does did how what why when where who which can could should would will just even about into over after before than then also not no yes our your their".split(
    " "
  )
);

export function mmss(t: number) {
  const m = Math.floor(Math.max(0, t) / 60);
  const s = Math.floor(Math.max(0, t) % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function overlap(q: string[], text: string): number {
  if (!q.length) return 0;
  const hay = tokenize(text);
  if (!hay.length) return 0;
  let hits = 0;
  for (const token of q) {
    if (hay.some((w) => w === token || w.includes(token) || token.includes(w))) {
      hits += 1;
    }
  }
  return hits / q.length;
}

function bestCue(q: string[], cues: Cue[]) {
  let best: { score: number; cue: Cue | null } = { score: 0, cue: null };
  for (const cue of cues) {
    const score = overlap(q, cue.text);
    if (score > best.score) best = { score, cue };
  }
  return best;
}

function pickLine(seed: string, lines: string[]) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return lines[Math.abs(h) % lines.length];
}

const REFUSE = [
  "I haven't taught that yet. Sit down. This isn't a buffet.",
  "Cute guess. That's later. Sit down and wait like a person.",
  "Spoilers are for people who skip class. Sit down.",
  "I haven't taught that yet. Your impatience is showing. Sit down.",
  "Not yet. Sit down. I promise it will still be impressive when I actually say it.",
];

function snarkYank(cite: string, line: string) {
  return pickLine(
    cite + line,
    [
      `See? ${cite}. I already said this: "${line}" Maybe write it down this time.`,
      `That was me, ${cite}, saying the thing you just asked. "${line}" You're welcome, I guess.`,
      `I already covered this at ${cite}. "${line}" Rewatching is free. Attention, apparently, is not.`,
      `Timestamp ${cite}. I said "${line}" out loud. In this room. Try existing here.`,
    ]
  );
}

function snarkAnswer(cite: string, bits: string) {
  return pickLine(
    cite + bits,
    [
      `Fine. From ${cite}, since listening was optional: ${bits}`,
      `Paying attention is a sport you sit out, I see. ${cite}: ${bits}`,
      `From the part that was not a secret (${cite}): ${bits} Try to keep up.`,
      `Yes, I will repeat myself. Slowly. ${cite}. ${bits}`,
      `Oh good, a question I already answered. ${cite}: ${bits} Now sit.`,
    ]
  );
}

export function decide(cues: Cue[], currentTime: number, question: string): Decision {
  const q = tokenize(question);
  // Judges mash the chip the second the hall opens. A line a few seconds
  // ahead is being taught now, not "later in the course".
  const GRACE = 28;
  const before = cues.filter((c) => c.start <= currentTime + GRACE);
  const after = cues.filter((c) => c.start > currentTime + GRACE);
  const beforeBest = bestCue(q, before);
  const afterBest = bestCue(q, after);
  const beforeBlob = overlap(q, before.map((c) => c.text).join(" "));
  const afterBlob = overlap(q, after.map((c) => c.text).join(" "));
  const MATCH = 0.34;
  const YANK_GAP = 14;

  const afterStrong =
    (afterBest.score >= MATCH && afterBest.score > beforeBest.score + 0.08 && beforeBlob < 0.42) ||
    (afterBlob >= MATCH && afterBlob > beforeBlob + 0.18 && beforeBest.score < MATCH);

  if (afterStrong || (beforeBest.score < 0.22 && afterBlob > 0.28)) {
    return {
      kind: "refuse",
      text: pickLine(question + String(currentTime), REFUSE),
    };
  }

  if (beforeBest.cue && (beforeBest.score >= MATCH || beforeBlob >= 0.28)) {
    const cue = beforeBest.cue;
    const cite = mmss(cue.start);
    const age = currentTime - cue.start;
    if (age > YANK_GAP) {
      return {
        kind: "yank",
        t: cue.start,
        cite,
        line: cue.text,
        text: snarkYank(cite, cue.text),
      };
    }
    const window = before.filter((c) => c.start >= currentTime - 100);
    const bits = (window.length ? window : before.slice(-3)).map((c) => c.text);
    return {
      kind: "answer",
      cite,
      line: cue.text,
      text: snarkAnswer(cite, bits.slice(-3).join(" ")),
    };
  }

  if (afterBlob > beforeBlob && afterBlob > 0.18) {
    return { kind: "refuse", text: pickLine(question + "late", REFUSE) };
  }

  const fallback = before.slice(-3).map((c) => c.text).join(" ");
  return {
    kind: "answer",
    cite: before.length ? mmss(before[before.length - 1].start) : "00:00",
    text: fallback
      ? snarkAnswer(
          before.length ? mmss(before[before.length - 1].start) : "00:00",
          fallback
        )
      : "Sit down. I have barely opened my mouth. Let me start before you quiz me.",
  };
}
