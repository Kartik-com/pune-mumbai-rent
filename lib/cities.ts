export interface CityConfig {
  name: string;
  lat: number;
  lng: number;
  zoom: number;
  slug: string;
  title: string;
  description: string;
  stateCode: string;
  neighborhoods: string[];
}

export const CITIES: Record<string, CityConfig> = {
  pune: {
    name: 'Pune',
    lat: 18.5204,
    lng: 73.8567,
    zoom: 13.5,
    slug: 'pune',
    title: 'Pune Rent Map — Real Rent Prices by Area',
    description:
      'See actual rent prices across Koregaon Park, Baner, Hinjewadi, Kharadi and all Pune areas. Anonymous, community-reported rent data. 1BHK, 2BHK, 3BHK rents in Pune.',
    stateCode: 'MH',
    neighborhoods: [
      'Koregaon Park',
      'Kalyani Nagar',
      'Viman Nagar',
      'Kharadi',
      'Baner',
      'Aundh',
      'Hinjewadi',
      'Wakad',
      'Pimpri-Chinchwad',
      'Shivajinagar',
      'Deccan',
      'Camp',
      'Kothrud',
      'Hadapsar',
      'Magarpatta',
      'Bibwewadi',
      'Warje',
      'Sinhagad Road',
      'Kondhwa',
      'Undri',
      'Ambegaon',
      'Katraj',
      'Bavdhan',
      'Balewadi',
      'Pashan',
      'Sus Road',
      'Punawale',
      'Tathawade',
      'Moshi',
      'Charholi',
    ],
  },
  mumbai: {
    name: 'Mumbai',
    lat: 19.076,
    lng: 72.8777,
    zoom: 13.5,
    slug: 'mumbai',
    title: 'Mumbai Rent Map — Real Rent Prices by Area',
    description:
      'See actual rent prices across Bandra, Andheri, Powai, Thane and all Mumbai areas. Anonymous, community-reported rent data. 1BHK, 2BHK, 3BHK rents in Mumbai.',
    stateCode: 'MH',
    neighborhoods: [
      'Bandra',
      'Andheri West',
      'Andheri East',
      'Powai',
      'Malad',
      'Goregaon',
      'Kandivali',
      'Borivali',
      'Thane',
      'Navi Mumbai',
      'Kharghar',
      'Belapur',
      'Panvel',
      'Dadar',
      'Prabhadevi',
      'Matunga',
      'Sion',
      'Kurla',
      'Ghatkopar',
      'Vikhroli',
      'Mulund',
      'Worli',
      'Lower Parel',
      'BKC',
      'Santacruz',
      'Juhu',
      'Versova',
      'Chembur',
      'Govandi',
      'Mankhurd',
      'Dharavi',
      'Wadala',
    ],
  },
};

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getNeighborhoodBySlug(
  city: string,
  slug: string
): string | undefined {
  const cityConfig = CITIES[city];
  if (!cityConfig) return undefined;
  return cityConfig.neighborhoods.find((n) => slugify(n) === slug);
}

export function getCityBySlug(slug: string): CityConfig | undefined {
  return CITIES[slug];
}

export function getAllCitySlugs(): string[] {
  return Object.keys(CITIES);
}

export function getNearbyNeighborhoods(
  city: string,
  neighborhood: string,
  count: number = 3
): string[] {
  const cityConfig = CITIES[city];
  if (!cityConfig) return [];
  const idx = cityConfig.neighborhoods.indexOf(neighborhood);
  if (idx === -1) return cityConfig.neighborhoods.slice(0, count);
  const nearby: string[] = [];
  for (let i = 1; nearby.length < count; i++) {
    if (idx + i < cityConfig.neighborhoods.length)
      nearby.push(cityConfig.neighborhoods[idx + i]);
    if (nearby.length < count && idx - i >= 0)
      nearby.push(cityConfig.neighborhoods[idx - i]);
  }
  return nearby.slice(0, count);
}
