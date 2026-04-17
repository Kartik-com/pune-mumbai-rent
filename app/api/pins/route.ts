import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { hashIP, getIPFromHeaders } from '@/lib/ipHash';

// GET /api/pins?city=pune&bhk=2&minRent=10000&maxRent=50000&gated=true&furnished=furnished
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  if (!city || !['pune', 'mumbai'].includes(city)) {
    return NextResponse.json(
      { error: 'Valid city parameter required (pune or mumbai)' },
      { status: 400 }
    );
  }

  let query = supabaseAdmin
    .from('rent_pins')
    .select(
      'id, city, category, sub_type, lat, lng, bhk, rent, furnished, includes_maint, gated, society, note, occupant, deposit_months, pets_allowed, sqft, ip_hash, report_count, available, available_from, flatmate_wanted, created_at'
    )
    .eq('city', city)
    .eq('hidden', false)
    .lt('report_count', 3);

  const bhk = searchParams.get('bhk');
  if (bhk) query = query.eq('bhk', parseInt(bhk));

  const minRent = searchParams.get('minRent');
  if (minRent) query = query.gte('rent', parseInt(minRent));

  const maxRent = searchParams.get('maxRent');
  if (maxRent) query = query.lte('rent', parseInt(maxRent));

  const gated = searchParams.get('gated');
  if (gated === 'true') query = query.eq('gated', true);
  if (gated === 'false') query = query.eq('gated', false);

  const furnished = searchParams.get('furnished');
  if (furnished) query = query.eq('furnished', furnished);

  const { data, error } = await query.order('created_at', {
    ascending: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Round coordinates for privacy, never return email/phone
  const pins = (data || []).map((pin) => ({
    ...pin,
    lat: Math.round(pin.lat * 1000) / 1000,
    lng: Math.round(pin.lng * 1000) / 1000,
  }));

  return NextResponse.json(pins);
}

// POST /api/pins
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ip = getIPFromHeaders(request.headers);
    const ip_hash = hashIP(ip);

    // Validate required fields (bhk optional for commercial)
    const { city, lat, lng, bhk, rent, society, category = 'residential', sub_type = 'flat' } = body;
    if (!city || !lat || !lng || !rent || !society) {
      return NextResponse.json(
        { error: 'Missing required fields: city, lat, lng, rent, society' },
        { status: 400 }
      );
    }

    if (!['pune', 'mumbai'].includes(city)) {
      return NextResponse.json(
        { error: 'Invalid city' },
        { status: 400 }
      );
    }

    // Validation: Enforce max lengths and logical ranges
    if (society.length > 60 || (body.note && body.note.length > 150)) {
      return NextResponse.json({ error: 'Input too long' }, { status: 400 });
    }
    if (parseInt(rent) > 10000000) {
      return NextResponse.json({ error: 'Rent too high' }, { status: 400 });
    }

    // Rate limit: max 3 pins per IP per 24 hours
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString();
    const { count } = await supabaseAdmin
      .from('rent_pins')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ip_hash)
      .gte('created_at', twentyFourHoursAgo);

    if (count !== null && count >= 3) {
      return NextResponse.json(
        { error: 'Rate limit: maximum 3 pins per 24 hours' },
        { status: 429 }
      );
    }

    const pinData = {
      city,
      category,
      sub_type,
      lat,
      lng,
      bhk: bhk ? parseInt(bhk) : 0,
      rent: parseInt(rent),
      furnished: body.furnished || null,
      includes_maint: body.includes_maint || false,
      gated: body.gated ?? null,
      society,
      note: body.note || null,
      occupant: body.occupant || null,
      deposit_months: body.deposit_months
        ? parseInt(body.deposit_months)
        : null,
      pets_allowed: body.pets_allowed ?? null,
      sqft: body.sqft ? parseInt(body.sqft) : null,
      email: body.email || null,
      phone: body.phone || null,
      ip_hash,
      available: body.available || false,
      available_from: body.available_from || null,
      flatmate_wanted: body.flatmate_wanted || false,
    };

    const { data, error } = await supabaseAdmin
      .from('rent_pins')
      .insert(pinData)
      .select(
        'id, city, category, sub_type, lat, lng, bhk, rent, furnished, includes_maint, gated, society, note, occupant, deposit_months, pets_allowed, sqft, ip_hash, available, available_from, flatmate_wanted, created_at'
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return without email/phone, round coordinates
    const pin = {
      ...data,
      lat: Math.round(data.lat * 1000) / 1000,
      lng: Math.round(data.lng * 1000) / 1000,
    };

    return NextResponse.json(pin, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
