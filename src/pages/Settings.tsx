import { Moon, Sun, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeading } from "../components/ui/shared";
import { Button } from "../components/ui/button";
import { AccountPanel } from "../features/auth/AccountPanel";
import { useAuth } from "../features/auth/AuthProvider";
export function SettingsPage({
  theme,
  setTheme,
}: {
  theme: string;
  setTheme: (theme: string) => void;
}) {
  const { user } = useAuth();
  return (
    <>
      <PageHeading
        eyebrow="WORKSPACE / PREFERENCES"
        title="Make room for your thinking."
        description="A few thoughtful defaults for your research workspace."
      />
      <section className="panel settings-panel">
        <h2>Appearance</h2>
        <p className="muted">
          Choose the workspace theme. This preference is stored on this device.
        </p>
        <div className="theme-options">
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            aria-pressed={theme === "dark"}
            onClick={() => setTheme("dark")}
          >
            <Moon size={18} />
            Dark
          </Button>
          <Button
            variant={theme === "light" ? "default" : "outline"}
            aria-pressed={theme === "light"}
            onClick={() => setTheme("light")}
          >
            <Sun size={18} />
            Light
          </Button>
        </div>
        <hr />
        <AccountPanel key={user?.id ?? "guest"} />
        <hr />
        <h2>About this build</h2>
        <p className="muted">
          DATUM v0.2.2 · Living investigations, real browser Python, and a
          reproducible evidence notebook. Cloud grading and AI require
          configured services; their availability is shown where you use them.
        </p>
        <Button asChild variant="outline">
          <Link to="/learn">
            Explore the curriculum <ArrowUpRight size={15} />
          </Link>
        </Button>
      </section>
    </>
  );
}
