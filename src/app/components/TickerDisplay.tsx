"use client";

import { useState, useEffect } from 'react';

interface TickerDisplayProps {
  ticker: string;
  data: any;
  onClear: () => void;
  viewType?: string;
}

interface FinancialDataPoint {
  value: number;
  period: string;
  date: string;
  quarter?: string;
  year?: string;
  filed?: string;
}

interface ProcessedMetric {
  name: string;
  description: string;
  unit: string;
  dataPoints: FinancialDataPoint[];
}

// Simple chart component for financial metrics
function MetricChart({ metric, className = "" }: { metric: ProcessedMetric; className?: string }) {
  if (metric.dataPoints.length < 2) return null;

  // Sort all data points by date
  const allSortedData = [...metric.dataPoints].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Limit to last 6 years (24 quarters) for charts to keep them readable
  const maxDataPoints = 24; // 6 years * 4 quarters
  const sortedData = allSortedData.slice(-maxDataPoints);

  const values = sortedData.map(d => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue;

  // Calculate parabolic regression (quadratic)
  const n = sortedData.length;
  const xValues = sortedData.map((_, i) => i);
  const yValues = sortedData.map(d => d.value);
  
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
  const sumX3 = xValues.reduce((sum, x) => sum + x * x * x, 0);
  const sumX4 = xValues.reduce((sum, x) => sum + x * x * x * x, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumX2Y = xValues.reduce((sum, x, i) => sum + x * x * yValues[i], 0);
  
  // Simple quadratic fit using normal equations
  const A = [
    [n, sumX, sumX2],
    [sumX, sumX2, sumX3],
    [sumX2, sumX3, sumX4]
  ];
  const B = [sumY, sumXY, sumX2Y];
  
  // Solve for quadratic coefficients (simplified)
  const det = A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
              A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
              A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
  
  let quadA = 0, quadB = 0, quadC = 0;
  if (Math.abs(det) > 0.001) {
    quadA = ((B[0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
              A[0][1] * (B[1] * A[2][2] - A[1][2] * B[2]) +
              A[0][2] * (B[1] * A[2][1] - A[1][1] * B[2])) / det);
    quadB = ((A[0][0] * (B[1] * A[2][2] - A[1][2] * B[2]) -
              B[0] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
              A[0][2] * (A[1][0] * B[2] - B[1] * A[2][0])) / det);
    quadC = ((A[0][0] * (A[1][1] * B[2] - B[1] * A[2][1]) -
              A[0][1] * (A[1][0] * B[2] - B[1] * A[2][0]) +
              B[0] * (A[1][0] * A[2][1] - A[1][1] * A[2][0])) / det);
  }

  // Determine trend direction from parabolic regression
  const firstQuadY = quadA + quadB * 0 + quadC * 0 * 0;
  const lastQuadY = quadA + quadB * (n-1) + quadC * (n-1) * (n-1);
  const isTrendingUp = lastQuadY > firstQuadY;

  // Generate regression line points
  const regressionPoints = xValues.map(x => {
    const quadraticY = quadA + quadB * x + quadC * x * x;
    return { x, quadraticY };
  });

  // Format time labels
  const formatTimeLabel = (dataPoint: FinancialDataPoint) => {
    const date = new Date(dataPoint.date);
    const year = date.getFullYear().toString().slice(-2); // Get last 2 digits of year
    return `${dataPoint.quarter}-${year}`; // dataPoint.quarter already includes "Q"
  };

  // Calculate value scale ticks
  const getValueTicks = () => {
    const tickCount = 5;
    const step = range / (tickCount - 1);
    return Array.from({ length: tickCount }, (_, i) => minValue + step * i);
  };

  const valueTicks = getValueTicks();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 mb-2">{metric.name}</h4>
      <div className="relative h-50 w-full">
        <svg 
          viewBox="0 0 400 120" 
          className="w-full "
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          <defs>
            <pattern id={`grid-${metric.name.replace(/\s+/g, '')}`} width="32" height="16" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 16" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect x="50" y="5" width="330" height="85" fill={`url(#grid-${metric.name.replace(/\s+/g, '')})`}/>
          
          {/* Y-axis (Value scale) */}
          <line x1="50" y1="5" x2="50" y2="90" stroke="#9ca3af" strokeWidth="1"/>
          {valueTicks.map((tick, index) => {
            const y = 90 - ((tick - minValue) / range) * 85;
            return (
              <g key={index}>
                <line x1="45" y1={y} x2="50" y2={y} stroke="#9ca3af" strokeWidth="1"/>
                <text x="40" y={y + 3} textAnchor="end" fontSize="8" fill="#6b7280">
                  {formatValue(tick, metric.unit)}
                </text>
              </g>
            );
          })}
          
          {/* X-axis (Time scale) */}
          <line x1="50" y1="90" x2="380" y2="90" stroke="#9ca3af" strokeWidth="1"/>
          {sortedData.map((dataPoint, index) => {
            // Show every 2nd or 3rd label depending on data density, plus always show first and last
            const showLabel = index === 0 || index === n - 1 || 
                            (n <= 8 && index % 2 === 0) || 
                            (n > 8 && index % 3 === 0);
            
            if (showLabel) {
              const x = 50 + (index / (n - 1)) * 330;
              return (
                <g key={index}>
                  <line x1={x} y1="90" x2={x} y2="95" stroke="#9ca3af" strokeWidth="1"/>
                  <text x={x} y="105" textAnchor="middle" fontSize="8" fill="#6b7280">
                    {formatTimeLabel(dataPoint)}
                  </text>
                </g>
              );
            }
            return null;
          })}
          
          {/* Parabolic trend line */}
          {Math.abs(det) > 0.001 && (
            <polyline
              fill="none"
              stroke={isTrendingUp ? "#10b981" : "#ef4444"}
              strokeWidth="2"
              points={regressionPoints.map((point, index) => {
                const x = 50 + (index / (n - 1)) * 330;
                const y = range === 0 ? 47.5 : 90 - ((point.quadraticY - minValue) / range) * 85;
                return `${x},${Math.max(5, Math.min(90, y))}`;
              }).join(' ')}
            />
          )}
          
          {/* Data points (blue dots) */}
          {sortedData.map((point, index) => {
            const x = 50 + (index / (n - 1)) * 330;
            const y = range === 0 ? 47.5 : 90 - ((point.value - minValue) / range) * 85;
            return (
              <circle
                key={index}
                cx={x}
                cy={Math.max(5, Math.min(90, y))}
                r="3"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="1"
              />
            );
          })}
        </svg>
        
        {/* Current value and trend indicator */}
        <div className="mt-2 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs">
            {Math.abs(det) > 0.001 && (
              <div className="flex items-center gap-1">
                <div className={`w-3 h-0.5 ${isTrendingUp ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-600">Trend</span>
                <span className={`text-xs ${isTrendingUp ? 'text-green-600' : 'text-red-600'}`}>
                  {isTrendingUp ? '↗ Up' : '↘ Down'}
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Latest</div>
            <span className="text-sm font-bold text-gray-900">
              {formatValue(values[values.length - 1], metric.unit)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to process financial data
function processFinancialData(facts: any, isDetailedView: boolean = false): { metrics: ProcessedMetric[], periods: string[] } {
  if (!facts || !facts['us-gaap']) {
    return { metrics: [], periods: [] };
  }

  const metrics: ProcessedMetric[] = [];
  const allPeriods = new Set<string>();

  // Key financial metrics to display in default view
  const keyMetrics = [
    'Revenues',
    'RevenueFromContractWithCustomerExcludingAssessedTax',
    'GrossProfit',
    'OperatingIncomeLoss',
    'NetIncomeLoss',
    'EarningsPerShareBasic',
    'EarningsPerShareDiluted',
    'Assets',
    'AssetsCurrent',
    'Liabilities',
    'LiabilitiesCurrent',
    'StockholdersEquity',
    'CashAndCashEquivalentsAtCarryingValue',
    'OperatingCashFlowsFromOperatingActivities'
  ];

  // In detailed view, process ALL available metrics
  const metricsToProcess = isDetailedView 
    ? Object.keys(facts['us-gaap']) 
    : keyMetrics;

  metricsToProcess.forEach(metricKey => {
    const metric = facts['us-gaap'][metricKey];
    if (!metric || !metric.units) return;

    // Find the most common unit (usually USD)
    const units = Object.keys(metric.units);
    const primaryUnit = units.find(unit => unit === 'USD') || units[0];
    
    if (!primaryUnit || !metric.units[primaryUnit]) return;

    // Process and deduplicate data points
    const rawDataPoints = metric.units[primaryUnit]
      .filter((point: any) => point.end && point.val)
      .map((point: any) => {
        const endDate = new Date(point.end);
        const year = endDate.getFullYear();
        const month = endDate.getMonth() + 1;
        const quarter = Math.ceil(month / 3);
        const periodKey = `${year}-Q${quarter}`;
        
        return {
          value: point.val,
          period: periodKey,
          date: point.end,
          quarter: `Q${quarter}`,
          year: year.toString(),
          filed: point.filed || point.end // Use filed date for deduplication preference
        };
      });

    // Deduplicate by period, keeping the most recently filed data for each period
    const periodMap = new Map<string, FinancialDataPoint>();
    rawDataPoints.forEach((point: any) => {
      const existing = periodMap.get(point.period);
      if (!existing || (point.filed && existing.filed && new Date(point.filed).getTime() > new Date(existing.filed).getTime())) {
        periodMap.set(point.period, point);
        allPeriods.add(point.period);
      } else if (!existing || (!point.filed && !existing.filed)) {
        // If neither has filed date, just use the first one or keep existing
        if (!existing) {
          periodMap.set(point.period, point);
          allPeriods.add(point.period);
        }
      }
    });

    const dataPoints: FinancialDataPoint[] = Array.from(periodMap.values())
      .sort((a: FinancialDataPoint, b: FinancialDataPoint) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

    if (dataPoints.length > 0) {
      metrics.push({
        name: metricKey.replace(/([A-Z])/g, ' $1').trim(),
        description: metric.description || '',
        unit: primaryUnit,
        dataPoints
      });
    }
  });

  // Sort periods chronologically (most recent first)
  const sortedPeriods = Array.from(allPeriods).sort((a, b) => {
    const [yearA, quarterA] = a.split('-Q');
    const [yearB, quarterB] = b.split('-Q');
    const dateA = parseInt(yearA) * 4 + parseInt(quarterA);
    const dateB = parseInt(yearB) * 4 + parseInt(quarterB);
    return dateB - dateA;
  });

  return { metrics, periods: sortedPeriods }; // Show all available quarters for table
}

// Helper function to format values
function formatValue(value: number, unit: string): string {
  if (unit === 'USD') {
    if (Math.abs(value) >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (Math.abs(value) >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else if (Math.abs(value) >= 1e3) {
      return `$${(value / 1e3).toFixed(2)}K`;
    } else {
      return `$${value.toLocaleString()}`;
    }
  } else if (unit === 'USD/shares') {
    return `$${value.toFixed(2)}`;
  } else {
    return value.toLocaleString();
  }
}

// Helper function to calculate trend for a metric
function calculateMetricTrend(metric: ProcessedMetric, shortTermPeriods: number = 3): { 
  overallTrend: 'up' | 'down' | 'neutral', 
  shortTermTrend: 'up' | 'down' | 'neutral',
  latestValue: number 
} {
  if (metric.dataPoints.length < 2) {
    return { overallTrend: 'neutral', shortTermTrend: 'neutral', latestValue: metric.dataPoints[0]?.value || 0 };
  }

  const sortedData = [...metric.dataPoints].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const n = sortedData.length;
  const xValues = sortedData.map((_, i) => i);
  const yValues = sortedData.map(d => d.value);
  
  // Calculate parabolic regression for overall trend
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
  const sumX3 = xValues.reduce((sum, x) => sum + x * x * x, 0);
  const sumX4 = xValues.reduce((sum, x) => sum + x * x * x * x, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumX2Y = xValues.reduce((sum, x, i) => sum + x * x * yValues[i], 0);
  
  const A = [
    [n, sumX, sumX2],
    [sumX, sumX2, sumX3],
    [sumX2, sumX3, sumX4]
  ];
  const B = [sumY, sumXY, sumX2Y];
  
  const det = A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
              A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
              A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
  
  let overallTrend: 'up' | 'down' | 'neutral' = 'neutral';
  if (Math.abs(det) > 0.001) {
    const quadA = ((B[0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
                    A[0][1] * (B[1] * A[2][2] - A[1][2] * B[2]) +
                    A[0][2] * (B[1] * A[2][1] - A[1][1] * B[2])) / det);
    const quadB = ((A[0][0] * (B[1] * A[2][2] - A[1][2] * B[2]) -
                    B[0] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
                    A[0][2] * (A[1][0] * B[2] - B[1] * A[2][0])) / det);
    const quadC = ((A[0][0] * (A[1][1] * B[2] - B[1] * A[2][1]) -
                    A[0][1] * (A[1][0] * B[2] - B[1] * A[2][0]) +
                    B[0] * (A[1][0] * A[2][1] - A[1][1] * A[2][0])) / det);

    const firstQuadY = quadA + quadB * 0 + quadC * 0 * 0;
    const lastQuadY = quadA + quadB * (n-1) + quadC * (n-1) * (n-1);
    overallTrend = lastQuadY > firstQuadY ? 'up' : 'down';
  }

  // Calculate short-term trend (configurable number of periods)
  const lastNPeriods = sortedData.slice(-shortTermPeriods);
  let shortTermTrend: 'up' | 'down' | 'neutral' = 'neutral';
  
  if (lastNPeriods.length >= 2) {
    const firstValue = lastNPeriods[0].value;
    const lastValue = lastNPeriods[lastNPeriods.length - 1].value;
    const change = ((lastValue - firstValue) / Math.abs(firstValue)) * 100;
    
    if (Math.abs(change) > 5) { // 5% threshold for significant change
      shortTermTrend = change > 0 ? 'up' : 'down';
    }
  }

  return { 
    overallTrend, 
    shortTermTrend, 
    latestValue: sortedData[sortedData.length - 1].value 
  };
}

// Helper function to get short metric names
function getShortMetricName(name: string): string {
  const nameMap: Record<string, string> = {
    'Revenues': 'Revenue',
    'Revenue From Contract With Customer Excluding Assessed Tax': 'Contract Revenue',
    'Gross Profit': 'Gross Profit',
    'Operating Income Loss': 'Operating Income',
    'Net Income Loss': 'Net Income',
    'Earnings Per Share Basic': 'EPS Basic',
    'Earnings Per Share Diluted': 'EPS Diluted',
    'Assets': 'Total Assets',
    'Assets Current': 'Current Assets',
    'Liabilities': 'Total Liabilities',
    'Liabilities Current': 'Current Liabilities',
    'Stockholders Equity': 'Equity',
    'Cash And Cash Equivalents At Carrying Value': 'Cash',
    'Operating Cash Flows From Operating Activities': 'Operating Cash Flow'
  };
  
  return nameMap[name] || name;
}

export default function TickerDisplay({ ticker, data, onClear, viewType = 'default' }: TickerDisplayProps) {
  const [isChartsExpanded, setIsChartsExpanded] = useState(false);
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false);
  const [shortTermPeriods, setShortTermPeriods] = useState(3);

  // Keyboard shortcut handling for trend period adjustment
  useEffect(() => {
    let inputBuffer = '';
    let isTypingT = false;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === 't' && !isTypingT) {
        isTypingT = true;
        inputBuffer = '';
        event.preventDefault();
        return;
      }

      if (isTypingT) {
        if (key === 'enter') {
          const num = parseInt(inputBuffer);
          if (!isNaN(num) && num >= 2 && num <= 12) {
            setShortTermPeriods(num);
          }
          isTypingT = false;
          inputBuffer = '';
          event.preventDefault();
        } else if (key >= '0' && key <= '9') {
          inputBuffer += key;
          event.preventDefault();
        } else if (key === 'escape' || key === 'backspace') {
          isTypingT = false;
          inputBuffer = '';
          event.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!data) {
    return (
      <div className="w-full min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading financial data for {ticker}...</p>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="w-full min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
            <p className="text-red-600">{data.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { title } = data;

  return (
    <div className="w-full bg-white text-gray-900">
      <div className="w-[90%] mx-auto px-6 py-6 space-y-6">
        {/* Company Info and Financial Status */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-lg font-bold text-gray-800">Company Information</h2>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              data.financialData === 'available' 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
            }`}>
              {data.financialData === 'available' ? '📊 Data Available' : '⚠️ Data Not Loaded'}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 text-sm">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Ticker</label>
              <p className="font-semibold text-gray-900">{data.ticker}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">CIK</label>
              <p className="text-gray-800">{data.cik}</p>
            </div>
            <div className="col-span-2 md:col-span-1 lg:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Company Name</label>
              <p className="text-gray-800 truncate" title={data.title}>{data.title}</p>
            </div>
            
            {/* Additional company information if available */}
            {data.facts && data.facts.entityName && (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Entity Name</label>
                <p className="text-gray-700 text-xs truncate" title={data.facts.entityName}>{data.facts.entityName}</p>
              </div>
            )}
            
            {data.facts && data.facts.dei && (
              <>
                {data.facts.dei.EntityRegistrantName && (
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Registrant</label>
                    <p className="text-gray-700 text-xs truncate" title={
                      data.facts.dei.EntityRegistrantName.units?.USD?.[0]?.val || 
                      data.facts.dei.EntityRegistrantName.label || 'N/A'
                    }>
                      {data.facts.dei.EntityRegistrantName.units?.USD?.[0]?.val || 
                       data.facts.dei.EntityRegistrantName.label || 'N/A'}
                    </p>
                  </div>
                )}
                
                {data.facts.dei.EntityIncorporationStateCountryCode && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
                    <p className="text-gray-700 text-xs">
                      {data.facts.dei.EntityIncorporationStateCountryCode.units?.USD?.[0]?.val ||
                       data.facts.dei.EntityIncorporationStateCountryCode.label || 'N/A'}
                    </p>
                  </div>
                )}
                
                {data.facts.dei.EntityPublicFloat && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Public Float</label>
                    <p className="text-gray-700 text-xs">
                      {data.facts.dei.EntityPublicFloat.units?.USD?.length > 0 
                        ? formatValue(data.facts.dei.EntityPublicFloat.units.USD[0].val, 'USD')
                        : 'N/A'}
                    </p>
                  </div>
                )}

                {data.facts.dei.EntityCommonStockSharesOutstanding && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Shares Outstanding</label>
                    <p className="text-gray-700 text-xs">
                      {data.facts.dei.EntityCommonStockSharesOutstanding.units?.shares?.length > 0 
                        ? (data.facts.dei.EntityCommonStockSharesOutstanding.units.shares[0].val / 1000000).toFixed(1) + 'M'
                        : 'N/A'}
                    </p>
                  </div>
                )}

                {data.facts.dei.EntityFilerCategory && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Filer Category</label>
                    <p className="text-gray-700 text-xs">
                      {data.facts.dei.EntityFilerCategory.units?.USD?.[0]?.val ||
                       data.facts.dei.EntityFilerCategory.label || 'N/A'}
                    </p>
                  </div>
                )}

                {data.facts.dei.TradingSymbol && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Trading Symbol</label>
                    <p className="text-gray-700 text-xs">
                      {data.facts.dei.TradingSymbol.units?.USD?.[0]?.val ||
                       data.facts.dei.TradingSymbol.label || data.ticker}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          
          {data.financialData !== 'available' && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <p className="text-yellow-800">
                💡 Financial data file not found in local storage. Some features may be limited.
              </p>
            </div>
          )}
        </div>

        {/* Financial Charts and Data */}
        {(data.facts || data.metrics) && (() => {
          const isDetailedView = viewType === 'detailed' || viewType === 'quarterly';
          
          // Handle both old format (data.facts) and new format (data.metrics)
          let metrics, periods;
          if (data.metrics && data.periods) {
            // New server-processed format - server already did the filtering
            metrics = data.metrics;
            periods = data.periods;
            console.log('Server-processed data:', { 
              totalMetrics: metrics.length, 
              viewType, 
              serverView: data.view,
              isDetailedView,
              firstFewMetrics: metrics.slice(0, 5).map((m: ProcessedMetric) => m.name)
            });
          } else if (data.facts) {
            // Old client-processed format (fallback)
            const processed = processFinancialData(data.facts, isDetailedView);
            metrics = processed.metrics;
            periods = processed.periods;
            console.log('Client-processed data:', { 
              totalMetrics: metrics.length, 
              viewType, 
              isDetailedView 
            });
          } else {
            metrics = [];
            periods = [];
          }
          
          console.log(`Final result - View Type: ${viewType}, Is Detailed: ${isDetailedView}, Metrics Count: ${metrics.length}`);
          
          if (metrics.length === 0 || periods.length === 0) {
            return (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Financial Data</h2>
                <div className="text-center py-8">
                  <p className="text-gray-600">No quarterly financial data available for display.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    This may occur if the company hasn't filed recent quarterly reports or if the data format is different.
                  </p>
                </div>
              </div>
            );
          }

          // Quarterly view: show only the financial data table
          if (viewType === 'quarterly') {
            return (
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Financial Data (Quarterly)</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[240px]">
                          Metric
                        </th>
                        {periods.map((period: string) => (
                          <th key={period} className="text-right py-3 px-4 font-semibold text-gray-700 min-w-[140px]">
                            {period}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((metric: ProcessedMetric, index: number) => (
                        <tr key={metric.name} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="py-3 px-4 w-[350px]">
                            <div>
                              <div className="font-medium text-gray-900 cursor-help" title={metric.description}>
                                {metric.name}
                              </div>
                            </div>
                          </td>
                          {periods.map((period: string) => {
                            const dataPoint = metric.dataPoints.find((dp: FinancialDataPoint) => dp.period === period);
                            return (
                              <td key={period} className="py-3 px-4 text-right">
                                {dataPoint ? (
                                  <span className="font-mono text-sm text-gray-800">
                                    {formatValue(dataPoint.value, metric.unit)}
                                  </span>
                                ) : (
                                  <span className="text-gray-500 text-sm">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Quarterly View: Shows all available quarterly financial metrics in table format. Hover over metric names for descriptions.
                    Values are shown in millions (M) or billions (B) where applicable.
                  </p>
                </div>
              </div>
            );
          }

          return (
            <>
              {/* Metrics Summary Table */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-bold text-gray-800">Metrics Summary</h2>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Short-term periods:</label>
                    <select
                      value={shortTermPeriods}
                      onChange={(e) => setShortTermPeriods(Number(e.target.value))}
                      className="px-2 py-1 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={2}>2Q</option>
                      <option value={3}>3Q</option>
                      <option value={4}>4Q</option>
                      <option value={5}>5Q</option>
                      <option value={6}>6Q</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-semibold text-gray-700">Metric</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700">Latest Value</th>
                        <th className="text-center py-2 px-3 font-semibold text-gray-700">Overall Trend</th>
                        <th className="text-center py-2 px-3 font-semibold text-gray-700">
                          <div className="flex items-center justify-center gap-1">
                            <span>{shortTermPeriods}Q Trend</span>
                            <span className="text-xs text-gray-400 font-normal">(t+num)</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((metric: ProcessedMetric, index: number) => {
                        const trends = calculateMetricTrend(metric, shortTermPeriods);
                        return (
                          <tr key={metric.name} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            <td className="py-2 px-3 font-medium text-gray-900">
                              {getShortMetricName(metric.name)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-gray-800">
                              {formatValue(trends.latestValue, metric.unit)}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {trends.overallTrend === 'up' && (
                                  <span className="text-green-600 font-bold">↗ Up</span>
                                )}
                                {trends.overallTrend === 'down' && (
                                  <span className="text-red-600 font-bold">↘ Down</span>
                                )}
                                {trends.overallTrend === 'neutral' && (
                                  <span className="text-gray-500">→ Neutral</span>
                                )}
                              </div>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {trends.shortTermTrend === 'up' && (
                                  <span className="text-green-600 font-bold">↗ Up</span>
                                )}
                                {trends.shortTermTrend === 'down' && (
                                  <span className="text-red-600 font-bold">↘ Down</span>
                                )}
                                {trends.shortTermTrend === 'neutral' && (
                                  <span className="text-gray-500">→ Flat</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Overall Trend: Based on parabolic regression across all available data. 
                  {shortTermPeriods}Q Trend: Short-term trend over last {shortTermPeriods} quarters (&gt;5% change threshold).
                  <br />
                  <span className="text-gray-400">💡 Quick shortcut: Press 't' + number + Enter to change trend period (e.g., t4 + Enter for 4 quarters)</span>
                </div>
              </div>

              {/* Financial Charts */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setIsChartsExpanded(!isChartsExpanded)}
                >
                  <h2 className="text-xl font-bold text-gray-800">Financial Metrics Overview</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {isChartsExpanded ? 'Hide Charts' : 'Show Charts'}
                    </span>
                    <div className={`transform transition-transform duration-200 ${isChartsExpanded ? 'rotate-180' : ''}`}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                {isChartsExpanded && (
                  <div className="mt-4">
                    {/* In detailed view, show all metrics with charts; in default view, show first 8 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(isDetailedView ? metrics : metrics.slice(0, 8)).map((metric: ProcessedMetric) => (
                        <MetricChart key={metric.name} metric={metric} />
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                      <p className="text-blue-800">
                        📊 <strong>{isDetailedView ? 'Detailed View' : 'Default View'}:</strong> 
                        {isDetailedView 
                          ? ` Showing all ${metrics.length} available financial metrics with charts.` 
                          : ` Showing top ${Math.min(8, metrics.length)} key metrics. Use /Ticker.d for all ${data.metrics?.length || 'available'} metrics.`
                        }
                        Charts display the last 6 years (24 quarters) for readability.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Data Table */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setIsMetricsExpanded(!isMetricsExpanded)}
                >
                  <h2 className="text-xl font-bold text-gray-800">Financial Data (Quarterly)</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {isMetricsExpanded ? 'Hide Table' : 'Show Table'}
                    </span>
                    <div className={`transform transition-transform duration-200 ${isMetricsExpanded ? 'rotate-180' : ''}`}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                {isMetricsExpanded && (
                  <div className="mt-4">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-gray-300">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[240px]">
                              Metric
                            </th>
                            {periods.map((period: string) => (
                              <th key={period} className="text-right py-3 px-4 font-semibold text-gray-700 min-w-[140px]">
                                {period}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {metrics.map((metric: ProcessedMetric, index: number) => (
                            <tr key={metric.name} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                              <td className="py-3 px-4 w-[350px]">
                                <div>
                                  <div className="font-medium text-gray-900 cursor-help" title={metric.description}>
                                    {metric.name}
                                  </div>
                                </div>
                              </td>
                              {periods.map((period: string) => {
                                const dataPoint = metric.dataPoints.find((dp: FinancialDataPoint) => dp.period === period);
                                return (
                                  <td key={period} className="py-3 px-4 text-right">
                                    {dataPoint ? (
                                      <span className="font-mono text-sm text-gray-800">
                                        {formatValue(dataPoint.value, metric.unit)}
                                      </span>
                                    ) : (
                                      <span className="text-gray-500 text-sm">—</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Legend */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        {viewType === 'detailed' || viewType === 'quarterly'
                          ? `Shows ALL ${metrics.length} available financial metrics from SEC filings. Hover over metric names for descriptions. ` 
                          : `Default View: Shows ${metrics.length} key financial metrics. Use /Ticker.d for detailed view (all ${data.metrics?.length || 'available'} metrics) or /Ticker.q for quarterly table. `
                        }
                        Table shows all available quarterly data. Charts display the last 6 years (24 quarters) for readability.
                        Values are shown in millions (M) or billions (B) where applicable.
                      </p>
                    </div>
                    
                    {isDetailedView && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm">
                        <p className="text-green-800">
                          🔍 <strong>Detailed View:</strong> Displaying all {metrics.length} available financial metrics. 
                          This includes comprehensive data across all financial statement categories.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
