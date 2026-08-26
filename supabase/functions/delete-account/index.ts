import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authorization = request.headers.get("Authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return json({ error: "Authentication required" }, 401);

  let payload: { confirmation?: string } = {};
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }
  if (payload.confirmation !== "DELETE") return json({ error: "Deletion was not confirmed" }, 400);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) return json({ error: "Deletion service unavailable" }, 503);

  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: userError } = await admin.auth.getUser(token);
  if (userError || !user) return json({ error: "Session expired. Sign in again." }, 401);

  const deleteByUserId = [
    "ascend_entitlements",
    "path_ai_reflections",
    "path_journal_entries",
    "path_practice_sessions",
    "path_student_marker_observations",
    "path_student_progress",
    "path_training_assignment_logs",
    "path_weekly_reviews",
    "training_branch_progress",
    "training_branch_repetition_log",
  ];

  for (const table of deleteByUserId) {
    const { error } = await admin.from(table).delete().eq("user_id", user.id);
    if (error) return json({ error: `Could not remove ${table}` }, 500);
  }

  for (const column of ["teacher_id", "student_id"]) {
    for (const table of ["path_teacher_reviews", "path_teacher_relationships"]) {
      const { error } = await admin.from(table).delete().eq(column, user.id);
      if (error) return json({ error: `Could not remove ${table}` }, 500);
    }
  }

  const { error: keyError } = await admin
    .from("ascend_tester_codes")
    .update({ redeemed_by: null, redeemed_device: null })
    .eq("redeemed_by", user.id);
  if (keyError) return json({ error: "Could not anonymize tester access" }, 500);

  const { error: pathProfileError } = await admin.from("path_profiles").delete().eq("user_id", user.id);
  if (pathProfileError) return json({ error: "Could not remove the ASCEND profile" }, 500);

  // Legacy profile-linked records cascade from public.profiles.
  const { error: legacyProfileError } = await admin.from("profiles").delete().eq("id", user.id);
  if (legacyProfileError) return json({ error: "Could not remove the legacy profile" }, 500);

  const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id, false);
  if (deleteUserError) return json({ error: "Could not remove the login account" }, 500);

  return json({ deleted: true });
});
