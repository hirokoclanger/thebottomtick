"use client";

interface TickerDisplayProps {
  ticker: string;
  data: any;
  onClear: () => void;
}

interface FinancialDataPoint {
  value: number;
  period: string;
  date: string;
  quarter?: string;
  year?: string;
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

  const sortedData = [...metric.dataPoints].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const values = sortedData.map(d => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue;

  // Calculate linear regression
  const n = sortedData.length;
  const xValues = sortedData.map((_, i) => i);
  const yValues = sortedData.map(d => d.value);
  
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate parabolic regression (quadratic)
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
  const sumX3 = xValues.reduce((sum, x) => sum + x * x * x, 0);
  const sumX4 = xValues.reduce((sum, x) => sum + x * x * x * x, 0);
  const sumXYQuad = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumX2Y = xValues.reduce((sum, x, i) => sum + x * x * yValues[i], 0);
  
  // Simple quadratic fit using normal equations
  const A = [
    [n, sumX, sumX2],
    [sumX, sumX2, sumX3],
    [sumX2, sumX3, sumX4]
  ];
  const B = [sumY, sumXYQuad, sumX2Y];
  
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

  const isPositiveTrend = values[values.length - 1] > values[0];

  // Generate regression line points
  const regressionPoints = xValues.map(x => {
    const linearY = slope * x + intercept;
    const quadraticY = quadA + quadB * x + quadC * x * x;
    return { x, linearY, quadraticY };
  });

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 mb-2">{metric.name}</h4>
      <div className="relative">
        <svg width="400" height="200" className="w-full h-40">
          {/* Grid lines */}
          <defs>
            <pattern id={`grid-${metric.name.replace(/\s+/g, '')}`} width="40" height="25" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 25" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${metric.name.replace(/\s+/g, '')})`}/>
          
          {/* Parabolic regression line */}
          {Math.abs(det) > 0.001 && (
            <polyline
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2"
              points={regressionPoints.map((point, index) => {
                const x = (index / (n - 1)) * 380 + 10;
                const y = range === 0 ? 100 : 190 - ((point.quadraticY - minValue) / range) * 180;
                return `${x},${Math.max(10, Math.min(190, y))}`;
              }).join(' ')}
            />
          )}
          
          {/* Data points (scatter) */}
          {sortedData.map((point, index) => {
            const x = (index / (n - 1)) * 380 + 10;
            const y = range === 0 ? 100 : 190 - ((point.value - minValue) / range) * 180;
            return (
              <circle
                key={index}
                cx={x}
                cy={Math.max(10, Math.min(190, y))}
                r="4"
                fill={isPositiveTrend ? "#10b981" : "#ef4444"}
                stroke="white"
                strokeWidth="1"
              />
            );
          })}
        </svg>
        
        {/* Legend and latest value */}
        <div className="mt-2 flex justify-between items-center">
          <div className="flex gap-4 text-xs">
            {Math.abs(det) > 0.001 && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-purple-500"></div>
                <span className="text-gray-600">Parabolic</span>
              </div>
            )}
          </div>
          <span className={`text-lg font-bold ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
            {formatValue(values[values.length - 1], metric.unit)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Helper function to process financial data
function processFinancialData(facts: any): { metrics: ProcessedMetric[], periods: string[] } {
  if (!facts || !facts['us-gaap']) {
    return { metrics: [], periods: [] };
  }

  const metrics: ProcessedMetric[] = [];
  const allPeriods = new Set<string>();

  // Key financial metrics to display
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

  keyMetrics.forEach(metricKey => {
    const metric = facts['us-gaap'][metricKey];
    if (!metric || !metric.units) return;

    // Find the most common unit (usually USD)
    const units = Object.keys(metric.units);
    const primaryUnit = units.find(unit => unit === 'USD') || units[0];
    
    if (!primaryUnit || !metric.units[primaryUnit]) return;

    const dataPoints: FinancialDataPoint[] = metric.units[primaryUnit]
      .filter((point: any) => point.end && point.val)
      .map((point: any) => {
        const endDate = new Date(point.end);
        const year = endDate.getFullYear();
        const month = endDate.getMonth() + 1;
        const quarter = Math.ceil(month / 3);
        const periodKey = `${year}-Q${quarter}`;
        
        allPeriods.add(periodKey);
        
        return {
          value: point.val,
          period: periodKey,
          date: point.end,
          quarter: `Q${quarter}`,
          year: year.toString()
        };
      })
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

  return { metrics, periods: sortedPeriods.slice(0, 8) }; // Show last 8 quarters
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

export default function TickerDisplay({ ticker, data, onClear }: TickerDisplayProps) {
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
        {/* Company Info */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Ticker Symbol</label>
              <p className="text-lg font-semibold text-gray-900">{data.ticker}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">CIK Number</label>
              <p className="text-lg text-gray-800">{data.cik}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600">Company Name</label>
              <p className="text-lg text-gray-800">{data.title}</p>
            </div>
          </div>
        </div>

        {/* Financial Data Status */}
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Financial Data Status</h2>
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              data.financialData === 'available' 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
            }`}>
              {data.financialData === 'available' ? 'Data Available' : 'Data Not Loaded'}
            </div>
            {data.financialData !== 'available' && (
              <p className="text-gray-600 text-sm">
                Financial data file not found in local storage
              </p>
            )}
          </div>
        </div>

        {/* Financial Charts and Data */}
        {data.facts && (() => {
          const { metrics, periods } = processFinancialData(data.facts);
          
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

          return (
            <>
              {/* Financial Charts */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Financial Metrics Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {metrics.slice(0, 8).map((metric) => (
                    <MetricChart key={metric.name} metric={metric} />
                  ))}
                </div>
              </div>

              {/* Financial Data Table */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Financial Data (Quarterly)</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 min-w-[200px]">
                          Metric
                        </th>
                        {periods.map(period => (
                          <th key={period} className="text-right py-3 px-4 font-semibold text-gray-700 min-w-[120px]">
                            {period}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((metric, index) => (
                        <tr key={metric.name} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{metric.name}</div>
                              {metric.description && (
                                <div className="text-xs text-gray-600 mt-1 line-clamp-3">
                                  {metric.description}
                                </div>
                              )}
                            </div>
                          </td>
                          {periods.map(period => {
                            const dataPoint = metric.dataPoints.find(dp => dp.period === period);
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
                    Values are shown in millions (M) or billions (B) where applicable. 
                    Data sourced from SEC filings and may include both quarterly and annual figures.
                  </p>
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
