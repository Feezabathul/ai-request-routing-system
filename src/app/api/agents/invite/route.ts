import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendInvitationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiration to 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create the invitation
    const invitation = await prisma.agentInvitation.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        token,
        status: 'INVITED',
        expiresAt,
      },
    });

    const setupUrl = `${new URL(request.url).origin}/agent/setup?token=${token}`;

    try {
      await sendInvitationEmail(email, setupUrl);
    } catch (emailError: any) {
      console.error('Failed to send email:', emailError?.message || emailError);
      // Rollback: delete the invitation if email fails to send
      await prisma.agentInvitation.delete({ where: { id: invitation.id } });
      return NextResponse.json({ 
        error: `Failed to send invitation email: ${emailError?.message || 'SMTP error'}. Please check SMTP configuration.` 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation sent successfully'
    });

  } catch (error: any) {
    console.error('Error creating invitation:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'An invitation already exists for this email' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
