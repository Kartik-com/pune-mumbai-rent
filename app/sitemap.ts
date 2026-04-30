import { MetadataRoute } from 'next';
import { CITIES, slugify } from '@/lib/cities';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pune.rent';

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemaps: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Add City Pages
  Object.keys(CITIES).forEach((citySlug) => {
    sitemaps.push({
      url: `${SITE_URL}/${citySlug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    });

    // Add Locality Pages
    CITIES[citySlug].neighborhoods.forEach((locality) => {
      sitemaps.push({
        url: `${SITE_URL}/${citySlug}/${slugify(locality)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });
  });

  return sitemaps;
}
