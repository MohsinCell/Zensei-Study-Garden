import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id ?? null;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });
    if (!user) return null;
  }

  return userId;
}

export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export async function requireDev(): Promise<string> {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isDev: true },
  });
  if (!user?.isDev) throw new Error("Unauthorized");
  return userId;
}

export async function isDev(): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return false;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isDev: true },
    });
    return user?.isDev ?? false;
  } catch {
    return false;
  }
}
