CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "VerificationCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
INSERT INTO "new_User" ("ageGroup", "createdAt", "currentlyLearning", "dailyGoal", "educationLevel", "email", "id", "interests", "learningStyle", "level", "name", "passwordHash", "preferredLanguage", "role", "updatedAt", "weakAreas") SELECT "ageGroup", "createdAt", "currentlyLearning", "dailyGoal", "educationLevel", "email", "id", "interests", "learningStyle", "level", "name", "passwordHash", "preferredLanguage", "role", "updatedAt", "weakAreas" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "UserAchievement"("userId", "achievementId");

