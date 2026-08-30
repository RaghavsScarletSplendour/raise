import type { Cue } from "./raise";
import type { Lecture } from "./seeds";
import { tokenize } from "./raise";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export function parseYouTubeId(raw: string): string | null {
  const s = raw.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s.startsWith("http") ? s : `https://${s}`);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    const v = u.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
    const parts = u.pathname.split("/").filter(Boolean);
    const ix = parts.findIndex((p) => p === "embed" || p === "shorts" || p === "live");
    if (ix >= 0 && parts[ix + 1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[ix + 1])) {
      return parts[ix + 1];
    }
  } catch {
    return null;
  }
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function decodeEntities(s: string) {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

function cuesFromXml(xml: string): Cue[] {
  const cues: Cue[] = [];
  const textRe = /<text[^>]*start="([^"]+)"[^>]*>([\s\S]*?)<\/text>/g;
  let m: RegExpExecArray | null;
  while ((m = textRe.exec(xml))) {
    cues.push({ start: Number(m[1]), text: decodeEntities(m[2]) });
  }
  if (cues.length) return cues.filter((c) => c.text);
  const pRe = /<p[^>]*t="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
  while ((m = pRe.exec(xml))) {
    cues.push({ start: Number(m[1]) / 1000, text: decodeEntities(m[2]) });
  }
  return cues.filter((c) => c.text);
}

function cuesFromJson3(raw: string): Cue[] {
  try {
    const data = JSON.parse(raw);
    const events = data.events || [];
    const cues: Cue[] = [];
    for (const ev of events) {
      const segs = ev.segs || [];
      const text = segs.map((s: { utf8?: string }) => s.utf8 || "").join("");
      const clean = decodeEntities(text);
      if (!clean || ev.tStartMs == null) continue;
      cues.push({ start: ev.tStartMs / 1000, text: clean });
    }
    return cues;
  } catch {
    return [];
  }
}

async function grab(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "en" },
    redirect: "follow",
    cache: "no-store",
  });
  if (!res.ok) return "";
  return res.text();
}

function tracksFromWatchHtml(html: string): { baseUrl: string; lang: string }[] {
  const blob = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/);
  if (!blob) return [];
  try {
    const data = JSON.parse(blob[1]);
    const tracks =
      data?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
    return tracks
      .map((t: { baseUrl?: string; languageCode?: string }) => ({
        baseUrl: String(t.baseUrl || "").replace(/\\u0026/g, "&"),
        lang: String(t.languageCode || ""),
      }))
      .filter((t: { baseUrl: string }) => t.baseUrl);
  } catch {
    return [];
  }
}

async function cuesFromUrl(url: string): Promise<Cue[]> {
  const body = await grab(url);
  if (!body) return [];
  if (body.trim().startsWith("{")) return cuesFromJson3(body);
  return cuesFromXml(body);
}

function durationFromWatch(html: string): number {
  const m = html.match(/"lengthSeconds":"(\d+)"/);
  if (m) return Number(m[1]);
  return 0;
}

function blobToCues(text: string, duration: number): Cue[] {
  const parts = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 24);
  if (!parts.length) return [];
  const span = Math.max(duration, parts.length * 8);
  return parts.map((p, i) => ({
    start: (i / Math.max(parts.length, 1)) * span,
    text: p,
  }));
}

async function fetchTranscriptBlob(videoId: string): Promise<string> {
  try {
    const res = await fetch("https://kome.ai/api/transcript", {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": UA },
      body: JSON.stringify({ video_id: videoId }),
      cache: "no-store",
    });
    if (!res.ok) return "";
    const data = (await res.json()) as { transcript?: string };
    return typeof data.transcript === "string" ? data.transcript : "";
  } catch {
    return "";
  }
}

export async function fetchCaptions(videoId: string): Promise<Cue[]> {
  const watch = await grab(`https://www.youtube.com/watch?v=${videoId}`);
  const duration = durationFromWatch(watch) || 600;
  const tracks = tracksFromWatchHtml(watch);
  const ordered = [
    ...tracks.filter((t) => t.lang.startsWith("en")),
    ...tracks,
  ];
  for (const t of ordered) {
    const withFmt = t.baseUrl.includes("fmt=") ? t.baseUrl : `${t.baseUrl}&fmt=json3`;
    const cues = await cuesFromUrl(withFmt);
    if (cues.length >= 3) return mergeCues(cues);
  }

  const timed = [
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&kind=asr&fmt=json3`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en-US`,
    `https://video.google.com/timedtext?lang=en&v=${videoId}`,
  ];
  for (const url of timed) {
    const cues = await cuesFromUrl(url);
    if (cues.length >= 3) return mergeCues(cues);
  }

  const blob = await fetchTranscriptBlob(videoId);
  if (blob.length > 80) return blobToCues(blob, duration);
  return [];
}

function mergeCues(cues: Cue[]): Cue[] {
  const out: Cue[] = [];
  for (const c of cues) {
    const last = out[out.length - 1];
    if (last && Math.abs(last.start - c.start) < 0.4) {
      last.text = `${last.text} ${c.text}`.replace(/\s+/g, " ").trim();
    } else {
      out.push({ ...c });
    }
  }
  return out.filter((c) => tokenize(c.text).length || c.text.length > 8);
}

export async function fetchVideoMeta(videoId: string): Promise<{ title: string; author: string }> {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(url, { headers: { "User-Agent": UA }, cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { title?: string; author_name?: string };
      return {
        title: data.title || "Public lecture",
        author: data.author_name || "The lecturer",
      };
    }
  } catch {}
  return { title: "Public lecture", author: "The lecturer" };
}

function clip(text: string, n = 88) {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= n ? t : `${t.slice(0, n - 1)}…`;
}

export function lectureFromCaptions(
  videoId: string,
  title: string,
  author: string,
  captions: Cue[]
): Lecture {
  const last = captions[captions.length - 1]?.start || 180;
  const laterAt = Math.max(45, Math.floor(last * 0.55));
  const meaty = (c: Cue) => tokenize(c.text).length >= 4;
  const early = captions.find((c) => c.start <= 80 && meaty(c)) || captions[0];
  const late =
    captions.find((c) => c.start >= laterAt && meaty(c)) || captions[captions.length - 1];
  const ghosts = early
    ? [
        {
          label: "Something I already said",
          hint: "Climbs out, unimpressed",
          move: "ask" as const,
          question: clip(early.text),
        },
        ...(late && late.start > (early.start || 0) + 20
          ? [
              {
                label: "Something later. Cute.",
                hint: "Sit down, obviously",
                move: "ask" as const,
                question: clip(late.text),
              },
              {
                label: "Ask the first thing later",
                hint: "Yanked. You knew this.",
                move: "later-then-ask" as const,
                question: clip(early.text),
              },
            ]
          : []),
      ]
    : [];

  return {
    id: `yt-${videoId}`,
    youtubeId: videoId,
    title,
    prof: author,
    hall: "Any public lecture · captions from this video",
    chip: "Your lecture",
    blurb: "Answers only from this video. Rudely.",
    laterAt,
    ghosts,
    captions,
  };
}

export async function loadYouTubeLecture(videoId: string): Promise<Lecture | null> {
  if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) return null;
  const [meta, captions] = await Promise.all([
    fetchVideoMeta(videoId),
    fetchCaptions(videoId),
  ]);
  if (!captions.length) return null;
  return lectureFromCaptions(videoId, meta.title, meta.author, captions);
}
