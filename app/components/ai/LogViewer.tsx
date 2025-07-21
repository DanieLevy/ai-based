'use client';

import { useState, useEffect } from 'react';
import { LogLevel } from '@/app/lib/ai/logging';

interface Log {
  timestamp: string;
  level: LogLevel;
  modelId?: string;
  requestId?: string;
  message: string;
  data?: any;
  duration?: number;
}

interface Metric {
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

interface Stats {
  averageDurations: Record<string, number>;
  successRates: Record<string, number>;
}

export default function LogViewer() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<LogLevel | null>(null);
  const [filterModel, setFilterModel] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'logs' | 'metrics' | 'stats'>('logs');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Fetch logs from the API
  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/api/ai/logs';
      const params = new URLSearchParams();
      
      if (filterLevel) {
        params.append('level', filterLevel);
      }
      
      if (filterModel) {
        params.append('modelId', filterModel);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setLogs(data.logs || []);
      setMetrics(data.metrics || []);
      setStats(data.stats || null);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Setup auto-refresh interval
  useEffect(() => {
    // Initial fetch
    fetchLogs();
    
    // Clean up any existing interval
    if (refreshInterval !== null) {
      clearInterval(refreshInterval);
    }
    
    // Set up a new interval if needed
    let intervalId: number | null = null;
    
    if (refreshInterval && refreshInterval > 0) {
      intervalId = window.setInterval(fetchLogs, refreshInterval * 1000);
    }
    
    // Clean up on unmount
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [filterLevel, filterModel, refreshInterval]);

  // Get color for log level
  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.DEBUG:
        return 'bg-gray-100 text-gray-800';
      case LogLevel.INFO:
        return 'bg-blue-100 text-blue-800';
      case LogLevel.WARN:
        return 'bg-yellow-100 text-yellow-800';
      case LogLevel.ERROR:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  // Render log table
  const renderLogs = () => {
    if (logs.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          No logs available. Try adjusting your filters.
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Time</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Level</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Model</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Message</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Duration</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="px-4 py-2 text-sm text-gray-500 whitespace-nowrap">
                  {formatTimestamp(log.timestamp)}
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                    {log.level}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm">
                  {log.modelId ? (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                      {log.modelId.split('-')[0]}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-4 py-2 text-sm">{log.message}</td>
                <td className="px-4 py-2 text-sm">
                  {log.duration ? `${log.duration}ms` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render metrics table
  const renderMetrics = () => {
    if (metrics.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          No metrics available. Try making some API requests first.
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Model</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Duration</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Input Tokens</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Output Tokens</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="px-4 py-2 text-sm">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                    {metric.modelId.split('-')[0]}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    metric.success 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {metric.success ? 'Success' : 'Error'}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm">{metric.totalDuration}ms</td>
                <td className="px-4 py-2 text-sm">{metric.inputTokenCount || '-'}</td>
                <td className="px-4 py-2 text-sm">{metric.outputTokenCount || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render statistics
  const renderStats = () => {
    if (!stats) {
      return (
        <div className="p-4 text-center text-gray-500">
          No statistics available. Try making some API requests first.
        </div>
      );
    }
    
    const { averageDurations, successRates } = stats;
    const models = Object.keys({ ...averageDurations, ...successRates });
    
    if (models.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          No statistics available yet. Make some API requests to generate data.
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-md shadow">
          <h3 className="text-lg font-medium mb-4">Average Response Time (ms)</h3>
          <div className="space-y-4">
            {models.map(modelId => {
              const duration = averageDurations[modelId];
              if (!duration) return null;
              
              // Calculate percentage for bar chart (max 3000ms)
              const percentage = Math.min((duration / 3000) * 100, 100);
              
              return (
                <div key={modelId} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {modelId.split('-')[0]}
                    </span>
                    <span className="text-sm text-gray-500">{Math.round(duration)}ms</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-600 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-md shadow">
          <h3 className="text-lg font-medium mb-4">Success Rate (%)</h3>
          <div className="space-y-4">
            {models.map(modelId => {
              const rate = successRates[modelId];
              if (rate === undefined) return null;
              
              // Calculate percentage for bar chart
              const percentage = rate * 100;
              
              return (
                <div key={modelId} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {modelId.split('-')[0]}
                    </span>
                    <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-2 rounded-full ${
                        percentage >= 90 
                          ? 'bg-green-600' 
                          : percentage >= 70 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AI System Logs</h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <label className="mr-2 text-sm">Auto-refresh:</label>
            <select
              className="p-1 border border-gray-300 rounded text-sm"
              value={refreshInterval === null ? '' : refreshInterval}
              onChange={e => setRefreshInterval(e.target.value ? parseInt(e.target.value, 10) : null)}
            >
              <option value="">Off</option>
              <option value="5">5s</option>
              <option value="10">10s</option>
              <option value="30">30s</option>
              <option value="60">1m</option>
            </select>
          </div>
          
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            onClick={fetchLogs}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-md shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <label className="text-sm">Level:</label>
              <select
                className="p-1 border border-gray-300 rounded"
                value={filterLevel || ''}
                onChange={e => setFilterLevel(e.target.value ? e.target.value as LogLevel : null)}
              >
                <option value="">All</option>
                <option value={LogLevel.DEBUG}>Debug</option>
                <option value={LogLevel.INFO}>Info</option>
                <option value={LogLevel.WARN}>Warning</option>
                <option value={LogLevel.ERROR}>Error</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm">Model:</label>
              <input
                type="text"
                className="p-1 border border-gray-300 rounded w-40"
                placeholder="Filter by model..."
                value={filterModel}
                onChange={e => setFilterModel(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'logs'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('logs')}
            >
              Logs
            </button>
            
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'metrics'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('metrics')}
            >
              Metrics
            </button>
            
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'stats'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('stats')}
            >
              Statistics
            </button>
          </nav>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 text-red-700">
            <p>{error}</p>
          </div>
        )}
        
        <div className="p-4">
          {lastRefresh && (
            <p className="text-xs text-gray-500 mb-4">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
          
          {activeTab === 'logs' && renderLogs()}
          {activeTab === 'metrics' && renderMetrics()}
          {activeTab === 'stats' && renderStats()}
        </div>
      </div>
    </div>
  );
} 