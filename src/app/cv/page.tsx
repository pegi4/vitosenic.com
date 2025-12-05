import cv from "@public/content/cv.json";
import { Metadata } from "next";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "CV — Vito Senič",
  description: "CV / resume for Vito Senič"
};

export default function CVPage() {
  return (
    <Container>
      <main className="mx-auto max-w-[720px] px-4 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-white">{cv.name}</h1>
          <p className="text-white/90">{cv.role}</p>
          <p className="text-white/90">{cv.location}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-white/80">
            <a href={cv.socials.github} target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a>
            <a href={cv.socials.linkedin} target="_blank" rel="noreferrer" className="hover:text-white">LinkedIn</a>
            <a href={`mailto:${cv.socials.email}`} className="hover:text-white">Email</a>
            <a href={cv.socials.x} target="_blank" rel="noreferrer" className="hover:text-white">X</a>
            <a href={cv.socials.instagram} target="_blank" rel="noreferrer" className="hover:text-white">Instagram</a>
            <span>Updated: {cv.updated}</span>
          </div>
        </header>

        <article className="prose prose-invert prose-neutral max-w-none">
          <h2 id="summary">Summary</h2>
          <p>{cv.summary}</p>

          <h2 id="focus-now">Now / Focus</h2>
          <p>{cv.focus_now}</p>

          <h2 id="experience">Experience</h2>
          {cv.experience.map((job) => (
            <section key={job.id} id={job.id} className="mb-6">
              <h3 className="text-white">{job.company} — {job.role}</h3>
              <p className="text-sm text-white/70">{job.dates}</p>
              <ul>
                {job.bullets.map((bullet: string, i: number) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            </section>
          ))}

          <h2 id="skills">Skills</h2>
          <ul>
            <li><strong>Web:</strong> {cv.skills.web.join(", ")}</li>
            <li><strong>Backend:</strong> {cv.skills.backend.join(", ")}</li>
            <li><strong>AI:</strong> {cv.skills.ai.join(", ")}</li>
            <li><strong>DevOps:</strong> {cv.skills.devops.join(", ")}</li>
            <li><strong>Languages:</strong> {cv.skills.langs.join(", ")}</li>
          </ul>

          <h2 id="education">Education</h2>
          <ul>
            {cv.education.map((edu: string, i: number) => (
              <li key={i}>{edu}</li>
            ))}
          </ul>

          <h2 id="roadmap">Roadmap</h2>
          <ul>
            {cv.roadmap.map((item, i: number) => (
              <li key={i}>
                <strong>{item.year}:</strong> {item.milestone}
              </li>
            ))}
          </ul>

          <h2 id="other">Other</h2>
          <ul>
            <li><strong>Born:</strong> {cv.other.born}</li>
            <li><strong>Music:</strong> {cv.other.music}</li>
            <li><strong>Favorite Book:</strong> {cv.other.favorite_book}</li>
            <li><strong>Quote:</strong> &ldquo;{cv.other.quote}&rdquo;</li>
            <li><strong>Dream Car:</strong> {cv.other.dream_car}</li>
            <li><strong>Dream Motorbike:</strong> {cv.other.dream_motorbike}</li>
          </ul>
        </article>
      </main>
    </Container>
  );
}