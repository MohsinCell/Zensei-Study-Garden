PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT '',
    "interests" TEXT NOT NULL DEFAULT '[]',
    "learningStyle" TEXT NOT NULL DEFAULT 'analogies',
    "level" TEXT NOT NULL DEFAULT 'intermediate',
    "educationLevel" TEXT NOT NULL DEFAULT '',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'English',
    "dailyGoal" TEXT NOT NULL DEFAULT 'casual',
    "weakAreas" TEXT NOT NULL DEFAULT '',
    "currentlyLearning" TEXT NOT NULL DEFAULT '',
    "ageGroup" TEXT NOT NULL DEFAULT '',
    "avatar" TEXT NOT NULL DEFAULT '',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "isDev" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "xpLevel" INTEGER NOT NULL DEFAULT 1,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TEXT NOT NULL DEFAULT '',
    "totalTopics" INTEGER NOT NULL DEFAULT 0,
    "totalExplanations" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("ageGroup", "createdAt", "currentStreak", "currentlyLearning", "dailyGoal", "educationLevel", "email", "id", "interests", "lastActiveDate", "learningStyle", "level", "longestStreak", "name", "passwordHash", "preferredLanguage", "role", "totalExplanations", "totalTopics", "updatedAt", "weakAreas", "xp", "xpLevel") SELECT "ageGroup", "createdAt", "currentStreak", "currentlyLearning", "dailyGoal", "educationLevel", "email", "id", "interests", "lastActiveDate", "learningStyle", "level", "longestStreak", "name", "passwordHash", "preferredLanguage", "role", "totalExplanations", "totalTopics", "updatedAt", "weakAreas", "xp", "xpLevel" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
