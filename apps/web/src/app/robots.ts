import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chinaislandgrill.com';

/**
 * Generates robots.txt directives for search engine crawlers.
 *
 * Allows all user agents to crawl all pages and references the sitemap location.
 * The base URL is configurable via NEXT_PUBLIC_SITE_URL environment variable.
 *
 * @returns Next.js robots metadata configuration
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/checkout', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
