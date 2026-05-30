import { NextResponse } from 'next/server';
import { getAdminNotifications } from '@/services/admin-notification.service';

type JsonSuccess<T> = { success: true; data: T };
type JsonError = { success: false; error: { message: string; code: string } };

export async function GET() {
  try {
    const data = await getAdminNotifications();
    return NextResponse.json({ success: true, data } satisfies JsonSuccess<typeof data>, {
      status: 200,
    });
  } catch (error) {
    console.error('GET /api/admin/notifications failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to load admin notifications', code: 'INTERNAL_SERVER_ERROR' },
      } satisfies JsonError,
      { status: 500 }
    );
  }
}
