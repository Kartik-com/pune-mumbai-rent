export interface Landmark {
  name: string;
  coords: [number, number];
  type: 'mall' | 'it_park' | 'landmark' | 'park';
  city: 'pune' | 'mumbai';
}

export const LANDMARKS: Landmark[] = [
  // ── PUNE ──
  { name: 'Phoenix Marketcity', coords: [18.5622, 73.9168], type: 'mall', city: 'pune' },
  { name: 'Amanora Mall', coords: [18.5195, 73.9312], type: 'mall', city: 'pune' },
  { name: 'Seasons Mall', coords: [18.5198, 73.9333], type: 'mall', city: 'pune' },
  { name: 'EON IT Park', coords: [18.5516, 73.9515], type: 'it_park', city: 'pune' },
  { name: 'Magarpatta Cybercity', coords: [18.5152, 73.9272], type: 'it_park', city: 'pune' },
  { name: 'Hinjewadi IT Park Ph 1', coords: [18.5913, 73.7389], type: 'it_park', city: 'pune' },
  { name: 'SP Infocity', coords: [18.4967, 73.9740], type: 'it_park', city: 'pune' },
  { name: 'Shaniwar Wada', coords: [18.5194, 73.8553], type: 'landmark', city: 'pune' },
  { name: 'Dagdusheth Ganpati', coords: [18.5163, 73.8560], type: 'landmark', city: 'pune' },
  { name: 'Savitribai Phule Univ', coords: [18.5515, 73.8242], type: 'landmark', city: 'pune' },

  // ── MUMBAI ──
  { name: 'Gateway of India', coords: [18.9220, 72.8347], type: 'landmark', city: 'mumbai' },
  { name: 'Phoenix Marketcity', coords: [19.0883, 72.8900], type: 'mall', city: 'mumbai' },
  { name: 'R City Mall', coords: [19.0998, 72.9163], type: 'mall', city: 'mumbai' },
  { name: 'BKC Business Dist', coords: [19.0607, 72.8644], type: 'it_park', city: 'mumbai' },
  { name: 'Nesco IT Park', coords: [19.1500, 72.8540], type: 'it_park', city: 'mumbai' },
  { name: 'Juhu Beach', coords: [19.1075, 72.8263], type: 'park', city: 'mumbai' },
  { name: 'Bandra Fort', coords: [19.0413, 72.8185], type: 'landmark', city: 'mumbai' },
  { name: 'Marine Drive', coords: [18.9400, 72.8200], type: 'park', city: 'mumbai' },
];
