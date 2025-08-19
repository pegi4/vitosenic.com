declare module '@public/content/projects.json' {
  interface ProjectLink {
    type: "repo" | "demo" | "video" | "case";
    label: string;
    url: string;
    gated?: boolean;
  }

  interface Project {
    slug: string;
    title: string;
    tagline: string;
    year: string;
    stack: string[];
    image?: string;
    links: ProjectLink[];
  }

  const projects: Project[];
  export default projects;
  export type { Project, ProjectLink };
}