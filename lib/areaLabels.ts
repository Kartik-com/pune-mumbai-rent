export interface AreaLabel {
  name: string;
  coords: [number, number];
  city: 'pune' | 'mumbai';
}

export const AREA_LABELS: AreaLabel[] = [
  // ── PUNE ──
  { name: 'Shivajinagar', coords: [18.5308, 73.8475], city: 'pune' },
  { name: 'Baner', coords: [18.5597, 73.7799], city: 'pune' },
  { name: 'Koregaon Park', coords: [18.5362, 73.8940], city: 'pune' },
  { name: 'Kalyani Nagar', coords: [18.5463, 73.9033], city: 'pune' },
  { name: 'Viman Nagar', coords: [18.5679, 73.9143], city: 'pune' },
  { name: 'Kharadi', coords: [18.5515, 73.9348], city: 'pune' },
  { name: 'Hinjewadi Ph 1', coords: [18.5913, 73.7389], city: 'pune' },
  { name: 'Wakad', coords: [18.5987, 73.7652], city: 'pune' },
  { name: 'Kothrud', coords: [18.5074, 73.8077], city: 'pune' },
  { name: 'Hadapsar', coords: [18.5089, 73.9259], city: 'pune' },
  { name: 'Swargate', coords: [18.5018, 73.8636], city: 'pune' },
  { name: 'Deccan', coords: [18.5158, 73.8445], city: 'pune' },
  { name: 'Camp', coords: [18.5246, 73.8786], city: 'pune' },
  { name: 'Aundh', coords: [18.5580, 73.8075], city: 'pune' },
  { name: 'Balewadi', coords: [18.5750, 73.7830], city: 'pune' },
  { name: 'Pimple Saudagar', coords: [18.5947, 73.7997], city: 'pune' },
  { name: 'Magarpatta City', coords: [18.5150, 73.9250], city: 'pune' },
  { name: 'Yerwada', coords: [18.5500, 73.8850], city: 'pune' },
  { name: 'Bibwewadi', coords: [18.4900, 73.8680], city: 'pune' },
  { name: 'Katraj', coords: [18.4520, 73.8560], city: 'pune' },

  // ── MUMBAI ──
  { name: 'Bandra West', coords: [19.0596, 72.8295], city: 'mumbai' },
  { name: 'Andheri East', coords: [19.1150, 72.8680], city: 'mumbai' },
  { name: 'Andheri West', coords: [19.1200, 72.8250], city: 'mumbai' },
  { name: 'Powai', coords: [19.1176, 72.9060], city: 'mumbai' },
  { name: 'Worli', coords: [19.0176, 72.8172], city: 'mumbai' },
  { name: 'Juhu', coords: [19.1075, 72.8263], city: 'mumbai' },
  { name: 'BKC', coords: [19.0607, 72.8644], city: 'mumbai' },
  { name: 'Dadar', coords: [19.0178, 72.8478], city: 'mumbai' },
  { name: 'Borivali West', coords: [19.2307, 72.8567], city: 'mumbai' },
  { name: 'Goregaon East', coords: [19.1650, 73.8600], city: 'mumbai' }, // Fix Goregaon coords
  { name: 'Malad West', coords: [19.1874, 72.8484], city: 'mumbai' },
  { name: 'Chembur', coords: [19.0522, 72.8995], city: 'mumbai' },
  { name: 'Lower Parel', coords: [18.9950, 72.8300], city: 'mumbai' },
  { name: 'Thane West', coords: [19.2183, 72.9781], city: 'mumbai' },
  { name: 'Ghatkopar East', coords: [19.0850, 72.9100], city: 'mumbai' },
  { name: 'Colaba', coords: [18.9067, 72.8147], city: 'mumbai' },
  { name: 'Santacruz', coords: [19.0800, 72.8400], city: 'mumbai' },
  { name: 'Kandivali West', coords: [19.2000, 72.8350], city: 'mumbai' },
];
