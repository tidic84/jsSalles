import { NextRequest, NextResponse } from "next/server";
import { getFreeRooms } from "@/lib/room-utils";
import { getUnivs } from "@/lib/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ univ: string }> }
) {
  const { univ } = await params;
  const univs = await getUnivs();
  if (!univs.includes(univ)) {
    return NextResponse.json({ error: "Universite non trouvee" }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");
  const time = searchParams.get("time");

  if (date && time) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^[0-2][0-9]:[0-5][0-9]$/;
    if (!dateRegex.test(date) || !timeRegex.test(time)) {
      return NextResponse.json({ error: "Format invalide" }, { status: 400 });
    }
  }

  const result = await getFreeRooms(date, time, univ);
  return NextResponse.json(result);
}
