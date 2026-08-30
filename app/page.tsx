import Link from "next/link";
import { LECTURES } from "@/lib/seeds";
import PasteLecture from "./PasteLecture";

export default function Home() {
  const demo = LECTURES[0];
  const rest = LECTURES.slice(1);

  return (
    <main className="hall">
      <div className="mark">Calcutta AI Club · Hackathon 2</div>
      <h1>RAISE</h1>
      <p className="lede">
        A real public lecture plays. You raise a hand. The frame freezes.
        An illustrated professor peels out of the paused picture, sits on it
        like a windowsill, and answers only from what this video has already said.
      </p>
      <p className="lede">Ask ahead and they will not climb. Ask what they already covered and they yank you back.</p>

      <div className="tickets">
        <Link href={`/watch/${demo.id}`} className="ticket hero">
          <span className="chip">The 90 second demo</span>
          <h2>{demo.chip}</h2>
          <p>Three taps, in order. Climb out. Sit down. Yank back.</p>
          <div className="prof">{demo.prof} · {demo.hall}</div>
        </Link>
      </div>

      <PasteLecture />

      <div className="tickets">
        {rest.map((lec) => (
          <Link key={lec.id} href={`/watch/${lec.id}`} className="ticket">
            <span className="chip">{lec.chip}</span>
            <h2>{lec.title}</h2>
            <p>{lec.blurb}</p>
            <div className="prof">{lec.prof} · {lec.hall}</div>
          </Link>
        ))}
      </div>
      <p className="fine">
        Unofficial study avatar. Public lecture plus public captions only.
        This is not the professor, and it will not fake the rest of the video.
      </p>
    </main>
  );
}
