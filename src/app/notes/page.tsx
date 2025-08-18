import { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import { getAllPostsMeta } from "@/lib/notes";
import { formatISO9075 } from "date-fns";

export const metadata: Metadata = {
  title: "Notes",
  description: "Articles on software development, projects, and more.",
};

export default async function NotesPage() {
  const posts = await getAllPostsMeta();

  return (
    <Container>
      <div className="py-14">
        <h1 className="text-3xl sm:text-4xl md:text-4xl font-bold mb-6 sm:mb-8">Notes</h1>
        
        {posts.length === 0 ? (
          <p>No posts yet. Check back soon!</p>
        ) : (
          <ul className="space-y-8">
            {posts.map((post) => (
              <li key={post.slug} className="border-b pb-8">
                <article>
                  <Link href={`/notes/${post.slug}`}>
                    <h2 className="text-xl font-medium hover:underline">{post.title}</h2>
                  </Link>
                  
                  <time className="text-sm text-gray-600 block mt-1">
                    {formatISO9075(new Date(post.date), { representation: 'date' })}
                  </time>
                  
                  {post.summary && (
                    <p className="mt-2 text-gray-700">{post.summary}</p>
                  )}
                  
                  <div className="mt-3">
                    <Link 
                      href={`/notes/${post.slug}`}
                      className="text-sm font-medium hover:underline"
                    >
                      Read more →
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
