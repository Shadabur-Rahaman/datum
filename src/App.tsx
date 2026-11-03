import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  FlaskConical,
  Code2,
  Swords,
  Fingerprint,
  NotebookPen,
  Settings,
  Sun,
  Moon,
  ChevronRight,
  Command,
  PanelLeftClose,
  Menu,
  X,
} from "lucide-react";
import { SettingsPage } from "./pages/Settings";
import { AuthProvider, useAuth } from "./features/auth/AuthProvider";
import { Dashboard } from "./pages/Dashboard";
import { Learn } from "./pages/Learn";
import { Lesson } from "./pages/Lesson";
import { LivingLab } from "./features/lab/LivingLab";
import { Quiz } from "./pages/Quiz";
import { Practice } from "./pages/Practice";
import { Notebook } from "./pages/Notebook";
import { Skills } from "./pages/Skills";
import { Investigate } from "./pages/Investigate";
import { Button } from "./components/ui/button";
import { Badge, PageHeading, Upcoming } from "./components/ui/shared";
const navigation = [
  { to: "/", name: "Dashboard", icon: LayoutDashboard },
  { to: "/learn", name: "Learn", icon: BookOpen },
  { to: "/investigate", name: "Investigate", icon: FlaskConical },
  { to: "/practice", name: "Practice", icon: Code2 },
  { to: "/quiz", name: "Quiz Arena", icon: Swords },
  { to: "/skills", name: "Skill DNA", icon: Fingerprint },
  { to: "/notebook", name: "Evidence Notebook", icon: NotebookPen },
];
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="error-page">
          <h1>The workspace hit an unexpected error.</h1>
          <p>Your session could not be displayed. Reload to try again.</p>
          <Button onClick={() => window.location.reload()}>
            Reload workspace
          </Button>
        </main>
      );
    return this.props.children;
  }
}
export function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
function AppShell() {
  const { user, loading: authLoading } = useAuth();
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("datum-theme") === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });
  const [storageError, setStorageError] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const previousPath = useRef(location.pathname);
  const main = useRef<HTMLElement>(null);
  const menu = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("datum-theme", theme);
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [theme]);
  useEffect(() => {
    setOpen(false);
    if (previousPath.current !== location.pathname) {
      main.current?.focus();
      previousPath.current = location.pathname;
    }
    document.title = `${navigation.find((n) => n.to !== "/" && location.pathname.startsWith(n.to))?.name ?? (location.pathname === "/settings" ? "Settings" : location.pathname === "/" ? "Dashboard" : "Not found")} · DATUM`;
  }, [location.pathname]);
  useEffect(() => {
    function escape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        menu.current?.focus();
      }
    }
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  const current =
    navigation.find((n) => n.to !== "/" && location.pathname.startsWith(n.to))
      ?.name ?? (location.pathname === "/settings" ? "Settings" : "Dashboard");
  return (
    <div className="app">
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        Skip to content
      </a>
      <aside id="navigation" className={`sidebar ${open ? "is-open" : ""}`}>
        <Link to="/" className="brand" aria-label="DATUM home">
          <span className="brand-symbol">
            <i />
            <i />
            <i />
          </span>
          DATUM<span className="brand-version">V2.2</span>
        </Link>
        <p className="sidebar-label">THE LEARNING ENGINE</p>
        <nav aria-label="Main navigation">
          {navigation.map(({ to, name, icon: Icon }) => (
            <NavLink to={to} end={to === "/"} key={to}>
              <Icon size={19} />
              <span>{name}</span>
              {name === "Investigate" && <span className="nav-dot" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="status-dot" />
            <span>A lab for curious minds.</span>
            <p>
              Ask better questions.
              <br />
              Find your own answers.
            </p>
          </div>
          <NavLink className="settings-link" to="/settings">
            <Settings size={18} />
            Settings
          </NavLink>
          <div className="guest">
            <div className="avatar">G</div>
            <div>
              <strong>
                {user ? "Signed-in investigator" : "Guest investigator"}
              </strong>
              <span>V2.2 · Evidence workspace</span>
            </div>
            <Badge>{user ? "CLOUD" : "LOCAL"}</Badge>
          </div>
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              ref={menu}
              className="mobile-menu icon-button"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              aria-controls="navigation"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <PanelLeftClose className="desktop-icon" size={17} />
            <span className="topbar-divider" />
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{current}</strong>
          </div>
          <div className="topbar-right">
            <span className="guest-label">
              <span className="status-dot" />
              {authLoading
                ? "Restoring session"
                : user
                  ? "Signed in"
                  : "Guest mode"}
            </span>
            <button
              className="icon-button"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link
              to="/settings"
              className="avatar small-avatar"
              aria-label="Account and settings"
            >
              {user ? "A" : "G"}
            </Link>
          </div>
        </header>
        {storageError && (
          <p className="storage-warning" role="status">
            Theme changed for this session. Browser storage is unavailable, so
            it cannot be remembered.
          </p>
        )}
        <main id="main" tabIndex={-1} ref={main}>
          <Routes key={user?.id ?? "guest"}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/learn" element={<Learn />} />
            <Route
              path="/learn/:lessonId"
              element={<Lesson key={location.pathname} />}
            />
            <Route path="/investigate" element={<LivingLab />} />
            <Route path="/investigate/legacy" element={<Investigate />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/notebook" element={<Notebook />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route
              path="/settings"
              element={<SettingsPage theme={theme} setTheme={setTheme} />}
            />
            <Route
              path="*"
              element={
                <section className="panel empty-state">
                  <Command size={32} />
                  <p className="eyebrow">404 / UNCHARTED TERRITORY</p>
                  <h1>This page is outside the dataset.</h1>
                  <p>
                    Choose a destination from the navigation or return to your
                    workspace.
                  </p>
                  <Button asChild>
                    <Link to="/">Back to dashboard</Link>
                  </Button>
                </section>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}
