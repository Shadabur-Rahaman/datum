import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Code2,
  Fingerprint,
  FlaskConical,
  Target,
  Clock3,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, PageHeading } from "../components/ui/shared";
import { Button } from "../components/ui/button";
import { useJourney } from "../features/journey/useJourney";
import { lessons } from "../content/track";
import { practiceSchema, notebookSchema } from "../features/journey/schema";
export function Dashboard() {
  const { drafts, quizzes, loading, error } = useJourney();
  const reflections = drafts.filter((d) =>
    lessons.some((l) => l.id === d.content_id),
  );
  const practice = drafts
    .filter((d) => d.content_id.startsWith("practice-"))
    .flatMap((d) => {
      const p = practiceSchema.safeParse(d.body);
      return p.success ? p.data.attempts : [];
    });
  const book = notebookSchema.safeParse(
    drafts.find((d) => d.content_id === "evidence-notebook")?.body,
  );
  const findings = book.success ? book.data.entries.length : 0;
  const latest = [...reflections].sort((a, b) =>
    b.updated_at.localeCompare(a.updated_at),
  )[0];
  const navigation = drafts.find(
    (d) => d.content_id === "learner-navigation",
  )?.body;
  const last =
    navigation && "lastLesson" in navigation ? navigation.lastLesson : "";
  const resume = lessons.some((l) => l.id === last)
    ? last
    : (latest?.content_id ?? "hypotheses");
  return (
    <>
      <PageHeading
        eyebrow="YOUR RESEARCH WORKSPACE"
        title="Good questions lead to discoveries."
        description="Welcome, investigator. Follow your curiosity. Build your evidence."
      >
        <Badge tone="amber">YOUR WORKSPACE</Badge>
      </PageHeading>
      <div className="demo-note">
        <span className="status-dot" />
        Illustrative learner data · Explore the interface. Progress and activity
        below are examples, not your results.
      </div>
      <div className="dashboard-grid">
        <section className="hero panel">
          <div className="hero-copy">
            <p className="eyebrow">
              DATA DETECTIVE TRACK <span className="tiny-line" />
            </p>
            <Badge tone="teal">CHAPTER 01 · LESSON 02</Badge>
            <h2>
              A hunch is a start.
              <br />
              Evidence is the next step.
            </h2>
            <p>
              Learn to turn a good question into a hypothesis you can actually
              test.
            </p>
            <div className="hero-meta">
              <span>
                <Clock3 size={14} />
                15 min
              </span>
              <span>
                <BookOpen size={14} />
                Guided lesson preview
              </span>
            </div>
            <Button asChild>
              <Link to={`/learn/${resume}`}>
                Continue learning <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
          <div className="orbital" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit orbit-three" />
            <div className="orbital-core">
              <Fingerprint size={62} strokeWidth={1} />
            </div>
            <span className="orbit-dot dot-one" />
            <span className="orbit-dot dot-two" />
            <span className="orbit-label">OBSERVE. QUESTION. DISCOVER.</span>
          </div>
          <div className="hero-footer">
            <span>Saved lesson reflections</span>
            <div className="progress">
              <span style={{ width: `${(reflections.length / 12) * 100}%` }} />
            </div>
            <strong>{reflections.length} / 12 reflections</strong>
          </div>
        </section>
        <section className="panel mission-card">
          <div className="section-top">
            <span className="icon-tile violet">
              <FlaskConical size={22} />
            </span>
            <Badge tone="violet">LIVING INVESTIGATION</Badge>
          </div>
          <p className="eyebrow">YOUR NEXT INVESTIGATION</p>
          <h2>
            The Delivery
            <br />
            Delay Mystery
          </h2>
          <p>
            More complaints. Slower deliveries.
            <br />
            What does the data really say?
          </p>
          <div className="tags">
            <span>Data cleaning</span>
            <span>Relationships</span>
          </div>
          <Button asChild variant="outline">
            <Link to="/investigate">
              Open mission brief <ArrowUpRight size={16} />
            </Link>
          </Button>
        </section>
      </div>
      <div className="stats-grid">
        {[
          {
            icon: BookOpen,
            value: `${reflections.length} / 12`,
            label: "Saved lesson reflections",
            note: "A foundation for better questions",
          },
          {
            icon: Code2,
            value: String(practice.filter((a) => a.passed).length),
            label: "Practice checks passed",
            note: "Unverified browser practice",
          },
          {
            icon: Target,
            value: String(findings),
            label: "Saved findings",
            note: "From observation to explanation",
          },
          {
            icon: Fingerprint,
            value: String(quizzes.length),
            label: "Verified quiz attempts",
            note: "Understanding takes evidence",
          },
        ].map(({ icon: Icon, value, label, note }) => (
          <section className="panel stat" key={label}>
            <div className="section-top">
              <Icon size={18} />
              <span className="micro">SAVED</span>
            </div>
            <strong>{value}</strong>
            <h3>{label}</h3>
            <p>{note}</p>
          </section>
        ))}
      </div>
      <div className="dashboard-bottom">
        <section className="panel">
          <div className="section-top">
            <h2>Your skill landscape</h2>
            <Link className="text-link" to="/skills">
              View Skill DNA <ArrowUpRight size={14} />
            </Link>
          </div>
          <p className="muted small">
            Evidence grows through saved findings, practice and verified
            assessments. Page visits never increase mastery.
          </p>
          <p>
            {quizzes.length
              ? `${quizzes.length} verified assessments are available in Skill DNA.`
              : "No verified assessment evidence yet. Start with an investigation or coding challenge."}
          </p>
          <div className="insight">
            <Sparkles size={18} />
            <p>
              <strong>Make your next question testable.</strong>
              <br />
              Try writing a hypothesis before opening the data.
            </p>
          </div>
        </section>
        <section className="panel">
          <div className="section-top">
            <h2>A little curiosity, every day</h2>
            <Badge>SAVED</Badge>
          </div>
          <p className="muted small">Recent saved work</p>
          {drafts.length ? (
            [...drafts]
              .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
              .slice(0, 5)
              .map((d) => (
                <p key={d.content_id}>
                  {lessons.find((l) => l.id === d.content_id)?.title ??
                    d.content_id.replaceAll("-", " ")}{" "}
                  · {new Date(d.updated_at).toLocaleDateString()}
                </p>
              ))
          ) : (
            <p>
              Start a lesson, save a reflection, and your activity will appear
              here.
            </p>
          )}
        </section>
      </div>
      <footer className="page-footer">
        Understanding is built, one experiment at a time.
        <span>DATUM / V0.1 · FOUNDATION</span>
      </footer>
    </>
  );
}
