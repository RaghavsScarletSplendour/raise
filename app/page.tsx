import Link from "next/link";
import { LECTURES } from "@/lib/seeds";

export default function Home() {
  return (
    <main className="hall">
      <div className="mark">Calcutta AI Club · Hackathon 2</div>
      <h1>RAISE</h1>
      <p className="lede">
        A real public lecture plays. You raise a hand. The frame freezes.
        An illustrated professor peels out of the paused picture, sits on it
        like a windowsill, and answers only from what this video has already said.
      </p>
      <p className="lede">Ask ahead and he will not climb. Ask what he already covered and he yanks you back. No skipping the rewatch.</p>
      <div className="tickets">
        {LECTURES.map((lec) => (
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
        Ninety-second demo: tap Crash Course OS, let it play ten seconds, tap What is an OS,
        then Virtual memory. For the yank, hit Later in the lecture and tap What is an OS again.
      </p>
    </main>
  );
}
