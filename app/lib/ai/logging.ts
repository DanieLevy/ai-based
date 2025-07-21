import { AIModel } from './models';

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

// Log entry structure
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  modelId?: string;
  requestId?: string;
  message: string;
  data?: any;
  duration?: number;
}

// Performance metrics for API calls
export interface ApiMetrics {
  modelId: string;
  requestId: string;
  requestTime: number;
  responseTime: number;
  totalDuration: number;
  inputTokenCount?: number;
  outputTokenCount?: number;
  success: boolean;
  error?: string;
}

// In-memory store for logs (in a real app, you'd probably use a database)
const logs: LogEntry[] = [];
const metrics: ApiMetrics[] = [];

// Maximum number of logs to keep in memory
const MAX_LOGS = 1000;

// Add a log entry
export function addLog(level: LogLevel, message: string, data?: any, modelId?: string, requestId?: string, duration?: number): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    modelId,
    requestId,
    message,
    data,
    duration
  };

  console[level](message, data || '');
  logs.unshift(entry);

  // Keep logs under the maximum size
  if (logs.length > MAX_LOGS) {
    logs.pop();
  }
}

// Log debug message
export function debug(message: string, data?: any, modelId?: string, requestId?: string): void {
  addLog(LogLevel.DEBUG, message, data, modelId, requestId);
}

// Log info message
export function info(message: string, data?: any, modelId?: string, requestId?: string): void {
  addLog(LogLevel.INFO, message, data, modelId, requestId);
}

// Log warning message
export function warn(message: string, data?: any, modelId?: string, requestId?: string): void {
  addLog(LogLevel.WARN, message, data, modelId, requestId);
}

// Log error message
export function error(message: string, data?: any, modelId?: string, requestId?: string): void {
  addLog(LogLevel.ERROR, message, data, modelId, requestId);
}

// Log API request
export function logApiRequest(modelId: string, requestId: string, prompt: any): void {
  const shortRequestId = requestId.substring(0, 8);
  const modelName = modelId.split('-')[0];
  
  // For chat messages, extract just the content
  let messagePreview = '';
  if (prompt.messages && Array.isArray(prompt.messages)) {
    const userMessages = prompt.messages.filter((m: any) => m.role === 'user');
    if (userMessages.length > 0) {
      const content = userMessages[0].content;
      messagePreview = content.length > 60 
        ? content.substring(0, 60) + '...' 
        : content;
    }
  }
  
  info(`📤 Request [${modelName}] #${shortRequestId} • ${messagePreview}`, 
    { prompt }, 
    modelId, 
    requestId
  );
}

// Log API response
export function logApiResponse(
  modelId: string, 
  requestId: string, 
  response: any, 
  startTime: number, 
  endTime: number, 
  inputTokenCount?: number, 
  outputTokenCount?: number
): void {
  const duration = endTime - startTime;
  const shortRequestId = requestId.substring(0, 8);
  const modelName = modelId.split('-')[0];
  
  // Format response data in a readable way
  let contentPreview = '';
  if (response.choices && response.choices.length > 0 && response.choices[0].message) {
    const content = response.choices[0].message.content;
    contentPreview = content.length > 60 
      ? content.substring(0, 60) + '...' 
      : content;
  }
  
  const tokenInfo = inputTokenCount && outputTokenCount 
    ? `${inputTokenCount}➡️${outputTokenCount} tokens`
    : 'tokens unknown';
  
  info(
    `📥 Response [${modelName}] #${shortRequestId} • ${duration}ms • ${tokenInfo} • "${contentPreview}"`, 
    { 
      model: modelId,
      duration: `${duration}ms`,
      inputTokens: inputTokenCount,
      outputTokens: outputTokenCount
    }, 
    modelId, 
    requestId,
    duration
  );

  // Store metrics
  metrics.unshift({
    modelId,
    requestId,
    requestTime: startTime,
    responseTime: endTime,
    totalDuration: duration,
    inputTokenCount,
    outputTokenCount,
    success: true
  });

  // Keep metrics under the maximum size
  if (metrics.length > MAX_LOGS) {
    metrics.pop();
  }
}

// Log API error
export function logApiError(modelId: string, requestId: string, error: any, startTime: number): void {
  const endTime = Date.now();
  const duration = endTime - startTime;
  const shortRequestId = requestId.substring(0, 8);
  const modelName = modelId.split('-')[0];
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const shortError = errorMessage.length > 100 
    ? errorMessage.substring(0, 100) + '...' 
    : errorMessage;
  
  this.error(
    `❌ Error [${modelName}] #${shortRequestId} • ${duration}ms • ${shortError}`, 
    { error: errorMessage, stack: error.stack, duration: `${duration}ms` }, 
    modelId, 
    requestId,
    duration
  );

  // Store metrics for the failed request
  metrics.unshift({
    modelId,
    requestId,
    requestTime: startTime,
    responseTime: endTime,
    totalDuration: duration,
    success: false,
    error: errorMessage
  });

  // Keep metrics under the maximum size
  if (metrics.length > MAX_LOGS) {
    metrics.pop();
  }
}

// Get all logs
export function getLogs(
  level?: LogLevel, 
  modelId?: string, 
  limit: number = 100, 
  offset: number = 0
): LogEntry[] {
  let filteredLogs = logs;
  
  if (level) {
    filteredLogs = filteredLogs.filter(log => log.level === level);
  }
  
  if (modelId) {
    filteredLogs = filteredLogs.filter(log => log.modelId === modelId);
  }
  
  return filteredLogs.slice(offset, offset + limit);
}

// Get all metrics
export function getMetrics(modelId?: string, limit: number = 100, offset: number = 0): ApiMetrics[] {
  let filteredMetrics = metrics;
  
  if (modelId) {
    filteredMetrics = filteredMetrics.filter(metric => metric.modelId === modelId);
  }
  
  return filteredMetrics.slice(offset, offset + limit);
}

// Get average duration by model
export function getAverageDurationByModel(): Record<string, number> {
  const durations: Record<string, { total: number, count: number }> = {};
  
  metrics.filter(m => m.success).forEach(metric => {
    if (!durations[metric.modelId]) {
      durations[metric.modelId] = { total: 0, count: 0 };
    }
    
    durations[metric.modelId].total += metric.totalDuration;
    durations[metric.modelId].count += 1;
  });
  
  const result: Record<string, number> = {};
  
  Object.keys(durations).forEach(modelId => {
    result[modelId] = durations[modelId].total / durations[modelId].count;
  });
  
  return result;
}

// Get success rate by model
export function getSuccessRateByModel(): Record<string, number> {
  const stats: Record<string, { success: number, total: number }> = {};
  
  metrics.forEach(metric => {
    if (!stats[metric.modelId]) {
      stats[metric.modelId] = { success: 0, total: 0 };
    }
    
    if (metric.success) {
      stats[metric.modelId].success += 1;
    }
    
    stats[metric.modelId].total += 1;
  });
  
  const result: Record<string, number> = {};
  
  Object.keys(stats).forEach(modelId => {
    result[modelId] = stats[modelId].success / stats[modelId].total;
  });
  
  return result;
} 