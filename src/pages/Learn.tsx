import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { track, skillKeywords } from "../content/track";
import { Badge, PageHeading } from "../components/ui/shared";
import { Button } from "../components/ui/button";
export function Learn() {
  const [query, setQuery] = useState("");
  const filtered = track.chapters.filter((c) =>
    `${c.title} ${c.description} ${c.lessons.map((l) => `${l.title} ${l.question} ${l.concept} ${l.prompt} ${(skillKeywords[l.id] ?? []).join(" ")}`).join(" ")}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <PageHeading
        eyebrow="LEARN / YOUR FIRST TRACK"
        title="Become a Data Detective."
        description="Six chapters. Twelve questions worth asking. One new way of thinking."
      />
      <section className="track-banner panel">
        <span className="icon-tile">
          <BookOpen size={30} />
        </span>
        <div>
          <h2>Start with a question. Finish with evidence.</h2>
          <p className="muted">
            Beginner friendly · 12 lessons · Start with the interactive
            hypothesis lesson; the remaining lessons retain their guided
            previews.
          </p>
        </div>
        <Badge tone="teal">CONTENT V1</Badge>
      </section>
      <label className="search-field">
        <Search size={18} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a chapter or lesson…"
          aria-label="Find a chapter or lesson"
        />
      </label>
      <div className="chapter-grid">
        {filtered.map((c) => (
          <section className="panel chapter" key={c.id}>
            <div className="section-top">
              <span className="chapter-number">0{c.id}</span>
              <Badge>2 LESSON PREVIEWS</Badge>
            </div>
            <h2>{c.title}</h2>
            <p className="muted">{c.description}</p>
            <div className="lesson-links">
              {c.lessons.map((l) => (
                <Link key={l.id} to={`/learn/${l.id}`}>
                  <span>
                    <BookOpen size={16} />
                    {l.title}
                  </span>
                  <span>
                    {l.minutes}m <ArrowRight size={15} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      {!filtered.length && (
        <section className="panel empty-state">
          <h2>No matching lessons</h2>
          <p>Try a topic such as Python, data or statistics.</p>
          <Button variant="outline" onClick={() => setQuery("")}>
            Clear search
          </Button>
        </section>
      )}
    </>
  );
}
