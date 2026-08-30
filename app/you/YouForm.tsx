"use client";

import { useRef, useState } from "react";
import Link from "next/link";

type LearnStyle = "lecture" | "2x" | "headlines";

type Answers = {
  dinner: string;
  wiki: string;
  learn: LearnStyle;
};

type Rec = {
  id: string;
  label: string;
  snippet: string;
  youtubeId?: string;
};

type ScrapeOk = {
  publicBits: unknown;
  roast?: string;
  concepts?: Rec[];
  error?: string;
};

const DINNER: { id: string; label: string }[] = [
  { id: "psychology", label: "Other people's feelings" },
  { id: "quantum-computing", label: "Superposition, probably" },
  { id: "gravity", label: "Why the apple falls. Still." },
  { id: "dna", label: "My own genome, casually" },
  { id: "computers", label: "Computers. I own one. Close enough." },
];

const WIKI: { id: string; label: string }[] = [
  { id: "black-holes", label: "Event horizons and other excuses" },
  { id: "evolution", label: "How sludge became this" },
  { id: "atoms", label: "What everything is made of" },
  { id: "gravity", label: "Gravity again. A 2am classic." },
  { id: "psychology", label: "A quiz that diagnosed me" },
];

const LEARN: { id: LearnStyle; label: string }[] = [
  { id: "lecture", label: "I sit through the whole lecture, like a monk" },
  { id: "2x", label: "2x YouTube, then I lie about it" },
  { id: "headlines", label: "Headlines. I am a headlines person." },
];

type Step = "form" | "q1" | "q2" | "q3" | "wait" | "roast";

export default function YouForm() {
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [url, setUrl] = useState("");
  const [school, setSchool] = useState("");
  const [err, setErr] = useState("");
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [roast, setRoast] = useState("");
  const [recs, setRecs] = useState<Rec[]>([]);
  const scrapeRef = useRef<Promise<ScrapeOk | null> | null>(null);

  function payload(withAnswers?: Answers, bits?: unknown) {
    return {
      name: name.trim(),
      email: email.trim(),
      url: url.trim(),
      school: school.trim(),
      answers: withAnswers,
      publicBits: bits,
    };
  }

  async function postFootprint(body: unknown, quiet = false): Promise<ScrapeOk | null> {
    try {
      const res = await fetch("/api/footprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as ScrapeOk & { error?: string };
      if (!res.ok) {
        if (!quiet) setErr(json.error || "The form bounced. Try again, with less mystery.");
        return null;
      }
      return json;
    } catch {
      if (!quiet) setErr("The network flinched. Stay. Try once more.");
      return null;
    }
  }

  function startForm(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!name.trim()) {
      setErr("A name. Yours. In the box.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErr("That email is theater without a plot.");
      return;
    }
    if (!url.trim()) {
      setErr("Paste a public URL. LinkedIn, GitHub, a site. Something with a door.");
      return;
    }
    scrapeRef.current = postFootprint(payload(), true);
    setStep("q1");
  }

  async function finish(next: Answers) {
    setStep("wait");
    setErr("");
    let bits: unknown = undefined;
    try {
      const scraped = scrapeRef.current ? await scrapeRef.current : null;
      bits = scraped?.publicBits;
    } catch {
      bits = undefined;
    }
    const result = await postFootprint(payload(next, bits));
    if (!result || !result.roast || !result.concepts?.length) {
      setErr(result?.error || "I looked. I grimaced. Then I tripped. Try once more.");
      setStep("q3");
      return;
    }
    setRoast(result.roast);
    setRecs(result.concepts);
    setStep("roast");
  }

  function pickDinner(id: string) {
    setAnswers((a) => ({ ...a, dinner: id }));
    setStep("q2");
  }
  function pickWiki(id: string) {
    setAnswers((a) => ({ ...a, wiki: id }));
    setStep("q3");
  }
  function pickLearn(id: LearnStyle) {
    const next: Answers = {
      dinner: answers.dinner || "computers",
      wiki: answers.wiki || "gravity",
      learn: id,
    };
    setAnswers(next);
    void finish(next);
  }

  return (
    <main className="you-main">
      {step === "form" && (
        <form className="you-form" onSubmit={startForm}>
          <div className="you-kicker">Digital footprint, volunteered</div>
          <h1 className="you-title">Sit down. Hand me a URL.</h1>
          <p className="you-lede">
            Name, email, one public page. School is optional. I fetch only what the internet already shows
            strangers. Then three questions. Then a roast. Then homework.
          </p>

          <label className="you-field">
            <span>Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              maxLength={80}
              placeholder="The one you answer to"
            />
          </label>
          <label className="you-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              maxLength={120}
              placeholder="inbox@somewhere"
            />
          </label>
          <label className="you-field">
            <span>LinkedIn or any public URL</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              inputMode="url"
              required
              maxLength={400}
              placeholder="https://linkedin.com/in/you or github.com/you"
            />
          </label>
          <label className="you-field">
            <span>School or college (optional)</span>
            <input
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              maxLength={160}
              placeholder="Skip it if you want. I will not ask twice."
            />
          </label>

          {err ? <p className="you-err">{err}</p> : (
            <p className="you-fine">
              Public html only. If LinkedIn hides, I roast the slug. Nothing is stored.
            </p>
          )}
          <button className="submit-btn" type="submit">
            Roast me
          </button>
        </form>
      )}

      {step === "q1" && (
        <Question
          n={1}
          prompt="What do you pretend to understand at dinner?"
          options={DINNER}
          onPick={pickDinner}
        />
      )}
      {step === "q2" && (
        <Question
          n={2}
          prompt="Your last 2am Wikipedia hole?"
          options={WIKI}
          onPick={pickWiki}
        />
      )}
      {step === "q3" && (
        <Question
          n={3}
          prompt="How do you actually learn?"
          options={LEARN}
          onPick={(id) => pickLearn(id as LearnStyle)}
          err={err}
        />
      )}

      {step === "wait" && (
        <div className="you-wait">
          <div className="you-kicker">Scanning public debris</div>
          <h1 className="you-title">Hold still.</h1>
          <p className="you-lede">Title tags, a bio if anyone left the door open, the slug if they did not.</p>
          <div className="you-scan">peering at what you volunteered</div>
        </div>
      )}

      {step === "roast" && (
        <div className="you-roast">
          <div className="you-kicker">The verdict</div>
          <h1 className="you-title">Your footprint, graded.</h1>
          {roast.split("\n\n").map((p, i) => (
            <p key={i} className="you-graf">
              {p}
            </p>
          ))}
          <div className="you-kicker you-assign">Your assignment</div>
          <div className="you-recs">
            {recs.map((c) => (
              <Link
                key={c.id}
                className="you-rec"
                href={c.youtubeId ? `/watch/yt/${c.youtubeId}` : "/"}
              >
                <span className="you-rec-lab">{c.label}</span>
                <span className="you-rec-sn">{c.snippet}</span>
                <span className="you-rec-go">Interrupt the lecture</span>
              </Link>
            ))}
          </div>
          <Link href="/" className="ghost-btn you-back">
            Back to shuffle
          </Link>
        </div>
      )}
    </main>
  );
}

function Question({
  n,
  prompt,
  options,
  onPick,
  err,
}: {
  n: number;
  prompt: string;
  options: { id: string; label: string }[];
  onPick: (id: string) => void;
  err?: string;
}) {
  return (
    <div className="you-q">
      <div className="you-kicker">Question {n} of 3</div>
      <h1 className="you-title">{prompt}</h1>
      <p className="you-scan">meanwhile, a public page is being glanced at. not logged into. glanced at.</p>
      <div className="you-choices">
        {options.map((o) => (
          <button key={o.id} type="button" className="you-choice" onClick={() => onPick(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
      {err ? <p className="you-err">{err}</p> : null}
    </div>
  );
}
