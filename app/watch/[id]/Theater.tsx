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
    <div className="theater-root">
      <div className="topbar">
        <Link href="/" className="stamp">RAISE</Link>
        <div className="meta">
          {lecture.prof}
          {ready ? "" : " · loading"}
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
      <ellipse cx="80" cy="208" rx="36" ry="6" fill="rgba(22,24,27,0.18)" />
      <path d="M52 206c8-48 16-80 28-94 12 14 20 46 28 94" fill="#16181B" />
      <rect x="62" y="98" width="36" height="48" rx="10" fill="#16181B" />
      <rect x="66" y="104" width="28" height="36" rx="8" fill="#FFCE45" />
      <circle cx="80" cy="74" r="20" fill="#F6F4EE" stroke="#16181B" strokeWidth="3" />
      <path d="M62 70c6-16 30-16 36 0" fill="#16181B" />
      <circle cx="73" cy="76" r="2.4" fill="#16181B" />
      <circle cx="87" cy="76" r="2.4" fill="#16181B" />
      <path d="M73 86c4 5 10 5 14 0" stroke="#16181B" strokeWidth="2" fill="none" />
      <rect x="118" y="120" width="5" height="48" rx="2" fill="#16181B" />
      <circle cx="120.5" cy="118" r="4" fill="#FFCE45" />
    </svg>
  );
}
