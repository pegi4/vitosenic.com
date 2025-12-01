import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { Document } from "@langchain/core/documents";
import { pgPool } from "../src/utils/database";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { GithubModelsEmbeddings } from "../src/utils/githubModels";
import { PostgresRecordManager } from "@langchain/community/indexes/postgres";
import { index } from "langchain/indexes";

// Suppress specific PostgreSQL connection cleanup errors that happen during normal shutdown
// These errors are harmless and occur when the process is shutting down
process.on('uncaughtException', (error) => {
  const errorMessage = String(error);
  if (
    errorMessage.includes('db_termination') || 
    errorMessage.includes('Connection terminated') ||
    errorMessage.includes('Connection ended') ||
    errorMessage.includes('Connection terminated unexpectedly')
  ) {
    // Silently ignore these specific errors
    return;
  }
  // For any other uncaught exceptions, log them and exit
  console.error("\n❌ Uncaught exception:", error);
  process.exit(1);
});

// Constants for file paths
const NOTES_DIR = "public/content/notes";
const CV_JSON = "public/content/cv.json";
const PROJECTS_JSON = "public/content/projects.json";

// Initialize record manager with direct PostgreSQL connection
const recordManager = new PostgresRecordManager("vitosenic_content", {
  postgresConnectionOptions: {
    host: process.env.POSTGRES_HOST!,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER!,
    password: process.env.POSTGRES_PASSWORD!,
    database: process.env.POSTGRES_DATABASE!,
    ssl: process.env.POSTGRES_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false,
  },
  tableName: "upsertion_records",
});

// Create GitHub Embeddings class that implements LangChain's Embeddings interface
// This class is now imported directly from githubModels.ts

// Type definitions for structured data
type ProjectType = {
  slug: string;
  title: string;
  tagline?: string;
  year?: string | null;
  stack?: string[];
  image?: string | null;
  summary?: string;
  highlights?: string[];
  links?: ProjectLink[];
  case_study?: string;
};

type ContentChunk = {
  title: string;
  url: string;
  type: string;
  section: string;
  date: string | null;
  source: string;
  text: string;
};

type CVJob = {
  id: string;
  company: string;
  role: string;
  dates: string;
  bullets?: string[];
};

type ProjectLink = {
  type: string;
  label: string;
  url: string;
};

type RoadmapItem = {
  year: string;
  milestone: string;
};

// Function to read CV data
function readCVData(): ContentChunk[] {
  console.log(`Reading CV data from ${CV_JSON}`);
  const cvRaw = fs.readFileSync(path.join(process.cwd(), CV_JSON), 'utf8');
  const cv = JSON.parse(cvRaw);
  
  const chunks: ContentChunk[] = [];
  
  // Socials - one chunk for top-level section
  if (cv.socials) {
    const socialsText = [
      `GitHub: ${cv.socials.github}`,
      `LinkedIn: ${cv.socials.linkedin}`,
      `X (Twitter): ${cv.socials.x}`,
      `Instagram: ${cv.socials.instagram}`,
      `Email: ${cv.socials.email}`
    ].join("\n");
    
    chunks.push({
      title: "Social Media & Contact",
      url: "/cv#socials",
      type: "cv",
      section: "Socials",
      date: null,
      source: "cv-socials",
      text: socialsText
    });
  }
  
  // Summary - one chunk for top-level section
  if (cv.summary) {
    chunks.push({
      title: "Summary",
      url: "/cv#summary",
      type: "cv",
      section: "Summary",
      date: null,
      source: "cv-summary",
      text: cv.summary
    });
  }
  
  // Focus now - one chunk for top-level section
  if (cv.focus_now) {
    chunks.push({
      title: "Now / Focus",
      url: "/cv#focus-now",
      type: "cv",
      section: "Focus Now",
      date: null,
      source: "cv-focus-now",
      text: cv.focus_now
    });
  }
  
  // Experience - one chunk per work experience
  if (cv.experience) {
    cv.experience.forEach((job: CVJob) => {
      chunks.push({
        title: `${job.company} — ${job.role}`,
        url: `/cv#${job.id}`,
        type: "cv",
        section: "Experience",
        date: null,
        source: `cv-experience-${job.id}`,
        text: `${job.company} — ${job.role}\n${job.dates}\n${job.bullets?.join("\n")}`
      });
    });
  }
  
  // Skills - one chunk for top-level section
  if (cv.skills) {
    const skillsText = [
      `Web: ${cv.skills.web?.join(", ")}`,
      `Backend: ${cv.skills.backend?.join(", ")}`,
      `AI: ${cv.skills.ai?.join(", ")}`,
      `DevOps: ${cv.skills.devops?.join(", ")}`,
      `Languages: ${cv.skills.langs?.join(", ")}`
    ].join("\n");
    
    chunks.push({
      title: "Skills",
      url: "/cv#skills",
      type: "cv",
      section: "Skills",
      date: null,
      source: "cv-skills",
      text: skillsText
    });
  }
  
  // Education - one chunk for top-level section
  if (cv.education) {
    chunks.push({
      title: "Education",
      url: "/cv#education",
      type: "cv",
      section: "Education",
      date: null,
      source: "cv-education",
      text: cv.education.join("\n")
    });
  }
  
  // Roadmap - one chunk for top-level section
  if (cv.roadmap) {
    const roadmapText = cv.roadmap.map((item: RoadmapItem) => 
      `${item.year}: ${item.milestone}`
    ).join("\n");
    
    chunks.push({
      title: "Roadmap",
      url: "/cv#roadmap",
      type: "cv",
      section: "Roadmap",
      date: null,
      source: "cv-roadmap",
      text: roadmapText
    });
  }
  
  // Other - one chunk for top-level section
  if (cv.other) {
    const otherText = [
      `Born: ${cv.other.born}`,
      `Music: ${cv.other.music}`,
      `Favorite Book: ${cv.other.favorite_book}`,
      `Quote: ${cv.other.quote}`,
      `Dream Car: ${cv.other.dream_car}`,
      `Dream Motorbike: ${cv.other.dream_motorbike}`
    ].join("\n");
    
    chunks.push({
      title: "Other",
      url: "/cv#other",
      type: "cv",
      section: "Other",
      date: null,
      source: "cv-other",
      text: otherText
    });
  }
  
  // FAQ - added as requested
  if (cv.faq) {
    chunks.push({
      title: cv.faq.title || "FAQ",
      url: cv.faq.url || "/cv#faq",
      type: cv.faq.type || "cv",
      section: cv.faq.section || "FAQ",
      date: cv.faq.date || null,
      source: cv.faq.source || "cv-faq",
      text: cv.faq.text || ""
    });
  }
  
  console.log(`Generated ${chunks.length} chunks from CV data`);
  return chunks;
}

// Function to read projects data
function readProjectsData(): ContentChunk[] {
  console.log(`Reading projects data from ${PROJECTS_JSON}`);
  const projectsRaw = fs.readFileSync(path.join(process.cwd(), PROJECTS_JSON), 'utf8');
  const projects = JSON.parse(projectsRaw);
  
  // Each project = 1 canonical chunk
  const chunks = projects.map((project: ProjectType) => {
    // Format all project details
    const highlights = project.highlights?.join("\n");
    const linksText = project.links?.map((link: ProjectLink) => 
      `${link.label}: ${link.url}`
    ).join(", ");
    
    const projectText = [
      `Title: ${project.title}`,
      `Tagline: ${project.tagline}`,
      project.year ? `Year: ${project.year}` : null,
      project.stack && project.stack.length > 0 ? `Stack: ${project.stack.join(", ")}` : null,
      project.summary ? `Summary: ${project.summary}` : null,
      highlights ? `Highlights:\n${highlights}` : null,
      linksText ? `Links: ${linksText}` : null,
      project.case_study ? `Case Study: ${project.case_study}` : null
    ].filter(Boolean).join("\n");
    
    return {
      title: project.title,
      url: `/projects#${project.slug}`,
      type: "project",
      section: project.tagline || "Project",
      date: project.year ? `${project.year}-01-01` : null, // Default to Jan 1st of the year if only year is provided
      source: `project-${project.slug}`,
      text: projectText
    };
  });
  
  console.log(`Generated ${chunks.length} chunks from projects data`);
  return chunks;
}

// Function to read notes/blog posts
async function readNotes(): Promise<ContentChunk[]> {
  console.log(`Reading notes from ${NOTES_DIR}`);
  
  if (!fs.existsSync(NOTES_DIR)) {
    console.warn(`Notes directory not found: ${NOTES_DIR}`);
    return [];
  }
  
  const noteFiles = fs.readdirSync(NOTES_DIR).filter(f => f.endsWith('.md'));
  console.log(`Found ${noteFiles.length} markdown files`);
  
  const allChunks: ContentChunk[] = [];
  
  for (const file of noteFiles) {
    const filePath = path.join(NOTES_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    try {
      // Parse front-matter
      const { data, content: noteContent } = matter(content);
      const title = data.title || path.basename(file, '.md');
      const slug = data.slug || path.basename(file, '.md');
      const date = data.date || null;
      const lead = data.lead || data.summary || null;
      const tags = data.tags || [];
      const url = `/notes/${slug}`;
      
      // Generate chunks according to the rules
      const chunks = await processNoteContent(noteContent, title, slug, date, lead, url, tags);
      allChunks.push(...chunks);
      
    } catch (error) {
      console.error(`Error processing note ${file}:`, error);
    }
  }
  
  console.log(`Generated ${allChunks.length} chunks from ${noteFiles.length} notes`);
  return allChunks;
}

// Helper function to process note content into chunks according to rules
async function processNoteContent(
  content: string, 
  title: string, 
  slug: string, 
  date: string | null,
  lead: string | null,
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tags: string[]
): Promise<ContentChunk[]> {
  const chunks: ContentChunk[] = [];
  
  // 1. Always create a Summary chunk
  if (lead) {
    chunks.push({
      title: `${title} - Summary`,
      url,
      type: "note",
      section: "Summary",
      date,
      source: `note-${slug}-summary`,
      text: lead
    });
  }
  
  // Normalize content - trim whitespace, collapse multiple blank lines
  content = content.trim().replace(/\n{3,}/g, '\n\n');
  
  // Split the content by headings
  const sections: Array<{ heading: string; content: string }> = [];
  
  // Find content before first heading
  const lines = content.split('\n');
  let lineIndex = 0;
  let bodyContent = '';
  
  // Collect content before the first heading (if any)
  while (lineIndex < lines.length) {
    const line = lines[lineIndex];
    if (line.startsWith('## ') || line.startsWith('### ')) {
      break;
    }
    bodyContent += line + '\n';
    lineIndex++;
  }
  
  // If there's content before first heading and it's not just whitespace
  if (bodyContent.trim() && bodyContent !== lead) {
    sections.push({
      heading: 'Body',
      content: bodyContent.trim()
    });
  }
  
  // Process remaining content with headings
  let currentHeading = '';
  let currentContent = '';
  
  for (; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    
    if (line.startsWith('## ') || line.startsWith('### ')) {
      // If we have accumulated content, save the previous section
      if (currentHeading) {
        sections.push({
          heading: currentHeading,
          content: currentContent.trim()
        });
      }
      
      // Start a new section
      currentHeading = line.replace(/^#+\s+/, '');
      currentContent = '';
    } else {
      // Add to current section content
      currentContent += line + '\n';
    }
  }
  
  // Don't forget the last section
  if (currentHeading && currentContent.trim()) {
    sections.push({
      heading: currentHeading,
      content: currentContent.trim()
    });
  }
  
  // Process each section to create chunks
  for (const section of sections) {
    const sectionText = section.content;
    
    // If section is too large, split it on paragraph boundaries
    if (sectionText.length > 1200) {
      const paragraphs = sectionText.split(/\n\n+/);
      let currentChunk = '';
      let chunkCount = 1;
      
      for (const paragraph of paragraphs) {
        // If adding this paragraph would make the chunk too large, create a new chunk
        if (currentChunk && (currentChunk.length + paragraph.length) > 1200) {
          // Generate chunk with overlap for context
          const overlapStart = Math.max(0, currentChunk.length - 200);
          const overlap = currentChunk.substring(overlapStart);
          
          chunks.push({
            title: `${title} - ${section.heading} (Part ${chunkCount})`,
            url,
            type: "note",
            section: section.heading,
            date,
            source: `note-${slug}-${section.heading.toLowerCase().replace(/\s+/g, '-')}-p${chunkCount}`,
            text: currentChunk
          });
          
          // Start new chunk with overlap for context
          currentChunk = overlap + '\n\n' + paragraph;
          chunkCount++;
        } else {
          // Add to current chunk
          currentChunk = currentChunk ? currentChunk + '\n\n' + paragraph : paragraph;
        }
      }
      
      // Don't forget the last chunk
      if (currentChunk) {
        chunks.push({
          title: `${title} - ${section.heading}${chunkCount > 1 ? ` (Part ${chunkCount})` : ''}`,
          url,
          type: "note",
          section: section.heading,
          date,
          source: `note-${slug}-${section.heading.toLowerCase().replace(/\s+/g, '-')}${chunkCount > 1 ? `-p${chunkCount}` : ''}`,
          text: currentChunk
        });
      }
    } else {
      // Section fits in a single chunk
      chunks.push({
        title: `${title} - ${section.heading}`,
        url,
        type: "note",
        section: section.heading,
        date,
        source: `note-${slug}-${section.heading.toLowerCase().replace(/\s+/g, '-')}`,
        text: sectionText
      });
    }
  }
  
  // If there are no sections and no summary yet (rare case), create a default chunk
  if (chunks.length === 0) {
    chunks.push({
      title,
      url,
      type: "note",
      section: "Body",
      date,
      source: `note-${slug}`,
      text: content
    });
  }
  
  return chunks;
}

async function indexContent() {
  console.log("Starting content indexing...");
  
  // Initialize embeddings
  const embeddings = new GithubModelsEmbeddings();
  
  // Initialize text splitter (not actively used but keeping for reference)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 100
  });
  
  // Create the record manager schema if it doesn't exist
  console.log("Setting up record manager...");
  await recordManager.createSchema();
  
  // Initialize vector store with PGVectorStore
  const vectorStore = await PGVectorStore.initialize(embeddings, {
    pool: pgPool,
    tableName: "documents",
    columns: {
      idColumnName: 'id',
      vectorColumnName: 'embedding',
      contentColumnName: 'content',
      metadataColumnName: 'metadata',
    },
    distanceStrategy: "cosine",
  });
  
  console.log("\n==== Preparing documents for indexing ====");
  
  // 1. Process CV data
  console.log("\n==== Processing CV data ====");
  const cvData = readCVData();
  const cvDocs = cvData.map(item => 
    new Document({
      pageContent: item.text,
      metadata: {
        title: item.title,
        url: item.url,
        type: item.type,
        section: item.section,
        date: item.date,
        source: item.source
      }
    })
  );
  console.log(`Created ${cvDocs.length} CV documents`);
  
  // 2. Process projects data
  console.log("\n==== Processing Projects data ====");
  const projectsData = readProjectsData();
  const projectsDocs = projectsData.map(item => 
    new Document({
      pageContent: item.text,
      metadata: {
        title: item.title,
        url: item.url,
        type: item.type,
        section: item.section,
        date: item.date,
        source: item.source
      }
    })
  );
  console.log(`Created ${projectsDocs.length} Project documents`);
  
  // 3. Process notes/blog posts - now using the new chunking strategy
  console.log("\n==== Processing Notes/Blog posts ====");
  const notesData = await readNotes();
  
  const notesDocs = notesData.map(item => 
    new Document({
      pageContent: item.text,
      metadata: {
        title: item.title,
        url: item.url,
        type: item.type,
        section: item.section,
        date: item.date,
        source: item.source
      }
    })
  );
  console.log(`Created ${notesDocs.length} Note documents`);
  
  // 4. Combine all documents
  const allDocs = [...cvDocs, ...projectsDocs, ...notesDocs];
  console.log(`\nTotal documents: ${allDocs.length}`);
  
  // 5. Store in PostgreSQL using LangChain's incremental indexing
  console.log("\n==== Storing documents in PostgreSQL with incremental indexing ====");
  
  try {
    // Use LangChain's index function for intelligent, incremental indexing
    const result = await index({
      docsSource: allDocs,
      recordManager,
      vectorStore,
      options: {
        cleanup: "incremental", // Only process new/changed content
        sourceIdKey: "source",  // Use source metadata field to identify documents
      },
    });
    
    console.log("\n==== Indexing Results ====");
    console.log(`✅ Documents added: ${result.numAdded}`);
    console.log(`🔄 Documents updated: ${result.numUpdated}`);
    console.log(`🗑️  Documents deleted: ${result.numDeleted}`);
    console.log(`⏭️  Documents skipped (unchanged): ${result.numSkipped}`);
    
    // Calculate API call savings
    if (result.numSkipped > 0) {
      const totalDocs = allDocs.length;
      const savingsPercent = ((result.numSkipped / totalDocs) * 100).toFixed(1);
      console.log(`\n💰 API Call Savings: ${savingsPercent}% (${result.numSkipped}/${totalDocs} embeddings skipped)`);
    }
    
    console.log("\n✅ Indexing complete!");
  } catch (error) {
    console.error("\n❌ Indexing failed:", error);
    throw error;
  } finally {
    // Close connections gracefully
    try {
      // Set a timeout to avoid waiting too long for connections to close
      const timeout = setTimeout(() => {
        console.log("🔄 Connection cleanup completed (timeout)");
      }, 1000);
      
      await recordManager.end().catch(() => {
        // Silently ignore any connection cleanup errors
        // They're expected and harmless during shutdown
      });
      
      clearTimeout(timeout);
      console.log("🔄 Connection cleanup completed");
    } catch {
      // Catch-all to ensure we never throw during cleanup
    }
    // Close pgPool connections
    await pgPool.end();
  }
}

// Handle graceful shutdown
process.on('exit', () => {
  // This runs synchronously during exit - no async operations allowed
  // Just for cleanup that must happen before exit
});

process.on('SIGINT', () => {
  console.log("\n🛑 Process interrupted, cleaning up...");
  // Give time for cleanup before exiting
  setTimeout(() => process.exit(0), 500);
});

// Run the indexing function
indexContent()
  .then(() => {
    // Ensure clean exit after successful completion
    setTimeout(() => process.exit(0), 500);
  })
  .catch(error => {
    console.error("❌ Indexing failed:", error);
    process.exit(1);
  });