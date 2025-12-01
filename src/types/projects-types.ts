export interface ProjectLink {
  type: "repo" | "demo" | "video" | "case" | "page" | "case_study";
  label: string;
  url: string;
  gated?: boolean;
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  year: string | null;
  stack: string[];
  image?: string | null;
  summary?: string;
  highlights?: string[];
  case_study?: string;
  links: ProjectLink[];
}

