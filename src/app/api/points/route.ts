import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/session";
import { getProgression } from "@/lib/progression";

export async function GET() {
  try {
    const userId = await requireUserId();
    const progression = await getProgression(userId);
    // Backwards-compatible response + full progression data
    return NextResponse.json({
      points: progression.xp,
      ...progression,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
