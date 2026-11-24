/**
 * AL AMIN Portfolio OS — Trusted Server-Side Scheduled Publisher Edge Function
 * Invoke on a trusted schedule (Supabase Cron / pg_net / GitHub Actions cron)
 * when pg_cron is not used directly. Never runs on visitor requests.
 *
 * Required server-side secrets (Supabase Edge Function Secrets — NEVER frontend):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   CRON_PUBLISH_SECRET
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const cronSecret = Deno.env.get("CRON_PUBLISH_SECRET") || "";

  if (!supabaseUrl || !serviceRoleKey || !cronSecret) {
    return new Response(JSON.stringify({ error: "Scheduler server secrets not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token || !constantTimeEqual(token, cronSecret)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data, error } = await supabaseAdmin.rpc("publish_due_scheduled_content");
  if (error) {
    return new Response(JSON.stringify({ error: "Scheduled publisher execution failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: true, result: data }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
});
