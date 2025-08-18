export type ProjectLink = {
  type: "repo" | "demo" | "video" | "case";
  label: string;
  url: string;
  gated?: boolean;
};

export type Project = {
  slug: string;
  title: string;
  tagline: string;   // one line
  year: string;      // e.g., "2025"
  stack: string[];   // max 4 shown on card
  image?: string;    // optional /images/...
  links: ProjectLink[];
};

export const projects: Project[] = [
  {
    slug: "feri-urnik-personal-url-google-calendar-generator",
    title: "Feri urnik personal-url-google-calendar-generator",
    tagline: "Convert wisetime table to add it as a url to google calander.",
    year: "2023",
    stack: ["Next.js","Tailwind"],
    image: "/images/feri_urnik_ical.png",
    links: [
      { type: "repo", label: "Code", url: "https://github.com/pegi4/feri-urnik-personal-url-google-calendar-generator" },
      { type: "demo", label: "Link", url: "https://feri-calendar.vercel.app/"}
    ],
  }
];
