import type { CV } from './cv-types';

declare module '@public/content/cv.json' {
  const cv: CV;
  export default cv;
}
