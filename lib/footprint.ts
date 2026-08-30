import dns from "node:dns/promises";
import net from "node:net";
import { CONCEPTS, type Concept } from "./concepts";

const FETCH_MS = 5000;
const BYTE_CAP = 50 * 1024;
const MAX_REDIRECTS = 3;

export type LearnStyle = "lecture" | "2x" | "headlines";

export type FootprintAnswers = {
  dinner: string;
  wiki: string;
  learn: LearnStyle;
};

export type GithubBits = {
  login: string;
  name?: string;
  bio?: string;
  company?: string;
  public_repos?: number;
  location?: string;
};

export type PublicBits = {
  ok: boolean;
  walled: boolean;
  host?: string;
  title?: string;
  description?: string;
  slug?: string;
  kind?: "linkedin" | "github" | "x" | "web";
  github?: GithubBits;
};

export type FootprintInput = {
  name: string;
  email: string;
  url: string;
  school?: string;
  answers?: FootprintAnswers;
  publicBits?: PublicBits;
};

export type FootprintResult = {
  publicBits: PublicBits;
  roast?: string;
  concepts?: Array<Pick<Concept, "id" | "label" | "snippet" | "youtubeId">>;
  error?: string;
};

const DINNER_IDS = new Set(["psychology", "quantum-computing", "gravity", "dna", "computers"]);
const WIKI_IDS = new Set(["black-holes", "evolution", "atoms", "gravity", "psychology"]);
const LEARN_IDS = new Set<LearnStyle>(["lecture", "2x", "headlines"]);

const BLOCKED_HOSTS = new Set([
  "localhost",
  "ip6-localhost",
  "ip6-loopback",
  "metadata",
  "metadata.google.internal",
  "metadata.internal",
  "kubernetes",
  "kubernetes.default",
  "kubernetes.default.svc",
]);

function clean(s: string, n = 220): string {
  const t = s
    .replace(/<[^>]+>/g, " ")
    .replace(/[\u2014\u2013\u2015]/g, "-")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (t.length <= n) return t;
  return t.slice(0, n).trimEnd() + "...";
}

function firstName(name: string): string {
  const t = name.trim().split(/\s+/).filter(Boolean)[0] || "you";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => {
      const code = Number(n);
      if (!code || code === 0x2014 || code === 0x2013) return "-";
      try {
        return String.fromCharCode(code);
      } catch {
        return " ";
      }
    });
}

function isBlockedIpv4(a: number, b: number, c: number, _d: number): boolean {
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return true;
  if (a === 198 && (b === 18 || b === 51)) return true;
  if (a === 203 && b === 0) return true;
  if (a >= 224) return true;
  return false;
}

function isBlockedIp(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v.startsWith("::ffff:")) return isBlockedIp(v.slice(7));
  if (net.isIP(v) === 4) {
    const p = v.split(".").map(Number);
    return isBlockedIpv4(p[0], p[1], p[2], p[3]);
  }
  if (net.isIP(v) === 6) {
    if (v === "::1" || v === "::") return true;
    const compact = v.replace(/:/g, "");
    if (v.startsWith("fe80")) return true;
    if (v.startsWith("fc") || v.startsWith("fd")) return true;
    if (v.startsWith("ff")) return true;
    if (v.startsWith("2001:db8")) return true;
    if (compact.startsWith("fc") || compact.startsWith("fd")) return true;
  }
  return false;
}

function packedIpv4(host: string): string | null {
  if (!/^\d+$/.test(host) || host.length > 10) return null;
  const n = Number(host);
  if (!Number.isInteger(n) || n < 0 || n > 4294967295) return null;
  return [((n >>> 24) & 255), ((n >>> 16) & 255), ((n >>> 8) & 255), (n & 255)].join(".");
}

function hostLooksLocal(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/\.$/, "").replace(/^\[|\]$/g, "");
  if (BLOCKED_HOSTS.has(h)) return true;
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (h.endsWith(".local") || h.endsWith(".internal") || h.endsWith(".lan") || h.endsWith(".home")) return true;
  if (h.includes("metadata.google.internal")) return true;
  if (h === "0.0.0.0" || h === "::" || h === "::1") return true;
  const packed = packedIpv4(h);
  if (packed && isBlockedIp(packed)) return true;
  if (isBlockedIp(h)) return true;
  return false;
}

export async function assertPublicHttpUrl(raw: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    throw new Error("That is not a URL. Paste a real http or https link.");
  }
  if (parsed.protocol === "file:" || parsed.protocol === "ftp:" || parsed.protocol === "data:") {
    throw new Error("http or https only. I do not open drawers on this machine.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("http or https only.");
  }
  if (parsed.username || parsed.password) {
    throw new Error("No credentials in the URL. Public pages only.");
  }
  const host = parsed.hostname.replace(/^\[|\]$/g, "");
  if (!host || hostLooksLocal(host)) {
    throw new Error("That host is off limits. Public internet only.");
  }
  try {
    const results = await dns.lookup(host, { all: true, verbatim: true });
    if (!results.length) throw new Error("empty");
    for (const r of results) {
      if (isBlockedIp(r.address)) {
        throw new Error("That host is off limits. Public internet only.");
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("off limits")) throw err;
    throw new Error("I could not resolve that host. Try a public URL.");
  }
  return parsed;
}

async function readCapped(res: Response, cap = BYTE_CAP): Promise<string> {
  if (!res.body) {
    const t = await res.text();
    return t.slice(0, cap);
  }
  const reader = res.body.getReader();
  const chunks: Buffer[] = [];
  let total = 0;
  try {
    while (total < cap) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      const buf = Buffer.from(value);
      chunks.push(buf);
      total += buf.byteLength;
      if (total >= cap) break;
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      /* ignore */
    }
  }
  return Buffer.concat(chunks).subarray(0, cap).toString("utf8");
}

function metaContent(html: string, key: string): string {
  const re1 = new RegExp(
    `<meta[^>]+(?:property|name)\\s*=\\s*["']${key}["'][^>]*content\\s*=\\s*["']([^"']+)["']`,
    "i"
  );
  const re2 = new RegExp(
    `<meta[^>]+content\\s*=\\s*["']([^"']+)["'][^>]*(?:property|name)\\s*=\\s*["']${key}["']`,
    "i"
  );
  const m = html.match(re1) || html.match(re2);
  return clean(decodeEntities(m?.[1] || ""), 280);
}

function pageTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return clean(decodeEntities(m?.[1] || ""), 160);
}

function kindOf(url: URL): PublicBits["kind"] {
  const h = url.hostname.toLowerCase();
  if (h === "linkedin.com" || h.endsWith(".linkedin.com")) return "linkedin";
  if (h === "github.com" || h.endsWith(".github.com")) return "github";
  if (h === "x.com" || h === "twitter.com" || h.endsWith(".x.com") || h.endsWith(".twitter.com")) return "x";
  return "web";
}

function vanitySlug(url: URL, kind: PublicBits["kind"]): string | undefined {
  const parts = url.pathname.split("/").filter(Boolean);
  if (kind === "linkedin") {
    const i = parts.findIndex((p) => p === "in" || p === "pub" || p === "company");
    const slug = i >= 0 ? parts[i + 1] : parts[0];
    return slug ? decodeURIComponent(slug).replace(/-/g, " ") : undefined;
  }
  if (kind === "x") {
    const skip = new Set(["home", "explore", "search", "i", "intent", "share"]);
    const handle = parts[0];
    if (handle && !skip.has(handle.toLowerCase())) return handle.replace(/^@/, "");
  }
  if (kind === "github") {
    return githubUsername(url) || undefined;
  }
  return parts[0] ? decodeURIComponent(parts[0]) : undefined;
}

function githubUsername(url: URL): string | null {
  const h = url.hostname.toLowerCase();
  if (!(h === "github.com" || h === "www.github.com")) return null;
  const part = url.pathname.split("/").filter(Boolean)[0];
  if (!part) return null;
  const reserved =
    /^(orgs|settings|login|signup|explore|topics|collections|events|features|marketplace|pricing|about|security|enterprise|team|solutions|sponsors|notifications|issues|pulls|codespaces|new|dashboard|apps|marketplace|orgs)$/i;
  if (reserved.test(part)) return null;
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(part)) return null;
  return part;
}

function looksWalled(kind: PublicBits["kind"], title: string, html: string): boolean {
  const blob = `${title} ${html.slice(0, 4000)}`.toLowerCase();
  if (kind === "linkedin") {
    return /sign in|join now|authwall|login|join linkedin|are you a robot/.test(blob);
  }
  if (kind === "x") {
    return /sign in|log in|javascript is not available|something went wrong/.test(blob);
  }
  return false;
}

async function fetchHtml(start: URL): Promise<{ url: URL; html: string; status: number }> {
  let current = start;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    await assertPublicHttpUrl(current.href);
    const res = await fetch(current.href, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
      credentials: "omit",
      signal: AbortSignal.timeout(FETCH_MS),
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "Mozilla/5.0 (compatible; RAISE-public-preview/1.0)",
      },
    });
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const loc = res.headers.get("location");
      if (!loc) return { url: current, html: "", status: res.status };
      current = new URL(loc, current);
      continue;
    }
    const html = await readCapped(res);
    return { url: current, html, status: res.status };
  }
  return { url: current, html: "", status: 0 };
}

async function fetchGithub(user: string): Promise<GithubBits | undefined> {
  try {
    const api = new URL(`https://api.github.com/users/${encodeURIComponent(user)}`);
    await assertPublicHttpUrl(api.href);
    const res = await fetch(api.href, {
      method: "GET",
      redirect: "manual",
      cache: "no-store",
      credentials: "omit",
      signal: AbortSignal.timeout(FETCH_MS),
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "RAISE-public-preview",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!res.ok) return undefined;
    const json = (await res.json()) as Record<string, unknown>;
    if (!json || typeof json.login !== "string") return undefined;
    return {
      login: json.login,
      name: typeof json.name === "string" ? clean(json.name, 80) : undefined,
      bio: typeof json.bio === "string" ? clean(json.bio, 220) : undefined,
      company: typeof json.company === "string" ? clean(json.company, 80) : undefined,
      public_repos: typeof json.public_repos === "number" ? json.public_repos : undefined,
      location: typeof json.location === "string" ? clean(json.location, 80) : undefined,
    };
  } catch {
    return undefined;
  }
}

export async function scrapePublic(urlRaw: string): Promise<PublicBits> {
  let url: URL;
  try {
    url = await assertPublicHttpUrl(normalizeUrl(urlRaw));
  } catch {
    return { ok: false, walled: false };
  }
  const kind = kindOf(url);
  const slug = vanitySlug(url, kind);
  const bits: PublicBits = { ok: false, walled: false, host: url.hostname, kind, slug };

  if (kind === "github") {
    const user = githubUsername(url);
    if (user) {
      const gh = await fetchGithub(user);
      if (gh) {
        bits.ok = true;
        bits.github = gh;
        bits.title = gh.name || gh.login;
        bits.description = gh.bio;
        bits.slug = gh.login;
        return bits;
      }
    }
  }

  try {
    const { url: finalUrl, html, status } = await fetchHtml(url);
    bits.host = finalUrl.hostname;
    const title = pageTitle(html) || metaContent(html, "og:title");
    const description =
      metaContent(html, "og:description") || metaContent(html, "description") || metaContent(html, "twitter:description");
    bits.title = title || undefined;
    bits.description = description || undefined;
    const walled = looksWalled(kind, title, html) || status === 401 || status === 403 || status === 999;
    bits.walled = walled;
    bits.ok = Boolean(title || description) && !walled;
    if (walled) {
      bits.title = undefined;
      bits.description = undefined;
    }
    return bits;
  } catch {
    bits.walled = kind === "linkedin" || kind === "x";
    return bits;
  }
}

export function normalizeUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return "https://" + t;
}

export function validateInput(body: FootprintInput): string | null {
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const url = String(body.url || "").trim();
  const school = String(body.school || "").trim();
  if (!name || name.length > 80) return "A name. Yours. In the box.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return "That email is theater without a plot.";
  if (!url || url.length > 400) return "Paste a public URL. LinkedIn, GitHub, a site. Something with a door.";
  if (school.length > 160) return "School name is optional, not a memoir.";
  if (body.answers) {
    if (!DINNER_IDS.has(body.answers.dinner)) return "Pick a dinner lie from the list.";
    if (!WIKI_IDS.has(body.answers.wiki)) return "Pick a Wikipedia hole from the list.";
    if (!LEARN_IDS.has(body.answers.learn)) return "How do you actually learn. Pick one.";
  }
  return null;
}

function emailRoast(email: string, first: string): string {
  const domain = (email.split("@")[1] || "").toLowerCase();
  if (domain === "gmail.com" || domain === "googlemail.com") {
    return `Gmail, ${first}. The hoodie of inboxes. Serviceable, everywhere, and allergic to looking employed.`;
  }
  if (domain === "yahoo.com" || domain === "aol.com") {
    return `${domain}. A museum piece with unread folders. I respect the commitment. I do not respect the filing.`;
  }
  if (domain === "hotmail.com" || domain === "outlook.com" || domain === "live.com") {
    return `${domain}. Microsoft already knows more than I do. I am working with the scraps you handed me.`;
  }
  if (domain === "icloud.com" || domain === "me.com") {
    return `iCloud. Sleek. Locked. A fruit logo doing the talking while you nod.`;
  }
  if (domain === "proton.me" || domain === "protonmail.com") {
    return `Proton. You want privacy and then you paste a URL into a roast. The bit is the point, I suppose.`;
  }
  if (domain.endsWith(".edu") || domain.endsWith(".ac.in") || domain.endsWith(".ac.uk")) {
    return `${domain}. A campus login. Either you still belong there or you are forwarding internships to a ghost.`;
  }
  if (domain) {
    return `${domain}. A company domain. Someone is paying for this persona. I will be polite to their brand and unkind to yours.`;
  }
  return `That email has no domain I can tease. Consider this a rare mercy, ${first}.`;
}

function schoolRoast(school: string, first: string): string | null {
  const s = school.trim();
  if (!s) return null;
  const low = s.toLowerCase();
  if (/\biit\b|indian institute of technology/.test(low)) {
    return `IIT. You typed it like a password. The swagger arrived before the sentence did, ${first}. Relax. The lecture does not grade your entrance exam.`;
  }
  if (/\bits\b|indian institute of science|iim\b/.test(low)) {
    return `${s}. A name that expects a pause. You will get a lecture instead.`;
  }
  if (/\bmit\b|stanford|harvard|caltech|oxford|cambridge|berkeley|cmu\b|carnegie mellon/.test(low)) {
    return `You dropped ${s} into a form like a business card at a wake. Noted. Now learn something that is not the name of a gate.`;
  }
  if (/high school|secondary school|senior secondary|class of|12th|10th|highschool/.test(low)) {
    return `High school, listed without shame. Good. We can skip the myth that you already finished thinking.`;
  }
  if (/community college|polytechnic|junior college/.test(low)) {
    return `${s}. A real place with real classes. Prestige is a costume. Showing up is the assignment.`;
  }
  return `${s}. I will not pretend I have a ranking. I will pretend you showed up to learn, which is rarer.`;
}

function urlRoast(bits: PublicBits, first: string): string {
  if (bits.kind === "github" && bits.github) {
    const g = bits.github;
    const bio = g.bio ? ` The bio reads "${g.bio}".` : " The bio is empty, which is also a bio.";
    const repos =
      typeof g.public_repos === "number"
        ? g.public_repos === 0
          ? " Zero public repos. A blank museum."
          : ` ${g.public_repos} public repositories. Quantity is a personality. Quality is assigned later.`
        : "";
    const company = g.company ? ` Affiliated with ${g.company}, at least on the internet.` : "";
    return `GitHub user ${g.login}.${bio}${repos}${company} I did not clone you, ${first}. I barely knocked.`;
  }
  if (bits.kind === "linkedin") {
    const slug = bits.slug ? ` The vanity slug is "${bits.slug}". That is doing a lot of unpaid work.` : "";
    if (bits.walled || !bits.ok) {
      return `LinkedIn put up a wall. Of course it did.${slug} I will not log in. I do not sit behind a signup gate for a headshot. A locked door is still a portrait if you squint, ${first}.`;
    }
    return `LinkedIn let a little through.${slug} Title: "${bits.title || "untitled"}". ${bits.description ? `Caption: "${bits.description}".` : "No caption. Mysterious. Cheap."}`;
  }
  if (bits.kind === "x") {
    const handle = bits.slug ? `@${bits.slug}` : "that handle";
    if (bits.walled || !bits.ok) {
      return `X declined to load ${handle}. The wall is the content. I will roast the silhouette, ${first}, and skip the timeline.`;
    }
    return `X offered this: "${bits.title || handle}". ${bits.description ? `Then: "${bits.description}".` : "Then silence, which is on-brand."}`;
  }
  if (bits.title || bits.description) {
    return `Your page introduces itself as "${bits.title || bits.host || "a website"}". ${
      bits.description ? `The public caption: "${bits.description}".` : "No description. A shrug in html."
    } Voluntary. Delicious.`;
  }
  return `I fetched ${bits.host || "that URL"} and got approximately nothing. That is still data, ${first}. A locked door is a personality.`;
}

const LABELS: Record<string, string> = {
  psychology: "psychology",
  "quantum-computing": "quantum computing",
  gravity: "gravity",
  dna: "DNA",
  computers: "computers",
  "black-holes": "black holes",
  evolution: "evolution",
  atoms: "atoms",
};

function answerRoast(answers: FootprintAnswers, first: string): string {
  const dinner = LABELS[answers.dinner] || answers.dinner;
  const wiki = LABELS[answers.wiki] || answers.wiki;
  let learn = "";
  if (answers.learn === "lecture") {
    learn = `You claim you sit through the whole lecture. ${first}, I will test that. Pausing is allowed. Leaving is a tell.`;
  } else if (answers.learn === "2x") {
    learn = `2x YouTube, then you lie about it. At least you are honest in this form. In the theater I will yank you backward until the lie becomes a timestamp.`;
  } else {
    learn = `Headlines. You collect titles like seashells and call it an education. The snippet era ends here.`;
  }
  const same = answers.dinner === answers.wiki;
  const dinnerLine = same
    ? `At dinner you pretend to understand ${dinner}, and at 2am you wikipedia the same wound. Commitment. Misapplied.`
    : `At dinner you pretend to understand ${dinner}. At 2am you fall into ${wiki}. One of those is a performance. The other is a confession.`;
  return `${dinnerLine} ${learn}`;
}

export function composeRoast(input: FootprintInput, bits: PublicBits): string {
  const first = firstName(input.name);
  const parts: string[] = [];
  parts.push(
    `Sit down, ${first}. I looked at what you volunteered, which is already more homework than you usually do.`
  );
  parts.push(emailRoast(input.email, first));
  const school = schoolRoast(String(input.school || ""), first);
  if (school) parts.push(school);
  parts.push(urlRoast(bits, first));
  if (input.answers) parts.push(answerRoast(input.answers, first));
  parts.push(
    `I am assigning you three lectures. Not because you asked. Because your public self is a group project and you are currently the weak link.`
  );
  return parts.join("\n\n").replace(/[\u2014\u2013\u2015]/g, "-");
}

export function recommendConcepts(answers: FootprintAnswers, bits: PublicBits, extra = ""): Concept[] {
  const score = new Map<string, number>(CONCEPTS.map((c) => [c.id, 0]));
  const bump = (id: string, n: number) => {
    if (score.has(id)) score.set(id, (score.get(id) || 0) + n);
  };
  bump(answers.dinner, 6);
  bump(answers.wiki, 5);
  if (answers.learn === "lecture") {
    bump("quantum-computing", 1);
    bump("gravity", 1);
  } else if (answers.learn === "2x") {
    bump("computers", 2);
  } else {
    bump("psychology", 1);
    bump("black-holes", 1);
  }
  const blob = [
    extra,
    bits.title,
    bits.description,
    bits.slug,
    bits.host,
    bits.github?.bio,
    bits.github?.company,
    bits.github?.name,
    bits.kind,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/software|github|engineer|code|developer|programmer|\bcs\b|computer|sde|\bswe\b|fullstack|frontend|backend/.test(blob)) {
    bump("computers", 4);
  }
  if (/physics|physicist|newton|relativity/.test(blob)) {
    bump("gravity", 3);
    bump("atoms", 2);
  }
  if (/\bbio\b|biology|genetic|genome|life science|neuro|premed|pre-med/.test(blob)) {
    bump("dna", 3);
    bump("evolution", 2);
  }
  if (/space|astro|nasa|cosmology|orbit|planet/.test(blob)) bump("black-holes", 4);
  if (/people|human resource|\bhr\b|psych|counsel|recruiter|talent|behavior/.test(blob)) bump("psychology", 4);
  if (/quantum|\bai\b|artificial intelligence|machine learning|ml engineer|llm/.test(blob)) {
    bump("quantum-computing", 4);
  }

  const ranked = [...CONCEPTS]
    .filter((c) => c.youtubeId)
    .sort((a, b) => (score.get(b.id) || 0) - (score.get(a.id) || 0) || a.label.localeCompare(b.label));
  const picked: Concept[] = [];
  for (const c of ranked) {
    if (picked.length >= 3) break;
    picked.push(c);
  }
  return picked;
}

export async function runFootprint(input: FootprintInput): Promise<FootprintResult> {
  const bits = input.publicBits && input.publicBits.host ? input.publicBits : await scrapePublic(input.url);
  if (!input.answers) return { publicBits: bits };
  const concepts = recommendConcepts(input.answers, bits, `${input.name} ${input.school || ""} ${input.email}`);
  return {
    publicBits: bits,
    roast: composeRoast(input, bits),
    concepts: concepts.map((c) => ({
      id: c.id,
      label: c.label,
      snippet: c.snippet,
      youtubeId: c.youtubeId,
    })),
  };
}
