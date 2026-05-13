const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { plan, role, firstName, lastName, email, phone, contactMethod, helpText } = req.body || {};

  if (!firstName || !lastName || !email || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const PLANS = {
    starter: 'Micromouse Track ($300 / 5 weeks)',
    guided:  'AI + Projects Track ($1,000 / 10 weeks)',
    elite:   'Full Capstone Track ($3,000 / 10 weeks)',
  };

  const planLabel = PLANS[plan] || plan || 'Unknown';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0a0a0a">
      <div style="background:#0a0a0a;padding:20px 28px;border-radius:8px 8px 0 0">
        <h2 style="color:#fff;margin:0;font-size:20px">New RoboLab Inquiry</h2>
      </div>
      <div style="border:1px solid #e4e2dc;border-top:none;padding:24px 28px;border-radius:0 0 8px 8px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#6b6760;width:40%">Plan</td><td style="padding:8px 0;font-weight:600">${planLabel}</td></tr>
          <tr><td style="padding:8px 0;color:#6b6760;border-top:1px solid #f0efec">I am a</td><td style="padding:8px 0;border-top:1px solid #f0efec">${role}</td></tr>
          <tr><td style="padding:8px 0;color:#6b6760;border-top:1px solid #f0efec">Name</td><td style="padding:8px 0;border-top:1px solid #f0efec">${firstName} ${lastName}</td></tr>
          <tr><td style="padding:8px 0;color:#6b6760;border-top:1px solid #f0efec">Email</td><td style="padding:8px 0;border-top:1px solid #f0efec"><a href="mailto:${email}" style="color:#0a0a0a">${email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#6b6760;border-top:1px solid #f0efec">Phone</td><td style="padding:8px 0;border-top:1px solid #f0efec">${phone || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#6b6760;border-top:1px solid #f0efec">Preferred contact</td><td style="padding:8px 0;border-top:1px solid #f0efec">${contactMethod || '—'}</td></tr>
        </table>
        ${helpText ? `
        <div style="margin-top:20px;background:#f9f9f8;border:1px solid #e4e2dc;border-radius:6px;padding:14px 16px">
          <p style="margin:0 0 6px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#6b6760">How can we help?</p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#0a0a0a">${helpText.replace(/\n/g, '<br>')}</p>
        </div>` : ''}
      </div>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"RoboLab" <${process.env.GMAIL_USER}>`,
      to: 'info.robolabs1@gmail.com',
      replyTo: email,
      subject: `New inquiry: ${firstName} ${lastName} — ${planLabel}`,
      html,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Mail error:', err);
    return res.status(500).json({ error: 'Failed to send email. Please try again.' });
  }
}
