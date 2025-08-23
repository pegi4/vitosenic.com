import Container from "@/components/Container";
import Link from "next/link";

export default function Home() {
  return (
    <Container>
      <div className="flex flex-col min-h-screen py-14">
        <div className="max-w-2xl text-lg font-medium">
          <h1 className="text-3xl sm:text-4xl md:text-4xl font-bold mb-6 sm:mb-8">
            Vito Senič
          </h1>

          <p className="mb-6 sm:mb-8 leading-relaxed">
            I’m a CS student at FERI, exploring the space between code and business.
          </p>

          <p className="mb-6 sm:mb-8 leading-relaxed">
            Recently, I built my own{" "}
            <Link
              href="/chat"
              className="inline-flex items-center px-3 py-1 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              personal AI chat
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
            . It’s not perfect, but I’m proud of it. 
            If you’re curious how I made it, I wrote about the process{" "}
            <Link
              href="/notes/building-personal-ai-chat"
              className="text-rose-500 font-medium underline"
            >
              [here]
            </Link>
            .
          </p>

          <p className="mb-6 sm:mb-8 leading-relaxed">
            You can also browse my{" "}
            <Link
              href="/projects"
              className="text-rose-500 font-medium underline hover:text-rose-600 transition-colors duration-200"
            >
              [projects]
            </Link>{" "}
            and{" "}
            <Link
              href="/notes"
              className="text-rose-500 font-medium underline hover:text-rose-600 transition-colors duration-200"
            >
              [notes]
            </Link>
            .
          </p>

          <p className="leading-relaxed">
            Connect with me on{" "}
            <a
              href="https://github.com/pegi4"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-500 underline font-medium hover:text-rose-600 transition-colors duration-200"
            >
              [github]
            </a>
            ,{" "}
            <a
              href="https://x.com/vitosenic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-500 underline font-medium hover:text-rose-600 transition-colors duration-200"
            >
              [x.com]
            </a>
            ,{" "}
            <a
              href="https://linkedin.com/in/vitosenic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-500 underline font-medium hover:text-rose-600 transition-colors duration-200"
            >
              [linkedin]
            </a>
            , or at{" "}
            <a className="underline hover:text-gray-700 transition-colors duration-200">vito.senic at gmail dot com</a>.
          </p>
        </div>
      </div>
    </Container>
  );
}
