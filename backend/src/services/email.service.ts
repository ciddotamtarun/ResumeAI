import nodemailer from 'nodemailer';

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host || !user || !pass) return null;

  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const from = process.env.SMTP_FROM?.trim() || user || `noreply@resumeai.app`;

  return { host, port, secure: port === 465, user, pass, from };
}

export function isEmailConfigured(): boolean {
  return getSmtpConfig() !== null;
}

function buildOtpHtml(otp: string, type: 'login' | 'registration'): string {
  const isReg = type === 'registration';
  const heading = isReg ? 'Verify Your Account' : 'Sign-in Verification';
  const actionText = isReg
    ? 'create your new ResumeAI account'
    : 'complete your sign-in to ResumeAI';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>ResumeAI Verification Code</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#13131a;border-radius:16px;border:1px solid rgba(255,255,255,0.08);padding:40px;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <span style="font-size:26px;font-weight:900;color:#818cf8;letter-spacing:-0.5px;">Resume<span style="color:#a78bfa;">AI</span></span>
            </td>
          </tr>
          <!-- Title -->
          <tr>
            <td style="color:#ffffff;font-size:20px;font-weight:700;padding-bottom:8px;">${heading}</td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="color:#9ca3af;font-size:14px;line-height:1.6;padding-bottom:24px;">
              Use the one-time code below to ${actionText}.
              This code expires in <strong style="color:#ffffff;">5 minutes</strong>.
            </td>
          </tr>
          <!-- OTP Box -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <div style="background:rgba(99,102,241,0.12);border:2px solid rgba(99,102,241,0.45);border-radius:14px;padding:28px 32px;display:inline-block;">
                <span style="font-size:44px;font-weight:900;letter-spacing:14px;color:#818cf8;font-family:'Courier New',Courier,monospace;">${otp}</span>
              </div>
            </td>
          </tr>
          <!-- Warning -->
          <tr>
            <td style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:10px;padding:12px 16px;margin-bottom:20px;color:#fca5a5;font-size:13px;line-height:1.5;">
              ⚠️&nbsp; <strong>Never share this code.</strong> ResumeAI staff will never ask for your verification code.
            </td>
          </tr>
          <!-- Spacer -->
          <tr><td style="height:16px;"></td></tr>
          <!-- Footer -->
          <tr>
            <td style="color:#4b5563;font-size:12px;line-height:1.6;border-top:1px solid rgba(255,255,255,0.06);padding-top:20px;">
              If you did not request this verification code, you can safely ignore this email.
              No account will be activated without this code.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendOtpEmail(
  email: string,
  otp: string,
  type: 'login' | 'registration' = 'login'
): Promise<void> {
  const config = getSmtpConfig();

  // Explicit failure if SMTP is not configured
  if (!config) {
    throw new Error(
      'SMTP credentials missing or incomplete. SMTP_HOST, SMTP_USER, and SMTP_PASS must be configured in .env.'
    );
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  const subject =
    type === 'registration'
      ? 'Your ResumeAI registration verification code'
      : 'Your ResumeAI sign-in code';

  const info = await transporter.sendMail({
    from: `"ResumeAI" <${config.from}>`,
    to: email,
    subject,
    html: buildOtpHtml(otp, type),
    text: `Your ResumeAI verification code is: ${otp}\n\nThis code expires in 5 minutes.\n\nDo NOT share this code with anyone. ResumeAI will never ask for it.`,
  });

  if (!info || !info.messageId) {
    throw new Error('SMTP server did not confirm delivery of the email.');
  }

  console.log(`[Email] ${type.toUpperCase()} OTP email successfully dispatched to ${email} (MessageID: ${info.messageId})`);
}
