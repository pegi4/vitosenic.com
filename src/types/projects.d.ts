import type { Project, ProjectLink } from './projects-types';

declare module '@public/content/projects.json' {
  const projects: Project[];
  export default projects;
  export type { Project, ProjectLink };
}