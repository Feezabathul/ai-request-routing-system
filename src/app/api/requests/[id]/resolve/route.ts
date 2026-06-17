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
    if (!payload || payload.role !== 'AGENT') {
      return NextResponse.json({ error: 'Forbidden. Only agents can resolve requests.' }, { status: 403 });
    }

    const { resolutionNote } = await request.json();
    if (!resolutionNote || resolutionNote.trim() === '') {
      return NextResponse.json({ error: 'Resolution note is required' }, { status: 400 });
    }

    const customerReq = await prisma.customerRequest.findUnique({
      where: { id }
    });

    if (!customerReq) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (customerReq.assignedToId !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden. You can only resolve requests assigned to you.' }, { status: 403 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedReq = await tx.customerRequest.update({
        where: { id },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
          resolutionNote,
        },
      });

      await tx.requestEvent.create({
        data: {
          requestId: id,
          actorId: payload.userId,
          eventType: 'STATUS_CHANGED',
          description: `Resolved request`,
          metadata: { newStatus: 'RESOLVED', resolutionNote }
        }
      });

      // Insert customer notification record
      await tx.customerNotification.create({
        data: {
          customerEmail: customerReq.customerEmail,
          requestId: id,
          message: `Your request has been resolved. Agent notes: ${resolutionNote}`,
          status: 'PENDING'
        }
      });

      return updatedReq;
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error('Error resolving request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
