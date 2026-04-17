import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// GET /api/stats?city=pune
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  if (!city || !['pune', 'mumbai'].includes(city)) {
    return NextResponse.json(
      { error: 'Valid city parameter required' },
      { status: 400 }
    );
  }

  // Get BHK stats
  const { data: byBhk, error } = await supabaseAdmin.rpc('get_city_stats', {
    p_city: city,
  });

  if (error) {
    // Fallback: manual query if function doesn't exist
    const { data: pins } = await supabaseAdmin
      .from('rent_pins')
      .select('bhk, rent')
      .eq('city', city)
      .eq('hidden', false)
      .lt('report_count', 3);

    if (!pins) {
      return NextResponse.json({ byBhk: [], total: 0, addedThisWeek: 0 });
    }

    const bhkGroups: Record<number, number[]> = {};
    pins.forEach((p) => {
      if (!bhkGroups[p.bhk]) bhkGroups[p.bhk] = [];
      bhkGroups[p.bhk].push(p.rent);
    });

    const bhkStats = Object.entries(bhkGroups)
      .map(([bhk, rents]) => ({
        bhk: parseInt(bhk),
        avg_rent: Math.round(
          rents.reduce((a, b) => a + b, 0) / rents.length
        ),
        count: rents.length,
      }))
      .sort((a, b) => a.bhk - b.bhk);

    // Count added this week
    const oneWeekAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();
    const { count: weekCount } = await supabaseAdmin
      .from('rent_pins')
      .select('id', { count: 'exact', head: true })
      .eq('city', city)
      .eq('hidden', false)
      .lt('report_count', 3)
      .gte('created_at', oneWeekAgo);

    return NextResponse.json({
      byBhk: bhkStats,
      total: pins.length,
      addedThisWeek: weekCount || 0,
    });
  }

  // Total pins
  const { count: total } = await supabaseAdmin
    .from('rent_pins')
    .select('id', { count: 'exact', head: true })
    .eq('city', city)
    .eq('hidden', false)
    .lt('report_count', 3);

  // Added this week
  const oneWeekAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();
  const { count: weekCount } = await supabaseAdmin
    .from('rent_pins')
    .select('id', { count: 'exact', head: true })
    .eq('city', city)
    .eq('hidden', false)
    .lt('report_count', 3)
    .gte('created_at', oneWeekAgo);

  return NextResponse.json({
    byBhk: byBhk || [],
    total: total || 0,
    addedThisWeek: weekCount || 0,
  });
}
