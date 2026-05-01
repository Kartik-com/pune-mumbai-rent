import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET /api/stats?city=pune
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  // Query builders
  let pinsQuery = supabaseAdmin.from('rent_pins').select('id', { count: 'exact', head: true });
  let availableQuery = supabaseAdmin.from('rent_pins').select('id', { count: 'exact', head: true }).eq('available', true);
  let seekersQuery = supabaseAdmin.from('seekers').select('id', { count: 'exact', head: true });

  if (city && ['pune', 'mumbai'].includes(city)) {
    pinsQuery = pinsQuery.eq('city', city);
    availableQuery = availableQuery.eq('city', city);
    seekersQuery = seekersQuery.eq('city', city);
  }

  // Filter out hidden/reported pins
  pinsQuery = pinsQuery.eq('hidden', false).lt('report_count', 3);
  availableQuery = availableQuery.eq('hidden', false).lt('report_count', 3);

  const [
    { count: totalPins },
    { count: availablePins },
    { count: totalSeekers }
  ] = await Promise.all([
    pinsQuery,
    availableQuery,
    seekersQuery
  ]);

  // For BHK stats, we still need city
  let bhkStats: { bhk: number; avg_rent: number; count: number }[] = [];
  if (city) {
    const { data: byBhk } = await supabaseAdmin.rpc('get_city_stats', { p_city: city });
    if (byBhk) bhkStats = byBhk;
  }

  return NextResponse.json({
    total: totalPins || 0,
    available: availablePins || 0,
    seekers: totalSeekers || 0,
    byBhk: bhkStats
  });
}
