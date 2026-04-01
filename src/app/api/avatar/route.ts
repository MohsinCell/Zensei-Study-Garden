import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/session";
import { updateProfile } from "@/lib/db";
import { writeFile, mkdir, readdir, unlink } from "fs/promises";
import path from "path";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function deleteOldAvatars(dir: string, userId: string, keepFilename: string) {
  try {
    const files = await readdir(dir);
    for (const file of files) {
      if (file.startsWith(userId + ".") && file !== keepFilename) {
        await unlink(path.join(dir, file)).catch(() => {});
      }
    }
  } catch {}
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, and WebP are allowed" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File must be under 2MB" }, { status: 400 });
    }

    const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
    const filename = `${userId}.${ext}`;
    const dir = path.join(process.cwd(), "public", "avatars");
    await mkdir(dir, { recursive: true });

    // Delete any previous avatar files for this user (handles extension changes)
    await deleteOldAvatars(dir, userId, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);

    const avatarUrl = `/api/avatars/${filename}?t=${Date.now()}`;
    const profile = await updateProfile(userId, { avatar: avatarUrl });

    return NextResponse.json({ profile, avatarUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
