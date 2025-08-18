import { getAllPostsMeta } from '@/lib/blog';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://vitosenic.com';
  
  // Base routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ] as MetadataRoute.Sitemap;
  
  // Get all blog posts
  const posts = await getAllPostsMeta();
  
  // Add blog posts to sitemap
  const postRoutes = posts.map(post => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  })) as MetadataRoute.Sitemap;
  
  return [...routes, ...postRoutes];
}
