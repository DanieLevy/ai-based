import { NextResponse } from 'next/server';
import * as logger from '@/app/lib/ai/logging';
import { LogLevel } from '@/app/lib/ai/logging';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const level = searchParams.get('level') as LogLevel | null;
    const modelId = searchParams.get('modelId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    // Get logs
    const logs = logger.getLogs(level, modelId, limit, offset);
    
    // Get metrics
    const metrics = logger.getMetrics(modelId, limit, offset);
    
    // Get performance stats
    const averageDurations = logger.getAverageDurationByModel();
    const successRates = logger.getSuccessRateByModel();
    
    return NextResponse.json({
      logs,
      metrics,
      stats: {
        averageDurations,
        successRates
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve logs', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 