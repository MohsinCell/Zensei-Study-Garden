// Achievement System
// 110+ achievements across 14 categories with tiered rewards

export type AchievementCategory =
  | "exploration"
  | "depth"
  | "questions"
  | "examples"
  | "analogies"
  | "simplification"
  | "feedback"
  | "streaks"
  | "xp_milestones"
  | "level_milestones"
  | "preferences"
  | "categories"
  | "variety"
  | "hidden"
  | "meta";

export type AchievementTier = "bronze" | "silver" | "gold" | "platinum" | "legendary";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  xpReward: number;
  icon: string;
  hidden?: boolean;
  check: (stats: UserStats, unlockedIds?: Set<string>) => boolean;
}

export interface UserStats {
  totalTopics: number;
  totalExplanations: number;
  deeperCount: number;
  followupCount: number;
  exampleCount: number;
  analogyCount: number;
  simplifiedCount: number;
  totalRatings: number;
  ratings5: number;
  ratings4Plus: number;
  ratings1: number;
  briefCount: number;
  detailedCount: number;
  curiosityCount: number;
  examCount: number;
  xp: number;
  xpLevel: number;
  currentStreak: number;
  longestStreak: number;
  tagCounts: Record<string, number>;
  uniqueCategories: number;
  actionTypesUsed: number;
  totalActions: number;
  hour: number;
  dayOfWeek: number;
  topicsToday: number;
  xpToday: number;
  consecutiveHighRatings: number;
}

export const CATEGORY_LABELS: Record<AchievementCategory, { label: string; icon: string }> = {
  exploration: { label: "Exploration", icon: "compass" },
  depth: { label: "Going Deeper", icon: "waves" },
  questions: { label: "Follow-up Questions", icon: "question-circle" },
  examples: { label: "Examples", icon: "microscope" },
  analogies: { label: "Analogies", icon: "bridge" },
  simplification: { label: "Simplification", icon: "gem" },
  feedback: { label: "Feedback", icon: "star" },
  streaks: { label: "Streaks", icon: "flame" },
  xp_milestones: { label: "XP Milestones", icon: "bolt" },
  level_milestones: { label: "Levels", icon: "chart-up" },
  preferences: { label: "Learning Styles", icon: "palette" },
  categories: { label: "Subjects", icon: "books" },
  variety: { label: "Variety", icon: "masks" },
  hidden: { label: "Hidden", icon: "dice" },
  meta: { label: "Meta", icon: "crown" },
};

export const ACHIEVEMENTS: Achievement[] = [
  // ==========================================
  // EXPLORATION: Exploring new topics
  // ==========================================
  {
    id: "explore_1",
    name: "First Light",
    description: "Explore your very first topic",
    category: "exploration",
    tier: "bronze",
    xpReward: 15,
    icon: "🌱",
    check: (s) => s.totalTopics >= 1,
  },
  {
    id: "explore_3",
    name: "Three So Far",
    description: "Explore 3 topics",
    category: "exploration",
    tier: "bronze",
    xpReward: 15,
    icon: "☘️",
    check: (s) => s.totalTopics >= 3,
  },
  {
    id: "explore_7",
    name: "Seven Strong",
    description: "Explore 7 topics",
    category: "exploration",
    tier: "bronze",
    xpReward: 25,
    icon: "🍀",
    check: (s) => s.totalTopics >= 7,
  },
  {
    id: "explore_15",
    name: "Fifteen",
    description: "Explore 15 topics",
    category: "exploration",
    tier: "silver",
    xpReward: 40,
    icon: "🔟",
    check: (s) => s.totalTopics >= 15,
  },
  {
    id: "explore_25",
    name: "Twenty-Five",
    description: "Explore 25 topics",
    category: "exploration",
    tier: "silver",
    xpReward: 60,
    icon: "🏅",
    check: (s) => s.totalTopics >= 25,
  },
  {
    id: "explore_50",
    name: "Fifty",
    description: "Explore 50 topics",
    category: "exploration",
    tier: "gold",
    xpReward: 100,
    icon: "🏆",
    check: (s) => s.totalTopics >= 50,
  },
  {
    id: "explore_100",
    name: "One Hundred",
    description: "Explore 100 topics",
    category: "exploration",
    tier: "gold",
    xpReward: 200,
    icon: "💯",
    check: (s) => s.totalTopics >= 100,
  },
  {
    id: "explore_250",
    name: "Two Hundred Fifty",
    description: "Explore 250 topics",
    category: "exploration",
    tier: "platinum",
    xpReward: 400,
    icon: "🧠",
    check: (s) => s.totalTopics >= 250,
  },
  {
    id: "explore_500",
    name: "Five Hundred",
    description: "Explore 500 topics",
    category: "exploration",
    tier: "platinum",
    xpReward: 750,
    icon: "🏛️",
    check: (s) => s.totalTopics >= 500,
  },
  {
    id: "explore_1000",
    name: "The Thousand",
    description: "Explore 1,000 topics",
    category: "exploration",
    tier: "platinum",
    xpReward: 1500,
    icon: "🌐",
    check: (s) => s.totalTopics >= 1000,
  },

  // ==========================================
  // DEPTH: Going deeper
  // ==========================================
  {
    id: "deeper_1",
    name: "First Dive",
    description: "Use Go Deeper for the first time",
    category: "depth",
    tier: "bronze",
    xpReward: 15,
    icon: "🌊",
    check: (s) => s.deeperCount >= 1,
  },
  {
    id: "deeper_10",
    name: "Ten Deeper",
    description: "Go deeper 10 times",
    category: "depth",
    tier: "silver",
    xpReward: 40,
    icon: "🤿",
    check: (s) => s.deeperCount >= 10,
  },
  {
    id: "deeper_25",
    name: "Digging In",
    description: "Go deeper 25 times",
    category: "depth",
    tier: "silver",
    xpReward: 60,
    icon: "⛏️",
    check: (s) => s.deeperCount >= 25,
  },
  {
    id: "deeper_50",
    name: "Deep Roots",
    description: "Go deeper 50 times",
    category: "depth",
    tier: "gold",
    xpReward: 100,
    icon: "🔩",
    check: (s) => s.deeperCount >= 50,
  },
  {
    id: "deeper_100",
    name: "All the Way Down",
    description: "Go deeper 100 times",
    category: "depth",
    tier: "gold",
    xpReward: 200,
    icon: "🌋",
    check: (s) => s.deeperCount >= 100,
  },
  {
    id: "deeper_250",
    name: "Abyssal Zone",
    description: "Go deeper 250 times",
    category: "depth",
    tier: "platinum",
    xpReward: 400,
    icon: "🕳️",
    check: (s) => s.deeperCount >= 250,
  },

  // ==========================================
  // QUESTIONS: Follow-up questions
  // ==========================================
  {
    id: "followup_1",
    name: "First Question",
    description: "Ask your first follow-up question",
    category: "questions",
    tier: "bronze",
    xpReward: 15,
    icon: "🤔",
    check: (s) => s.followupCount >= 1,
  },
  {
    id: "followup_10",
    name: "Curious Habit",
    description: "Ask 10 follow-up questions",
    category: "questions",
    tier: "silver",
    xpReward: 40,
    icon: "🎰",
    check: (s) => s.followupCount >= 10,
  },
  {
    id: "followup_25",
    name: "Keeps Asking",
    description: "Ask 25 follow-up questions",
    category: "questions",
    tier: "silver",
    xpReward: 60,
    icon: "🔍",
    check: (s) => s.followupCount >= 25,
  },
  {
    id: "followup_50",
    name: "Fifty Questions",
    description: "Ask 50 follow-up questions",
    category: "questions",
    tier: "gold",
    xpReward: 100,
    icon: "🏛️",
    check: (s) => s.followupCount >= 50,
  },
  {
    id: "followup_100",
    name: "Always Asking",
    description: "Ask 100 follow-up questions",
    category: "questions",
    tier: "gold",
    xpReward: 200,
    icon: "🔦",
    check: (s) => s.followupCount >= 100,
  },
  {
    id: "followup_250",
    name: "The Inquisitor",
    description: "Ask 250 follow-up questions",
    category: "questions",
    tier: "platinum",
    xpReward: 400,
    icon: "📡",
    check: (s) => s.followupCount >= 250,
  },

  // ==========================================
  // EXAMPLES: Requesting examples
  // ==========================================
  {
    id: "example_1",
    name: "First Example",
    description: "Request your first example",
    category: "examples",
    tier: "bronze",
    xpReward: 15,
    icon: "🧪",
    check: (s) => s.exampleCount >= 1,
  },
  {
    id: "example_10",
    name: "Hands On",
    description: "Request 10 examples",
    category: "examples",
    tier: "silver",
    xpReward: 40,
    icon: "🛠️",
    check: (s) => s.exampleCount >= 10,
  },
  {
    id: "example_25",
    name: "Show Me More",
    description: "Request 25 examples",
    category: "examples",
    tier: "gold",
    xpReward: 75,
    icon: "🧙",
    check: (s) => s.exampleCount >= 25,
  },
  {
    id: "example_75",
    name: "Example Collector",
    description: "Request 75 examples",
    category: "examples",
    tier: "gold",
    xpReward: 150,
    icon: "📖",
    check: (s) => s.exampleCount >= 75,
  },
  {
    id: "example_150",
    name: "Living Library",
    description: "Request 150 examples",
    category: "examples",
    tier: "platinum",
    xpReward: 300,
    icon: "📚",
    check: (s) => s.exampleCount >= 150,
  },

  // ==========================================
  // ANALOGIES: Requesting analogies
  // ==========================================
  {
    id: "analogy_1",
    name: "First Analogy",
    description: "Request your first analogy",
    category: "analogies",
    tier: "bronze",
    xpReward: 15,
    icon: "🔗",
    check: (s) => s.analogyCount >= 1,
  },
  {
    id: "analogy_10",
    name: "Making Connections",
    description: "Request 10 analogies",
    category: "analogies",
    tier: "silver",
    xpReward: 40,
    icon: "🪢",
    check: (s) => s.analogyCount >= 10,
  },
  {
    id: "analogy_25",
    name: "Seeing Patterns",
    description: "Request 25 analogies",
    category: "analogies",
    tier: "gold",
    xpReward: 75,
    icon: "🌉",
    check: (s) => s.analogyCount >= 25,
  },
  {
    id: "analogy_75",
    name: "Bridge Builder",
    description: "Request 75 analogies",
    category: "analogies",
    tier: "gold",
    xpReward: 150,
    icon: "🏗️",
    check: (s) => s.analogyCount >= 75,
  },
  {
    id: "analogy_150",
    name: "Pattern Master",
    description: "Request 150 analogies",
    category: "analogies",
    tier: "platinum",
    xpReward: 300,
    icon: "🧩",
    check: (s) => s.analogyCount >= 150,
  },

  // ==========================================
  // SIMPLIFICATION: Simplifying explanations
  // ==========================================
  {
    id: "simplify_1",
    name: "Keep It Simple",
    description: "Simplify an explanation for the first time",
    category: "simplification",
    tier: "bronze",
    xpReward: 15,
    icon: "✂️",
    check: (s) => s.simplifiedCount >= 1,
  },
  {
    id: "simplify_10",
    name: "Clear Thinker",
    description: "Simplify 10 explanations",
    category: "simplification",
    tier: "silver",
    xpReward: 40,
    icon: "📝",
    check: (s) => s.simplifiedCount >= 10,
  },
  {
    id: "simplify_25",
    name: "Plain and Clear",
    description: "Simplify 25 explanations",
    category: "simplification",
    tier: "gold",
    xpReward: 75,
    icon: "💎",
    check: (s) => s.simplifiedCount >= 25,
  },
  {
    id: "simplify_75",
    name: "Crystal Mind",
    description: "Simplify 75 explanations",
    category: "simplification",
    tier: "gold",
    xpReward: 150,
    icon: "⚗️",
    check: (s) => s.simplifiedCount >= 75,
  },
  {
    id: "simplify_150",
    name: "Essence Extractor",
    description: "Simplify 150 explanations",
    category: "simplification",
    tier: "platinum",
    xpReward: 300,
    icon: "💠",
    check: (s) => s.simplifiedCount >= 150,
  },

  // ==========================================
  // FEEDBACK: Rating topics
  // ==========================================
  {
    id: "rate_1",
    name: "First Impression",
    description: "Rate your first topic",
    category: "feedback",
    tier: "bronze",
    xpReward: 10,
    icon: "📋",
    check: (s) => s.totalRatings >= 1,
  },
  {
    id: "rate_10",
    name: "Sharing Thoughts",
    description: "Rate 10 topics",
    category: "feedback",
    tier: "silver",
    xpReward: 30,
    icon: "🎭",
    check: (s) => s.totalRatings >= 10,
  },
  {
    id: "rate_25",
    name: "Thoughtful Feedback",
    description: "Rate 25 topics",
    category: "feedback",
    tier: "gold",
    xpReward: 60,
    icon: "📊",
    check: (s) => s.totalRatings >= 25,
  },
  {
    id: "rate_100",
    name: "Century Rated",
    description: "Rate 100 topics",
    category: "feedback",
    tier: "gold",
    xpReward: 150,
    icon: "👑",
    check: (s) => s.totalRatings >= 100,
  },
  {
    id: "rate_250",
    name: "Feedback Legend",
    description: "Rate 250 topics",
    category: "feedback",
    tier: "platinum",
    xpReward: 300,
    icon: "🏅",
    check: (s) => s.totalRatings >= 250,
  },
  {
    id: "rate_perfect",
    name: "Perfect Score",
    description: "Give a topic a 5/5 rating",
    category: "feedback",
    tier: "bronze",
    xpReward: 15,
    icon: "✨",
    check: (s) => s.ratings5 >= 1,
  },
  {
    id: "rate_honest",
    name: "Honest Feedback",
    description: "Give a topic a 1/5 rating. Honesty helps you grow.",
    category: "feedback",
    tier: "bronze",
    xpReward: 15,
    icon: "🪞",
    check: (s) => s.ratings1 >= 1,
  },
  {
    id: "rate_high_10",
    name: "High Standards",
    description: "Give 10 ratings of 4 or higher",
    category: "feedback",
    tier: "silver",
    xpReward: 40,
    icon: "📈",
    check: (s) => s.ratings4Plus >= 10,
  },
  {
    id: "rate_high_50",
    name: "Good Understanding",
    description: "Give 50 ratings of 4 or higher",
    category: "feedback",
    tier: "gold",
    xpReward: 100,
    icon: "🎖️",
    check: (s) => s.ratings4Plus >= 50,
  },
  {
    id: "rate_high_150",
    name: "Solid Grasp",
    description: "Give 150 ratings of 4 or higher",
    category: "feedback",
    tier: "platinum",
    xpReward: 250,
    icon: "💫",
    check: (s) => s.ratings4Plus >= 150,
  },
  {
    id: "rate_golden_streak",
    name: "Golden Streak",
    description: "Rate 5 topics in a row 4 or higher",
    category: "feedback",
    tier: "gold",
    xpReward: 60,
    icon: "🌟",
    check: (s) => s.consecutiveHighRatings >= 5,
  },

  // ==========================================
  // STREAKS: Consistency
  // ==========================================
  {
    id: "streak_3",
    name: "Kindling",
    description: "Reach a 3-day streak. The fire grows",
    category: "streaks",
    tier: "bronze",
    xpReward: 25,
    icon: "🪵",
    check: (s) => s.longestStreak >= 3,
  },
  {
    id: "streak_5",
    name: "Steady Flame",
    description: "Reach a 5-day streak",
    category: "streaks",
    tier: "silver",
    xpReward: 40,
    icon: "🔥",
    check: (s) => s.longestStreak >= 5,
  },
  {
    id: "streak_10",
    name: "Blazing Trail",
    description: "Reach a 10-day streak",
    category: "streaks",
    tier: "silver",
    xpReward: 60,
    icon: "⚔️",
    check: (s) => s.longestStreak >= 10,
  },
  {
    id: "streak_21",
    name: "Habit Forged",
    description: "Reach a 21-day streak",
    category: "streaks",
    tier: "gold",
    xpReward: 100,
    icon: "🛡️",
    check: (s) => s.longestStreak >= 21,
  },
  {
    id: "streak_30",
    name: "Monthly Maven",
    description: "Reach a 30-day streak. Habit formed!",
    category: "streaks",
    tier: "gold",
    xpReward: 150,
    icon: "📅",
    check: (s) => s.longestStreak >= 30,
  },
  {
    id: "streak_60",
    name: "Phoenix Rising",
    description: "Reach a 60-day streak",
    category: "streaks",
    tier: "platinum",
    xpReward: 300,
    icon: "🦅",
    check: (s) => s.longestStreak >= 60,
  },
  {
    id: "streak_100",
    name: "Eternal Flame",
    description: "Reach a 100-day streak. You are unstoppable",
    category: "streaks",
    tier: "platinum",
    xpReward: 500,
    icon: "♾️",
    check: (s) => s.longestStreak >= 100,
  },
  {
    id: "streak_200",
    name: "Unbreakable",
    description: "Reach a 200-day streak",
    category: "streaks",
    tier: "platinum",
    xpReward: 750,
    icon: "💪",
    check: (s) => s.longestStreak >= 200,
  },
  {
    id: "streak_365",
    name: "Legendary Persistence",
    description: "Reach a 365-day streak. A full year of daily learning",
    category: "streaks",
    tier: "platinum",
    xpReward: 1500,
    icon: "🌍",
    check: (s) => s.longestStreak >= 365,
  },

  // ==========================================
  // XP MILESTONES
  // ==========================================
  {
    id: "xp_100",
    name: "Getting Warmed Up",
    description: "Earn 100 XP",
    category: "xp_milestones",
    tier: "bronze",
    xpReward: 15,
    icon: "🌡️",
    check: (s) => s.xp >= 100,
  },
  {
    id: "xp_500",
    name: "Half a Grand",
    description: "Earn 500 XP",
    category: "xp_milestones",
    tier: "silver",
    xpReward: 40,
    icon: "💰",
    check: (s) => s.xp >= 500,
  },
  {
    id: "xp_1000",
    name: "Brain Gains",
    description: "Earn 1,000 XP, your mind is a muscle",
    category: "xp_milestones",
    tier: "silver",
    xpReward: 60,
    icon: "🧠",
    check: (s) => s.xp >= 1000,
  },
  {
    id: "xp_2500",
    name: "Knowledge Investor",
    description: "Earn 2,500 XP",
    category: "xp_milestones",
    tier: "gold",
    xpReward: 100,
    icon: "📊",
    check: (s) => s.xp >= 2500,
  },
  {
    id: "xp_5000",
    name: "XP Powerhouse",
    description: "Earn 5,000 XP, serious learner energy",
    category: "xp_milestones",
    tier: "gold",
    xpReward: 150,
    icon: "⚡",
    check: (s) => s.xp >= 5000,
  },
  {
    id: "xp_10000",
    name: "Ten Grand",
    description: "Earn 10,000 XP",
    category: "xp_milestones",
    tier: "platinum",
    xpReward: 300,
    icon: "🌟",
    check: (s) => s.xp >= 10000,
  },
  {
    id: "xp_25000",
    name: "XP Legend",
    description: "Earn 25,000 XP, your dedication is legendary",
    category: "xp_milestones",
    tier: "platinum",
    xpReward: 500,
    icon: "👑",
    check: (s) => s.xp >= 25000,
  },
  {
    id: "xp_50000",
    name: "Transcendent Mind",
    description: "Earn 50,000 XP, beyond mortal learning",
    category: "xp_milestones",
    tier: "platinum",
    xpReward: 1000,
    icon: "🌌",
    check: (s) => s.xp >= 50000,
  },
  {
    id: "xp_100000",
    name: "Cosmic Scholar",
    description: "Earn 100,000 XP",
    category: "xp_milestones",
    tier: "platinum",
    xpReward: 2000,
    icon: "🪐",
    check: (s) => s.xp >= 100000,
  },

  // ==========================================
  // LEVEL MILESTONES
  // ==========================================
  {
    id: "level_5",
    name: "High Five",
    description: "Reach level 5",
    category: "level_milestones",
    tier: "bronze",
    xpReward: 25,
    icon: "🖐️",
    check: (s) => s.xpLevel >= 5,
  },
  {
    id: "level_10",
    name: "Double Digits",
    description: "Reach level 10, now we are cooking",
    category: "level_milestones",
    tier: "silver",
    xpReward: 50,
    icon: "🔢",
    check: (s) => s.xpLevel >= 10,
  },
  {
    id: "level_20",
    name: "Roaring Twenty",
    description: "Reach level 20",
    category: "level_milestones",
    tier: "gold",
    xpReward: 80,
    icon: "🦁",
    check: (s) => s.xpLevel >= 20,
  },
  {
    id: "level_30",
    name: "Thirty Strong",
    description: "Reach level 30",
    category: "level_milestones",
    tier: "gold",
    xpReward: 120,
    icon: "🗿",
    check: (s) => s.xpLevel >= 30,
  },
  {
    id: "level_50",
    name: "Halfway Hero",
    description: "Reach level 50",
    category: "level_milestones",
    tier: "platinum",
    xpReward: 250,
    icon: "⚔️",
    check: (s) => s.xpLevel >= 50,
  },
  {
    id: "level_75",
    name: "The Summit",
    description: "Reach level 75, the air is thin up here",
    category: "level_milestones",
    tier: "platinum",
    xpReward: 400,
    icon: "🏔️",
    check: (s) => s.xpLevel >= 75,
  },
  {
    id: "level_100",
    name: "Apex Reached",
    description: "Reach level 100, you are the mountain",
    category: "level_milestones",
    tier: "platinum",
    xpReward: 750,
    icon: "👁️",
    check: (s) => s.xpLevel >= 100,
  },

  // ==========================================
  // PREFERENCES: Learning style exploration
  // ==========================================
  {
    id: "pref_quick_10",
    name: "Quick Thinker",
    description: "Complete 10 Quick Look explanations",
    category: "preferences",
    tier: "silver",
    xpReward: 30,
    icon: "⚡",
    check: (s) => s.briefCount >= 10,
  },
  {
    id: "pref_quick_30",
    name: "Lightning Learner",
    description: "Complete 30 Quick Look explanations, fast and sharp",
    category: "preferences",
    tier: "gold",
    xpReward: 75,
    icon: "⚡",
    check: (s) => s.briefCount >= 30,
  },
  {
    id: "pref_quick_75",
    name: "Flash Master",
    description: "Complete 75 Quick Look explanations",
    category: "preferences",
    tier: "platinum",
    xpReward: 150,
    icon: "🌩️",
    check: (s) => s.briefCount >= 75,
  },
  {
    id: "pref_deep_10",
    name: "Deep Thinker",
    description: "Complete 10 Full Exploration explanations",
    category: "preferences",
    tier: "silver",
    xpReward: 30,
    icon: "🧐",
    check: (s) => s.detailedCount >= 10,
  },
  {
    id: "pref_deep_30",
    name: "Depth Devotee",
    description: "Complete 30 Full Exploration explanations",
    category: "preferences",
    tier: "gold",
    xpReward: 75,
    icon: "🔭",
    check: (s) => s.detailedCount >= 30,
  },
  {
    id: "pref_deep_75",
    name: "Abyssal Mind",
    description: "Complete 75 Full Exploration explanations",
    category: "preferences",
    tier: "platinum",
    xpReward: 150,
    icon: "🌊",
    check: (s) => s.detailedCount >= 75,
  },
  {
    id: "pref_balanced",
    name: "Balanced Brain",
    description: "Complete 10 Quick and 10 Detailed explanations",
    category: "preferences",
    tier: "gold",
    xpReward: 60,
    icon: "⚖️",
    check: (s) => s.briefCount >= 10 && s.detailedCount >= 10,
  },
  {
    id: "pref_curious_10",
    name: "Just Curious",
    description: "Use curiosity mode 10 times",
    category: "preferences",
    tier: "silver",
    xpReward: 30,
    icon: "🦋",
    check: (s) => s.curiosityCount >= 10,
  },
  {
    id: "pref_curious_50",
    name: "Curiosity Incarnate",
    description: "Use curiosity mode 50 times, born to wonder",
    category: "preferences",
    tier: "gold",
    xpReward: 100,
    icon: "🔮",
    check: (s) => s.curiosityCount >= 50,
  },
  {
    id: "pref_curious_100",
    name: "Wonder Eternal",
    description: "Use curiosity mode 100 times",
    category: "preferences",
    tier: "platinum",
    xpReward: 200,
    icon: "✨",
    check: (s) => s.curiosityCount >= 100,
  },
  {
    id: "pref_exam_10",
    name: "Exam Prepper",
    description: "Use study mode 10 times",
    category: "preferences",
    tier: "silver",
    xpReward: 30,
    icon: "📝",
    check: (s) => s.examCount >= 10,
  },
  {
    id: "pref_exam_50",
    name: "Test Titan",
    description: "Use study mode 50 times, exams do not stand a chance",
    category: "preferences",
    tier: "gold",
    xpReward: 100,
    icon: "🏆",
    check: (s) => s.examCount >= 50,
  },
  {
    id: "pref_exam_100",
    name: "Scholar Supreme",
    description: "Use study mode 100 times",
    category: "preferences",
    tier: "platinum",
    xpReward: 200,
    icon: "🎓",
    check: (s) => s.examCount >= 100,
  },

  // ==========================================
  // CATEGORIES: Subject mastery
  // ==========================================
  {
    id: "cat_science",
    name: "Science Spark",
    description: "Explore 5 science-related topics",
    category: "categories",
    tier: "silver",
    xpReward: 40,
    icon: "🔬",
    check: (s) => (s.tagCounts["science"] || 0) >= 5,
  },
  {
    id: "cat_technology",
    name: "Tech Whisperer",
    description: "Explore 5 technology-related topics",
    category: "categories",
    tier: "silver",
    xpReward: 40,
    icon: "💻",
    check: (s) => (s.tagCounts["technology"] || 0) >= 5,
  },
  {
    id: "cat_history",
    name: "History Buff",
    description: "Explore 5 history-related topics",
    category: "categories",
    tier: "silver",
    xpReward: 40,
    icon: "🏺",
    check: (s) => (s.tagCounts["history"] || 0) >= 5,
  },
  {
    id: "cat_philosophy",
    name: "Philosophy Stone",
    description: "Explore 5 philosophy-related topics",
    category: "categories",
    tier: "silver",
    xpReward: 40,
    icon: "🤔",
    check: (s) => (s.tagCounts["philosophy"] || 0) >= 5,
  },
  {
    id: "cat_math",
    name: "Math Magician",
    description: "Explore 5 math-related topics",
    category: "categories",
    tier: "silver",
    xpReward: 40,
    icon: "🔢",
    check: (s) => (s.tagCounts["mathematics"] || s.tagCounts["math"] || 0) >= 5,
  },
  {
    id: "cat_art",
    name: "Art Connoisseur",
    description: "Explore 5 art-related topics",
    category: "categories",
    tier: "silver",
    xpReward: 40,
    icon: "🎨",
    check: (s) => (s.tagCounts["art"] || 0) >= 5,
  },
  {
    id: "cat_finance",
    name: "Money Mind",
    description: "Explore 5 finance-related topics",
    category: "categories",
    tier: "silver",
    xpReward: 40,
    icon: "💵",
    check: (s) => (s.tagCounts["finance"] || s.tagCounts["economics"] || 0) >= 5,
  },
  {
    id: "cat_literature",
    name: "Word Smith",
    description: "Explore 5 literature or language topics",
    category: "categories",
    tier: "silver",
    xpReward: 40,
    icon: "📜",
    check: (s) => (s.tagCounts["literature"] || s.tagCounts["language"] || 0) >= 5,
  },
  {
    id: "cat_programming",
    name: "Code Whisperer",
    description: "Explore 5 programming topics",
    category: "categories",
    tier: "silver",
    xpReward: 40,
    icon: "🖥️",
    check: (s) => (s.tagCounts["programming"] || s.tagCounts["computer science"] || 0) >= 5,
  },
  {
    id: "cat_health",
    name: "Body Scholar",
    description: "Explore 5 health or medicine topics",
    category: "categories",
    tier: "silver",
    xpReward: 40,
    icon: "🩺",
    check: (s) => (s.tagCounts["health"] || s.tagCounts["medicine"] || 0) >= 5,
  },

  // ==========================================
  // VARIETY: Breadth of exploration
  // ==========================================
  {
    id: "variety_5",
    name: "Renaissance Mind",
    description: "Explore topics in 5+ different categories",
    category: "variety",
    tier: "silver",
    xpReward: 50,
    icon: "🎭",
    check: (s) => s.uniqueCategories >= 5,
  },
  {
    id: "variety_10",
    name: "Polymath",
    description: "Explore topics in 10+ different categories",
    category: "variety",
    tier: "gold",
    xpReward: 100,
    icon: "🌐",
    check: (s) => s.uniqueCategories >= 10,
  },
  {
    id: "variety_20",
    name: "Universal Scholar",
    description: "Explore topics in 20+ different categories, you know everything!",
    category: "variety",
    tier: "platinum",
    xpReward: 250,
    icon: "🌌",
    check: (s) => s.uniqueCategories >= 20,
  },
  {
    id: "variety_toolkit",
    name: "Full Toolkit",
    description: "Use all 4 action types at least once (deeper, example, analogy, simplify)",
    category: "variety",
    tier: "silver",
    xpReward: 30,
    icon: "🧰",
    check: (s) => s.actionTypesUsed >= 4,
  },
  {
    id: "variety_actions_100",
    name: "Action Hero",
    description: "Use action buttons 100 times total",
    category: "variety",
    tier: "gold",
    xpReward: 100,
    icon: "🦸",
    check: (s) => s.totalActions >= 100,
  },
  {
    id: "variety_actions_250",
    name: "Action Legend",
    description: "Use action buttons 250 times",
    category: "variety",
    tier: "platinum",
    xpReward: 250,
    icon: "🌟",
    check: (s) => s.totalActions >= 250,
  },

  // ==========================================
  // HIDDEN / SURPRISE ACHIEVEMENTS
  // ==========================================
  {
    id: "hidden_night_owl",
    name: "Night Owl",
    description: "Explore 3+ topics between midnight and 4 AM",
    category: "hidden",
    tier: "silver",
    xpReward: 30,
    icon: "🦉",
    hidden: true,
    check: (s) => s.topicsToday >= 3 && s.hour >= 0 && s.hour < 4,
  },
  {
    id: "hidden_early_bird",
    name: "Early Bird",
    description: "Explore 3+ topics between 5 AM and 7 AM",
    category: "hidden",
    tier: "silver",
    xpReward: 30,
    icon: "🐦",
    hidden: true,
    check: (s) => s.topicsToday >= 3 && s.hour >= 5 && s.hour < 7,
  },
  {
    id: "hidden_weekend",
    name: "Weekend Scholar",
    description: "Explore 5+ topics on a single weekend day",
    category: "hidden",
    tier: "bronze",
    xpReward: 20,
    icon: "🛋️",
    hidden: true,
    check: (s) => s.topicsToday >= 5 && (s.dayOfWeek === 0 || s.dayOfWeek === 6),
  },
  {
    id: "hidden_marathon",
    name: "Marathon Mind",
    description: "Explore 15+ topics in a single day",
    category: "hidden",
    tier: "gold",
    xpReward: 100,
    icon: "🏃",
    hidden: true,
    check: (s) => s.topicsToday >= 15,
  },
  {
    id: "hidden_century_sprint",
    name: "Century Sprint",
    description: "Earn 500+ XP in a single day",
    category: "hidden",
    tier: "gold",
    xpReward: 100,
    icon: "💨",
    hidden: true,
    check: (s) => s.xpToday >= 500,
  },
  {
    id: "hidden_all_rounder",
    name: "The Completionist",
    description: "Use every feature at least 3 times: explore, go deeper, simplify, example, analogy, follow-up, and rate",
    category: "hidden",
    tier: "gold",
    xpReward: 100,
    icon: "🎯",
    hidden: true,
    check: (s) =>
      s.totalTopics >= 3 &&
      s.deeperCount >= 3 &&
      s.simplifiedCount >= 3 &&
      s.exampleCount >= 3 &&
      s.analogyCount >= 3 &&
      s.followupCount >= 3 &&
      s.totalRatings >= 3,
  },
  {
    id: "hidden_midnight_streak",
    name: "Midnight Scholar",
    description: "Explore 5 topics between midnight and 4 AM on the same day",
    category: "hidden",
    tier: "gold",
    xpReward: 80,
    icon: "🌙",
    hidden: true,
    check: (s) => s.topicsToday >= 5 && s.hour >= 0 && s.hour < 4,
  },
  {
    id: "hidden_perfect_week",
    name: "Perfect Week",
    description: "Explore at least one topic every day for 7 consecutive days without missing a day",
    category: "hidden",
    tier: "platinum",
    xpReward: 200,
    icon: "📆",
    hidden: true,
    check: (s) => s.longestStreak >= 7,
  },

  // ==========================================
  // META ACHIEVEMENTS
  // ==========================================
  {
    id: "meta_all_hidden",
    name: "Shadow Collector",
    description: "Unlock every hidden achievement. You found what was meant to stay hidden.",
    category: "meta",
    tier: "platinum",
    xpReward: 500,
    icon: "🌑",
    hidden: true,
    check: (s, unlockedIds) => {
      if (!unlockedIds) return false;
      const hiddenAchievements = ACHIEVEMENTS.filter((a) => a.hidden && a.category === "hidden");
      return hiddenAchievements.every((a) => unlockedIds.has(a.id));
    },
  },
  {
    id: "meta_omniscient",
    name: "Omniscient",
    description: "Unlock every achievement in the game. You have mastered all of knowledge.",
    category: "meta",
    tier: "legendary",
    xpReward: 2500,
    icon: "👑",
    hidden: true,
    check: (s, unlockedIds) => {
      if (!unlockedIds) return false;
      const allNonMeta = ACHIEVEMENTS.filter((a) => a.id !== "meta_omniscient");
      return allNonMeta.every((a) => unlockedIds.has(a.id));
    },
  },
];

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.category === category);
}

export const TIER_ORDER: Record<AchievementTier, number> = {
  bronze: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
  legendary: 4,
};

export const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: "text-amber-600",
  silver: "text-gray-400",
  gold: "text-yellow-400",
  platinum: "text-cyan-300",
  legendary: "text-[#341539]",
};

export const TIER_BG: Record<AchievementTier, string> = {
  bronze: "bg-amber-900/20 border-amber-700/30",
  silver: "bg-gray-700/20 border-gray-500/30",
  gold: "bg-yellow-900/20 border-yellow-600/30",
  platinum: "bg-cyan-900/20 border-cyan-500/30",
  legendary: "bg-purple-900/20 border-purple-500/30",
};
