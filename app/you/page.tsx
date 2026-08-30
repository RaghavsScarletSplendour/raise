import Link from "next/link";
import YouForm from "./YouForm";

export const metadata = {
  title: "RAISE: roast me first",
  description: "Volunteer a public URL. Answer three rude questions. Get a lecture assignment.",
};

export default function YouPage() {
  return (
    <div className="stand you-page">
      <div className="topbar">
        <div>
          <Link href="/" className="stamp">
            RAISE
          </Link>
          <div className="tagline">volunteer a public URL. get a lecture assignment.</div>
        </div>
        <Link href="/" className="roast-link">
          Back to shuffle
        </Link>
      </div>
      <YouForm />
    </div>
  );
}
