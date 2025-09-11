export async function handler(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  let body = {};
  try { body = JSON.parse(event.body || "{}"); } catch {}
  const adminPass = event.headers["x-admin-pass"];
  if (adminPass !== process.env.ADMIN_PASS) return { statusCode: 401, body: "Unauthorized" };

  const { week_iso, day, slot } = body || {};
  if (!week_iso || !day || !slot) return { statusCode: 400, body: "Missing week_iso/day/slot" };

  const url = `${process.env.SUPABASE_URL}/rest/v1/kla_bookings`
            + `?week_iso=eq.${encodeURIComponent(week_iso)}`
            + `&day=eq.${encodeURIComponent(day)}`
            + `&slot=eq.${encodeURIComponent(slot)}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal"
    }
  });

  const text = await res.text();
  if (!res.ok) return { statusCode: res.status, body: text || "Delete failed" };
  return { statusCode: 200, body: "Deleted" };
}
