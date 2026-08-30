"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Lecture } from "@/lib/seeds";
import { decide, type Decision } from "@/lib/raise";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

type Mode = "idle" | "yank" | "refuse" | "speak";

export default function Theater({ lecture }: { lecture: Lecture }) {
  const playerRef = useRef<any>(null);
  const resumeAt = useRef(0);
  const yankTimer = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [out, setOut] = useState(false);
  const [q, setQ] = useState("");
  const [decision, setDecision] = useState<Decision | null>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const boot = () => {
      if (cancelled) return;
      if (!window.YT?.Player) return;
      if (playerRef.current) return;
      const el = document.getElementById("yt");
      if (!el) return;
      playerRef.current = new window.YT.Player("yt", {
        videoId: lecture.youtubeId,
        host: "https://www.youtube.com",
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          autoplay: 1,
        },
        events: {
          onReady: (e: any) => {
            if (cancelled) return;
            try {
              e.target.playVideo();
            } catch {}
            setReady(true);
          },
        },
      });
    };
    if (window.YT?.Player) boot();
    else {
      window.onYouTubeIframeAPIReady = boot;
      if (!document.querySelector("script[data-yt]")) {
        const s = document.createElement("script");
        s.src = "https://www.youtube.com/iframe_api";
        s.dataset.yt = "1";
        document.body.appendChild(s);
      }
    }
    const fallback = window.setTimeout(() => {
      if (!cancelled) setReady(true);
    }, 2500);
    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      if (yankTimer.current) window.clearInterval(yankTimer.current);
    };
  }, [lecture.youtubeId]);

  function now() {
    try {
      return playerRef.current?.getCurrentTime?.() ?? 0;
    } catch {
      return 0;
    }
  }

  function play() {
    try {
      playerRef.current?.playVideo?.();
    } catch {}
  }
  function pause() {
    try {
      playerRef.current?.pauseVideo?.();
    } catch {}
  }
  function seek(t: number) {
    try {
      playerRef.current?.seekTo?.(t, true);
    } catch {}
  }

  function clearYankWatch() {
    if (yankTimer.current) {
      window.clearInterval(yankTimer.current);
      yankTimer.current = null;
    }
  }

  function climbBack(to: number) {
    setOut(false);
    window.setTimeout(() => {
      setMode("idle");
      setDecision(null);
      seek(to);
      play();
      setBusy(false);
    }, 900);
  }

  function speakThenBack() {
    pause();
    setMode("speak");
    window.setTimeout(() => setOut(true), 80);
    window.setTimeout(() => climbBack(resumeAt.current), 7200);
  }

  function raise(question: string, forcedTime?: number) {
    if (busy) return;
    const text = question.trim();
    if (!text) return;
    setBusy(true);
    const currentTime =
      typeof forcedTime === "number" ? forcedTime : now() || 12;
    resumeAt.current = now() || currentTime;
    const data = decide(lecture.captions, currentTime, text);
    setDecision(data);

    if (data.kind === "refuse") {
      setMode("refuse");
      window.setTimeout(() => {
        setMode("idle");
        setDecision(null);
        setBusy(false);
      }, 4200);
      return;
    }

    if (data.kind === "yank" && typeof data.t === "number") {
      setMode("yank");
      pause();
      seek(data.t);
      play();
      const start = data.t;
      const end = start + 8;
      clearYankWatch();
      yankTimer.current = window.setInterval(() => {
        const t = now();
        if (t > 0 && t < start - 0.4) seek(start);
        if (t >= end) {
          clearYankWatch();
          speakThenBack();
        }
      }, 200);
      window.setTimeout(() => {
        if (yankTimer.current) {
          clearYankWatch();
          speakThenBack();
        }
      }, 9000);
      return;
    }

    speakThenBack();
  }

  function tapMove(i: number) {
    const g = lecture.ghosts[i];
    if (!g || busy) return;
    setQ(g.question);
    setStep(i + 1);
    if (g.move === "later-then-ask") raise(g.question, lecture.laterAt);
    else raise(g.question);
  }

  const frozen = mode === "speak";

  return (
    <div>
      <div className="topbar">
        <Link href="/">RAISE</Link>
        <div className="meta">
          {lecture.prof} · {lecture.hall}
          {ready ? "" : " · cueing the projector"}
        </div>
      </div>
      <div className="stage-wrap">
        <div className={`stage ${frozen ? "frozen" : ""}`}>
          <div id="yt" className="yt-slot" />
          <Professor out={out} />
          {mode === "yank" && (
            <div className="banner">Rewatch. No skip. {decision?.cite}</div>
          )}
          {mode === "refuse" && (
            <div className="banner">I haven&apos;t taught that yet. Sit down.</div>
          )}
          <div className={`bubble ${mode === "speak" && out ? "show" : ""}`}>
            {decision?.text}
            {decision?.cite && (
              <span className="cite">{decision.cite} · from this lecture only</span>
            )}
          </div>
        </div>
      </div>
      <div className="rail">
        <p className="coach">Three taps. In order. That is the whole demo.</p>
        <div className="moves">
          {lecture.ghosts.slice(0, 3).map((g, i) => (
            <button
              key={g.label}
              className={`move ${i === 0 && step === 0 ? "primary" : ""} ${step === i + 1 ? "on" : ""}`}
              disabled={busy}
              onClick={() => tapMove(i)}
              type="button"
            >
              <span className="n">Tap {i + 1}</span>
              <span className="lab">{g.label}</span>
              <span className="hint">{g.hint}</span>
            </button>
          ))}
        </div>
        <form
          className="ask"
          onSubmit={(e) => {
            e.preventDefault();
            raise(q);
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Or type your own question from this lecture"
          />
          <button className="primary" disabled={busy} type="submit">
            Raise hand
          </button>
        </form>
      </div>
    </div>
  );
}

function Professor({ out }: { out: boolean }) {
  return (
    <svg className={`prof ${out ? "out" : ""}`} viewBox="0 0 160 220" aria-hidden>
      <ellipse cx="80" cy="208" rx="48" ry="8" fill="rgba(0,0,0,0.35)" />
      <path d="M46 206c8-46 18-78 34-92 16 14 26 46 34 92" fill="#2a1810" />
      <path d="M52 200c10-40 14-70 28-82 14 12 18 42 28 82" fill="#c9a227" opacity="0.35" />
      <rect x="58" y="92" width="44" height="58" rx="14" fill="#3d2a14" />
      <rect x="62" y="98" width="36" height="46" rx="12" fill="#5c1220" />
      <circle cx="80" cy="72" r="22" fill="#e8d5a3" />
      <path d="M58 68c6-22 38-22 44 0" fill="#2a1810" />
      <circle cx="72" cy="74" r="3" fill="#140c07" />
      <circle cx="88" cy="74" r="3" fill="#140c07" />
      <path d="M62 74h20M78 74h20" stroke="#140c07" strokeWidth="2" fill="none" />
      <path d="M72 84c4 6 12 6 16 0" stroke="#8a6a16" strokeWidth="2" fill="none" />
      <rect x="118" y="118" width="6" height="54" rx="2" fill="#e8d5a3" />
      <circle cx="121" cy="116" r="5" fill="#c9a227" />
    </svg>
  );
}
