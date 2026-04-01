import { NextResponse } from "next/server";
import { isDev } from "@/lib/session";

export async function GET() {
  return NextResponse.json({ isDev: await isDev() });
}
