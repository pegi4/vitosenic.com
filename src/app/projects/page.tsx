import { Metadata } from "next";
import Container from "@/components/Container";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@public/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Showcase of my projects and work as a developer and CS student.",
  openGraph: {
    title: "Vito Senič - Projects",
    description: "Showcase of my projects and work as a developer and CS student.",
    url: "https://vitosenic.com/projects",
    type: "website",
    images: [
      {
        url: "/images/og-projects.jpg", // Create this image in your public folder
        width: 1200,
        height: 630,
        alt: "Vito Senič Projects",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vito Senič - Projects",
    description: "Showcase of my projects and work as a developer and CS student.",
    images: ["/images/og-projects.jpg"], // Same image as OpenGraph
  },
  alternates: {
    canonical: "https://vitosenic.com/projects",
  },
};

export default function ProjectsPage() {
  // Create JSON-LD structured data for the projects collection
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": projects.map((project, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "SoftwareApplication",
          "name": project.title,
          "description": project.tagline,
          "applicationCategory": "WebApplication",
          "operatingSystem": "Any",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/OnlineOnly"
          },
          ...(project.image && {
            "image": `https://vitosenic.com${project.image}`
          }),
          "datePublished": `${project.year}-01-01`
        }
      }))
    }
  };
  
  return (
    <Container wide>
      {/* Add JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <div className="py-14">
        <h1 className="text-3xl sm:text-4xl md:text-4xl font-bold mb-6 sm:mb-8">Projects</h1>
        
        {projects.length === 0 ? (
          <p>No projects yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
