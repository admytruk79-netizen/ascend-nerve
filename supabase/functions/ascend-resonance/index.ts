import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

// Mirror v1 -- the "Resonance Engine" mirror-engine.js calls.
//
// Deliberately deterministic, per AI_ENGINE_CONTRACT.md: no LLM call, no
// external network dependency, nothing that could assert attainment. It
// reads the student's own journal entries and reflects back word/phrase
// recurrence, an observation/interpretation balance and a prompting
// question -- the "AI Reflection Engine" role stays limited to organizing
// evidence the student already wrote, never deciding it.

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

const BOUNDARY =
  "Resonance reflects recurring patterns in your record. It does not determine attainment, diagnose you, or establish spiritual claims as fact.";

const STOPWORDS = new Set([
  "this","that","these","those","with","from","have","has","had","were","was",
  "been","being","about","into","onto","over","under","after","before","while",
  "then","than","when","where","what","which","would","could","should","there",
  "their","they","them","some","such","also","very","just","only","still",
  "again","today","because","doesn","didn","wasn","were","your","mine","myself",
  "practice","practiced","practicing","felt","feel","feeling","today's","during",
]);

type JournalRow = {
  observation: string | null;
  inner_state: string | null;
  life_application: string | null;
  interpretation: string | null;
  unresolved: string | null;
  entry_date: string;
};

function tokenize(text: string | null): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
}

function entryText(row: JournalRow): string {
  return [row.observation, row.inner_state, row.life_application, row.interpretation]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function wordFrequency(rows: JournalRow[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const row of rows) {
    for (const word of tokenize(entryText(row))) freq.set(word, (freq.get(word) || 0) + 1);
  }
  return freq;
}

function topThemes(rows: JournalRow[], limit = 4) {
  if (!rows.length) return [] as { label: string; trend?: string }[];
  const overall = wordFrequency(rows);
  const mid = Math.ceil(rows.length / 2);
  const earlierFreq = wordFrequency(rows.slice(0, mid));
  const recentFreq = wordFrequency(rows.slice(mid));
  return [...overall.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label]) => {
      const before = earlierFreq.get(label) || 0;
      const after = recentFreq.get(label) || 0;
      const trend = after > before ? "more recent" : before > after ? "earlier" : undefined;
      return trend ? { label, trend } : { label };
    });
}

function topPhrases(rows: JournalRow[], limit = 4) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const words = entryText(row)
      .replace(/[^a-z0-9\s']/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      counts.set(phrase, (counts.get(phrase) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label]) => ({ label }));
}

function topCooccurrences(rows: JournalRow[], themeWords: string[], limit = 3) {
  if (themeWords.length < 2) return [] as { pair: string }[];
  const counts = new Map<string, number>();
  for (const row of rows) {
    const text = entryText(row);
    const present = themeWords.filter((w) => text.includes(w));
    for (let i = 0; i < present.length; i++) {
      for (let j = i + 1; j < present.length; j++) {
        const pair = [present[i], present[j]].sort().join(" + ");
        counts.set(pair, (counts.get(pair) || 0) + 1);
      }
    }
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([pair]) => ({ pair }));
}

function truncate(text: string, max = 140): string {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}

function changeOverTime(rows: JournalRow[], themes: { label: string }[]) {
  if (rows.length < 2) return null;
  const earlierRow = rows[0];
  const recentRow = rows[rows.length - 1];
  const earlierText = earlierRow.observation || earlierRow.inner_state || "";
  const recentText = recentRow.observation || recentRow.inner_state || "";
  if (!earlierText && !recentText) return null;

  const earlierWhole = entryText(earlierRow);
  const recentWhole = entryText(recentRow);
  const persisted = themes.find((t) => earlierWhole.includes(t.label) && recentWhole.includes(t.label));
  const faded = themes.find((t) => earlierWhole.includes(t.label) && !recentWhole.includes(t.label));
  const observation = persisted
    ? `"${persisted.label}" appears in both your earlier and your most recent entries.`
    : faded
    ? `"${faded.label}" appeared earlier but not in your most recent entries.`
    : themes.length
    ? "Your recent entries use different recurring language than your earlier ones."
    : "";

  return {
    earlier: truncate(earlierText || "(no observation recorded)"),
    recent: truncate(recentText || "(no observation recorded)"),
    observation,
  };
}

const FALLBACK_QUESTIONS = [
  "What did you actually observe before interpretation?",
  "What changed when you returned attention more quickly?",
  "Where in your day did the practice show up unexpectedly?",
  "What resistance did you notice, and what did you do with it?",
];

function pickQuestion(themes: { label: string }[], entryCount: number): string {
  if (themes[0]) return `What have you noticed about "${themes[0].label}" that you hadn't named before?`;
  return FALLBACK_QUESTIONS[entryCount % FALLBACK_QUESTIONS.length];
}

function buildSummary(count: number, lifeApplication: number, unresolved: number): string {
  if (count === 0) return "Resonance begins with your own record.";
  const parts = [`You recorded ${count} ${count === 1 ? "entry" : "entries"}`];
  if (lifeApplication) parts.push(`${lifeApplication} connecting the practice to ordinary life`);
  if (unresolved) parts.push(`${unresolved} left deliberately unresolved`);
  return `${parts.join(", ")}.`;
}

async function relatedPractice(
  admin: ReturnType<typeof createClient>,
  stageId: string | null,
): Promise<string | null> {
  if (!stageId) return null;
  const { data: link } = await admin
    .from("path_stage_practices")
    .select("practice_id")
    .eq("stage_id", stageId)
    .eq("role", "primary")
    .maybeSingle();
  if (!link?.practice_id) return null;
  const { data: practice } = await admin
    .from("path_practices")
    .select("title")
    .eq("id", link.practice_id)
    .maybeSingle();
  return practice?.title || null;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authorization = request.headers.get("Authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return json({ error: "Authentication required" }, 401);

  let payload: { stage_id?: string; scope?: string } = {};
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }
  const scope = payload.scope === "all" ? "all" : "stage";
  const stageId = payload.stage_id || null;
  if (scope === "stage" && !stageId) return json({ error: "A current stage is required for this view." }, 400);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) return json({ error: "Resonance service unavailable" }, 503);

  const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: { user }, error: userError } = await admin.auth.getUser(token);
  if (userError || !user) return json({ error: "Session expired. Sign in again." }, 401);

  let query = admin
    .from("path_journal_entries")
    .select("observation,inner_state,life_application,interpretation,unresolved,entry_date")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: true });
  if (scope === "stage") query = query.eq("stage_id", stageId);

  const { data: rows, error: entriesError } = await query;
  if (entriesError) return json({ error: "Could not read journal entries" }, 500);
  const entries = (rows || []) as JournalRow[];

  const lifeApplicationCount = entries.filter((e) => e.life_application?.trim()).length;
  const unresolvedCount = entries.filter((e) => e.unresolved?.trim()).length;

  let trainingLogs = 0;
  try {
    const { count } = await admin
      .from("path_training_assignment_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    trainingLogs = count || 0;
  } catch {
    trainingLogs = 0;
  }

  const observationLength = entries.reduce((sum, e) => sum + (e.observation?.length || 0), 0);
  const interpretationLength = entries.reduce((sum, e) => sum + (e.interpretation?.length || 0), 0);
  const totalLength = observationLength + interpretationLength;

  const themes = topThemes(entries);
  const phrases = topPhrases(entries);
  const cooccurrences = topCooccurrences(entries, themes.map((t) => t.label));
  const confidence = entries.length === 0 ? "insufficient" : entries.length < 4 ? "emerging" : "clear";

  const related = await relatedPractice(admin, stageId).catch(() => null);

  return json({
    confidence,
    metrics: {
      journal_entries: entries.length,
      life_application: lifeApplicationCount,
      unresolved: unresolvedCount,
      training_logs: trainingLogs,
    },
    summary: buildSummary(entries.length, lifeApplicationCount, unresolvedCount),
    themes,
    change_over_time: changeOverTime(entries, themes),
    phrases,
    cooccurrences,
    question: pickQuestion(themes, entries.length),
    related_practice: related,
    observation_balance: { ratio: totalLength > 0 ? observationLength / totalLength : null },
    boundary: BOUNDARY,
  });
});
