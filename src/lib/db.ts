import { prisma } from "./prisma";

// ─── Profile ───

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    interests: JSON.parse(user.interests) as string[],
    learningStyle: user.learningStyle,
    level: user.level,
    educationLevel: user.educationLevel,
    preferredLanguage: user.preferredLanguage,
    dailyGoal: user.dailyGoal,
    weakAreas: user.weakAreas,
    currentlyLearning: user.currentlyLearning,
    ageGroup: user.ageGroup,
    avatar: user.avatar,
    timezone: user.timezone,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function updateProfile(
  userId: string,
  data: {
    name?: string;
    role?: string;
    interests?: string[];
    learningStyle?: string;
    level?: string;
    educationLevel?: string;
    preferredLanguage?: string;
    dailyGoal?: string;
    weakAreas?: string;
    currentlyLearning?: string;
    ageGroup?: string;
    avatar?: string;
    timezone?: string;
  }
) {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.interests !== undefined) updateData.interests = JSON.stringify(data.interests);
  if (data.learningStyle !== undefined) updateData.learningStyle = data.learningStyle;
  if (data.level !== undefined) updateData.level = data.level;
  if (data.educationLevel !== undefined) updateData.educationLevel = data.educationLevel;
  if (data.preferredLanguage !== undefined) updateData.preferredLanguage = data.preferredLanguage;
  if (data.dailyGoal !== undefined) updateData.dailyGoal = data.dailyGoal;
  if (data.weakAreas !== undefined) updateData.weakAreas = data.weakAreas;
  if (data.currentlyLearning !== undefined) updateData.currentlyLearning = data.currentlyLearning;
  if (data.ageGroup !== undefined) updateData.ageGroup = data.ageGroup;
  if (data.avatar !== undefined) updateData.avatar = data.avatar;
  if (data.timezone !== undefined) updateData.timezone = data.timezone;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return getProfile(user.id);
}

// ─── Topics ───

export async function getTopics(userId: string) {
  const topics = await prisma.topic.findMany({
    where: { userId },
    include: { explanations: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return topics.map(formatTopic);
}

export async function getTopic(topicId: string, userId: string) {
  const topic = await prisma.topic.findFirst({
    where: { id: topicId, userId },
    include: { explanations: { orderBy: { createdAt: "asc" } } },
  });

  return topic ? formatTopic(topic) : null;
}

export async function createTopic(
  userId: string,
  data: {
    topic: string;
    tags: string[];
  },
  explanation: {
    type: string;
    content: string;
    tldr: string;
    core: string;
    analogy?: string;
    deeperDive?: string;
    example?: string;
    depthPreference: string;
    purposeIntent: string;
  }
) {
  // Verify user exists before creating topic
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found - please sign in again");
  }

  const topic = await prisma.topic.create({
    data: {
      topic: data.topic,
      tags: JSON.stringify(data.tags),
      userId,
      explanations: {
        create: {
          type: explanation.type,
          content: explanation.content,
          tldr: explanation.tldr,
          core: explanation.core,
          analogy: explanation.analogy,
          deeperDive: explanation.deeperDive,
          example: explanation.example,
          depthPreference: explanation.depthPreference,
          purposeIntent: explanation.purposeIntent,
        },
      },
    },
    include: { explanations: true },
  });

  return formatTopic(topic);
}

export async function addExplanation(
  topicId: string,
  explanation: {
    type: string;
    content: string;
    tldr: string;
    core: string;
    analogy?: string;
    deeperDive?: string;
    example?: string;
    userQuery?: string;
    depthPreference: string;
    purposeIntent: string;
  }
) {
  const exp = await prisma.explanation.create({
    data: {
      topicId,
      ...explanation,
    },
  });

  return formatExplanation(exp);
}

export async function rateTopic(topicId: string, rating: number) {
  const topic = await prisma.topic.update({
    where: { id: topicId },
    data: { rating },
    include: { explanations: { orderBy: { createdAt: "asc" } } },
  });

  return formatTopic(topic);
}

export async function deleteTopic(topicId: string, userId: string) {
  const topic = await prisma.topic.findFirst({
    where: { id: topicId, userId },
  });
  if (!topic) return false;

  await prisma.topic.delete({ where: { id: topicId } });
  return true;
}

// ─── Insights ───

export async function getInsights(userId: string) {
  return prisma.insight.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function addInsight(
  userId: string,
  data: { type: string; description: string; evidence: string }
) {
  // Keep max 50 insights
  const count = await prisma.insight.count({ where: { userId } });
  if (count >= 50) {
    const oldest = await prisma.insight.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: count - 49,
    });
    await prisma.insight.deleteMany({
      where: { id: { in: oldest.map((i) => i.id) } },
    });
  }

  return prisma.insight.create({
    data: { ...data, userId },
  });
}

// ─── Context Builder ───

export async function buildUserContext(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return "No user profile available.";

  const interests = JSON.parse(user.interests) as string[];

  // Fetch in parallel, with reduced limits to save tokens
  const [topics, weakAreas, strongAreas, insights] = await Promise.all([
    prisma.topic.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { topic: true, rating: true },
    }),
    prisma.topic.findMany({
      where: { userId, rating: { lte: 2, not: null } },
      take: 3,
      select: { topic: true },
    }),
    prisma.topic.findMany({
      where: { userId, rating: { gte: 4 } },
      take: 3,
      select: { topic: true },
    }),
    prisma.insight.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { type: true, description: true },
    }),
  ]);

  // Compact format - every token counts
  const lines: string[] = [
    `User: ${user.name} | ${user.role} | ${user.level} level | ${user.learningStyle} learner`,
    `Interests: ${interests.join(", ")}`,
  ];

  if (user.educationLevel) lines.push(`Education: ${user.educationLevel}`);
  if (user.ageGroup) lines.push(`Age: ${user.ageGroup}`);
  if (user.preferredLanguage !== "English") lines.push(`Language: ${user.preferredLanguage}`);
  if (user.currentlyLearning) lines.push(`Currently learning: ${user.currentlyLearning}`);
  if (user.weakAreas) lines.push(`Weak areas: ${user.weakAreas}`);

  if (topics.length > 0) {
    const topicList = topics.map((t) => `${t.topic}(${t.rating ?? "?"})`).join(", ");
    lines.push(`Recent topics (rating): ${topicList}`);
  }

  if (weakAreas.length > 0) {
    lines.push(`Struggled with: ${weakAreas.map((t) => t.topic).join(", ")}`);
  }

  if (strongAreas.length > 0) {
    lines.push(`Strong at: ${strongAreas.map((t) => t.topic).join(", ")}`);
  }

  if (insights.length > 0) {
    lines.push(`Insights: ${insights.map((i) => `${i.type}: ${i.description}`).join("; ")}`);
  }

  return lines.join("\n");
}

// ─── Helpers ───

function formatTopic(topic: {
  id: string;
  topic: string;
  rating: number | null;
  tags: string;
  createdAt: Date;
  explanations: Array<{
    id: string;
    type: string;
    content: string;
    tldr: string;
    core: string;
    analogy: string | null;
    deeperDive: string | null;
    example: string | null;
    userQuery: string | null;
    depthPreference: string;
    purposeIntent: string;
    createdAt: Date;
  }>;
}) {
  return {
    id: topic.id,
    topic: topic.topic,
    rating: topic.rating,
    tags: JSON.parse(topic.tags) as string[],
    createdAt: topic.createdAt.toISOString(),
    explanations: topic.explanations.map(formatExplanation),
  };
}

function formatExplanation(exp: {
  id: string;
  type: string;
  content: string;
  tldr: string;
  core: string;
  analogy: string | null;
  deeperDive: string | null;
  example: string | null;
  userQuery: string | null;
  depthPreference: string;
  purposeIntent: string;
  createdAt: Date;
}) {
  return {
    id: exp.id,
    type: exp.type,
    content: exp.content,
    sections: {
      tldr: exp.tldr,
      core: exp.core,
      analogy: exp.analogy ?? undefined,
      deeperDive: exp.deeperDive ?? undefined,
      example: exp.example ?? undefined,
    },
    userQuery: exp.userQuery ?? undefined,
    depthPreference: exp.depthPreference,
    purposeIntent: exp.purposeIntent,
    createdAt: exp.createdAt.toISOString(),
  };
}
