import { getAllPostsMeta } from '@/lib/blog';
import { formatISO } from 'date-fns';

export async function GET() {
  // Get all blog posts metadata
  const posts = await getAllPostsMeta();
  const siteUrl = 'https://vitosenic.com';

  // Generate RSS XML
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Vito Senic — Blog</title>
    <link>${siteUrl}</link>
    <description>CS student with a builder's mindset — diving deep from code to business strategy to create solutions that actually work in the real world.</description>
    <language>en-us</language>
    <lastBuildDate>${formatISO(new Date())}</lastBuildDate>
    <atom:link href="${siteUrl}/rss" rel="self" type="application/rss+xml"/>
    ${posts
      .map(post => {
        return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <pubDate>${formatISO(new Date(post.date))}</pubDate>
      <description><![CDATA[${post.summary}]]></description>
    </item>`;
      })
      .join('')}
  </channel>
</rss>`;

  // Return XML with appropriate content type
  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
