// Supabase Edge Function: send-welcome-email
// Deploy with: npx supabase functions deploy send-welcome-email
// Set secret: npx supabase secrets set RESEND_API_KEY=re_xxxxx

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const emailHtml = (email: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Brews Lee</title>
</head>
<body style="margin:0;padding:0;background:#0e1a12;font-family:'Georgia',serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e1a12;padding:48px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#0e1a12;max-width:560px;width:100%;">

          <!-- Top accent bar -->
          <tr>
            <td style="padding-bottom:32px;">
              <div style="width:40px;height:2px;background:#c1f23e;"></div>
            </td>
          </tr>

          <!-- Brand -->
          <tr>
            <td>
              <p style="margin:0;font-family:'Georgia',serif;font-size:13px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.5);">Brews Lee</p>
            </td>
          </tr>

          <!-- Hero headline -->
          <tr>
            <td style="padding-top:20px;padding-bottom:12px;">
              <h1 style="margin:0;font-family:'Georgia',serif;font-size:40px;font-weight:400;color:#ffffff;line-height:1.15;letter-spacing:-0.02em;">
                You're in the<br/>inner circle.
              </h1>
            </td>
          </tr>

          <!-- Sub text -->
          <tr>
            <td style="padding-bottom:40px;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;line-height:1.8;color:rgba(255,255,255,0.45);letter-spacing:0.02em;">
                Welcome to Brews Lee — a place where every cup<br/>
                is a quiet ritual. We'll keep you close with exclusive<br/>
                drops, seasonal menus, and members-only offers.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-bottom:40px;">
              <div style="width:100%;height:1px;background:rgba(255,255,255,0.07);"></div>
            </td>
          </tr>

          <!-- Three features -->
          <tr>
            <td style="padding-bottom:40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" style="padding-right:16px;vertical-align:top;">
                    <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#c1f23e;">Early Access</p>
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;line-height:1.7;color:rgba(255,255,255,0.4);">New menu items before anyone else.</p>
                  </td>
                  <td width="33%" style="padding-right:16px;vertical-align:top;">
                    <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#c1f23e;">Members Perks</p>
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;line-height:1.7;color:rgba(255,255,255,0.4);">Exclusive discounts curated for you.</p>
                  </td>
                  <td width="33%" style="vertical-align:top;">
                    <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#c1f23e;">Zen Stories</p>
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;line-height:1.7;color:rgba(255,255,255,0.4);">Sourcing tales & brewing rituals.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding-bottom:48px;">
              <a href="https://brewslee.com/menu"
                style="display:inline-block;background:#c1f23e;color:#0a1811;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none;padding:16px 40px;">
                EXPLORE THE MENU →
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-bottom:32px;">
              <div style="width:100%;height:1px;background:rgba(255,255,255,0.07);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.2);line-height:1.8;letter-spacing:0.04em;">
                You received this because ${email} joined our waitlist.<br/>
                © ${new Date().getFullYear()} Brews Lee. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    if (!email) throw new Error('Missing email');

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) throw new Error('Missing RESEND_API_KEY');

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Brews Lee <onboarding@resend.dev>',
        to: [email],
        subject: 'Welcome to the inner circle. ✦',
        html: emailHtml(email),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    const data = await res.json();
    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
