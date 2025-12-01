import fs from 'fs';
import path from 'path';

/**
 * Formats LinkedIn profile JSON into readable text
 */
export function formatLinkedInProfile(profile: any): string {
  const parts: string[] = [];
  
  // Basic Info
  parts.push('=== LINKEDIN PROFILE ===');
  if (profile.basic_info?.fullname) {
    parts.push(`Name: ${profile.basic_info.fullname}`);
  }
  if (profile.basic_info?.headline) {
    parts.push(`Headline: ${profile.basic_info.headline}`);
  }
  if (profile.basic_info?.location?.full) {
    parts.push(`Location: ${profile.basic_info.location.full}`);
  }
  if (profile.basic_info?.about) {
    parts.push(`\nAbout:\n${profile.basic_info.about}`);
  }
  if (profile.basic_info?.current_company) {
    parts.push(`\nCurrent Company: ${profile.basic_info.current_company}`);
  }
  
  // Experience
  if (profile.experience && profile.experience.length > 0) {
    parts.push('\n=== EXPERIENCE ===');
    profile.experience.forEach((exp: any, idx: number) => {
      parts.push(`\n${idx + 1}. ${exp.title} at ${exp.company}`);
      if (exp.duration) parts.push(`   Duration: ${exp.duration}`);
      if (exp.location) parts.push(`   Location: ${exp.location}`);
      if (exp.description) {
        parts.push(`   Description: ${exp.description}`);
      }
      if (exp.skills && exp.skills.length > 0) {
        parts.push(`   Skills: ${exp.skills.join(', ')}`);
      }
    });
  }
  
  // Education
  if (profile.education && profile.education.length > 0) {
    parts.push('\n=== EDUCATION ===');
    profile.education.forEach((edu: any, idx: number) => {
      parts.push(`\n${idx + 1}. ${edu.school}`);
      if (edu.degree) parts.push(`   Degree: ${edu.degree}`);
      if (edu.field_of_study) parts.push(`   Field: ${edu.field_of_study}`);
      if (edu.duration) parts.push(`   Duration: ${edu.duration}`);
      if (edu.activities) parts.push(`   Activities: ${edu.activities}`);
      if (edu.skills) parts.push(`   Skills: ${edu.skills}`);
    });
  }
  
  return parts.join('\n');
}

/**
 * Formats LinkedIn posts array into readable text
 * Filters out unimportant data and focuses on content
 */
export function formatLinkedInPosts(posts: any[]): string {
  const parts: string[] = [];
  parts.push(`=== LINKEDIN POSTS (${posts.length} total) ===\n`);
  
  posts.forEach((post, idx) => {
    // Skip reposts from other people (only include original posts and reposts of own content)
    if (post.post_type === 'repost' && post.author?.username !== 'vitosenic') {
      return; // Skip this post
    }
    
    const date = post.posted_at?.date || 'Unknown date';
    const reactions = post.stats?.total_reactions || 0;
    const comments = post.stats?.comments || 0;
    const reposts = post.stats?.reposts || 0;
    
    parts.push(`--- Post #${idx + 1} (${date}) ---`);
    parts.push(`Engagement: ${reactions} reactions, ${comments} comments, ${reposts} reposts`);
    parts.push('');
    
    // Main post text
    if (post.text) {
      parts.push(post.text);
    }
    
    // If it's a quote/repost, include the reshared post content
    if (post.reshared_post?.text) {
      parts.push('\n[Reshared Post]');
      parts.push(post.reshared_post.text);
      if (post.reshared_post.article?.url) {
        parts.push(`\nArticle: ${post.reshared_post.article.title}`);
        parts.push(`URL: ${post.reshared_post.article.url}`);
      }
    }
    
    // Include article if present
    if (post.article?.url) {
      parts.push(`\n[Article] ${post.article.title}`);
      parts.push(`URL: ${post.article.url}`);
    }
    
    // Include post URL
    if (post.url) {
      parts.push(`\nLinkedIn URL: ${post.url}`);
    }
    
    parts.push('\n'); // Empty line between posts
  });
  
  return parts.join('\n');
}

/**
 * Formats CV JSON into readable text
 */
export function formatCV(cv: any): string {
  const parts: string[] = [];
  
  parts.push('=== CV / RESUME ===');
  parts.push(`Name: ${cv.name}`);
  parts.push(`Role: ${cv.role}`);
  parts.push(`Location: ${cv.location}`);
  
  // Socials
  if (cv.socials) {
    parts.push('\n=== CONTACT ===');
    if (cv.socials.email) parts.push(`Email: ${cv.socials.email}`);
    if (cv.socials.github) parts.push(`GitHub: ${cv.socials.github}`);
    if (cv.socials.linkedin) parts.push(`LinkedIn: ${cv.socials.linkedin}`);
    if (cv.socials.x) parts.push(`X (Twitter): ${cv.socials.x}`);
    if (cv.socials.instagram) parts.push(`Instagram: ${cv.socials.instagram}`);
  }
  
  // Summary
  if (cv.summary) {
    parts.push('\n=== SUMMARY ===');
    parts.push(cv.summary);
  }
  
  // Focus Now
  if (cv.focus_now) {
    parts.push('\n=== CURRENT FOCUS ===');
    parts.push(cv.focus_now);
  }
  
  // Experience
  if (cv.experience && cv.experience.length > 0) {
    parts.push('\n=== EXPERIENCE ===');
    cv.experience.forEach((job: any) => {
      if (job.id === 'experience-index') return; // Skip index entry
      
      parts.push(`\n${job.company} — ${job.role}`);
      if (job.dates) parts.push(`Duration: ${job.dates}`);
      if (job.bullets && job.bullets.length > 0) {
        job.bullets.forEach((bullet: string) => {
          parts.push(`  • ${bullet}`);
        });
      }
    });
  }
  
  // Skills
  if (cv.skills) {
    parts.push('\n=== SKILLS ===');
    if (cv.skills.web) parts.push(`Web: ${cv.skills.web.join(', ')}`);
    if (cv.skills.backend) parts.push(`Backend: ${cv.skills.backend.join(', ')}`);
    if (cv.skills.ai) parts.push(`AI: ${cv.skills.ai.join(', ')}`);
    if (cv.skills.devops) parts.push(`DevOps: ${cv.skills.devops.join(', ')}`);
    if (cv.skills.langs) parts.push(`Languages: ${cv.skills.langs.join(', ')}`);
  }
  
  // Education
  if (cv.education && cv.education.length > 0) {
    parts.push('\n=== EDUCATION ===');
    cv.education.forEach((edu: string) => {
      parts.push(`  • ${edu}`);
    });
  }
  
  // Roadmap
  if (cv.roadmap && cv.roadmap.length > 0) {
    parts.push('\n=== ROADMAP / TIMELINE ===');
    cv.roadmap.forEach((item: any) => {
      parts.push(`${item.year}: ${item.milestone}`);
    });
  }
  
  // Other
  if (cv.other) {
    parts.push('\n=== OTHER ===');
    if (cv.other.born) parts.push(`Born: ${cv.other.born}`);
    if (cv.other.music) parts.push(`Music: ${cv.other.music}`);
    if (cv.other.favorite_book) parts.push(`Favorite Book: ${cv.other.favorite_book}`);
    if (cv.other.quote) parts.push(`Quote: ${cv.other.quote}`);
    if (cv.other.dream_car) parts.push(`Dream Car: ${cv.other.dream_car}`);
    if (cv.other.dream_motorbike) parts.push(`Dream Motorbike: ${cv.other.dream_motorbike}`);
  }
  
  // FAQ
  if (cv.faq?.text) {
    parts.push('\n=== FAQ ===');
    parts.push(cv.faq.text);
  }
  
  return parts.join('\n');
}

/**
 * Formats projects JSON into readable text
 */
export function formatProjects(projects: any[]): string {
  const parts: string[] = [];
  
  parts.push(`=== PROJECTS (${projects.length} total) ===\n`);
  
  projects.forEach((project, idx) => {
    if (project.slug === 'projects-index') return; // Skip index entry
    
    parts.push(`--- ${project.title}${project.year ? ` (${project.year})` : ''} ---`);
    if (project.tagline) parts.push(`Tagline: ${project.tagline}`);
    if (project.summary) parts.push(`\nSummary: ${project.summary}`);
    if (project.stack && project.stack.length > 0) {
      parts.push(`Stack: ${project.stack.join(', ')}`);
    }
    if (project.highlights && project.highlights.length > 0) {
      parts.push('\nHighlights:');
      project.highlights.forEach((highlight: string) => {
        parts.push(`  • ${highlight}`);
      });
    }
    if (project.links && project.links.length > 0) {
      parts.push('\nLinks:');
      project.links.forEach((link: any) => {
        parts.push(`  • ${link.label}: ${link.url}`);
      });
    }
    if (project.case_study) {
      parts.push(`\nCase Study: ${project.case_study}`);
    }
    parts.push('\n');
  });
  
  return parts.join('\n');
}

/**
 * Formats all content files into a single context string
 */
export function formatAllContent(): string {
  const contentDir = path.join(process.cwd(), 'public', 'content');
  const parts: string[] = [];
  
  // Format CV
  try {
    const cvPath = path.join(contentDir, 'cv.json');
    if (fs.existsSync(cvPath)) {
      const cv = JSON.parse(fs.readFileSync(cvPath, 'utf-8'));
      parts.push(formatCV(cv));
      parts.push('\n\n');
    }
  } catch (error) {
    console.error('Error formatting CV:', error);
  }
  
  // Format LinkedIn Profile
  try {
    const profilePath = path.join(contentDir, 'linkedin_profile.json');
    if (fs.existsSync(profilePath)) {
      const profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
      parts.push(formatLinkedInProfile(profile));
      parts.push('\n\n');
    }
  } catch (error) {
    console.error('Error formatting LinkedIn profile:', error);
  }
  
  // Format LinkedIn Posts
  try {
    const postsPath = path.join(contentDir, 'linkedin_posts.json');
    if (fs.existsSync(postsPath)) {
      const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
      parts.push(formatLinkedInPosts(posts));
      parts.push('\n\n');
    }
  } catch (error) {
    console.error('Error formatting LinkedIn posts:', error);
  }
  
  // Format Projects
  try {
    const projectsPath = path.join(contentDir, 'projects.json');
    if (fs.existsSync(projectsPath)) {
      const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'));
      parts.push(formatProjects(projects));
      parts.push('\n\n');
    }
  } catch (error) {
    console.error('Error formatting projects:', error);
  }
  
  return parts.join('');
}

