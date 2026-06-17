import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwtToken, AUTH_COOKIE_NAME } from '@/services/auth.service';
import { cookies } from 'next/headers';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { agentId } = await request.json();
    if (!agentId) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }
  // Verify that the assigned user is an agent
  const targetUser = await prisma.user.findUnique({
    where: { id: agentId },
    select: { role: true },
  });
  if (!targetUser || targetUser.role !== 'AGENT') {
    return NextResponse.json({ error: 'Can only assign to agents' }, { status: 400 });
  }

    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const customerReq = await prisma.customerRequest.findUnique({
      where: { id }
    });

    if (!customerReq) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const previousAgentId = customerReq.assignedToId;

    // Use transaction to update request and create event
    const updated = await prisma.$transaction(async (tx) => {
      const updatedReq = await tx.customerRequest.update({
        where: { id },
        data: {
          assignedToId: agentId,
          status: 'IN_PROGRESS',
        },
      });

      await tx.requestEvent.create({
        data: {
          requestId: id,
          actorId: payload.userId,
          eventType: 'ASSIGNED',
          description: `Assigned to agent ${agentId}`,
          metadata: {
            previousAgentId,
            newAgentId: agentId
          }
        }
      });

      return updatedReq;
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error('Error assigning request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
