'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, DollarSign } from 'lucide-react';

interface MoneyFlowCircleProps {
  data: any;
  quarter: string;
  ticker: string;
}

const MoneyFlowCircle: React.FC<MoneyFlowCircleProps> = ({ data, quarter, ticker }) => {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Extract real financial data from comprehensive data
  const realData = useMemo(() => {
    if (!data || !data.metrics) {
      return null;
    }

    const getMetricValue = (metricName: string) => {
      const metric = data.metrics.find((m: any) => m.name === metricName);
      if (!metric) return 0;
      const dataPoint = metric.dataPoints.find((dp: any) => dp.period === quarter);
      return dataPoint ? dataPoint.value : 0;
    };

    // Get key financial metrics from all three statements
    return {
      // Income Statement
      revenue: getMetricValue('Revenues'),
      grossProfit: getMetricValue('Gross Profit'),
      operatingIncome: getMetricValue('Operating Income Loss'),
      netIncome: getMetricValue('Net Income Loss'),
      costOfRevenue: getMetricValue('Cost Of Goods And Services Sold'),
      rnd: getMetricValue('Research And Development Expense'),
      sga: getMetricValue('Selling General And Administrative Expense'),
      
      // Balance Sheet
      cash: getMetricValue('Cash And Cash Equivalents At Carrying Value'),
      assets: getMetricValue('Assets'),
      currentAssets: getMetricValue('Assets Current'),
      longTermDebt: getMetricValue('Long Term Debt'),
      stockholdersEquity: getMetricValue('Stockholders Equity'),
      
      // Cash Flow Statement
      operatingCashFlow: getMetricValue('Net Cash Provided By Used In Operating Activities'),
      investingCashFlow: getMetricValue('Net Cash Provided By Used In Investing Activities'),
      financingCashFlow: getMetricValue('Net Cash Provided By Used In Financing Activities')
    };
  }, [data, quarter]);

  if (!realData) {
    return <div className="p-8 text-center">No financial data available for visualization</div>;
  }

  const flows = [
    { from: 'Revenue', to: 'Cost of Revenue', amount: Math.abs(realData.costOfRevenue), color: 'red' },
    { from: 'Revenue', to: 'R&D', amount: Math.abs(realData.rnd), color: 'blue' },
    { from: 'Revenue', to: 'SG&A', amount: Math.abs(realData.sga), color: 'orange' },
    { from: 'Revenue', to: 'Gross Profit', amount: Math.abs(realData.grossProfit), color: 'green' },
    { from: 'Gross Profit', to: 'Operating Income', amount: Math.abs(realData.operatingIncome), color: 'darkgreen' },
    { from: 'Operating Income', to: 'Net Income', amount: Math.abs(realData.netIncome), color: 'emerald' },
    { from: 'Operating Income', to: 'Operating Cash Flow', amount: Math.abs(realData.operatingCashFlow), color: 'teal' },
    { from: 'Operating Cash Flow', to: 'Cash', amount: Math.abs(realData.cash) * 0.1, color: 'gold' }
  ];

  const nodes = [
    { id: 'Revenue', x: 400, y: 80, value: realData.revenue, color: 'bg-green-500' },
    { id: 'Cost of Revenue', x: 150, y: 200, value: realData.costOfRevenue, color: 'bg-red-500' },
    { id: 'R&D', x: 650, y: 200, value: realData.rnd, color: 'bg-blue-500' },
    { id: 'SG&A', x: 100, y: 380, value: realData.sga, color: 'bg-orange-500' },
    { id: 'Gross Profit', x: 400, y: 200, value: realData.grossProfit, color: 'bg-green-400' },
    { id: 'Operating Income', x: 400, y: 320, value: realData.operatingIncome, color: 'bg-green-600' },
    { id: 'Net Income', x: 280, y: 450, value: realData.netIncome, color: 'bg-emerald-600' },
    { id: 'Operating Cash Flow', x: 520, y: 450, value: realData.operatingCashFlow, color: 'bg-teal-500' },
    { id: 'Cash', x: 700, y: 380, value: realData.cash, color: 'bg-yellow-500' }
  ];

  const formatValue = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const getNodeSize = (value: number) => {
    const maxValue = Math.max(...nodes.map(n => n.value));
    const minValue = Math.min(...nodes.map(n => n.value));
    const minSize = 45;
    const maxSize = 100;
    
    // Use logarithmic scale for more pronounced differences
    const normalizedValue = Math.log(value + 1) / Math.log(maxValue + 1);
    return minSize + normalizedValue * (maxSize - minSize);
  };

  const getFlowWidth = (amount: number) => {
    const maxFlow = Math.max(...flows.map(f => f.amount));
    const minFlow = Math.min(...flows.map(f => f.amount));
    const minWidth = 3;
    const maxWidth = 12;
    
    // Use logarithmic scale for more pronounced differences
    const normalizedAmount = Math.log(amount + 1) / Math.log(maxFlow + 1);
    return minWidth + normalizedAmount * (maxWidth - minWidth);
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-2">Comprehensive Money Flow - {ticker}</h3>
        <p className="text-gray-600">Watch money flow through all business areas using complete financial data</p>
      </div>

      <div className="relative bg-gray-50 rounded-lg p-8" style={{ height: '650px' }}>
        {/* Flow Lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          {flows.map((flow, index) => {
            const fromNode = nodes.find(n => n.id === flow.from);
            const toNode = nodes.find(n => n.id === flow.to);
            if (!fromNode || !toNode) return null;

            const flowWidth = getFlowWidth(flow.amount);
            const animationOffset = (animationStep * 2) % 100;

            return (
              <g key={index}>
                {/* Flow line */}
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={flow.color === 'green' ? '#10b981' : 
                          flow.color === 'blue' ? '#3b82f6' :
                          flow.color === 'orange' ? '#f59e0b' :
                          flow.color === 'purple' ? '#8b5cf6' :
                          flow.color === 'red' ? '#ef4444' :
                          flow.color === 'teal' ? '#14b8a6' :
                          '#eab308'}
                  strokeWidth={flowWidth}
                  opacity={0.6}
                />
                
                {/* Animated flow particles */}
                <circle
                  cx={fromNode.x + (toNode.x - fromNode.x) * (animationOffset / 100)}
                  cy={fromNode.y + (toNode.y - fromNode.y) * (animationOffset / 100)}
                  r={flowWidth / 2}
                  fill={flow.color === 'green' ? '#10b981' : 
                        flow.color === 'blue' ? '#3b82f6' :
                        flow.color === 'orange' ? '#f59e0b' :
                        flow.color === 'purple' ? '#8b5cf6' :
                        flow.color === 'red' ? '#ef4444' :
                        flow.color === 'teal' ? '#14b8a6' :
                        '#eab308'}
                  opacity={0.8}
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const size = getNodeSize(node.value);
          return (
            <div
              key={node.id}
              className={`absolute ${node.color} rounded-full flex flex-col items-center justify-center text-white shadow-lg cursor-pointer hover:scale-110 transition-transform`}
              style={{
                left: `${node.x - size/2}px`,
                top: `${node.y - size/2}px`,
                width: `${size}px`,
                height: `${size}px`,
                zIndex: 2
              }}
            >
              <DollarSign size={16} />
              <div className="text-xs font-semibold text-center px-1">{node.id}</div>
              <div className="text-xs">{formatValue(node.value)}</div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg" style={{ zIndex: 3 }}>
          <h4 className="font-semibold mb-2">Flow Legend</h4>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-2 bg-green-500 rounded"></div>
              <span className="text-xs">Revenue to Operations</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-2 bg-blue-500 rounded"></div>
              <span className="text-xs">Revenue to R&D</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-2 bg-purple-500 rounded"></div>
              <span className="text-xs">Operations to Investments</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-2 bg-yellow-500 rounded"></div>
              <span className="text-xs">Cash to Profit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Summary */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {flows.slice(0, 4).map((flow, index) => (
          <div key={index} className="bg-white p-3 rounded-lg border">
            <div className="flex items-center space-x-2 mb-1">
              <ArrowRight size={16} />
              <span className="text-sm font-medium">{flow.from} → {flow.to}</span>
            </div>
            <div className="text-lg font-semibold">{formatValue(flow.amount)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoneyFlowCircle;
