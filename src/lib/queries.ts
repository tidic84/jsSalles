import { query } from "./db";
import bcrypt from "bcrypt";

export async function getRooms(univ?: string) {
  if (!univ) {
    const res = await query("SELECT univ, room_name, room_url FROM rooms");
    return res.rows;
  }
  const res = await query(
    "SELECT univ, room_name, room_url FROM rooms WHERE univ = $1",
    [univ]
  );
  return res.rows;
}

export async function getUnivs() {
  const res = await query("SELECT DISTINCT univ FROM rooms");
  return res.rows.map((r: { univ: string }) => r.univ);
}

export async function getVisites() {
  const res1 = await query(
    "SELECT visites_jour, visites FROM visites ORDER BY visites_jour"
  );
  const res2 = await query(
    "SELECT visites_jour, visites FROM visitesparutilisateur ORDER BY visites_jour"
  );

  const visitesMap: Record<string, number> = {};
  const visitesParUtilisateurMap: Record<string, number> = {};

  res1.rows.forEach(
    (row: { visites_jour: string | Date; visites: number }) => {
      const jour = new Date(row.visites_jour).toISOString().split("T")[0];
      visitesMap[jour] = row.visites;
    }
  );

  res2.rows.forEach(
    (row: { visites_jour: string | Date; visites: number }) => {
      const jour = new Date(row.visites_jour).toISOString().split("T")[0];
      visitesParUtilisateurMap[jour] = row.visites;
    }
  );

  return { visites: visitesMap, visitesParUtilisateur: visitesParUtilisateurMap };
}

export async function incrementVisites(jour: string) {
  const res = await query(
    "UPDATE visites SET visites = visites + 1 WHERE visites_jour = $1 RETURNING *",
    [jour]
  );
  if (res.rowCount === 0) {
    await query(
      "INSERT INTO visites (visites_jour, visites) VALUES ($1, 1)",
      [jour]
    );
  }
}

export async function incrementVisitesParUtilisateur(jour: string) {
  const res = await query(
    "UPDATE visitesparutilisateur SET visites = visites + 1 WHERE visites_jour = $1 RETURNING *",
    [jour]
  );
  if (res.rowCount === 0) {
    await query(
      "INSERT INTO visitesparutilisateur (visites_jour, visites) VALUES ($1, 1)",
      [jour]
    );
  }
}

export async function checkCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const res = await query("SELECT password FROM users WHERE username = $1", [
    username,
  ]);
  if (res.rows.length === 0) return false;
  return bcrypt.compare(password, res.rows[0].password);
}
