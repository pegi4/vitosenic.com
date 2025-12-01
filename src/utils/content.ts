import fs from 'fs';
import path from 'path';

/**
 * Formats LinkedIn profile JSON into readable text
 */
function formatLinkedInProfile(profile: any): string {
  const parts: string[] = [];
  
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
 */
function formatLinkedInPosts(posts: any[]): string {
  const parts: string[] = [];
  parts.push(`=== LINKEDIN POSTS (${posts.length} total) ===\n`);
  
  posts.forEach((post, idx) => {
    // Skip reposts from other people
    if (post.post_type === 'repost' && post.author?.username !== 'vitosenic') {
      return;
    }
    
    const date = post.posted_at?.date || 'Unknown date';
    const reactions = post.stats?.total_reactions || 0;
    const comments = post.stats?.comments || 0;
    const reposts = post.stats?.reposts || 0;
    
    parts.push(`--- Post #${idx + 1} (${date}) ---`);
    parts.push(`Engagement: ${reactions} reactions, ${comments} comments, ${reposts} reposts`);
    parts.push('');
    
    if (post.text) {
      parts.push(post.text);
    }
    
    if (post.reshared_post?.text) {
      parts.push('\n[Reshared Post]');
      parts.push(post.reshared_post.text);
      if (post.reshared_post.article?.url) {
        parts.push(`\nArticle: ${post.reshared_post.article.title}`);
        parts.push(`URL: ${post.reshared_post.article.url}`);
      }
    }
    
    if (post.article?.url) {
      parts.push(`\n[Article] ${post.article.title}`);
      parts.push(`URL: ${post.article.url}`);
    }
    
    if (post.url) {
      parts.push(`\nLinkedIn URL: ${post.url}`);
    }
    
    parts.push('\n');
  });
  
  return parts.join('\n');
}

/**
 * Formats CV JSON into readable text
 */
function formatCV(cv: any): string {
  const parts: string[] = [];
  
  parts.push(`Name: ${cv.name}`);
  parts.push(`Role: ${cv.role}`);
  parts.push(`Location: ${cv.location}`);
  
  if (cv.socials) {
    parts.push('\n=== CONTACT ===');
    if (cv.socials.email) parts.push(`Email: ${cv.socials.email}`);
    if (cv.socials.github) parts.push(`GitHub: ${cv.socials.github}`);
    if (cv.socials.linkedin) parts.push(`LinkedIn: ${cv.socials.linkedin}`);
    if (cv.socials.x) parts.push(`X (Twitter): ${cv.socials.x}`);
    if (cv.socials.instagram) parts.push(`Instagram: ${cv.socials.instagram}`);
  }
  
  if (cv.summary) {
    parts.push('\n=== SUMMARY ===');
    parts.push(cv.summary);
  }
  
  if (cv.focus_now) {
    parts.push('\n=== CURRENT FOCUS ===');
    parts.push(cv.focus_now);
  }
  
  if (cv.experience && cv.experience.length > 0) {
    parts.push('\n=== EXPERIENCE ===');
    cv.experience.forEach((job: any) => {
      if (job.id === 'experience-index') return;
      parts.push(`\n${job.company} — ${job.role}`);
      if (job.dates) parts.push(`Duration: ${job.dates}`);
      if (job.bullets && job.bullets.length > 0) {
        job.bullets.forEach((bullet: string) => {
          parts.push(`  • ${bullet}`);
        });
      }
    });
  }
  
  if (cv.skills) {
    parts.push('\n=== SKILLS ===');
    if (cv.skills.web) parts.push(`Web: ${cv.skills.web.join(', ')}`);
    if (cv.skills.backend) parts.push(`Backend: ${cv.skills.backend.join(', ')}`);
    if (cv.skills.ai) parts.push(`AI: ${cv.skills.ai.join(', ')}`);
    if (cv.skills.devops) parts.push(`DevOps: ${cv.skills.devops.join(', ')}`);
    if (cv.skills.langs) parts.push(`Languages: ${cv.skills.langs.join(', ')}`);
  }
  
  if (cv.education && cv.education.length > 0) {
    parts.push('\n=== EDUCATION ===');
    cv.education.forEach((edu: string) => {
      parts.push(`  • ${edu}`);
    });
  }
  
  if (cv.roadmap && cv.roadmap.length > 0) {
    parts.push('\n=== ROADMAP / TIMELINE ===');
    cv.roadmap.forEach((item: any) => {
      parts.push(`${item.year}: ${item.milestone}`);
    });
  }
  
  if (cv.other) {
    parts.push('\n=== OTHER ===');
    if (cv.other.born) parts.push(`Born: ${cv.other.born}`);
    if (cv.other.music) parts.push(`Music: ${cv.other.music}`);
    if (cv.other.favorite_book) parts.push(`Favorite Book: ${cv.other.favorite_book}`);
    if (cv.other.quote) parts.push(`Quote: ${cv.other.quote}`);
    if (cv.other.dream_car) parts.push(`Dream Car: ${cv.other.dream_car}`);
    if (cv.other.dream_motorbike) parts.push(`Dream Motorbike: ${cv.other.dream_motorbike}`);
  }
  
  if (cv.faq?.text) {
    parts.push('\n=== FAQ ===');
    parts.push(cv.faq.text);
  }
  
  return parts.join('\n');
}

/**
 * Formats projects JSON into readable text
 */
function formatProjects(projects: any[]): string {
  const parts: string[] = [];
  
  parts.push(`=== PROJECTS (${projects.length} total) ===\n`);
  
  projects.forEach((project) => {
    if (project.slug === 'projects-index') return;
    
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
 * Loads all formatted content for the chat context
 * Uses Gemini's 1M context window to include everything
 */
export function loadAllContent(): string {
  try {
    // Try to load the combined context file first (faster, pre-formatted)
    const combinedPath = path.join(process.cwd(), 'public', 'content', 'all_content.txt');
    if (fs.existsSync(combinedPath)) {
      const content = fs.readFileSync(combinedPath, 'utf-8');
      console.log(`Loaded combined context file (${(content.length / 1024).toFixed(2)} KB)`);
      return content;
    }
    
    // Fallback: format on the fly
    const contentDir = path.join(process.cwd(), 'public', 'content');
    const parts: string[] = [];
    
    // Format CV
    try {
      const cvPath = path.join(contentDir, 'cv.json');
      if (fs.existsSync(cvPath)) {
        const cv = JSON.parse(fs.readFileSync(cvPath, 'utf-8'));
        parts.push('=== CV / RESUME ===');
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
        parts.push('=== LINKEDIN PROFILE ===');
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
    
    const content = parts.join('');
    console.log(`Formatted content on the fly (${(content.length / 1024).toFixed(2)} KB)`);
    return content;
  } catch (error) {
    console.error('Error loading content:', error);
    return 'No content available.';
  }
}

