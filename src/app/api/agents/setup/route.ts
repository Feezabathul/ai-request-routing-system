import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, name, department, password } = await request.json();

    if (!token || !name || !department || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find invitation
    const invitation = await prisma.agentInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 400 });
    }

    if (invitation.status !== 'INVITED') {
      return NextResponse.json({ error: 'Invitation has already been used or expired' }, { status: 400 });
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.agentInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' }
      });
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 });
    }

    // Check if user already exists just in case
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create Agent User
    // We do it in a transaction to ensure both operations succeed
    const newAgent = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          name,
          passwordHash,
          role: 'AGENT',
          department,
          status: 'OFFLINE',
        },
      });

      await tx.agentInvitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' },
      });

      return user;
    });

    return NextResponse.json({ success: true, message: 'Agent account created successfully', user: { id: newAgent.id, email: newAgent.email } });

  } catch (error) {
    console.error('Error setting up agent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  const invitation = await prisma.agentInvitation.findUnique({
    where: { token },
  });

  if (!invitation) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
  }

  if (invitation.status !== 'INVITED' || new Date() > invitation.expiresAt) {
    return NextResponse.json({ error: 'Invitation expired or already used', email: invitation.email, status: invitation.status }, { status: 400 });
  }

  return NextResponse.json({ email: invitation.email, status: invitation.status });
}
