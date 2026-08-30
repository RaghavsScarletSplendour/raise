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
      <main className="no-captions">
        <div className="mark">RAISE</div>
        <h1>No captions</h1>
        <p className="lede">
          That video has no public captions. I refuse to guess. Pick a
          lecture that actually captions itself, or use the Crash Course demo
          like someone who wants this to work.
        </p>
        <p className="fine">
          <a href="/">Back</a>
        </p>
      </main>
    );
  }
  return <Theater lecture={lecture} />;
}
