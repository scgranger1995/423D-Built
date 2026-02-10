import nodemailer from "nodemailer";

// ---------- XSS prevention ----------

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ============================================
// Email Notification Utility
// ============================================
// Sends transactional emails via SMTP (nodemailer).
// If SMTP credentials are not configured the helpers
// gracefully fall back to console.log so the site
// keeps working without an email provider.
// ============================================

// ---------- Configuration ----------

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || "423D Built <noreply@423dbuilt.com>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@423dbuilt.com";

const isSmtpConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

// ---------- Transporter (lazy singleton) ----------

let _transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!isSmtpConfigured) return null;
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return _transporter;
}

// ---------- Brand tokens (inline-CSS friendly) ----------

const BRAND = {
  bg: "#0a0a0a",
  card: "#141414",
  border: "#2a2a2a",
  gold: "#c8a84e",
  goldLight: "#e0c96a",
  textPrimary: "#f5f5f5",
  textSecondary: "#a0a0a0",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

// ---------- Shared layout wrapper ----------

function emailLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:${BRAND.fontFamily};color:${BRAND.textPrimary};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bg};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:${BRAND.card};border:1px solid ${BRAND.border};border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 16px 32px;text-align:center;border-bottom:1px solid ${BRAND.border};">
              <h1 style="margin:0;font-size:28px;font-weight:700;color:${BRAND.gold};letter-spacing:1px;">423D Built</h1>
              <p style="margin:8px 0 0;font-size:13px;color:${BRAND.textSecondary};">3D Printing &amp; Laser Engraving</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;text-align:center;border-top:1px solid ${BRAND.border};font-size:12px;color:${BRAND.textSecondary};">
              <p style="margin:0;">&copy; ${new Date().getFullYear()} 423D Built &mdash; Bristol, Tennessee</p>
              <p style="margin:8px 0 0;">This is an automated message. Please do not reply directly to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ============================================
// Core send function
// ============================================

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email via the configured SMTP transport.
 * If SMTP is not configured, falls back to a console.log.
 */
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(
      `[Email] SMTP not configured -- email NOT sent.\n  To: ${to}\n  Subject: ${subject}`
    );
    return false;
  }

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent "${subject}" to ${to}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send "${subject}" to ${to}:`, error);
    return false;
  }
}

// ============================================
// Template helpers
// ============================================

export interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number; // in cents
}

/**
 * Send an order confirmation email to the customer.
 */
export async function sendOrderConfirmation(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  items: OrderItem[],
  total: number // in cents
): Promise<boolean> {
  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;color:${BRAND.textPrimary};border-bottom:1px solid ${BRAND.border};">
            ${escapeHtml(item.productName)}
          </td>
          <td style="padding:8px 0;text-align:center;color:${BRAND.textSecondary};border-bottom:1px solid ${BRAND.border};">
            ${item.quantity}
          </td>
          <td style="padding:8px 0;text-align:right;color:${BRAND.textPrimary};border-bottom:1px solid ${BRAND.border};">
            $${(item.unitPrice / 100).toFixed(2)}
          </td>
        </tr>`
    )
    .join("");

  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;color:${BRAND.gold};">Order Confirmed</h2>
    <p style="margin:0 0 24px;color:${BRAND.textSecondary};font-size:15px;">
      Hi ${escapeHtml(customerName)}, thank you for your order!
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background-color:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:6px;padding:16px;margin-bottom:24px;">
      <tr>
        <td style="padding:4px 0;font-size:13px;color:${BRAND.textSecondary};">Order Number</td>
        <td style="padding:4px 0;text-align:right;font-size:15px;font-weight:600;color:${BRAND.gold};">${orderNumber}</td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <thead>
        <tr>
          <th style="padding:8px 0;text-align:left;font-size:12px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid ${BRAND.gold};">Item</th>
          <th style="padding:8px 0;text-align:center;font-size:12px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid ${BRAND.gold};">Qty</th>
          <th style="padding:8px 0;text-align:right;font-size:12px;color:${BRAND.textSecondary};text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid ${BRAND.gold};">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:12px 0;font-size:18px;font-weight:700;color:${BRAND.textPrimary};">Total</td>
        <td style="padding:12px 0;text-align:right;font-size:18px;font-weight:700;color:${BRAND.gold};">$${(total / 100).toFixed(2)}</td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:${BRAND.textSecondary};">
      We are working on your order and will notify you when it ships. If you have any questions,
      feel free to reach out via our website.
    </p>`;

  const html = emailLayout("Order Confirmation - 423D Built", body);

  return sendEmail({
    to: customerEmail,
    subject: `Order Confirmed - ${orderNumber}`,
    html,
  });
}

/**
 * Human-readable label for a service type enum value.
 */
function formatServiceType(serviceType: string): string {
  const map: Record<string, string> = {
    PRINTING_3D: "3D Printing",
    LASER_ENGRAVING: "Laser Engraving",
    DESIGN: "Design Services",
    CONSULTATION: "Consultation",
  };
  return map[serviceType] || serviceType;
}

/**
 * Send an inquiry confirmation email to the customer.
 */
export async function sendInquiryConfirmation(
  customerEmail: string,
  customerName: string,
  serviceType: string
): Promise<boolean> {
  const serviceLabel = formatServiceType(serviceType);

  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;color:${BRAND.gold};">Inquiry Received</h2>
    <p style="margin:0 0 24px;color:${BRAND.textSecondary};font-size:15px;">
      Hi ${escapeHtml(customerName)}, thanks for reaching out!
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background-color:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:6px;padding:16px;margin-bottom:24px;">
      <tr>
        <td style="padding:4px 0;font-size:13px;color:${BRAND.textSecondary};">Service</td>
        <td style="padding:4px 0;text-align:right;font-size:15px;font-weight:600;color:${BRAND.gold};">${serviceLabel}</td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:14px;color:${BRAND.textPrimary};">
      We have received your inquiry and will review it shortly. You can expect a response
      within <strong style="color:${BRAND.gold};">1&ndash;2 business days</strong>.
    </p>

    <p style="margin:0;font-size:14px;color:${BRAND.textSecondary};">
      If you have any additional details or files to share, feel free to reply or submit
      another inquiry through our website.
    </p>`;

  const html = emailLayout("Inquiry Received - 423D Built", body);

  return sendEmail({
    to: customerEmail,
    subject: `We received your ${serviceLabel} inquiry`,
    html,
  });
}

/**
 * Send a notification email to the site admin.
 */
export async function sendAdminNotification(
  subject: string,
  bodyContent: string
): Promise<boolean> {
  const body = `
    <h2 style="margin:0 0 16px;font-size:22px;color:${BRAND.gold};">Admin Notification</h2>
    <div style="font-size:14px;line-height:1.6;color:${BRAND.textPrimary};">
      ${bodyContent}
    </div>`;

  const html = emailLayout(subject, body);

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[423D Built] ${subject}`,
    html,
  });
}
