import fs from 'fs';

import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';

// Define the directory where blog posts are stored
const postsDirectory = path.join(process.cwd(), 'public/content/blog');

// Define the type for post metadata
export type PostMeta = {
  title: string;
  slug: string;
  date: string;
  summary: string;
  tags: string[];
  cover?: string;
  canonical?: string;
};

// Function to get all post metadata
export async function getAllPostsMeta(): Promise<PostMeta[]> {
  // Get all markdown files from the posts directory
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Parse the frontmatter metadata section
      const { data } = matter(fileContents);

      // Ensure required fields are present
      if (!data.title || !data.slug || !data.date) {
        console.warn(`Post ${fileName} is missing required metadata fields`);
      }

      // Return the metadata
      return {
        title: data.title || 'Untitled',
        slug: data.slug || fileName.replace(/\.md$/, ''),
        date: data.date || new Date().toISOString(),
        summary: data.summary || '',
        tags: data.tags || [],
        cover: data.cover,
        canonical: data.canonical,
      } as PostMeta;
    });

  // Sort posts by date in descending order (newest first)
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

// Function to get a specific post by slug
export async function getPostBySlug(slug: string): Promise<{ meta: PostMeta; content: string }> {
  // Construct the file path
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  
  // Read the file contents
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Parse the frontmatter and content
  const { data, content } = matter(fileContents);

  // Create the post metadata
  const meta: PostMeta = {
    title: data.title || 'Untitled',
    slug: data.slug || slug,
    date: data.date || new Date().toISOString(),
    summary: data.summary || '',
    tags: data.tags || [],
    cover: data.cover,
    canonical: data.canonical,
  };

  // Return the metadata and content
  return { meta, content };
}

// Function to convert markdown to HTML
export async function markdownToHtml(markdown: string): Promise<string> {
  // Process the markdown content
  const result = await remark()
    .use(remarkGfm) // GitHub-flavored markdown
    .use(remarkRehype) // Convert to rehype AST
    .use(rehypeHighlight) // Add syntax highlighting
    .use(rehypeStringify) // Convert to HTML string
    .process(markdown);

  return result.toString();
}
