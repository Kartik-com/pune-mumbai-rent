import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { findMatches } from '@/lib/matching';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// GET /api/match-cron — daily matching job (secured with CRON_SECRET)
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get active seekers (non-expired, unmatched)
    const { data: seekers } = await supabaseAdmin
      .from('seekers')
      .select('*')
      .eq('matched', false)
      .gte('expires_at', new Date().toISOString());

    if (!seekers || seekers.length === 0) {
      return NextResponse.json({
        message: 'No active seekers',
        matchesFound: 0,
      });
    }

    // Get available pins
    const { data: availablePins } = await supabaseAdmin
      .from('rent_pins')
      .select('*')
      .eq('available', true)
      .eq('hidden', false)
      .lt('report_count', 3);

    if (!availablePins || availablePins.length === 0) {
      return NextResponse.json({
        message: 'No available pins',
        matchesFound: 0,
      });
    }

    const matches = findMatches(seekers, availablePins);

    // Send emails for each match
    let emailsSent = 0;
    for (const match of matches) {
      try {
        // Email to seeker
        const waLink = match.pinPhone ? `https://wa.me/91${match.pinPhone}?text=${encodeURIComponent(`Hi! I just got a match email for your flat in ${match.pinSociety}. Is it still available?`)}` : null;

        await resend.emails.send({
          from: 'City Rent Map <noreply@pune.rent>',
          to: match.seekerEmail,
          subject: `✨ Match Found: ${match.pinBhk}BHK in ${match.pinSociety}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
              <h2 style="color: #0f0f0f; margin-bottom: 20px;">We found a match for you!</h2>
              <div style="background: #fafafa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="font-size: 18px; margin: 0 0 10px;"><strong>${match.pinBhk} BHK</strong> at <strong>${match.pinSociety}</strong></p>
                <p style="font-size: 16px; color: #e8c547; font-weight: bold; margin: 0;">₹${match.pinRent.toLocaleString('en-IN')}/month</p>
                <p style="font-size: 13px; color: #888; margin-top: 10px;">📍 Located approximately ${match.distanceKm} km from your search area.</p>
              </div>
              
              ${waLink ? `
                <a href="${waLink}" style="display: block; background: #25D366; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; margin-bottom: 20px;">
                  💬 Chat with Owner on WhatsApp
                </a>
              ` : ''}

              ${match.pinEmail ? `<p style="font-size: 14px; color: #555;">Or reach them via email: <a href="mailto:${match.pinEmail}">${match.pinEmail}</a></p>` : ''}
              
              <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;">
              <p style="color: #aaa; font-size: 11px; text-align: center;">You're receiving this because you posted a Seeker request on our platform. Your request will automatically expire in 30 days.</p>
            </div>
          `,
        });

        // Email to owner (if they have email)
        if (match.pinEmail) {
          await resend.emails.send({
            from: 'City Rent Map <noreply@pune.rent>',
            to: match.pinEmail,
            subject: `🔑 Someone is interested in your ${match.pinBhk}BHK at ${match.pinSociety}`,
            html: `
              <h2>A potential tenant is interested!</h2>
              <p>They are looking for a ${match.pinBhk}BHK within ${match.distanceKm} km of your listing.</p>
              <p>Contact them: ${match.seekerEmail}</p>
              ${match.seekerPhone ? `<p>Phone: ${match.seekerPhone}</p>` : ''}
              <hr>
              <p style="color: #888; font-size: 12px;">This email was sent by pune.rent flat hunt matching service.</p>
            `,
          });
        }

        emailsSent++;
      } catch (emailError) {
        console.error('Failed to send match email:', emailError);
      }
    }

    // Mark matched seekers
    const matchedSeekerIds = Array.from(new Set(matches.map((m) => m.seekerId)));
    if (matchedSeekerIds.length > 0) {
      await supabaseAdmin
        .from('seekers')
        .update({ matched: true })
        .in('id', matchedSeekerIds);
    }

    return NextResponse.json({
      message: `Matching complete`,
      matchesFound: matches.length,
      emailsSent,
      seekersMatched: matchedSeekerIds.length,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
