// Disposable real PostgreSQL instance. Never connects to or resets an existing database.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import net from "node:net";
import assert from "node:assert/strict";
import pg from "pg";

const windows = process.platform === "win32";
const discovered = spawnSync("pg_config", ["--bindir"], { encoding: "utf8" });
const bin =
  process.env.PG_BIN ||
  (discovered.status === 0
    ? discovered.stdout.trim()
    : windows
      ? "C:/Program Files/PostgreSQL/18/bin"
      : "/usr/lib/postgresql/16/bin");
const exe = (name) => join(bin, name + (windows ? ".exe" : ""));
if (!existsSync(exe("initdb")))
  throw new Error("Install PostgreSQL or set PG_BIN to its bin directory.");
const root = mkdtempSync(join(tmpdir(), "datum-rls-"));
const data = join(root, "data");
const port = await new Promise((resolve) => {
  const s = net.createServer();
  s.listen(0, "127.0.0.1", () => {
    const port = s.address().port;
    s.close(() => resolve(port));
  });
});
function run(name, args) {
  const r = spawnSync(exe(name), args, {
    encoding: "utf8",
    windowsHide: true,
    stdio: name === "pg_ctl" ? "ignore" : "pipe",
    timeout: 60000,
  });
  if (r.status !== 0)
    throw new Error(
      `${name}: ${r.stderr ?? ""}\n${r.stdout ?? ""}\n${existsSync(join(root, "postgres.log")) ? readFileSync(join(root, "postgres.log"), "utf8") : "No PostgreSQL log created"}`,
    );
}
const clients = [];
let started = false;
let passed = 0;
const A = "00000000-0000-4000-8000-000000000001",
  B = "00000000-0000-4000-8000-000000000002";
async function check(name, fn) {
  await fn();
  passed++;
  console.log(`PASS ${name}`);
}
async function denied(promise, code = "42501") {
  await assert.rejects(promise, (e) => e.code === code);
}
async function client() {
  const c = new pg.Client({
    host: "127.0.0.1",
    port,
    user: "datum_test_admin",
    database: "postgres",
  });
  await c.connect();
  clients.push(c);
  return c;
}
try {
  run("initdb", [
    "-D",
    data,
    "-U",
    "datum_test_admin",
    "-A",
    "trust",
    "--no-locale",
    "--encoding=UTF8",
  ]);
  run("pg_ctl", [
    "-D",
    data,
    "-l",
    join(root, "postgres.log"),
    "-o",
    `-h 127.0.0.1 -p ${port}${windows ? "" : ` -k ${root}`}`,
    "-w",
    "start",
  ]);
  started = true;
  const admin = await client();
  // Minimal Supabase Auth boundary fixture. Actual PostgreSQL roles, policies and RPCs run below.
  // This does NOT test GoTrue/email transport, JWT verification or a hosted Supabase project.
  await admin.query(`create role anon nologin; create role authenticated nologin; create role service_role nologin;
    create schema auth; create table auth.users(id uuid primary key,email text unique);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth,public to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;`);
  for (const file of readdirSync("supabase/migrations")
    .filter((f) => f.endsWith(".sql"))
    .sort())
    await admin.query(readFileSync("supabase/migrations/" + file, "utf8"));
  await admin.query(readFileSync("supabase/seed.sql", "utf8"));
  await admin.query(readFileSync("supabase/seed.sql", "utf8"));
  await admin.query("insert into auth.users values($1,$2),($3,$4)", [
    A,
    "a@example.test",
    B,
    "b@example.test",
  ]);
  const a = await client(),
    b = await client(),
    anon = await client();
  for (const [c, id] of [
    [a, A],
    [b, B],
  ]) {
    await c.query("set role authenticated");
    await c.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
  }
  await anon.query("set role anon");
  const save = (c, id, body, revision = 0) =>
    c.query("select (public.save_draft($1,1,$2::jsonb,$3,auth.uid())).*", [
      id,
      JSON.stringify(body),
      revision,
    ]);
  const mission = {
    hypothesis: "Rain may matter",
    code: "print(1)",
    query: "Rain",
    panel: "Data",
  };
  await check("all exposed tables have RLS", async () => {
    const r = await admin.query(
      "select relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity",
    );
    assert.equal(r.rowCount, 0);
  });
  await check("idempotent seed and anonymous published content", async () =>
    assert.equal(
      (await anon.query("select * from public.content_items")).rowCount,
      14,
    ),
  );
  await admin.query(
    "insert into public.content_items values('hidden',1,'lesson','Hidden',false,now())",
  );
  await check("unpublished content hidden and cannot be saved", async () => {
    assert.equal(
      (await a.query("select * from public.content_items where id='hidden'"))
        .rowCount,
      0,
    );
    await denied(save(a, "hidden", { reflection: "no" }), "22023");
  });
  await check("profile trigger creates independent profiles", async () => {
    assert.equal(
      (await a.query("select * from public.profiles")).rows[0].user_id,
      A,
    );
    assert.equal(
      (await b.query("select * from public.profiles")).rows[0].user_id,
      B,
    );
  });
  await check(
    "owner profile edit allowed; cross-user edit affects zero",
    async () => {
      assert.equal(
        (
          await a.query(
            "update public.profiles set display_name=$1 where user_id=$2",
            ["Alice", A],
          )
        ).rowCount,
        1,
      );
      assert.equal(
        (
          await b.query(
            "update public.profiles set display_name=$1 where user_id=$2",
            ["Mallory", A],
          )
        ).rowCount,
        0,
      );
    },
  );
  await check("profile identity cannot be changed", async () =>
    denied(
      a.query("update public.profiles set user_id=$1 where user_id=$2", [B, A]),
    ),
  );
  await check("anonymous draft reads and writes denied", async () => {
    await denied(anon.query("select * from public.user_drafts"));
    await denied(save(anon, "observations", { reflection: "no" }));
  });
  await check("owner draft save and restore", async () => {
    const r = await save(a, "observations", { reflection: "A reflection" });
    assert.equal(r.rows[0].revision, 1);
    assert.equal(
      (await a.query("select * from public.user_drafts")).rowCount,
      1,
    );
  });
  await check("other user cannot read draft", async () =>
    assert.equal(
      (await b.query("select * from public.user_drafts")).rowCount,
      0,
    ),
  );
  await check("account-switch guard rejects stale-user payloads", async () => {
    await denied(
      b.query(
        "select public.save_draft('hypotheses',1,'{\"reflection\":\"private A\"}',0,$1)",
        [A],
      ),
    );
    await denied(b.query("select public.import_guest_drafts('[]',$1)", [A]));
  });
  await check("direct inserts and forged owners denied", async () =>
    denied(
      b.query(
        "insert into public.user_drafts(user_id,content_id,content_version,body) values($1,'observations',1,'{}')",
        [A],
      ),
    ),
  );
  await check("direct updates and deletes denied", async () => {
    await denied(b.query("update public.user_drafts set revision=9"));
    await denied(a.query("delete from public.user_drafts"));
  });
  await check("server timestamp and revision protected", async () =>
    denied(
      a.query("update public.user_drafts set updated_at=now(),revision=100"),
    ),
  );
  await check("idempotent retry does not increment revision", async () =>
    assert.equal(
      (await save(a, "observations", { reflection: "A reflection" })).rows[0]
        .revision,
      1,
    ),
  );
  await check("stale save rejects without overwriting", async () => {
    await denied(save(a, "observations", { reflection: "stale" }), "40001");
    assert.equal(
      (await a.query("select body from public.user_drafts")).rows[0].body
        .reflection,
      "A reflection",
    );
  });
  await check("valid versioned update", async () =>
    assert.equal(
      (await save(a, "observations", { reflection: "Updated" }, 1)).rows[0]
        .revision,
      2,
    ),
  );
  await check("independent user can save same content", async () =>
    assert.equal(
      (await save(b, "observations", { reflection: "B reflection" })).rows[0]
        .user_id,
      B,
    ),
  );
  await check("oversize and forged grade fields rejected", async () => {
    await denied(
      save(a, "hypotheses", { reflection: "x".repeat(2001) }),
      "22023",
    );
    await denied(
      save(a, "hypotheses", { reflection: "x", verified_score: 1 }),
      "22023",
    );
    await denied(
      save(a, "delivery-delay", { ...mission, panel: null }),
      "22023",
    );
  });
  await check("progress belongs to owner and is not mastery", async () => {
    const rows = (await a.query("select * from public.user_lesson_progress"))
      .rows;
    assert.equal(rows.length, 1);
    assert.equal(rows[0].status, "reflection_saved");
    await denied(
      a.query("update public.user_lesson_progress set status='complete'"),
    );
  });
  await check(
    "mission session saved without artificial completion",
    async () => {
      await save(a, "delivery-delay", mission);
      assert.equal(
        (await a.query("select stage from public.user_mission_runs")).rows[0]
          .stage,
        "BRIEF",
      );
      assert.equal(
        (await b.query("select * from public.user_mission_runs")).rowCount,
        0,
      );
      await denied(
        a.query("update public.user_mission_runs set stage='COMPLETE'"),
      );
    },
  );
  await check("attempt writes and scores denied", async () => {
    for (const t of ["quiz_attempts", "practice_attempts"]) {
      await denied(a.query(`update public.${t} set verified_score=1`));
      await denied(a.query(`insert into public.${t}(user_id) values($1)`, [A]));
    }
  });
  await check("private grading keys inaccessible", async () =>
    denied(a.query("select * from private.assessment_keys")),
  );
  await admin.query(
    "insert into public.content_items(id,version,kind,title,published) values('test-quiz',1,'quiz','Test quiz',true),('test-practice',1,'practice','Test practice',true)",
  );
  for (const uid of [A, B]) {
    await admin.query(
      "insert into public.quiz_attempts(user_id,content_id,content_version,request_id,verified_score) values($1,'test-quiz',1,gen_random_uuid(),0.5)",
      [uid],
    );
    await admin.query(
      "insert into public.practice_attempts(user_id,content_id,content_version,request_id,code,practice_passed) values($1,'test-practice',1,gen_random_uuid(),'print(1)',true)",
      [uid],
    );
  }
  await check(
    "quiz and practice attempts readable only by their owner",
    async () => {
      for (const table of ["quiz_attempts", "practice_attempts"])
        for (const [c, uid] of [
          [a, A],
          [b, B],
        ]) {
          const rows = (await c.query(`select * from public.${table}`)).rows;
          assert.equal(rows.length, 1);
          assert.equal(rows[0].user_id, uid);
        }
    },
  );
  await check("content type integrity rejects a lesson as a quiz", async () =>
    denied(
      admin.query(
        "insert into public.quiz_attempts(user_id,content_id,content_version,request_id) values($1,'observations',1,gen_random_uuid())",
        [A],
      ),
      "23503",
    ),
  );
  await check("anonymous RPC and export denied", async () => {
    await denied(
      anon.query("select public.import_guest_drafts('[]',auth.uid())"),
    );
    await denied(anon.query("select public.export_my_data()"));
  });
  await check(
    "guest import preserves cloud conflicts and can be retried",
    async () => {
      const entries = [
        {
          content_id: "observations",
          content_version: 1,
          body: { reflection: "guest conflicting" },
        },
        {
          content_id: "hypotheses",
          content_version: 1,
          body: { reflection: "guest new" },
        },
      ];
      for (let i = 0; i < 2; i++) {
        const r = await a.query(
          "select public.import_guest_drafts($1,auth.uid()) as result",
          [JSON.stringify(entries)],
        );
        assert.deepEqual(r.rows[0].result, { imported: 1, kept: 1 });
      }
      assert.equal(
        (
          await a.query(
            "select body from public.user_drafts where content_id='observations'",
          )
        ).rows[0].body.reflection,
        "Updated",
      );
    },
  );
  await check("invalid batch rolls back valid preceding inserts", async () => {
    await denied(
      a.query("select public.import_guest_drafts($1,auth.uid())", [
        JSON.stringify([
          {
            content_id: "charts",
            content_version: 1,
            body: { reflection: "valid" },
          },
          {
            content_id: "zzz-invalid",
            content_version: 1,
            body: { reflection: "invalid" },
          },
        ]),
      ]),
      "22023",
    );
    assert.equal(
      (
        await a.query(
          "select * from public.user_drafts where content_id='charts'",
        )
      ).rowCount,
      0,
    );
  });
  await check("owner export excludes other user", async () => {
    const value = (await a.query("select public.export_my_data() as result"))
      .rows[0].result;
    for (const rows of Object.values(value.data))
      for (const row of rows) assert.equal(row.user_id, A);
  });
  await check("concurrent writes reject one stale revision", async () => {
    const second = await client();
    await second.query("set role authenticated");
    await second.query("select set_config('request.jwt.claim.sub',$1,false)", [
      A,
    ]);
    const results = await Promise.allSettled([
      save(a, "observations", { reflection: "parallel 1" }, 2),
      save(second, "observations", { reflection: "parallel 2" }, 2),
    ]);
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal(
      results.find((r) => r.status === "rejected").reason.code,
      "40001",
    );
  });
  await check(
    "child-parent owner integrity even for server inserts",
    async () => {
      const run = (await a.query("select id from public.user_mission_runs"))
        .rows[0].id;
      await denied(
        admin.query(
          "insert into public.quiz_attempts(user_id,content_id,content_version,run_id,request_id) values($1,'test-quiz',1,$2,gen_random_uuid())",
          [B, run],
        ),
        "23503",
      );
    },
  );
  await check(
    "learning documents enforce ownership, revisions and protected writes",
    async () => {
      const body = { code: "print(1)", attempts: [] };
      const saveDoc = (c, owner, revision, payload = body) =>
        c.query(
          "select * from public.save_learning_document('practice-count',1,$1,$2,$3)",
          [payload, revision, owner],
        );
      assert.equal((await saveDoc(a, A, 0)).rows[0].revision, 1);
      assert.equal((await saveDoc(a, A, 0)).rows[0].revision, 1);
      assert.equal(
        (await b.query("select * from public.learning_documents")).rowCount,
        0,
      );
      await denied(saveDoc(b, A, 0));
      await denied(a.query("update public.learning_documents set revision=9"));
      await denied(b.query("delete from public.learning_documents"));
      await denied(saveDoc(a, A, 0, { ...body, code: "changed" }), "40001");
      await denied(saveDoc(a, A, 1, { ...body, verified_score: 1 }), "22023");
    },
  );
  await check(
    "quiz grades authored answers only on the server and retries idempotently",
    async () => {
      // Independent hand-validated fixtures, not answers read back from the solution table.
      const answers = {
        rows: "delivery",
        types: ["weather", "rush"],
        causal: "false",
        mean: 30,
        median: 25,
        output: "30",
        missing: "inspect",
        outliers: "median",
        split: "train",
        sample: "false",
        spread: 0,
        evidence: ["source", "limits"],
      };
      const request = "10000000-0000-4000-8000-000000000001";
      const grade = (c, owner, payload = answers, id = request) =>
        c.query("select * from public.grade_delivery_quiz($1,$2,$3)", [
          id,
          payload,
          owner,
        ]);
      const result = (await grade(a, A)).rows[0];
      assert.equal(Number(result.verified_score), 1);
      assert.equal(result.feedback.length, 12);
      assert.equal((await grade(a, A)).rows[0].id, result.id);
      await denied(grade(b, A));
      await denied(grade(a, A, { ...answers, mean: 31 }), "22023");
      await denied(
        grade(a, A, { mean: 30 }, "10000000-0000-4000-8000-000000000002"),
        "22023",
      );
      const wrong = {
        ...answers,
        mean: 31,
        types: ["distance"],
        evidence: ["color"],
      };
      const partial = (
        await grade(a, A, wrong, "10000000-0000-4000-8000-000000000003")
      ).rows[0];
      assert.equal(Number(partial.verified_score), 0.75);
      assert.equal(
        (
          await b.query("select * from public.quiz_attempts where id=$1", [
            result.id,
          ])
        ).rowCount,
        0,
      );
      await denied(
        grade(
          a,
          A,
          { ...answers, types: ["rush", "rush"] },
          "10000000-0000-4000-8000-000000000004",
        ),
        "22023",
      );
    },
  );
  await check(
    "mentor budgets are service-only and enforce per-minute limits",
    async () => {
      await denied(a.query("select public.consume_mentor_budget($1)", [A]));
      await denied(b.query("select * from private.mentor_requests"));
      for (let i = 0; i < 3; i++)
        assert.equal(
          (
            await admin.query("select public.consume_mentor_budget($1) as ok", [
              A,
            ])
          ).rows[0].ok,
          true,
        );
      assert.equal(
        (
          await admin.query("select public.consume_mentor_budget($1) as ok", [
            A,
          ])
        ).rows[0].ok,
        false,
      );
    },
  );
  await check(
    "mentor daily user and global budgets reject over-budget calls",
    async () => {
      await admin.query("delete from private.mentor_requests");
      await admin.query(
        "insert into private.mentor_requests(user_id,created_at) select $1,now()-interval '2 hours' from generate_series(1,20)",
        [A],
      );
      assert.equal(
        (
          await admin.query("select public.consume_mentor_budget($1) as ok", [
            A,
          ])
        ).rows[0].ok,
        false,
      );
      await admin.query(
        "insert into private.mentor_requests(user_id,created_at) select $1,now()-interval '2 hours' from generate_series(1,980)",
        [A],
      );
      assert.equal(
        (
          await admin.query("select public.consume_mentor_budget($1) as ok", [
            B,
          ])
        ).rows[0].ok,
        false,
      );
    },
  );
  await check("auth deletion cascades owned records", async () => {
    await admin.query("delete from auth.users where id=$1", [A]);
    for (const t of [
      "profiles",
      "user_drafts",
      "user_lesson_progress",
      "user_mission_runs",
      "learning_documents",
      "quiz_attempts",
    ])
      assert.equal(
        (await admin.query(`select * from public.${t} where user_id=$1`, [A]))
          .rowCount,
        0,
      );
    assert.equal(
      (await b.query("select * from public.user_drafts")).rowCount,
      1,
    );
  });
  console.log(
    `${passed} database checks passed against isolated PostgreSQL; two independent authenticated identity sessions. Hosted Auth/email not tested.`,
  );
} finally {
  for (const c of clients) await c.end().catch(() => {});
  if (started) run("pg_ctl", ["-D", data, "-m", "fast", "-w", "stop"]);
}
