import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

function v(name, fallback = "") {
  const raw = process.env[name];
  return (raw ?? fallback).trim();
}

const HOST = v("SMTP_HOST", "smtp.gmail.com");
const PORT = Number(v("SMTP_PORT", "465"));
const USER = v("SMTP_USER");
const PASS = v("SMTP_PASS");          // <-- App Password, no spaces
const FROM = v("FROM_EMAIL", `Shop <${USER}>`);

console.log("[mail env] host:", HOST, "port:", PORT, "user:", USER);
if (!USER || !PASS) console.warn("[mail] Missing SMTP_USER or SMTP_PASS");

const transporter = nodemailer.createTransport({
  host: HOST,
  port: PORT,
  secure: PORT === 465,               // 465 -> true, 587 -> false
  auth: { user: USER, pass: PASS },
});

export async function sendOrderEmail({ to, subject, html, replyTo }) {
  await transporter.verify(); // surfaces auth errors clearly
  return transporter.sendMail({
    from: FROM,               // must match USER for Gmail
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });
}
