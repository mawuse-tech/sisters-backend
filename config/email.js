// sendMail.js
import { Resend } from 'resend';

export const sendMail = async ({ email, subject, html }) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'Sisters App Acme <onboarding@resend.dev>', // You can use your domain or Resend provided domain
    to: email,
    subject,
    html,
  });
};
