import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
// Missing configuration is a supported guest-only state, never a pretend connection.
export const supabase =
  url && key
    ? createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
        global: {
          fetch: (input, init) =>
            fetch(input, {
              ...init,
              signal: AbortSignal.any([
                ...(init?.signal ? [init.signal] : []),
                AbortSignal.timeout(15000),
              ]),
            }),
        },
      })
    : null;
export const configurationMessage =
  !url && !key
    ? "Cloud sign-in is not configured. You can save guest drafts on this device."
    : !url || !key
      ? "Cloud configuration is incomplete. Both the project URL and publishable key are required."
      : "";
