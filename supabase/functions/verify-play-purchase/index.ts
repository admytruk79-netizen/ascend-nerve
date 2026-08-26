import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.0";

// The only writer of ascend_entitlements for a Google Play purchase. The
// client (billing.js) never trusts its own local store.owned() state for a
// hard paywall -- it just forwards the purchase token here, and this
// function is the one place that talks to the Android Publisher API to
// confirm the purchase is real before granting access.

const PACKAGE_NAME = "com.ascend.path";
const PRODUCT_ACCESS_LEVEL: Record<string, "premium" | "lifetime"> = {
  ascend_path_monthly: "premium",
  ascend_path_annual: "premium",
  ascend_path_lifetime: "lifetime",
};

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

function base64url(bytes: ArrayBuffer | string): string {
  const raw = typeof bytes === "string" ? bytes : String.fromCharCode(...new Uint8Array(bytes));
  return btoa(raw).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

// Exchanges the Google service account's private key for a short-lived
// Android Publisher API access token via the standard JWT-bearer flow.
// Requires GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL and
// GOOGLE_PLAY_SERVICE_ACCOUNT_PRIVATE_KEY (PEM, \n escaped) set as Supabase
// Edge Function secrets -- see the service account created in Play
// Console > Setup > API access, granted "View financial data" +
// "Manage orders and subscriptions" permissions.
async function getGoogleAccessToken(): Promise<string> {
  const email = Deno.env.get("GOOGLE_PLAY_SERVICE_ACCOUNT_EMAIL");
  const rawKey = Deno.env.get("GOOGLE_PLAY_SERVICE_ACCOUNT_PRIVATE_KEY");
  if (!email || !rawKey) throw new Error("Google Play service account is not configured");

  const pem = rawKey.replace(/\\n/g, "\n");
  const pemBody = pem.replace(/-----BEGIN PRIVATE KEY-----/, "").replace(/-----END PRIVATE KEY-----/, "").replace(/\s+/g, "");
  const keyBytes = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBytes.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${base64url(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error_description || body.error || "Google auth failed");
  return body.access_token as string;
}

async function verifySubscription(accessToken: string, purchaseToken: string) {
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/subscriptionsv2/tokens/${purchaseToken}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message || "Google Play rejected this subscription token");
  const active = body.subscriptionState === "SUBSCRIPTION_STATE_ACTIVE" || body.subscriptionState === "SUBSCRIPTION_STATE_IN_GRACE_PERIOD";
  const expiresAt = body.lineItems?.[0]?.expiryTime ?? null;
  return { active, expiresAt };
}

async function acknowledgeSubscription(accessToken: string, productId: string, purchaseToken: string) {
  // subscriptionsv2 does not expose acknowledgement directly; the legacy
  // subscriptions.acknowledge endpoint still works for the base plan.
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/subscriptions/${productId}/tokens/${purchaseToken}:acknowledge`;
  await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } }).catch(() => {});
}

async function verifyProduct(accessToken: string, productId: string, purchaseToken: string) {
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/products/${productId}/tokens/${purchaseToken}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message || "Google Play rejected this purchase token");
  const active = body.purchaseState === 0; // 0 = purchased, 1 = cancelled, 2 = pending
  if (active && body.acknowledgementState === 0) {
    const ackUrl = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/products/${productId}/tokens/${purchaseToken}:acknowledge`;
    await fetch(ackUrl, { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } }).catch(() => {});
  }
  return { active };
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authorization = request.headers.get("Authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return json({ error: "Authentication required" }, 401);

  let payload: { productId?: string; purchaseToken?: string; productType?: string } = {};
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }
  const { productId, purchaseToken } = payload;
  if (!productId || !purchaseToken) return json({ error: "Missing productId or purchaseToken" }, 400);
  const accessLevel = PRODUCT_ACCESS_LEVEL[productId];
  if (!accessLevel) return json({ error: "Unknown product" }, 400);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) return json({ error: "Verification service unavailable" }, 503);

  const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: { user }, error: userError } = await admin.auth.getUser(token);
  if (userError || !user) return json({ error: "Session expired. Sign in again." }, 401);

  let active = false;
  let expiresAt: string | null = null;
  try {
    const accessToken = await getGoogleAccessToken();
    if (accessLevel === "premium") {
      const result = await verifySubscription(accessToken, purchaseToken);
      active = result.active;
      expiresAt = result.expiresAt;
      if (active) await acknowledgeSubscription(accessToken, productId, purchaseToken);
    } else {
      const result = await verifyProduct(accessToken, productId, purchaseToken);
      active = result.active;
    }
  } catch (err) {
    console.error("verify-play-purchase: Google verification failed", err);
    return json({ error: err instanceof Error ? err.message : "Could not verify this purchase with Google Play" }, 502);
  }

  if (!active) return json({ verified: false, reason: "Purchase is not currently active" }, 200);

  const { error: deactivateError } = await admin
    .from("ascend_entitlements")
    .update({ is_active: false })
    .eq("user_id", user.id)
    .eq("is_active", true);
  if (deactivateError) return json({ error: "Could not update prior entitlement" }, 500);

  const { error: insertError } = await admin.from("ascend_entitlements").insert({
    user_id: user.id,
    access_level: accessLevel,
    source: "google_play",
    starts_at: new Date().toISOString(),
    expires_at: expiresAt,
    is_active: true,
  });
  if (insertError) return json({ error: "Could not record entitlement" }, 500);

  return json({ verified: true, access_level: accessLevel, expires_at: expiresAt });
});
