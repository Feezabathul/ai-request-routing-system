import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwtToken, AUTH_COOKIE_NAME } from '@/services/auth.service';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyJwtToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Agent queue strict sorting: Priority (URGENT > HIGH > MEDIUM > LOW) then Age (Oldest first)
    // We can fetch and sort in memory since Prisma doesn't natively support enum sorting easily without raw queries
    const rawRequests = await prisma.customerRequest.findMany({
      where: { 
        assignedToId: payload.userId,
      },
      select: {
        id: true,
        subject: true,
        status: true,
        priority: true,
        createdAt: true,
        customerName: true,
      }
    });

    const priorityWeight: Record<string, number> = {
      'URGENT': 4,
      'HIGH': 3,
      'MEDIUM': 2,
      'LOW': 1
    };

    const sortedRequests = rawRequests.sort((a, b) => {
      const weightA = priorityWeight[a.priority as string] || 0;
      const weightB = priorityWeight[b.priority as string] || 0;
      
      if (weightA !== weightB) {
        return weightB - weightA; // Higher weight first
      }
      
      // If priorities equal, oldest first (ascending createdAt)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return NextResponse.json({ requests: sortedRequests });

  } catch (error) {
    console.error('Error fetching agent queue:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
