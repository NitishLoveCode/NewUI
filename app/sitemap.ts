import type { MetadataRoute } from 'next';
import { getPublishedSeedPosts } from '@/lib/cms/seed';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/news`, changeFrequency: 'hourly', priority: 0.9 },
  ];

  const posts: MetadataRoute.Sitemap = getPublishedSeedPosts().map((p) => ({
    url: `${SITE_URL}/news/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'weekly',
    priority: p.featured ? 0.9 : 0.7,
  }));

  return [...staticRoutes, ...posts];
}
