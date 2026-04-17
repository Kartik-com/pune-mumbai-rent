import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { hashIP, getIPFromHeaders } from '@/lib/ipHash';

// GET /api/pins/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data, error } = await supabaseAdmin
    .from('rent_pins')
    .select(
      'id, city, lat, lng, bhk, rent, furnished, includes_maint, gated, society, note, occupant, deposit_months, pets_allowed, sqft, ip_hash, report_count, available, available_from, flatmate_wanted, created_at'
    )
    .eq('id', params.id)
    .eq('hidden', false)
    .lt('report_count', 3)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Pin not found' }, { status: 404 });
  }

  // Fetch ratings
  const { data: ratings } = await supabaseAdmin
    .from('pin_ratings')
    .select('locality, quality')
    .eq('pin_id', params.id);

  const avgLocality =
    ratings && ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.locality, 0) / ratings.length
      : null;
  const avgQuality =
    ratings && ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.quality, 0) / ratings.length
      : null;

  // Fetch comments
  const { data: comments } = await supabaseAdmin
    .from('pin_comments')
    .select('id, text, created_at')
    .eq('pin_id', params.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({
    ...data,
    lat: Math.round(data.lat * 1000) / 1000,
    lng: Math.round(data.lng * 1000) / 1000,
    ratings: {
      avgLocality: avgLocality ? Math.round(avgLocality * 10) / 10 : null,
      avgQuality: avgQuality ? Math.round(avgQuality * 10) / 10 : null,
      count: ratings?.length || 0,
    },
    comments: comments || [],
  });
}

// PATCH /api/pins/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const ip = getIPFromHeaders(request.headers);
    const ip_hash = hashIP(ip);

    // Rate Limit: Max 10 interactions (ratings) per hour per IP
    // This protects against automated bulk rating/reporting activity.
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: interactionCount } = await supabaseAdmin
      .from('pin_ratings')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ip_hash)
      .gte('created_at', oneHourAgo);

    if (interactionCount !== null && interactionCount >= 10) {
      return NextResponse.json(
        { error: 'Rate limit: Max 10 map interactions per hour' },
        { status: 429 }
      );
    }

    if (body.action === 'report') {
      // Increment report count
      const { data: pin } = await supabaseAdmin
        .from('rent_pins')
        .select('report_count')
        .eq('id', params.id)
        .single();

      if (!pin) {
        return NextResponse.json(
          { error: 'Pin not found' },
          { status: 404 }
        );
      }

      const newCount = (pin.report_count || 0) + 1;
      await supabaseAdmin
        .from('rent_pins')
        .update({
          report_count: newCount,
          hidden: newCount >= 3,
        })
        .eq('id', params.id);

      return NextResponse.json({
        message: 'Thanks for keeping the map honest.',
        hidden: newCount >= 3,
      });
    }

    if (body.action === 'rate') {
      const { locality, quality } = body;
      if (!locality || !quality) {
        return NextResponse.json(
          { error: 'locality and quality ratings required (1-5)' },
          { status: 400 }
        );
      }

      // Upsert rating (one per IP per pin)
      const { error } = await supabaseAdmin.from('pin_ratings').upsert(
        {
          pin_id: params.id,
          locality: parseInt(locality),
          quality: parseInt(quality),
          ip_hash,
        },
        { onConflict: 'pin_id,ip_hash' }
      );

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: 'Rating saved' });
    }

    if (body.action === 'mark_available') {
      // Verify ownership
      const { data: pin } = await supabaseAdmin
        .from('rent_pins')
        .select('ip_hash')
        .eq('id', params.id)
        .single();

      if (!pin || pin.ip_hash !== ip_hash) {
        return NextResponse.json(
          { error: 'Not authorized' },
          { status: 403 }
        );
      }

      await supabaseAdmin
        .from('rent_pins')
        .update({
          available: body.available ?? true,
          available_from: body.available_from || null,
        })
        .eq('id', params.id);

      return NextResponse.json({ message: 'Availability updated' });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// DELETE /api/pins/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = getIPFromHeaders(request.headers);
  const ip_hash = hashIP(ip);

  // Verify ownership
  const { data: pin } = await supabaseAdmin
    .from('rent_pins')
    .select('ip_hash')
    .eq('id', params.id)
    .single();

  if (!pin) {
    return NextResponse.json({ error: 'Pin not found' }, { status: 404 });
  }

  if (pin.ip_hash !== ip_hash) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  await supabaseAdmin.from('rent_pins').delete().eq('id', params.id);

  return NextResponse.json({ message: 'Pin deleted' });
}
