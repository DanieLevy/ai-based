import { NextResponse } from 'next/server';
import { AVAILABLE_MODELS } from '@/app/lib/ai/models';
import * as logger from '@/app/lib/ai/logging';

export async function GET() {
  try {
    // Return the predefined models list directly instead of trying to fetch from API
    logger.info('Returning predefined models list', { count: AVAILABLE_MODELS.length });
    return NextResponse.json({ models: AVAILABLE_MODELS });
  } catch (error) {
    logger.error('Error handling models request', { error });
    return NextResponse.json(
      { error: 'Failed to retrieve models', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 