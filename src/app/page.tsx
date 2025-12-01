'use client';

import { motion, type Variants } from 'framer-motion';
import Image from 'next/image';
import ChatInterface from '@/components/ChatInterface';
import projectsData from '@public/content/projects.json';
import type { Project } from '@/types/projects-types';

// Filter out the index project
const projects = projectsData as Project[];
const featuredProjects = projects.filter(p => p.slug !== 'projects-index').slice(0, 3);

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
      className="group bg-gray-900/50 border border-gray-800/50 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-rose-500/50 transition-all duration-300"
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

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto">
          {/* Intro Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 flex flex-col items-center justify-center"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
              Vito Senič
            </h1>
          </motion.div>

          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8"
          >
            <ChatInterface />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center text-gray-500"
          >
            <span className="text-sm mb-2">Scroll to explore</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-100">Featured Projects</h2>
            <p className="text-gray-400 text-lg">Some of the things I&apos;ve built</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {featuredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <a
              href="/projects"
              className="inline-flex items-center px-6 py-3 bg-gray-900/50 hover:bg-gray-800/50 text-gray-300 hover:text-rose-400 rounded-xl border border-gray-800/50 hover:border-rose-500/50 transition-all"
            >
              View All Projects
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-8 text-gray-100">Let&apos;s Connect</h2>
            
            <div className="flex flex-wrap justify-center gap-6">
              <motion.a
                href="https://github.com/pegi4"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gray-900/50 hover:bg-gray-800/50 text-gray-300 hover:text-rose-400 rounded-xl border border-gray-800/50 hover:border-rose-500/50 transition-all"
              >
                GitHub
              </motion.a>
              <motion.a
                href="https://x.com/vitosenic"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gray-900/50 hover:bg-gray-800/50 text-gray-300 hover:text-rose-400 rounded-xl border border-gray-800/50 hover:border-rose-500/50 transition-all"
              >
                X.com
              </motion.a>
              <motion.a
                href="https://linkedin.com/in/vitosenic"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gray-900/50 hover:bg-gray-800/50 text-gray-300 hover:text-rose-400 rounded-xl border border-gray-800/50 hover:border-rose-500/50 transition-all"
              >
                LinkedIn
              </motion.a>
              <motion.a
                href="mailto:vito.senic@gmail.com"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white rounded-xl transition-all shadow-lg shadow-rose-500/20"
              >
                Email
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
