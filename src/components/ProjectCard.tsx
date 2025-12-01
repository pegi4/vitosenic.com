import Image from "next/image";
import type { Project } from "@/types/projects-types";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="group flex flex-col bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative aspect-video overflow-hidden">
        {project.image ? (
          <Image
            src={project.image}
            alt={`${project.title} - ${project.tagline}`}
            fill
            sizes="(min-width: 1280px) 384px, (min-width: 768px) 50vw, 100vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cpath d='M0 0h40v40H0z' fill='%23f5f5f5'/%3E%3C/svg%3E"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-rose-600 transition-colors duration-200 mb-2">
            {project.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {project.tagline}
          </p>
        </div>

        <div className="mt-auto pt-3 flex flex-wrap gap-2">
  {project.links.map((link: { type: string; label: string; url: string; gated?: boolean }, index: number) => {
    let bgClass = "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300";
    
    if (link.type === "demo") {
      bgClass = "bg-black border border-black text-white hover:bg-gray-800 hover:border-gray-700";
    }
    
    return (
      <a
        key={`${link.url}-${index}`}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
                        className={`text-xs font-medium ${bgClass} px-3 py-2.5 rounded-md inline-flex items-center transition-all duration-200 ease-in-out cursor-pointer hover:scale-105 transform`}
      >
        <span className="hover:underline hover:underline-offset-2">{link.label}</span>
        {link.gated && " 🔒"}
      </a>
    );
  })}
</div>
      </div>
    </div>
  );
}
