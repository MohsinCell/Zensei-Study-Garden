import { NextRequest, NextResponse } from "next/server";
import { generateExplanation } from "@/lib/gemini";
import { requireUserId } from "@/lib/session";
import { buildUserContext, createTopic, addExplanation } from "@/lib/db";
import { awardXP, XPAction } from "@/lib/progression";

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await req.json();
    const {
      topic,
      mode = "initial",
      previousExplanation,
      topicId,
      followupQuery,
      depthPreference = "detailed",
      purposeIntent = "curiosity",
    } = body;

    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const userContext = await buildUserContext(userId);

    const sections = await generateExplanation(
      topic,
      userContext,
      mode,
      previousExplanation,
      followupQuery,
      depthPreference,
      purposeIntent
    );

    const explanationData = {
      type: mode,
      content: sections.core,
      tldr: sections.tldr || "",
      core: sections.core || "",
      analogy: sections.analogy,
      deeperDive: sections.deeperDive,
      example: sections.example,
      userQuery: followupQuery,
      depthPreference,
      purposeIntent,
    };

    if (topicId && mode !== "initial") {
      const explanation = await addExplanation(topicId, explanationData);
      const xpAction: XPAction = mode as XPAction;
      const progression = await awardXP(userId, xpAction);
      return NextResponse.json({ topicId, explanation, progression });
    } else {
      // Tags are now generated inline by Gemini in the initial call - no extra API call
      const tags = sections.tags ?? [];
      const result = await createTopic(
        userId,
        { topic: topic.trim(), tags },
        explanationData
      );
      const progression = await awardXP(userId, "initial");
      return NextResponse.json({
        topicId: result.id,
        explanation: result.explanations[0],
        progression,
      });
    }
  } catch (error) {
    console.error("Explain API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Not authenticated" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
