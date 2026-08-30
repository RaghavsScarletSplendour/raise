"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasteLecture from "./PasteLecture";
import {
  CONCEPTS,
  NO_ESCALATED,
  NO_MILD,
  PHRASES,
  type Concept,
} from "@/lib/concepts";

type View = "shuffle" | "lock" | "snippet";

function pick<T>(arr: T[], avoid?: T): T {
  let next = arr[Math.floor(Math.random() * arr.length)];
  if (arr.length > 1 && avoid !== undefined) {
    while (next === avoid) next = arr[Math.floor(Math.random() * arr.length)];
  }
  return next;
}

function pickTwo<T>(arr: T[]): [T, T] {
  const a = pick(arr);
  const b = pick(arr, a);
  return [a, b];
}

function fitToWidth(el: HTMLElement | null, max: number, min: number) {
  if (!el) return;
  const cap = el.parentElement?.clientWidth || el.clientWidth;
  let size = max;
  el.style.fontSize = size + "px";
  while (el.scrollWidth > cap * 0.94 && size > min) {
    size -= 2;
    el.style.fontSize = size + "px";
  }
}

export default function Shuffle() {
  const router = useRouter();
  const [view, setView] = useState<View>("shuffle");
  const [concept, setConcept] = useState<Concept>(() => pick(CONCEPTS));
  const [phrase, setPhrase] = useState(() => pick(PHRASES));
  const [nos, setNos] = useState<[string, string]>(() => pickTwo(NO_MILD));
  const [skips, setSkips] = useState(0);
  const lineRef = useRef<HTMLDivElement>(null);
  const topicRef = useRef<HTMLButtonElement>(null);

  function deal(nextSkips = skips) {
    const c = pick(CONCEPTS, concept);
    const p = pick(PHRASES, phrase);
    const pool = nextSkips >= 4 ? NO_ESCALATED : NO_MILD;
    setConcept(c);
    setPhrase(p);
    setNos(pickTwo(pool));
  }

  useEffect(() => {
    if (view !== "shuffle") return;
    const run = () => {
      fitToWidth(lineRef.current, 96, 22);
      fitToWidth(topicRef.current, 150, 30);
    };
    requestAnimationFrame(run);
    window.addEventListener("resize", run);
    return () => window.removeEventListener("resize", run);
  }, [view, phrase, concept]);

  function skip() {
    const n = skips + 1;
    setSkips(n);
    deal(n);
  }

  function lock() {
    setView("lock");
  }

  function learnMore() {
    if (concept.youtubeId) router.push(`/watch/yt/${concept.youtubeId}`);
    else if (concept.lectureId) router.push(`/watch/${concept.lectureId}`);
  }

  return (
    <div className="stand">
      <div className="topbar">
        <div>
          <div className="stamp">RAISE</div>
          <div className="tagline">a real lecture. raise a hand. get caught.</div>
        </div>
        <div className="topbar-actions">
          <Link href="/watch/os" className="demo-link">
            90 second demo
          </Link>
          <Link href="/you" className="roast-link">
            Roast me first
          </Link>
        </div>
      </div>

      {view === "shuffle" && (
        <main>
          <div className="line-a" ref={lineRef}>
            {phrase}
          </div>
          <div className="topic-wrap">
            <button
              className="topic-btn"
              ref={topicRef}
              type="button"
              onClick={lock}
              aria-label={`Lock in ${concept.label}`}
            >
              <span>{concept.label}</span>
              <span className="mark" aria-hidden />
            </button>
          </div>
          <div className="no-row">
            <button className="no-btn" type="button" onClick={skip}>
              {nos[0]}
            </button>
            <button className="no-btn" type="button" onClick={skip}>
              {nos[1]}
            </button>
          </div>
        </main>
      )}

      {view === "lock" && (
        <div className="course-view active">
          <div className="course-title">{concept.label}</div>
          <p>Locked in. A tiny snippet, or the real lecture, which you will interrupt like a menace.</p>
          <button className="back-btn" type="button" onClick={() => setView("snippet")}>
            Just the snippet
          </button>
          <button className="submit-btn" type="button" onClick={learnMore}>
            Learn more
          </button>
          <button
            className="ghost-btn"
            type="button"
            onClick={() => {
              setView("shuffle");
              skip();
            }}
          >
            Actually, something else
          </button>
        </div>
      )}

      {view === "snippet" && (
        <div className="course-view active">
          <div className="course-title">{concept.label}</div>
          <p className="snippet">{concept.snippet}</p>
          <button className="submit-btn" type="button" onClick={learnMore}>
            Learn more
          </button>
          <button
            className="ghost-btn"
            type="button"
            onClick={() => {
              setView("shuffle");
              skip();
            }}
          >
            Shuffle again
          </button>
        </div>
      )}

      <footer>
        <PasteLecture />
        unofficial study avatar. public lecture plus public captions only.
        <br />
        this is not the professor. it will not fake the rest of the video. it will just be rude.
        <br />
        <Link href="/you" className="roast-link">
          Roast me first
        </Link>
      </footer>
    </div>
  );
}
