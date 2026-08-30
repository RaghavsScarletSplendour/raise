import { loadYouTubeLecture } from "@/lib/youtube";
import Theater from "../../[id]/Theater";

export const revalidate = 3600;

export default async function WatchYouTube({
  params,
}: {
  params: { videoId: string };
}) {
  const lecture = await loadYouTubeLecture(params.videoId);
  if (!lecture) {
    return (
      <main className="hall">
        <div className="mark">RAISE</div>
        <h1>No captions</h1>
        <p className="lede">
          That video has no public captions we can read, so the professor
          would be guessing. Pick a lecture with captions on, or use the
          Crash Course demo.
        </p>
        <p className="fine">
          <a href="/">Back to the hall</a>
        </p>
      </main>
    );
  }
  return <Theater lecture={lecture} />;
}
