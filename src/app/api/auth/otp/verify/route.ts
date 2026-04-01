import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, code, type, name, password } = await req.json();

    if (!email?.trim() || !code?.trim()) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const verification = await prisma.verificationCode.findFirst({
      where: {
        email: normalizedEmail,
        code: code.trim().toUpperCase(),
        type,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    await prisma.verificationCode.delete({
      where: { id: verification.id },
    });

    if (type === "signup") {
      if (!name?.trim()) {
        return NextResponse.json(
          { error: "Name is required for signup" },
          { status: 400 }
        );
      }

      if (!password?.trim() || password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          name: name.trim(),
        },
      });

      return NextResponse.json({
        user: { id: user.id, email: user.email, name: user.name },
        action: "signup",
      });
    }

    if (type === "forgot-password") {
      if (!password?.trim()) {
        return NextResponse.json(
          { error: "New password is required" },
          { status: 400 }
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.update({
        where: { email: normalizedEmail },
        data: { passwordHash },
      });

      return NextResponse.json({
        user: { id: user.id, email: user.email, name: user.name },
        action: "password-reset",
      });
    }

    if (type === "signin") {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        user: { id: user.id, email: user.email, name: user.name },
        action: "signin",
      });
    }

    if (type === "delete-account") {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      await prisma.user.delete({
        where: { id: user.id },
      });

      return NextResponse.json({
        user: { id: user.id, email: user.email, name: user.name },
        action: "delete-account",
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 }
    );
  }
}
