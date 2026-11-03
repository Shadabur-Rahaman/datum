import { LessonExperiment } from "../features/journey/LessonExperiment";
import { useLastLesson } from "../features/journey/useLastLesson";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { lessons } from "../content/track";
import { Badge, PageHeading } from "../components/ui/shared";
import { Button } from "../components/ui/button";
import { useDraft } from "../features/persistence/useDraft";
import { DraftActions } from "../features/persistence/DraftActions";
export function Lesson() {
  const { lessonId } = useParams();
  const lesson = lessons.find((l) => l.id === lessonId);
  useLastLesson(lesson?.id);
  const saved = useDraft(lessonId ?? "", { reflection: "" });
  const draft = saved.body.reflection;
  const [show, setShow] = useState(false);
  if (!lesson)
    return (
      <section className="panel empty-state">
        <h1>Lesson not found</h1>
        <p>This lesson may have moved. Choose a lesson from the track.</p>
        <Button asChild>
          <Link to="/learn">Back to the track</Link>
        </Button>
      </section>
    );
  const next = lessons[lessons.indexOf(lesson) + 1];
  return (
    <>
      <Link className="text-link" to="/learn">
        <ArrowLeft size={15} />
        Data Detective track
      </Link>
      <PageHeading
        eyebrow={`CHAPTER 0${lesson.chapter} / ${lesson.id === "hypotheses" ? "INTERACTIVE LESSON" : "LESSON PREVIEW"}`}
        title={lesson.title}
        description={lesson.chapterTitle}
      >
        <Badge>
          <Clock3 size={13} />
          {lesson.minutes} MIN
        </Badge>
      </PageHeading>
      <div className="lesson-layout">
        <article className="panel lesson-body">
          <Badge tone="teal">01 / INVESTIGATE</Badge>
          <h2>{lesson.question}</h2>
          <p className="large-copy">{lesson.concept}</p>
          {lesson.id === "hypotheses" && <LessonExperiment />}
          <hr />
          <p className="eyebrow">02 / MAKE A PREDICTION</p>
          <label htmlFor="reflection">{lesson.prompt}</label>
          <textarea
            id="reflection"
            maxLength={2000}
            value={draft}
            disabled={saved.blocked}
            onChange={(e) => saved.update({ reflection: e.target.value })}
            placeholder="I think… because…"
          />
          <p className="small muted">
            {draft.length}/2000 · Reflection progress is not a verified
            assessment.
          </p>
          <DraftActions draft={saved} />
          <Button
            variant="outline"
            onClick={() => setShow(!show)}
            aria-expanded={show}
          >
            {show ? "Hide thinking guide" : "Show thinking guide"}
          </Button>
          {show && (
            <div className="insight">
              <p>
                Make your claim specific. Name the evidence you would need,
                identify a possible alternative explanation, and state what
                would change your mind. This is an authored reflection guide,
                not AI feedback.
              </p>
            </div>
          )}
          <div className="lesson-next">
            {next ? (
              <Button asChild>
                <Link to={`/learn/${next.id}`}>
                  Next lesson preview <ArrowRight size={16} />
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/investigate">
                  Explore the mission <ArrowRight size={16} />
                </Link>
              </Button>
            )}
          </div>
        </article>
        <aside className="panel lesson-aside">
          <p className="eyebrow">THE INVESTIGATION LOOP</p>
          {[
            "Investigate",
            "Predict",
            "Experiment",
            "Observe",
            "Explain",
            "Validate",
            "Adapt",
          ].map((s, i) => (
            <div className="loop-step" key={s}>
              <span>0{i + 1}</span>
              {s}
            </div>
          ))}
          <p className="small muted">
            Full lesson interactions and completion checks will be introduced
            with the learning engines. Reading a page does not count as mastery.
          </p>
        </aside>
      </div>
    </>
  );
}
