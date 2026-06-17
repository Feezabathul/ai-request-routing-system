import nodemailer from 'nodemailer';

export const sendInvitationEmail = async (to: string, inviteLink: string) => {
  // Gmail app passwords may be stored with spaces (e.g. "xxxx xxxx xxxx xxxx")
  // Strip spaces so SMTP authentication works correctly
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS?.replace(/\s+/g, '');

  if (!emailUser || !emailPass) {
    throw new Error('EMAIL_USER and EMAIL_PASS must be set in environment variables');
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: `"AI Router" <${emailUser}>`,
    to,
    subject: 'Agent Invitation',
    text: `You have been invited to join the AI Request Routing System.\n\nClick below to activate your account:\n\n${inviteLink}\n\nThe invitation expires in 7 days.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Agent Invitation</h2>
        <p>You have been invited to join the <strong>AI Request Routing System</strong>.</p>
        <p>Click the button below to activate your account:</p>
        <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #4f46e5, #7c3aed); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 16px 0;">
          Activate Account
        </a>
        <p style="color: #6b7280; font-size: 14px;">Or copy this link: <a href="${inviteLink}">${inviteLink}</a></p>
        <p style="color: #6b7280; font-size: 14px;">The invitation expires in 7 days.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
