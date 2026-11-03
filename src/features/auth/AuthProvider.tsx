import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../services/supabase";
import { clearPrivateRecovery } from "../persistence/recovery";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string;
  retry: () => void;
};
const AuthContext = createContext<AuthState>({
  user: null,
  loading: false,
  error: "",
  retry: () => {},
});
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!supabase);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    let receivedEvent = false;
    setLoading(true);
    setError("");
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === "SIGNED_OUT") clearPrivateRecovery();
      receivedEvent = true;
      if (active) {
        setUser(session?.user ?? null);
        setLoading(false);
        setError("");
      }
    });
    supabase.auth
      .getSession()
      .then(({ data, error: failure }) => {
        if (!active || receivedEvent) return;
        setUser(data.session?.user ?? null);
        setLoading(false);
        if (failure)
          setError(
            "Could not restore your account session. Retry before editing saved work.",
          );
      })
      .catch(() => {
        if (active) {
          setLoading(false);
          setError(
            "Could not restore your account session. Retry before editing saved work.",
          );
        }
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [attempt]);
  return (
    <AuthContext.Provider
      value={{ user, loading, error, retry: () => setAttempt((n) => n + 1) }}
    >
      {children}
    </AuthContext.Provider>
  );
}
