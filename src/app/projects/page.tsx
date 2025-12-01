'use client';

import { motion, type Variants } from 'framer-motion';
import Image from 'next/image';
import projectsData from "@public/content/projects.json";
import type { Project } from "@/types/projects-types";

const projects = projectsData as Project[];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const
    }
  }
};

function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5 }}
      className="group bg-gray-900/50 border border-gray-800/50 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-rose-500/50 transition-all duration-300 mb-6 break-inside-avoid"
    >
      {project.image && (
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-100 mb-2 group-hover:text-rose-400 transition-colors">
          {project.title}
        </h3>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
          {project.tagline}
        </p>
        {project.stack && project.stack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.stack.map((tech, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs bg-gray-800/50 text-gray-400 rounded-md border border-gray-700/50"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {project.links.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-xs font-medium bg-gray-800/50 hover:bg-rose-500/20 text-gray-300 hover:text-rose-400 rounded-lg border border-gray-700/50 hover:border-rose-500/50 transition-all"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ProjectsPage() {
  const filteredProjects = projects.filter(p => p.slug !== 'projects-index');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-100">Projects</h1>
          <p className="text-gray-400 text-lg">Showcase of my projects and work</p>
        </motion.div>

        {filteredProjects.length === 0 ? (
          <p className="text-gray-400">No projects yet. Check back soon!</p>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="columns-1 sm:columns-2 lg:columns-3 gap-6"
          >
            {filteredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
