import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/session";
import { getProfile, updateProfile } from "@/lib/db";

export async function GET() {
  try {
    const userId = await requireUserId();
    const profile = await getProfile(userId);
    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Not authenticated";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await req.json();
    const profile = await updateProfile(userId, body);
    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
