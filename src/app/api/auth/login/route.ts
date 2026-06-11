import { NextRequest, NextResponse } from "next/server";
import { checkCredentials } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import {
  clearAttempts,
  isRateLimited,
  recordFailedAttempt,
} from "@/lib/rate-limit";

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Trop de tentatives, réessayez dans 15 minutes" },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json({ error: "Champs requis" }, { status: 400 });
  }

  const valid = await checkCredentials(username, password);
  if (!valid) {
    recordFailedAttempt(ip);
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }

  clearAttempts(ip);
  const session = await getSession();
  session.loggedIn = true;
  await session.save();

  return NextResponse.json({ success: true });
}
