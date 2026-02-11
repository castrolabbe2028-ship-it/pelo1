// Vercel serverless function (api/send-demo.js)
// Sends a demo request email to jorge.castro@smartstudent.cl via Mailrelay API.
// IMPORTANT: set the following environment variables in Vercel (Project Settings -> Environment Variables):
// - MAILRELAY_API_KEY (your API key)
// - FROM_EMAIL (optional, default: no-reply@smartstudent.site)
// - MAILRELAY_ACCOUNT (your Mailrelay account subdomain, e.g., "miempresa" if your URL is miempresa.ipzmarketing.com)

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body || {};
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });

  const MAILRELAY_API_KEY = process.env.MAILRELAY_API_KEY;
  const MAILRELAY_ACCOUNT = process.env.MAILRELAY_ACCOUNT || 'smartstudent';
  const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@smartstudent.site';

  if (!MAILRELAY_API_KEY) {
    console.error('Missing MAILRELAY_API_KEY');
    return res.status(500).json({ error: 'Missing MAILRELAY_API_KEY' });
  }

  // Mailrelay API v1 endpoint for sending emails
  // Format: https://ACCOUNT.ipzmarketing.com/api/v1/send_emails
  const MAILRELAY_API_URL = `https://${MAILRELAY_ACCOUNT}.ipzmarketing.com/api/v1/send_emails`;

  const payload = {
    from: {
      email: FROM_EMAIL,
      name: 'Smart Student'
    },
    to: [
      {
        email: 'jorge.castro@smartstudent.cl',
        name: 'Jorge Castro'
      }
    ],
    subject: `Solicitud de Demo — ${email}`,
    html_part: `
      <h2>Nueva solicitud de Demo</h2>
      <p>Se ha recibido una solicitud de demo desde el sitio web.</p>
      <p><strong>Correo del interesado:</strong> ${email}</p>
      <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CL', { timeZone: 'America/Santiago' })}</p>
    `,
    text_part: `Nueva solicitud de demo desde: ${email}`
  };

  try {
    const r = await fetch(MAILRELAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-AUTH-TOKEN': MAILRELAY_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const responseText = await r.text();
    console.log('Mailrelay response:', r.status, responseText);

    if (!r.ok) {
      console.error('Mailrelay API error', r.status, responseText);
      return res.status(502).json({ error: 'mailrelay_error', details: responseText });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Send failed', err);
    return res.status(500).json({ error: 'send_failed', details: err.message });
  }
};
