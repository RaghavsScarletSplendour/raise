import { NextRequest, NextResponse } from "next/server";
import { getLecture } from "@/lib/seeds";
import { fetchCaptions, fetchVideoMeta, parseYouTubeId } from "@/lib/youtube";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") || "";
  const vRaw = req.nextUrl.searchParams.get("v") || "";
  const lecture = getLecture(id);
  if (lecture) {
    return NextResponse.json({
      id: lecture.id,
      youtubeId: lecture.youtubeId,
      captions: lecture.captions,
    });
  }
  const videoId = parseYouTubeId(vRaw) || parseYouTubeId(id);
  if (!videoId) return NextResponse.json({ error: "unknown lecture" }, { status: 404 });
  const [meta, captions] = await Promise.all([
    fetchVideoMeta(videoId),
    fetchCaptions(videoId),
  ]);
  if (!captions.length) {
    return NextResponse.json({ error: "no public captions" }, { status: 404 });
  }
  return NextResponse.json({
    id: `yt-${videoId}`,
    youtubeId: videoId,
    title: meta.title,
    author: meta.author,
    captions,
  });
}
