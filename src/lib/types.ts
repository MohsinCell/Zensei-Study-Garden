export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  interests: string[];
  learningStyle: LearningStyle;
  level: KnowledgeLevel;
  educationLevel: string;
  preferredLanguage: string;
  dailyGoal: DailyGoal;
  weakAreas: string;
  currentlyLearning: string;
  ageGroup: string;
  avatar: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export type LearningStyle = "analogies" | "step-by-step" | "examples" | "first-principles";

export type KnowledgeLevel = "beginner" | "intermediate" | "advanced";

export type DailyGoal = "casual" | "regular" | "intensive";

export type DepthPreference = "brief" | "detailed";

export type PurposeIntent = "curiosity" | "exam";

export interface TopicEntry {
  id: string;
  topic: string;
  explanations: Explanation[];
  rating: number | null;
  createdAt: string;
  tags: string[];
}

export interface Explanation {
  id: string;
  type: "initial" | "simplified" | "deeper" | "example" | "analogy" | "followup";
  content: string;
  sections: ExplanationSections;
  userQuery?: string;
  depthPreference: DepthPreference;
  purposeIntent: PurposeIntent;
  createdAt: string;
}

export interface ExplanationSections {
  tldr: string;
  core: string;
  analogy?: string;
  deeperDive?: string;
  example?: string;
}

export interface LearningInsight {
  id: string;
  type: "strength" | "weakness" | "preference" | "pattern";
  description: string;
  evidence: string;
  createdAt: string;
}

export interface ExplainRequest {
  topic: string;
  mode?: "initial" | "simplified" | "deeper" | "example" | "analogy" | "followup";
  previousExplanation?: string;
  topicId?: string;
  followupQuery?: string;
  depthPreference?: DepthPreference;
  purposeIntent?: PurposeIntent;
}

export const LEARNING_STYLES: Record<LearningStyle, { label: string; description: string }> = {
  analogies: {
    label: "Analogies & Metaphors",
    description: "Connect new ideas to things I already know",
  },
  "step-by-step": {
    label: "Step by Step",
    description: "Break it down into clear, ordered steps",
  },
  examples: {
    label: "Real Examples",
    description: "Show me how it works in practice",
  },
  "first-principles": {
    label: "First Principles",
    description: "Start from the fundamentals and build up",
  },
};

export const KNOWLEDGE_LEVELS: Record<KnowledgeLevel, { label: string; description: string }> = {
  beginner: {
    label: "Curious Beginner",
    description: "I'm new to most things and love learning from scratch",
  },
  intermediate: {
    label: "Building Knowledge",
    description: "I know the basics of many things, want to go deeper",
  },
  advanced: {
    label: "Deep Diver",
    description: "I have strong foundations, explain things in depth",
  },
};

export const DAILY_GOALS: Record<DailyGoal, { label: string; description: string }> = {
  casual: {
    label: "Casual Learner",
    description: "I learn when something catches my eye",
  },
  regular: {
    label: "Regular Learner",
    description: "I try to learn something new most days",
  },
  intensive: {
    label: "Intensive Learner",
    description: "I'm actively studying and want to learn as much as possible",
  },
};

export const EDUCATION_LEVELS: Record<string, { label: string; description: string }> = {
  "high-school": {
    label: "High School",
    description: "Currently in or completed high school",
  },
  undergraduate: {
    label: "Undergraduate",
    description: "Currently in or completed a bachelor's degree",
  },
  graduate: {
    label: "Graduate / Postgrad",
    description: "Master's, PhD, or equivalent",
  },
  "self-taught": {
    label: "Self-Taught",
    description: "Learning on my own through books, courses, and practice",
  },
  professional: {
    label: "Working Professional",
    description: "Learning through work experience and on-the-job training",
  },
};

export const AGE_GROUPS: Record<string, string> = {
  "under-18": "Under 18",
  "18-24": "18 - 24",
  "25-34": "25 - 34",
  "35-44": "35 - 44",
  "45+": "45+",
};
