import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { hashIP, getIPFromHeaders } from '@/lib/ipHash';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pinId = params.id;
    const ip = getIPFromHeaders(request.headers);
    const ip_hash = hashIP(ip);

    // 1. Rate Limit Check: Max 5 reveals per 24 hours per IP
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString();

    const { count, error: countError } = await supabaseAdmin
      .from('contact_requests')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ip_hash)
      .gte('created_at', twentyFourHoursAgo);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    if (count !== null && count >= 5) {
      return NextResponse.json(
        { error: 'Rate limit exceeded: You can only reveal 5 contacts per 24 hours.' },
        { status: 429 }
      );
    }

    // 2. Fetch the actual phone number for this pin
    // Use supabaseAdmin to bypass RLS and get the private phone field
    const { data: pin, error: pinError } = await supabaseAdmin
      .from('rent_pins')
      .select('phone, society, bhk, rent')
      .eq('id', pinId)
      .single();

    if (pinError || !pin) {
      return NextResponse.json({ error: 'Pin not found' }, { status: 404 });
    }

    if (!pin.phone) {
      return NextResponse.json({ error: 'Owner has not provided a contact number' }, { status: 404 });
    }

    // 3. Log the reveal event
    const { error: logError } = await supabaseAdmin
      .from('contact_requests')
      .insert({
        ip_hash,
        pin_id: pinId,
      });

    if (logError) {
      console.error('Error logging contact request:', logError);
      // We still return the number even if logging fails, but we should fix this in production
    }

    // 4. Return the data
    return NextResponse.json({
      phone: pin.phone,
      society: pin.society,
      bhk: pin.bhk,
      rent: pin.rent,
      revealsRemaining: 5 - (count || 0) - 1
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
