/**
 * City Metro Data — Real Geographic Station Coordinates
 * 
 * Pune: Purple Line (PCMC–Swargate) & Aqua Line (Vanaz–Ramwadi)
 * Mumbai: Line 1 (Versova–Ghatkopar), Line 2A (Dahisar–DN Nagar), Line 7 (Dahisar East–Andheri East)
 */

export interface MetroStation {
  name: string;
  coords: [number, number]; // [lat, lng]
  interchange?: boolean;
}

export interface MetroLine {
  id: string;
  name: string;
  color: string;
  stations: MetroStation[];
}

// ═══════════════════════════════
// PUNE METRO
// ═══════════════════════════════

const CIVIL_COURT: MetroStation = {
  name: 'Civil Court',
  coords: [18.52689, 73.85802],
  interchange: true,
};

const punePurpleLine: MetroLine = {
  id: 'pune-purple',
  name: 'Purple Line',
  color: '#9b6dff',
  stations: [
    { name: 'PCMC',               coords: [18.6294,  73.8033] },
    { name: 'Sant Tukaram Nagar',  coords: [18.6188,  73.8065] },
    { name: 'Nashik Phata',        coords: [18.6095,  73.8120] },
    { name: 'Kasarwadi',           coords: [18.6010,  73.8175] },
    { name: 'Phugewadi',           coords: [18.5935,  73.8260] },
    { name: 'Dapodi',              coords: [18.5838,  73.8338] },
    { name: 'Bopodi',              coords: [18.5697,  73.8381] },
    { name: 'Khadki',              coords: [18.5543,  73.8421] },
    { name: 'Range Hills',         coords: [18.5430,  73.8430] },
    { name: 'Shivaji Nagar',       coords: [18.5327,  73.8495] },
    { ...CIVIL_COURT },
    { name: 'Kasba Peth',          coords: [18.5195,  73.8580] },
    { name: 'Mandai',              coords: [18.5135,  73.8575] },
    { name: 'Swargate',            coords: [18.5018,  73.8625] },
  ],
};

const puneAquaLine: MetroLine = {
  id: 'pune-aqua',
  name: 'Aqua Line',
  color: '#3ecfc8',
  stations: [
    { name: 'Vanaz',               coords: [18.5098,  73.8052] },
    { name: 'Anand Nagar',         coords: [18.5096,  73.8141] },
    { name: 'Ideal Colony',        coords: [18.5092,  73.8225] },
    { name: 'Nal Stop',            coords: [18.5085,  73.8310] },
    { name: 'Garware College',     coords: [18.5115,  73.8390] },
    { name: 'Deccan Gymkhana',     coords: [18.5152,  73.8440] },
    { name: 'Sambhaji Park',       coords: [18.5190,  73.8480] },
    { name: 'PMC',                 coords: [18.5230,  73.8530] },
    { ...CIVIL_COURT },
    { name: 'Mangalwar Peth',      coords: [18.5280,  73.8645] },
    { name: 'Pune Railway Station', coords: [18.5297, 73.8726] },
    { name: 'Ruby Hall Clinic',    coords: [18.5340,  73.8810] },
    { name: 'Bund Garden',         coords: [18.5380,  73.8870] },
    { name: 'Yerawada',            coords: [18.5440,  73.8945] },
    { name: 'Kalyani Nagar',       coords: [18.5444,  73.9057] },
    { name: 'Ramwadi',             coords: [18.5530,  73.9170] },
  ],
};

// ═══════════════════════════════
// MUMBAI METRO
// ═══════════════════════════════

// Interchange: Andheri is shared by Line 1 and Line 7
const ANDHERI_IX: MetroStation = {
  name: 'Andheri',
  coords: [19.1197, 72.8464],
  interchange: true,
};

// D.N. Nagar is shared by Line 1 and Line 2A
const DN_NAGAR_IX: MetroStation = {
  name: 'D.N. Nagar',
  coords: [19.1268, 72.8365],
  interchange: true,
};

const mumbaiLine1: MetroLine = {
  id: 'mumbai-line1',
  name: 'Line 1 — Blue Line',
  color: '#0077c8',
  stations: [
    { name: 'Versova',             coords: [19.1320,  72.8175] },
    { ...DN_NAGAR_IX },
    { name: 'Azad Nagar',          coords: [19.1275,  72.8410] },
    { ...ANDHERI_IX },
    { name: 'Western Express Highway', coords: [19.1185, 72.8570] },
    { name: 'Chakala',             coords: [19.1138,  72.8625] },
    { name: 'Airport Road',        coords: [19.1060,  72.8700] },
    { name: 'Marol Naka',          coords: [19.1025,  72.8785] },
    { name: 'Saki Naka',           coords: [19.0905,  72.8868] },
    { name: 'Asalpha',             coords: [19.0825,  72.8900] },
    { name: 'Jagruti Nagar',       coords: [19.0780,  72.8910] },
    { name: 'Ghatkopar',           coords: [19.0868,  72.9085] },
  ],
};

const mumbaiLine2A: MetroLine = {
  id: 'mumbai-line2a',
  name: 'Line 2A — Yellow Line',
  color: '#ffd700',
  stations: [
    { name: 'Dahisar East',        coords: [19.2545,  72.8625] },
    { name: 'Anand Nagar (M)',     coords: [19.2387,  72.8575] },
    { name: 'Rudra Park',          coords: [19.2310,  72.8540] },
    { name: 'Eksar',               coords: [19.2238,  72.8495] },
    { name: 'Borivali West',       coords: [19.2177,  72.8440] },
    { name: 'Mandapeshwar',        coords: [19.2090,  72.8400] },
    { name: 'Dahanukar Wadi',      coords: [19.2015,  72.8380] },
    { name: 'Kandivali West',      coords: [19.1945,  72.8355] },
    { name: 'Malad West',          coords: [19.1870,  72.8340] },
    { name: 'Lower Malad',         coords: [19.1802,  72.8360] },
    { name: 'Goregaon West',       coords: [19.1660,  72.8340] },
    { name: 'Oshiwara',            coords: [19.1555,  72.8352] },
    { name: 'Lokhandwala',         coords: [19.1440,  72.8340] },
    { name: 'Pathanwadi',          coords: [19.1380,  72.8330] },
    { name: 'Andheri West (2A)',    coords: [19.1300,  72.8350] },
    { ...DN_NAGAR_IX },
  ],
};

const mumbaiLine7: MetroLine = {
  id: 'mumbai-line7',
  name: 'Line 7 — Red Line',
  color: '#e83e3e',
  stations: [
    { name: 'Dahisar East (7)',    coords: [19.2568,  72.8685] },
    { name: 'Ovaripada',           coords: [19.2460,  72.8665] },
    { name: 'Rashtriya Udyan',     coords: [19.2340,  72.8655] },
    { name: 'Devipada',            coords: [19.2180,  72.8628] },
    { name: 'Magathane',           coords: [19.2068,  72.8590] },
    { name: 'Poisar',              coords: [19.1962,  72.8545] },
    { name: 'Akurli',              coords: [19.1848,  72.8520] },
    { name: 'Kurar',               coords: [19.1735,  72.8508] },
    { name: 'Dindoshi',            coords: [19.1637,  72.8495] },
    { name: 'Aarey',               coords: [19.1528,  72.8500] },
    { name: 'JVLR',                coords: [19.1420,  72.8490] },
    { name: 'Jogeshwari East',     coords: [19.1352,  72.8510] },
    { ...ANDHERI_IX },
  ],
};

// ═══════════════════════════════
// EXPORTS — City-based lookup
// ═══════════════════════════════

const cityMetroLines: Record<string, MetroLine[]> = {
  pune: [punePurpleLine, puneAquaLine],
  mumbai: [mumbaiLine1, mumbaiLine2A, mumbaiLine7],
};

export function getMetroLines(city: string): MetroLine[] {
  return cityMetroLines[city] || [];
}

// Legacy export for backward compat
export const allLines: MetroLine[] = Object.values(cityMetroLines).flat();
