import Container from "@/components/Container";
import Link from "next/link";

export default function Home() {
  return (
    <Container>
      <div className="flex flex-col min-h-screen py-14">
        <div className="max-w-2xl text-lg font-medium">
          <h1 className="text-3xl sm:text-4xl md:text-4xl font-bold mb-6 sm:mb-8">Vito Senič</h1>
          
          <p className="mb-6 sm:mb-8 leading-relaxed">
            I&apos;m a CS student at FERI, exploring the space between code and business.
          </p>

          <p className="mb-6 sm:mb-8 leading-relaxed">
            Dive into my <Link href="/projects" className="text-blue-500 font-medium underline">[projects]</Link> or browse my <Link href="/notes" className="text-blue-500 font-medium underline">[notes]</Link> to see what I'm building and learning.
          </p>
          
          <p className="leading-relaxed">
            Connect with me on{' '}
            <a href="https://github.com/pegi4" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline font-medium">[github]</a>,{' '}
            <a href="https://x.com/vitosenic" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline font-medium">[x.com]</a>,{' '}
            <a href="https://linkedin.com/in/vitosenic" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline font-medium">[linkedin]</a>, or at{' '}
            <a className="underline">vito.senic at gmail dot com</a>!
          </p>
        </div>
      </div>
    </Container>
  );
}
