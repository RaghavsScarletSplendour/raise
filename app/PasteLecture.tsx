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
      setErr("That is not a YouTube link. Try again, with the whole URL this time.");
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
          placeholder="https://www.youtube.com/watch?v=26QPDBe-NB8"
        />
        <button className="submit-btn" type="submit">
          Interrupt it
        </button>
      </div>
      {err ? <p className="fine warn">{err}</p> : (
        <p className="fine">Public captions. Ask too early and you sit. Ask too late and you get yanked. I do not do spoilers.</p>
      )}
    </form>
  );
}
