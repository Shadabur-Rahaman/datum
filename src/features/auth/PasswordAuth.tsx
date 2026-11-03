import { useState } from "react";
import { z } from "zod";
import { supabase } from "../../services/supabase";
import { Button } from "../../components/ui/button";
export function PasswordAuth({ signedIn = false }: { signedIn?: boolean }) {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit() {
    if (!supabase) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const address = signedIn ? "" : z.email().parse(email.trim());
      if ((signedIn || mode !== "reset") && password.length < 8)
        throw new Error("Use at least 8 characters for your password.");
      const redirect =
        new URL(import.meta.env.BASE_URL, window.location.origin).href +
        "#/settings";
      if (signedIn) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMessage("Password updated.");
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: address,
          password,
          options: { emailRedirectTo: redirect },
        });
        if (error) throw error;
        setMessage(
          data.session
            ? "Account created. Guest import is available below."
            : "Check your email for the verification link. Open it in this browser to finish signing up.",
        );
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(address, {
          redirectTo: redirect,
        });
        if (error) throw error;
        setMessage(
          "If this address has an account, a reset link will arrive. Open it in this browser, then set a new password in Account settings.",
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: address,
          password,
        });
        if (error) throw error;
        setMessage("Signed in.");
      }
      setPassword("");
    } catch (e) {
      setError(
        e instanceof z.ZodError
          ? "Enter a valid email address."
          : e instanceof Error
            ? e.message
            : "Authentication failed. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section aria-label="Password account">
      <h3>{signedIn ? "Set a new password" : "Password account"}</h3>
      {!signedIn && (
        <div className="action-row">
          {(["login", "signup", "reset"] as const).map((value) => (
            <Button
              key={value}
              variant="outline"
              disabled={busy}
              aria-pressed={mode === value}
              onClick={() => {
                setMode(value);
                setError("");
                setMessage("");
              }}
            >
              {value === "login"
                ? "Password login"
                : value === "signup"
                  ? "Create account"
                  : "Forgot password"}
            </Button>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        {!signedIn && (
          <label>
            Email for password account
            <input
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              disabled={busy}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        )}
        {(signedIn || mode !== "reset") && (
          <label>
            {signedIn ? "New password" : "Password"}
            <input
              type="password"
              required
              minLength={8}
              maxLength={128}
              autoComplete={
                signedIn || mode === "signup"
                  ? "new-password"
                  : "current-password"
              }
              value={password}
              disabled={busy}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        )}
        <Button type="submit" disabled={busy}>
          {busy
            ? "Please wait…"
            : signedIn
              ? "Update password"
              : mode === "login"
                ? "Log in"
                : mode === "signup"
                  ? "Sign up"
                  : "Send reset link"}
        </Button>
      </form>
      {error && <p role="alert">{error}</p>}
      <p role="status">{message}</p>
    </section>
  );
}
