import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { Document } from "@langchain/core/documents";
import { supabaseAdmin } from "../src/utils/supabase";
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

// Parse the connection string to extract components
const connectionString = process.env.POSTGRES_URL_NON_POOLING!;
const url = new URL(connectionString);

// Initialize record manager with parsed connection options
const recordManager = new PostgresRecordManager("vitosenic_content", {
  postgresConnectionOptions: {
    host: url.hostname,
    port: parseInt(url.port),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading '/'
    // Proper SSL configuration
    ssl: {
      rejectUnauthorized: true,
      ca: process.env.SUPABASE_CA_CERT,
      servername: url.hostname,
    }
  },
  tableName: "upsertion_records",
});

// Create GitHub Embeddings class that implements LangChain's Embeddings interface
// This class is now imported directly from githubModels.ts

// Function to read CV data
// Function to read CV data
function readCVData(): any[] {
  console.log(`Reading CV data from ${CV_JSON}`);
  const cvRaw = fs.readFileSync(path.join(process.cwd(), CV_JSON), 'utf8');
  const cv = JSON.parse(cvRaw);
  
  const chunks: any[] = [];
  
  // Summary
  if (cv.summary) {
    chunks.push({
      source_type: "cv",
      title: "Summary",
      url: "/cv#summary",
      chunk: cv.summary
    });
  }
  
  // Focus now
  if (cv.focus_now) {
    chunks.push({
      source_type: "cv",
      title: "Now / Focus",
      url: "/cv#focus-now",
      chunk: cv.focus_now
    });
  }
  
  // Experience
  if (cv.experience) {
    cv.experience.forEach((job: any) => {
      chunks.push({
        source_type: "cv",
        title: `${job.company} — ${job.role}`,
        url: `/cv#${job.id}`,
        chunk: `${job.company} — ${job.role}\n${job.dates}\n${job.bullets?.join("\n")}`
      });
    });
  }
  
  // Skills
  if (cv.skills) {
    const skillsText = [
      `Web: ${cv.skills.web?.join(", ")}`,
      `Backend: ${cv.skills.backend?.join(", ")}`,
      `AI: ${cv.skills.ai?.join(", ")}`,
      `DevOps: ${cv.skills.devops?.join(", ")}`,
      `Languages: ${cv.skills.langs?.join(", ")}`
    ].join("\n");
    
    chunks.push({
      source_type: "cv",
      title: "Skills",
      url: "/cv#skills",
      chunk: skillsText
    });
  }
  
  // Education
  if (cv.education) {
    chunks.push({
      source_type: "cv",
      title: "Education",
      url: "/cv#education",
      chunk: cv.education.join("\n")
    });
  }
  
  // Roadmap
  if (cv.roadmap) {
    const roadmapText = cv.roadmap.map((item: any) => 
      `${item.year}: ${item.milestone}`
    ).join("\n");
    
    chunks.push({
      source_type: "cv",
      title: "Roadmap",
      url: "/cv#roadmap",
      chunk: roadmapText
    });
  }
  
  // Other
  if (cv.other) {
    const otherText = [
      `Born: ${cv.other.born}`,
      `Music: ${cv.other.music}`,
      `Favorite Book: ${cv.other.favorite_book}`,
      `Quote: ${cv.other.quote}`,
      `Personality: ${cv.other.personality}`,
      `Dream Car: ${cv.other.dream_car}`,
      `Dream Motorbike: ${cv.other.dream_motorbike}`
    ].join("\n");
    
    chunks.push({
      source_type: "cv",
      title: "Other",
      url: "/cv#other",
      chunk: otherText
    });
  }
  
  console.log(`Generated ${chunks.length} chunks from CV data`);
  return chunks;
}

// Function to read projects data
function readProjectsData(): any[] {
  console.log(`Reading projects data from ${PROJECTS_JSON}`);
  const projectsRaw = fs.readFileSync(path.join(process.cwd(), PROJECTS_JSON), 'utf8');
  const projects = JSON.parse(projectsRaw);
  
  const chunks = projects.map((project: any) => {
    const linksText = project.links?.map((link: any) => 
      `${link.label}: ${link.url}`
    ).join(", ");
    
    return {
      source_type: "project",
      title: project.title,
      url: `/projects#${project.slug}`,
      chunk: [
        `Title: ${project.title}`,
        `Year: ${project.year}`,
        `Stack: ${project.stack?.join(", ")}`,
        `Tagline: ${project.tagline}`,
        linksText ? `Links: ${linksText}` : null
      ].filter(Boolean).join("\n")
    };
  });
  
  console.log(`Generated ${chunks.length} chunks from projects data`);
  return chunks;
}

// Function to read notes/blog posts
async function readNotes(): Promise<any[]> {
  console.log(`Reading notes from ${NOTES_DIR}`);
  
  if (!fs.existsSync(NOTES_DIR)) {
    console.warn(`Notes directory not found: ${NOTES_DIR}`);
    return [];
  }
  
  const noteFiles = fs.readdirSync(NOTES_DIR).filter(f => f.endsWith('.md'));
  console.log(`Found ${noteFiles.length} markdown files`);
  
  const notes = [];
  
  for (const file of noteFiles) {
    const filePath = path.join(NOTES_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    try {
      const { data, content: noteContent } = matter(content);
      notes.push({
        title: data.title || path.basename(file, '.md'),
        slug: data.slug || path.basename(file, '.md'),
        content: noteContent,
        tags: data.tags || []
      });
    } catch (error) {
      console.error(`Error processing note ${file}:`, error);
    }
  }
  
  console.log(`Processed ${notes.length} notes`);
  return notes;
}

async function indexContent() {
  console.log("Starting content indexing...");
  
  // Initialize embeddings
  const embeddings = new GithubModelsEmbeddings();
  
  // Initialize text splitter
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 100
  });
  
  // Create the record manager schema if it doesn't exist
  console.log("Setting up record manager...");
  await recordManager.createSchema();
  
  // Initialize vector store
  const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabaseAdmin,
    tableName: "documents",
    queryName: "match_docs"
  });
  
  console.log("\n==== Preparing documents for indexing ====");
  
  // 1. Process CV data
  console.log("\n==== Processing CV data ====");
  const cvData = readCVData();
  const cvDocs = cvData.map(item => 
    new Document({
      pageContent: item.chunk,
      metadata: {
        source: `cv_${item.url.replace("/cv#", "")}`,
        title: item.title,
        url: item.url
      }
    })
  );
  console.log(`Created ${cvDocs.length} CV documents`);
  
  // 2. Process projects data
  console.log("\n==== Processing Projects data ====");
  const projectsData = readProjectsData();
  const projectsDocs = projectsData.map(item => 
    new Document({
      pageContent: item.chunk,
      metadata: {
        source: `project_${item.url.replace("/projects#", "")}`,
        title: item.title,
        url: item.url
      }
    })
  );
  console.log(`Created ${projectsDocs.length} Project documents`);
  
  // 3. Process notes/blog posts
  console.log("\n==== Processing Notes/Blog posts ====");
  const notesData = await readNotes();
  
  let notesDocs: Document[] = [];
  for (const note of notesData) {
    const chunks = await textSplitter.splitText(note.content);
    const docs = chunks.map((chunk, i) => 
      new Document({
        pageContent: chunk,
              metadata: {
        source: `note_${note.slug}${i > 0 ? `_chunk_${i}` : ''}`,
        title: chunks.length > 1 ? `${note.title} (Part ${i+1})` : note.title,
        url: `/notes/${note.slug}`,
        tags: note.tags?.join(", ")
      }
      })
    );
    notesDocs.push(...docs);
  }
  console.log(`Created ${notesDocs.length} Note documents`);
  
  // 4. Combine all documents
  const allDocs = [...cvDocs, ...projectsDocs, ...notesDocs];
  console.log(`\nTotal documents: ${allDocs.length}`);
  
  // 5. Store in Supabase using LangChain's incremental indexing
  console.log("\n==== Storing documents in Supabase with incremental indexing ====");
  
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
    // No need to close vectorStore as it uses Supabase client
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