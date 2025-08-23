import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import { getAllPostsMeta, getPostBySlug, markdownToHtml } from "@/lib/notes";
import { formatISO9075, formatISO } from "date-fns";

// Define the type for params
type Params = {
  slug: string;
};

// Generate metadata for the page based on the post
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const { meta } = await getPostBySlug(resolvedParams.slug);
    
    return {
      title: meta.title,
      description: meta.summary,
      openGraph: {
        title: meta.title,
        description: meta.summary,
        type: 'article',
        url: `https://vitosenic.com/notes/${meta.slug}`,
        ...(meta.cover && { 
          images: [{ url: meta.cover, width: 1200, height: 630 }] 
        }),
      },
      alternates: {
        canonical: meta.canonical || `https://vitosenic.com/notes/${meta.slug}`,
      },
    };
  } catch {
    return {
      title: 'Post Not Found',
    };
  }
}

// Generate static params for all posts
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = await getAllPostsMeta();
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  try {
    // Get the post data
    const resolvedParams = await params;
    const { meta, content } = await getPostBySlug(resolvedParams.slug);
    
    // Convert the markdown content to HTML
    const contentHtml = await markdownToHtml(content);
    
    // Prepare JSON-LD structured data for the blog post
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": meta.title,
      "datePublished": formatISO(new Date(meta.date)),
      "dateModified": formatISO(new Date(meta.date)),
      "description": meta.summary,
      "author": {
        "@type": "Person",
        "name": "Vito Senič",
        "url": "https://vitosenic.com"
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://vitosenic.com/notes/${meta.slug}`
      },
      ...(meta.cover && {
        "image": {
          "@type": "ImageObject",
          "url": `https://vitosenic.com${meta.cover}`,
        }
      }),
      "publisher": {
        "@type": "Person",
        "name": "Vito Senič",
        "logo": {
          "@type": "ImageObject",
          "url": "https://vitosenic.com/favicon.ico"
        }
      },
      ...(meta.tags && meta.tags.length > 0 && {
        "keywords": meta.tags.join(", ")
      })
    };
    
    return (
      <Container>
        {/* Add JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
        <article className="py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{meta.title}</h1>
            
            <time className="text-gray-600 block mb-4" dateTime={meta.date}>
              {formatISO9075(new Date(meta.date), { representation: 'date' })}
            </time>
            
            {meta.cover ? (
              <div className="mb-6 relative aspect-video">
                <Image 
                  src={meta.cover}
                  alt={`Cover image for ${meta.title}`}
                  fill
                  sizes="(min-width: 1024px) 700px, 100vw"
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
            ) : null}
            
            {meta.tags && meta.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {meta.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="bg-gray-100 px-2 py-1 rounded-md text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>
          
          <div 
            className="prose prose-slate prose-headings:font-bold prose-a:text-rose-500 prose-a:underline prose-a:hover:text-rose-600 max-w-none"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </article>
      </Container>
    );
  } catch {
    notFound();
  }
}
