import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/shared";
import { configurationMessage, supabase } from "../../services/supabase";
import { useAuth } from "./AuthProvider";
import { clearGuest, listGuest } from "../persistence/guest";
import { downloadJson } from "../persistence/repository";

export function AccountPanel() {
  const { user, loading, error: authError, retry } = useAuth();
  const [deleteText, setDeleteText] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [profileReady, setProfileReady] = useState(false);
  const [guestCount, setGuestCount] = useState(0);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    try {
      setGuestCount(
        listGuest().filter((d) => d.content_id !== "learner-navigation").length,
      );
    } catch {
      setError(
        "Guest storage is unreadable. Export or recover the browser data before importing it.",
      );
    }
  }, [refresh]);
  useEffect(() => {
    let active = true;
    if (user && supabase) {
      setProfileReady(false);
      supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single()
        .then(({ data, error }) => {
          if (!active) return;
          if (error)
            setError(
              "Profile could not be loaded. Check the connection and database setup, then retry.",
            );
          else {
            setName(data.display_name);
            setProfileReady(true);
          }
        });
    }
    return () => {
      active = false;
    };
  }, [user, refresh]);
  async function action(work: () => Promise<void>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await work();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "The request failed. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function send() {
    await action(async () => {
      if (!supabase) return;
      const parsed = z.email().safeParse(email.trim());
      if (!parsed.success) throw new Error("Enter a valid email address.");
      const { error } = await supabase.auth.signInWithOtp({
        email: parsed.data,
        options: { shouldCreateUser: true },
      });
      if (error) throw new Error(error.message);
      setSent(true);
      setMessage(
        "Check your email for a sign-in code. Delivery may take a moment.",
      );
    });
  }
  async function verify() {
    await action(async () => {
      if (!supabase) return;
      if (!/^\d{6,10}$/.test(token))
        throw new Error("Enter the numeric code from your email.");
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: "email",
      });
      if (error) throw new Error(error.message);
    });
  }
  return (
    <section className="account-panel" aria-labelledby="account-heading">
      <h2 id="account-heading">Your account & saved work</h2>
      {loading ? (
        <p role="status">Restoring your session…</p>
      ) : authError ? (
        <>
          <p role="alert">{authError}</p>
          <Button onClick={retry}>Retry session</Button>
        </>
      ) : user ? (
        <>
          <Badge tone="teal">SIGNED IN</Badge>
          <p className="muted">{user.email}</p>
          <label htmlFor="display-name">Display name</label>
          <input
            id="display-name"
            maxLength={80}
            value={name}
            disabled={busy || !profileReady}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="action-row">
            <Button
              disabled={busy || !profileReady}
              onClick={() =>
                void action(async () => {
                  const { error } = await supabase!
                    .from("profiles")
                    .update({ display_name: name.trim() })
                    .eq("user_id", user.id)
                    .select("user_id")
                    .single();
                  if (error) throw new Error(error.message);
                  setMessage("Profile saved.");
                })
              }
            >
              Save profile
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setRefresh((n) => n + 1)}
            >
              Reload profile
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                void action(async () => {
                  const { error } = await supabase!.auth.signOut({
                    scope: "local",
                  });
                  if (error) throw new Error(error.message);
                })
              }
            >
              Sign out
            </Button>
          </div>
          <p className="small muted">
            Save open drafts before signing out. Account data is loaded only for
            the signed-in user.
          </p>
        </>
      ) : supabase ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void (sent ? verify() : send());
          }}
        >
          <p className="muted">
            Sign in or create an account using a code sent to your email. Guest
            work is imported only if you choose to import it.
          </p>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={email}
            disabled={busy || sent}
            onChange={(e) => setEmail(e.target.value)}
          />
          {sent && (
            <>
              <label htmlFor="otp">Email sign-in code</label>
              <input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6,10}"
                required
                maxLength={10}
                value={token}
                disabled={busy}
                onChange={(e) => setToken(e.target.value)}
              />
            </>
          )}
          <div className="action-row">
            <Button type="submit" disabled={busy}>
              {busy
                ? "Please wait…"
                : sent
                  ? "Verify code"
                  : "Send sign-in code"}
            </Button>
            {sent && (
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => {
                  setSent(false);
                  setToken("");
                }}
              >
                Change email or request a new code
              </Button>
            )}
          </div>
        </form>
      ) : (
        <>
          <Badge>GUEST MODE</Badge>
          <p className="muted">{configurationMessage}</p>
        </>
      )}
      <hr />
      <h3>Guest drafts on this device</h3>
      <p className="muted">
        {guestCount} saved drafts. Browser data may be lost if you clear
        storage. Keep an export before changing devices.
      </p>
      {user && (
        <>
          <p className="small muted">
            Import adds missing drafts to this account. Existing cloud drafts
            are kept. Your local backup remains until you clear it.
          </p>
          <Button
            disabled={busy || !guestCount}
            onClick={() =>
              void action(async () => {
                const drafts = listGuest();
                const { data, error } = await supabase!.rpc(
                  "import_guest_drafts",
                  {
                    p_owner: user.id,
                    p_drafts: drafts.map((d) => ({
                      content_id: d.content_id,
                      content_version: d.content_version,
                      body: d.body,
                    })),
                  },
                );
                if (error) throw new Error(error.message);
                const result = z
                  .object({
                    imported: z.number().int(),
                    kept: z.number().int(),
                  })
                  .parse(data);
                setMessage(
                  `${result.imported} drafts available in your account; ${result.kept} existing cloud drafts kept. Local backup retained.`,
                );
              })
            }
          >
            Import guest drafts into this account
          </Button>
        </>
      )}
      <div className="action-row">
        <Button
          variant="outline"
          disabled={busy}
          onClick={() =>
            void action(async () => {
              downloadJson("datum-guest-export.json", {
                schema_version: 1,
                exported_at: new Date().toISOString(),
                drafts: listGuest(),
              });
              setMessage("Guest export downloaded.");
            })
          }
        >
          Export guest drafts
        </Button>
        <Button
          variant="outline"
          disabled={busy || !guestCount}
          onClick={() => {
            if (
              window.confirm(
                "Delete guest drafts from this device? Export first if you need a backup. Cloud drafts are not affected.",
              )
            ) {
              void action(async () => {
                clearGuest();
                setRefresh((n) => n + 1);
                setMessage("Guest drafts removed from this device.");
              });
            }
          }}
        >
          Clear guest drafts
        </Button>
      </div>
      {user && (
        <>
          <hr />
          <h3>Your account data</h3>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() =>
              void action(async () => {
                const { data, error } = await supabase!.rpc("export_my_data");
                if (error) throw new Error(error.message);
                downloadJson("datum-account-export.json", data);
                setMessage("Account export downloaded.");
              })
            }
          >
            Export account data
          </Button>
          <label>
            Type DELETE MY ACCOUNT to permanently delete your cloud account
            <input
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              autoComplete="off"
            />
          </label>
          <Button
            variant="outline"
            disabled={busy || deleteText !== "DELETE MY ACCOUNT"}
            onClick={() => {
              if (
                !window.confirm(
                  "Permanently delete your cloud account and all its learning records? Export first if you need a copy.",
                )
              )
                return;
              void action(async () => {
                const { data, error } = await supabase!.functions.invoke(
                  "delete-account",
                  { body: { confirmation: deleteText } },
                );
                if (error || data?.deleted !== true)
                  throw new Error(
                    "Account deletion could not be verified. Your session is retained; retry later.",
                  );
                await supabase!.auth.signOut({ scope: "local" });
                setDeleteText("");
                setMessage(
                  "Cloud account deleted. Device-only guest drafts are separate.",
                );
              });
            }}
          >
            Delete cloud account
          </Button>
        </>
      )}
      <p className="small muted">
        Cloud account deletion requires the deployed deletion service. Export
        first; deletion removes owned records and cannot be undone here.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <p role="status">{message}</p>
    </section>
  );
}
