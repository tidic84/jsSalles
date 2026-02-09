import { NextResponse } from "next/server";
import { getRooms } from "@/lib/queries";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session.loggedIn) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const rooms = await getRooms();
  return NextResponse.json(rooms);
}
