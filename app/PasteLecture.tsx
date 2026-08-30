"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseYouTubeId } from "@/lib/youtube";

export default function PasteLecture() {
  const router = useRouter();
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");

  function go(e: React.FormEvent) {
    e.preventDefault();
    const id = parseYouTubeId(val);
    if (!id) {
      setErr("Need a full YouTube link, or the 11-character video id.");
      return;
    }
    setErr("");
    router.push(`/watch/yt/${id}`);
  }

  return (
    <form className="paste" onSubmit={go}>
      <label htmlFor="yt-url">Or paste any public lecture</label>
      <div className="paste-row">
        <input
          id="yt-url"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
        />
        <button className="primary" type="submit">
          Open it
        </button>
      </div>
      {err ? <p className="fine">{err}</p> : (
        <p className="fine">Needs public captions. Same rules: already said, not yet, or said a while ago.</p>
      )}
    </form>
  );
}
