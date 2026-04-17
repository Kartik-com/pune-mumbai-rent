const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search';

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
}

let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < 1000) {
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 - timeSinceLastRequest)
    );
  }
  lastRequestTime = Date.now();
  return fetch(url, {
    headers: {
      'User-Agent': 'CityRentMap/1.0 (https://pune.rent)',
    },
  });
}

export async function searchLocation(
  query: string,
  city: string
): Promise<NominatimResult[]> {
  const params = new URLSearchParams({
    q: `${query}, ${city}, India`,
    format: 'json',
    limit: '5',
    countrycodes: 'in',
  });

  const response = await rateLimitedFetch(`${NOMINATIM_BASE}?${params}`);
  if (!response.ok) {
    throw new Error(`Nominatim request failed: ${response.status}`);
  }
  return response.json();
}

export async function geocodeNeighborhood(
  neighborhood: string,
  city: string
): Promise<{ lat: number; lng: number } | null> {
  const results = await searchLocation(neighborhood, city);
  if (results.length === 0) return null;
  return {
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
  };
}
