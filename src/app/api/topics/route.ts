import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/session";
import { getTopics, getTopic, deleteTopic } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const topicId = req.nextUrl.searchParams.get("id");

    if (topicId) {
      const topic = await getTopic(topicId, userId);
      if (!topic) {
        return NextResponse.json({ error: "Topic not found" }, { status: 404 });
      }
      return NextResponse.json({ topic });
    }

    const topics = await getTopics(userId);
    return NextResponse.json({ topics });
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const topicId = req.nextUrl.searchParams.get("id");
    if (!topicId) {
      return NextResponse.json({ error: "Topic ID required" }, { status: 400 });
    }

    const deleted = await deleteTopic(topicId, userId);
    return NextResponse.json({ success: deleted });
  } catch {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
}
