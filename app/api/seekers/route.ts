import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { hashIP, getIPFromHeaders } from '@/lib/ipHash';

// POST /api/seekers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ip = getIPFromHeaders(request.headers);
    const ip_hash = hashIP(ip);

    const { city, email } = body;
    if (!city || !email) {
      return NextResponse.json(
        { error: 'city and email are required' },
        { status: 400 }
      );
    }

    // Validation: Enforce max lengths
    if (email.length > 100 || (body.note && body.note.length > 140)) {
      return NextResponse.json({ error: 'Input too long' }, { status: 400 });
    }

    if (!['pune', 'mumbai'].includes(city)) {
      return NextResponse.json({ error: 'Invalid city' }, { status: 400 });
    }

    // Rate Limit: Max 2 seekers per 24 hours per IP
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from('seekers')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ip_hash)
      .gte('created_at', twentyFourHoursAgo);

    if (count !== null && count >= 2) {
      return NextResponse.json(
        { error: 'Rate limit: Max 2 seeker posts per 24 hours' },
        { status: 429 }
      );
    }

    const seekerData = {
      city,
      lat: body.lat || null,
      lng: body.lng || null,
      looking_for: body.looking_for || null,
      budget_min: body.budget_min ? parseInt(body.budget_min) : null,
      budget_max: body.budget_max ? parseInt(body.budget_max) : null,
      bhk_pref: body.bhk_pref ? parseInt(body.bhk_pref) : null,
      move_in: body.move_in || null,
      food_pref: body.food_pref || null,
      smoker_ok: body.smoker_ok ?? null,
      gender_pref: body.gender_pref || null,
      note: body.note || null,
      email,
      phone: body.phone || null,
      ip_hash,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('seekers')
      .insert(seekerData)
      .select('id, city, lat, lng, looking_for, budget_min, budget_max, bhk_pref, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
