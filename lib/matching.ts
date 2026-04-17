// Haversine distance in km between two lat/lng points
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export interface MatchResult {
  seekerId: string;
  seekerEmail: string;
  seekerPhone: string | null;
  pinId: string;
  pinEmail: string | null;
  pinPhone: string | null;
  pinRent: number;
  pinBhk: number;
  pinSociety: string;
  distanceKm: number;
}

export function findMatches(
  seekers: Array<{
    id: string;
    city: string;
    lat: number;
    lng: number;
    budget_min: number | null;
    budget_max: number | null;
    bhk_pref: number | null;
    email: string;
    phone: string | null;
  }>,
  availablePins: Array<{
    id: string;
    city: string;
    lat: number;
    lng: number;
    rent: number;
    bhk: number;
    society: string;
    email: string | null;
    phone: string | null;
  }>
): MatchResult[] {
  const matches: MatchResult[] = [];

  for (const seeker of seekers) {
    for (const pin of availablePins) {
      if (seeker.city !== pin.city) continue;

      const distance = haversineDistance(
        seeker.lat,
        seeker.lng,
        pin.lat,
        pin.lng
      );
      if (distance > 3) continue;

      if (seeker.budget_max && pin.rent > seeker.budget_max) continue;
      if (seeker.budget_min && pin.rent < seeker.budget_min) continue;
      if (seeker.bhk_pref && seeker.bhk_pref !== pin.bhk) continue;

      if (!pin.email) continue; // Owner must have provided email for matching

      matches.push({
        seekerId: seeker.id,
        seekerEmail: seeker.email,
        seekerPhone: seeker.phone,
        pinId: pin.id,
        pinEmail: pin.email,
        pinPhone: pin.phone,
        pinRent: pin.rent,
        pinBhk: pin.bhk,
        pinSociety: pin.society,
        distanceKm: Math.round(distance * 10) / 10,
      });
    }
  }

  return matches;
}
