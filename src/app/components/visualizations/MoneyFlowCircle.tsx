'use client';

import React, { useState, useEffect } from 'react';
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

  const flows = [
    { from: 'Revenue', to: 'Operations', amount: data.revenue * 0.6, color: 'green' },
    { from: 'Revenue', to: 'R&D', amount: data.rnd, color: 'blue' },
    { from: 'Revenue', to: 'Inventory', amount: data.inventory * 0.1, color: 'orange' },
    { from: 'Operations', to: 'Investments', amount: data.investments, color: 'purple' },
    { from: 'Operations', to: 'Debt Payments', amount: data.debt * 0.05, color: 'red' },
    { from: 'Operations', to: 'Cash', amount: data.cash * 0.2, color: 'teal' },
    { from: 'Cash', to: 'Profit', amount: data.revenue * 0.15, color: 'gold' }
  ];

  const nodes = [
    { id: 'Revenue', x: 400, y: 80, value: data.revenue, color: 'bg-green-500' },
    { id: 'Operations', x: 150, y: 200, value: data.operatingExpenses, color: 'bg-blue-500' },
    { id: 'R&D', x: 650, y: 200, value: data.rnd, color: 'bg-purple-500' },
    { id: 'Inventory', x: 100, y: 380, value: data.inventory, color: 'bg-orange-500' },
    { id: 'Investments', x: 280, y: 450, value: data.investments, color: 'bg-indigo-500' },
    { id: 'Debt Payments', x: 520, y: 450, value: data.debt * 0.05, color: 'bg-red-500' },
    { id: 'Cash', x: 700, y: 380, value: data.cash, color: 'bg-teal-500' },
    { id: 'Profit', x: 400, y: 520, value: data.revenue * 0.15, color: 'bg-yellow-500' }
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
        <h3 className="text-xl font-bold mb-2">Money Flow Circle - {ticker}</h3>
        <p className="text-gray-600">Watch money flow through different business areas</p>
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
