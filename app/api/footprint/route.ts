import { NextRequest, NextResponse } from "next/server";
import {
  runFootprint,
  validateInput,
  type FootprintAnswers,
  type FootprintInput,
  type LearnStyle,
  type PublicBits,
} from "@/lib/footprint";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function asAnswers(raw: unknown): FootprintAnswers | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const a = raw as Record<string, unknown>;
  const dinner = String(a.dinner || "");
  const wiki = String(a.wiki || "");
  const learn = String(a.learn || "") as LearnStyle;
  if (!dinner && !wiki && !learn) return undefined;
  return { dinner, wiki, learn };
}

function asBits(raw: unknown): PublicBits | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  return raw as PublicBits;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const input: FootprintInput = {
    name: String(body.name || ""),
    email: String(body.email || ""),
    url: String(body.url || ""),
    school: String(body.school || ""),
    answers: asAnswers(body.answers),
    publicBits: asBits(body.publicBits),
  };
  const err = validateInput(input);
  if (err) return NextResponse.json({ error: err }, { status: 400 });
  try {
    const result = await runFootprint(input);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "The public web declined to cooperate. I can still roast you from the form." },
      { status: 500 }
    );
  }
}
