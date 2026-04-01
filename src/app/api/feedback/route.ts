import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/session";
import { rateTopic, addInsight } from "@/lib/db";
import { awardXP } from "@/lib/progression";

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await req.json();
    const { topicId, rating } = body;

    if (!topicId || rating === undefined) {
      return NextResponse.json(
        { error: "topicId and rating are required" },
        { status: 400 }
      );
    }

    // Validate rating is 1-5 integer
    const numRating = Number(rating);
    if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    const topic = await rateTopic(topicId, numRating);

    if (numRating <= 2) {
      await addInsight(userId, {
        type: "weakness",
        description: `Had difficulty understanding "${topic.topic}" (tags: ${topic.tags.join(", ")})`,
        evidence: `Rated ${rating}/5 after explanation`,
      });
    } else if (numRating >= 4) {
      await addInsight(userId, {
        type: "strength",
        description: `Quickly understood "${topic.topic}" (tags: ${topic.tags.join(", ")})`,
        evidence: `Rated ${rating}/5 after explanation`,
      });
    }

    // Award XP for rating (bonus for perfect score)
    const progression = await awardXP(userId, numRating === 5 ? "rate_perfect" : "rate");
    return NextResponse.json({ success: true, topic, progression });
  } catch (error) {
    console.error("Feedback API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
