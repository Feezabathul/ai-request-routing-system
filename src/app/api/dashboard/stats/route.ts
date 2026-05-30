import { NextResponse } from 'next/server';
import { requestRepository } from '@/repositories/request.repository';

export async function GET() {
  try {
    const stats = await requestRepository.getDashboardStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Failed to load dashboard stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Unable to load dashboard statistics.',
          code: 'DASHBOARD_STATS_ERROR',
        },
      },
      { status: 500 },
    );
  }
}
