import { NextRequest, NextResponse } from "next/server";
import { getLecture } from "@/lib/seeds";
import { decide } from "@/lib/raise";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const lectureId = String(body.lectureId || "");
  const question = String(body.question || "");
  const currentTime = Number(body.currentTime || 0);
  const lecture = getLecture(lectureId);
  if (!lecture) return NextResponse.json({ error: "unknown lecture" }, { status: 404 });
  if (!question.trim()) return NextResponse.json({ error: "ask something" }, { status: 400 });
  const decision = decide(lecture.captions, currentTime, question);
  return NextResponse.json(decision);
}
