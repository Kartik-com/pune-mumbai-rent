import { Metadata } from 'next';
import { CITIES, slugify, CityConfig } from './cities';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pune.rent';

export function generateCityMetadata(citySlug: string): Metadata {
  const city = CITIES[citySlug];
  if (!city) {
    return { title: 'Not Found' };
  }

  return {
    title: `${city.title} | ${citySlug}.rent`,
    description: city.description,
    openGraph: {
      title: city.title,
      description: city.description,
      type: 'website',
      url: `${SITE_URL}/${citySlug}`,
      images: [`/og/${citySlug}-og.png`],
    },
    twitter: {
      card: 'summary_large_image',
      title: city.title,
      description: city.description,
      images: [`/og/${citySlug}-og.png`],
    },
    alternates: {
      canonical: `${SITE_URL}/${citySlug}`,
    },
  };
}

export function generateNeighborhoodMetadata(
  citySlug: string,
  neighborhood: string
): Metadata {
  const city = CITIES[citySlug];
  if (!city) {
    return { title: 'Not Found' };
  }
  const neighborhoodSlug = slugify(neighborhood);

  return {
    title: `${neighborhood} Rent Prices — ${city.name} | ${citySlug}.rent`,
    description: `See real 1BHK, 2BHK, 3BHK rent prices in ${neighborhood}, ${city.name} reported by actual residents. Average rents, gated vs non-gated, furnished vs unfurnished.`,
    openGraph: {
      title: `${neighborhood} Rent Prices — ${city.name}`,
      description: `See real 1BHK, 2BHK, 3BHK rent prices in ${neighborhood}, ${city.name} reported by actual residents.`,
      type: 'website',
      url: `${SITE_URL}/${citySlug}/${neighborhoodSlug}`,
      images: [`/og/${citySlug}-og.png`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${neighborhood} Rent Prices — ${city.name}`,
      description: `Real rent data in ${neighborhood}, ${city.name}.`,
    },
    alternates: {
      canonical: `${SITE_URL}/${citySlug}/${neighborhoodSlug}`,
    },
  };
}

export function generateFAQJsonLd(
  neighborhood: string,
  city: CityConfig,
  stats: { bhk: number; avg_rent: number; count: number }[]
) {
  const questions = stats.map((s) => ({
    '@type': 'Question',
    name: `What is the average ${s.bhk}BHK rent in ${neighborhood}, ${city.name}?`,
    acceptedAnswer: {
      '@type': 'Answer',
      text: `Based on ${s.count} community-reported pins, the average ${s.bhk}BHK rent in ${neighborhood} is ₹${Math.round(s.avg_rent).toLocaleString('en-IN')}/month.`,
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions,
  };
}

export function generateBreadcrumbJsonLd(
  citySlug: string,
  cityName: string,
  neighborhood?: string
) {
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: cityName,
      item: `${SITE_URL}/${citySlug}`,
    },
  ];

  if (neighborhood) {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: neighborhood,
      item: `${SITE_URL}/${citySlug}/${slugify(neighborhood)}`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}
