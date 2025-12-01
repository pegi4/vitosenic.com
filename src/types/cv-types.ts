export interface Social {
  github: string;
  linkedin: string;
  x: string;
  instagram: string;
  email: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  dates: string;
  bullets: string[];
}

export interface Skills {
  web: string[];
  backend: string[];
  ai: string[];
  devops: string[];
  langs: string[];
}

export interface RoadmapItem {
  year: string;
  milestone: string;
}

export interface Other {
  born: string;
  music: string;
  favorite_book: string;
  quote: string;
  dream_car: string;
  dream_motorbike: string;
}

export interface FAQ {
  title?: string;
  url?: string;
  text?: string;
  section?: string;
  source?: string;
}

export interface CV {
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
  faq?: FAQ;
}

