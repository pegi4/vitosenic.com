import fs from 'fs';
import path from 'path';
import { formatAllContent, formatCV, formatProjects, formatLinkedInProfile, formatLinkedInPosts } from './formatters';

/**
 * Script to format all content files into readable text
 * This creates formatted .txt files alongside the JSON files
 */
async function main() {
  console.log('🚀 Formatting all content files...\n');
  
  const contentDir = path.join(process.cwd(), 'public', 'content');
  
  // Format CV
  try {
    const cvPath = path.join(contentDir, 'cv.json');
    if (fs.existsSync(cvPath)) {
      const cv = JSON.parse(fs.readFileSync(cvPath, 'utf-8'));
      const formatted = formatCV(cv);
      const outputPath = path.join(contentDir, 'cv.txt');
      fs.writeFileSync(outputPath, formatted, 'utf-8');
      console.log(`✅ CV formatted: ${outputPath}`);
    }
  } catch (error) {
    console.error('❌ Error formatting CV:', error);
  }
  
  // Format Projects
  try {
    const projectsPath = path.join(contentDir, 'projects.json');
    if (fs.existsSync(projectsPath)) {
      const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'));
      const formatted = formatProjects(projects);
      const outputPath = path.join(contentDir, 'projects.txt');
      fs.writeFileSync(outputPath, formatted, 'utf-8');
      console.log(`✅ Projects formatted: ${outputPath}`);
    }
  } catch (error) {
    console.error('❌ Error formatting projects:', error);
  }
  
  // Format LinkedIn Profile
  try {
    const profilePath = path.join(contentDir, 'linkedin_profile.json');
    if (fs.existsSync(profilePath)) {
      const profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
      const formatted = formatLinkedInProfile(profile);
      const outputPath = path.join(contentDir, 'linkedin_profile.txt');
      fs.writeFileSync(outputPath, formatted, 'utf-8');
      console.log(`✅ LinkedIn profile formatted: ${outputPath}`);
    }
  } catch (error) {
    console.error('❌ Error formatting LinkedIn profile:', error);
  }
  
  // Format LinkedIn Posts
  try {
    const postsPath = path.join(contentDir, 'linkedin_posts.json');
    if (fs.existsSync(postsPath)) {
      const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
      const formatted = formatLinkedInPosts(posts);
      const outputPath = path.join(contentDir, 'linkedin_posts.txt');
      fs.writeFileSync(outputPath, formatted, 'utf-8');
      console.log(`✅ LinkedIn posts formatted: ${outputPath}`);
    }
  } catch (error) {
    console.error('❌ Error formatting LinkedIn posts:', error);
  }
  
  // Create combined context file
  try {
    const allContent = formatAllContent();
    const combinedPath = path.join(contentDir, 'all_content.txt');
    fs.writeFileSync(combinedPath, allContent, 'utf-8');
    console.log(`✅ Combined context file: ${combinedPath}`);
    console.log(`   Total size: ${(allContent.length / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ Error creating combined context:', error);
  }
  
  console.log('\n✅ All content formatted successfully!');
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

