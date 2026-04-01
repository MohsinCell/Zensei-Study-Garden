import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json();

    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name.trim(),
        passwordHash: hashedPassword,
        // Set defaults for other fields to match OTP flow
        role: "",
        interests: "[]",
        learningStyle: "analogies",
        level: "intermediate",
        educationLevel: "",
        preferredLanguage: "English",
        dailyGoal: "casual",
        weakAreas: "",
        currentlyLearning: "",
        ageGroup: "",
        xp: 0,
        xpLevel: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: "",
        totalTopics: 0,
        totalExplanations: 0,
      },
    });

    // Return success (do not return password hash)
    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}