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
  { name: 'Wagholi', coords: [18.5800, 73.9800], city: 'pune' },
  { name: 'Hinjewadi Ph 1', coords: [18.5913, 73.7389], city: 'pune' },
  { name: 'Wakad', coords: [18.5987, 73.7652], city: 'pune' },
  { name: 'Kothrud', coords: [18.5074, 73.8077], city: 'pune' },
  { name: 'Hadapsar', coords: [18.5089, 73.9259], city: 'pune' },
  { name: 'Bavdhan', coords: [18.5100, 73.7800], city: 'pune' },
  { name: 'Pashan', coords: [18.5350, 73.7950], city: 'pune' },
  { name: 'Aundh', coords: [18.5580, 73.8075], city: 'pune' },
  { name: 'Balewadi', coords: [18.5750, 73.7830], city: 'pune' },
  { name: 'Pimple Saudagar', coords: [18.5947, 73.7997], city: 'pune' },
  { name: 'Magarpatta City', coords: [18.5150, 73.9250], city: 'pune' },
  { name: 'Dhanori', coords: [18.5850, 73.8950], city: 'pune' },
  { name: 'Undri', coords: [18.4600, 73.9150], city: 'pune' },
  { name: 'Katraj', coords: [18.4520, 73.8560], city: 'pune' },
  { name: 'Pimple Nilakh', coords: [18.5650, 73.7900], city: 'pune' },
  { name: 'Sus', coords: [18.5450, 73.7550], city: 'pune' },

  // ── MUMBAI ──
  { name: 'Bandra West', coords: [19.0596, 72.8295], city: 'mumbai' },
  { name: 'Andheri West', coords: [19.1200, 72.8250], city: 'mumbai' },
  { name: 'Andheri East', coords: [19.1150, 72.8680], city: 'mumbai' },
  { name: 'Powai', coords: [19.1176, 72.9060], city: 'mumbai' },
  { name: 'Worli', coords: [19.0176, 72.8172], city: 'mumbai' },
  { name: 'Juhu', coords: [19.1075, 72.8263], city: 'mumbai' },
  { name: 'BKC', coords: [19.0607, 72.8644], city: 'mumbai' },
  { name: 'Dadar', coords: [19.0178, 72.8478], city: 'mumbai' },
  { name: 'Borivali West', coords: [19.2307, 72.8567], city: 'mumbai' },
  { name: 'Goregaon East', coords: [19.1650, 72.8550], city: 'mumbai' },
  { name: 'Goregaon West', coords: [19.1620, 72.8450], city: 'mumbai' },
  { name: 'Malad West', coords: [19.1874, 72.8484], city: 'mumbai' },
  { name: 'Kandivali West', coords: [19.2000, 72.8350], city: 'mumbai' },
  { name: 'Chembur', coords: [19.0522, 72.8995], city: 'mumbai' },
  { name: 'Lower Parel', coords: [18.9950, 72.8300], city: 'mumbai' },
  { name: 'Thane West', coords: [19.2183, 72.9781], city: 'mumbai' },
  { name: 'Ghatkopar East', coords: [19.0850, 72.9100], city: 'mumbai' },
  { name: 'Colaba', coords: [18.9067, 72.8147], city: 'mumbai' },
  { name: 'Marine Drive', coords: [18.9400, 72.8200], city: 'mumbai' },
  { name: 'Nariman Point', coords: [18.9250, 72.8250], city: 'mumbai' },
  { name: 'Kurla', coords: [19.0700, 72.8800], city: 'mumbai' },
  { name: 'Wadala', coords: [19.0200, 72.8600], city: 'mumbai' },
  { name: 'Sion', coords: [19.0400, 72.8600], city: 'mumbai' },
  { name: 'Mulund West', coords: [19.1750, 72.9500], city: 'mumbai' },

];
