// Optional real Supabase Auth/PostgREST integration. Use a disposable TEST project only.
// Admin key is read in Node, never Vite, never persisted or printed.
import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
const url = process.env.SUPABASE_TEST_URL,
  key = process.env.SUPABASE_TEST_PUBLISHABLE_KEY,
  adminKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
if (!url || !key || !adminKey) {
  console.error(
    "Not run: set SUPABASE_TEST_URL, SUPABASE_TEST_PUBLISHABLE_KEY and SUPABASE_TEST_SERVICE_ROLE_KEY for a disposable migrated test project.",
  );
  process.exit(2);
}
const options = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};
const admin = createClient(url, adminKey, options),
  a = createClient(url, key, options),
  b = createClient(url, key, options),
  restored = createClient(url, key, options);
const created = [];
const ok = ({ data, error }) => {
  if (error) throw new Error(error.message);
  return data;
};
try {
  for (const client of [a, b]) {
    const email = `datum-test-${randomUUID()}@example.test`;
    const { user } = ok(
      await admin.auth.admin.createUser({ email, email_confirm: true }),
    );
    created.push(user.id);
    const link = ok(
      await admin.auth.admin.generateLink({ type: "magiclink", email }),
    );
    ok(
      await client.auth.verifyOtp({
        email,
        token: link.properties.email_otp,
        type: "email",
      }),
    );
  }
  const saved = ok(
    await a.rpc("save_draft", {
      p_content_id: "observations",
      p_version: 1,
      p_body: { reflection: "Real Auth integration" },
      p_expected_revision: 0,
      p_owner: created[0],
    }),
  );
  assert.equal((Array.isArray(saved) ? saved[0] : saved).user_id, created[0]);
  assert.equal(
    ok(await b.from("user_drafts").select("*").eq("user_id", created[0]))
      .length,
    0,
  );
  const denied = await b
    .from("user_drafts")
    .insert({
      user_id: created[0],
      content_id: "observations",
      content_version: 1,
      body: { reflection: "forged" },
    });
  assert(denied.error);
  const session = ok(await a.auth.getSession()).session;
  ok(
    await restored.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    }),
  );
  assert.equal(
    ok(
      await restored
        .from("user_drafts")
        .select("*")
        .eq("content_id", "observations")
        .single(),
    ).body.reflection,
    "Real Auth integration",
  );
  const imported = ok(
    await restored.rpc("import_guest_drafts", {
      p_owner: created[0],
      p_drafts: [
        {
          content_id: "hypotheses",
          content_version: 1,
          body: { reflection: "guest migrated" },
        },
      ],
    }),
  );
  assert.equal(imported.imported, 1);
  assert.equal(ok(await b.from("user_lesson_progress").select("*")).length, 0);
  assert(
    (
      await a
        .from("quiz_attempts")
        .update({ verified_score: 1 })
        .eq("user_id", created[0])
    ).error,
  );
  const exported = ok(await a.rpc("export_my_data"));
  assert.equal(exported.data.user_drafts.length, 2);
  assert.equal(exported.data.profiles.length, 1);
  assert.equal(exported.data.profiles[0].user_id, created[0]);
  console.log(
    "PASS real OTP verification, two independent Auth users, profile trigger, draft save, session recovery, cross-user denial, guest import, protected scores and export. SMTP delivery still requires manual verification.",
  );
} finally {
  for (const client of [a, b, restored])
    await client.auth.signOut().catch(() => {});
  for (const id of created) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error)
      console.error(`Cleanup required for test user ${id}: ${error.message}`);
  }
}
