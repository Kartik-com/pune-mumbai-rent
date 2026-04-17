import { MetadataRoute } from 'next';
import { CITIES, slugify } from '@/lib/cities';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pune.rent';

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // City pages
  Object.keys(CITIES).forEach((city) => {
    routes.push({
      url: `${baseUrl}/${city}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    });

    // Neighborhood pages
    CITIES[city].neighborhoods.forEach((neighborhood) => {
      routes.push({
        url: `${baseUrl}/${city}/${slugify(neighborhood)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  });

  // Static pages
  routes.push(
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    }
  );

  return routes;
}
