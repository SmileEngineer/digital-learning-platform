/**
 * Transactional email: Resend HTTP API when RESEND_API_KEY is set, otherwise logs (dev / no provider).
 * Set PUBLIC_SITE_URL (e.g. https://example.com) for links in emails.
 */

function getPublicSiteUrl(): string {
  const raw = process.env.PUBLIC_SITE_URL ?? process.env.SITE_URL ?? 'http://localhost:3000';
  return raw.replace(/\/$/, '');
}

export async function sendEmailIfConfigured(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.info('[email:skipped]', { to: opts.to, subject: opts.subject });
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: opts.subject,
      text: opts.text,
      html: opts.html ?? opts.text.replace(/\n/g, '<br/>'),
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('[email:resend]', res.status, errText);
  }
}

export async function sendPasswordResetEmail(to: string, rawToken: string): Promise<void> {
  const base = getPublicSiteUrl();
  const link = `${base}/reset-password?token=${encodeURIComponent(rawToken)}`;
  await sendEmailIfConfigured({
    to,
    subject: 'Reset your Kantri Lawyer password',
    text: `You requested a password reset.\n\nOpen this link (valid for 1 hour):\n${link}\n\nIf you did not request this, you can ignore this email.`,
    html: `<p>You requested a password reset.</p><p><a href="${link}">Reset your password</a> (valid for 1 hour).</p><p>If you did not request this, you can ignore this email.</p>`,
  });
}

export async function sendOrderConfirmationEmail(input: {
  to: string;
  orderNumber: string;
  total: number;
  currency: string;
  productTitle: string;
}): Promise<void> {
  const { to, orderNumber, total, currency, productTitle } = input;
  const totalLabel =
    currency === 'INR'
      ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(total)
      : `${currency} ${total.toFixed(2)}`;
  await sendEmailIfConfigured({
    to,
    subject: `Order confirmed — ${orderNumber}`,
    text: `Thank you for your purchase.\n\nOrder: ${orderNumber}\nItem: ${productTitle}\nTotal: ${totalLabel}\n`,
    html: `<p>Thank you for your purchase.</p><p><strong>Order:</strong> ${orderNumber}<br/><strong>Item:</strong> ${productTitle}<br/><strong>Total:</strong> ${totalLabel}</p>`,
  });
}
