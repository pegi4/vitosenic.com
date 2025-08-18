import Container from "@/components/Container";
import Link from "next/link";

export default function Home() {
  return (
    <Container>
      <div className="flex flex-col min-h-screen py-4 md:py-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Vito Senič</h1>
          
          <p className=" mb-6 sm:mb-8 leading-relaxed">
            CS student with a builder's mindset — diving deep from code to business strategy to create solutions that actually work in the real world.
            Building in public and connecting with builders, founders, and innovators.
          </p>
          
          <ul className="list-disc pl-5 mb-6 sm:mb-8 space-y-1 sm:space-y-2">
            <li>
              <Link href="/blog" className="block text-blue-500 font-medium underline">
                blog
              </Link>
            </li>
            <li>
              <Link href="/projects" className="block text-blue-500 font-medium underline">
                projects
              </Link>
            </li>
          </ul>
          
          <p className="leading-relaxed">
            Connect with me on{' '}
            <a href="https://github.com/pegi4" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline font-medium">github</a>,{' '}
            <a href="https://x.com/vitosenic" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline font-medium">X.com</a>,{' '}
            <a href="https://linkedin.com/in/vitosenic" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline font-medium">linkedin</a>, or at{' '}
            <a className="underline">vito.senic at gmail dot com</a>!
          </p>
        </div>
      </div>
    </Container>
  );
}
