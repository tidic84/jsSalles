import { NextRequest, NextResponse } from "next/server";
import { checkCredentials } from "@/lib/queries";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json({ error: "Champs requis" }, { status: 400 });
  }

  const valid = await checkCredentials(username, password);
  if (!valid) {
    return NextResponse.json({ error: "Identifiants incorrects" }, { status: 401 });
  }

  const session = await getSession();
  session.loggedIn = true;
  await session.save();

  return NextResponse.json({ success: true });
}
