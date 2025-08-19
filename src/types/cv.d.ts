declare module '@public/content/cv.json' {
  interface Social {
    github: string;
    linkedin: string;
    x: string;
    instagram: string;
    email: string;
  }

  interface Experience {
    id: string;
    company: string;
    role: string;
    dates: string;
    bullets: string[];
  }

  interface Skills {
    web: string[];
    backend: string[];
    ai: string[];
    devops: string[];
    langs: string[];
  }

  interface RoadmapItem {
    year: string;
    milestone: string;
  }

  interface Other {
    born: string;
    music: string;
    favorite_book: string;
    quote: string;
    personality: string;
    dream_car: string;
    dream_motorbike: string;
  }

  interface CV {
    name: string;
    role: string;
    location: string;
    socials: Social;
    updated: string;
    summary: string;
    focus_now: string;
    experience: Experience[];
    skills: Skills;
    education: string[];
    roadmap: RoadmapItem[];
    other: Other;
  }

  const cv: CV;
  export default cv;
}
