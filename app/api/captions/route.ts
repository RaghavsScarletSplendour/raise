import { NextRequest, NextResponse } from "next/server";
import { getLecture } from "@/lib/seeds";

export function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") || "";
  const lecture = getLecture(id);
  if (!lecture) return NextResponse.json({ error: "unknown lecture" }, { status: 404 });
  return NextResponse.json({
    id: lecture.id,
    youtubeId: lecture.youtubeId,
    captions: lecture.captions,
  });
}
