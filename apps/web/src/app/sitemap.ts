import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chinaislandgrill.com';
const lastUpdated = new Date('2026-01-15');

/**
 * Generates XML sitemap entries for search engine indexing.
 *
 * Returns static routes with priorities and change frequencies.
 * Uses a fixed lastModified date to prevent unnecessary re-crawls on each build.
 * Excludes /checkout (user-specific page that shouldn't be indexed).
 * The base URL is configurable via NEXT_PUBLIC_SITE_URL environment variable.
 *
 * @returns Array of sitemap entries with URLs, priorities, and metadata
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: lastUpdated,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/menu`,
      lastModified: lastUpdated,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/order`,
      lastModified: lastUpdated,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/location`,
      lastModified: lastUpdated,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];
}
