'use client';

import React, { useState, useEffect } from 'react';
import { RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';

interface MoneyWheelProps {
  data: any;
  quarter: string;
  ticker: string;
}

const MoneyWheel: React.FC<MoneyWheelProps> = ({ data, quarter, ticker }) => {
  const [rotation, setRotation] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  // Remove automatic rotation - wheel is now static
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setRotation(prev => (prev + 1) % 360);
  //   }, 50);
  //   return () => clearInterval(interval);
  // }, []);

  const segments = [
    { id: 'revenue', label: 'Revenue', value: data.revenue, change: data.revenueChange, color: '#10b981' },
    { id: 'opex', label: 'Operating Expenses', value: data.operatingExpenses, change: data.opexChange, color: '#3b82f6' },
    { id: 'rd', label: 'R&D', value: data.rnd, change: data.rdChange, color: '#8b5cf6' },
    { id: 'assets', label: 'Assets', value: data.assets, change: data.assetsChange, color: '#f59e0b' },
    { id: 'debt', label: 'Debt', value: data.debt, change: data.debtChange, color: '#ef4444' },
    { id: 'cash', label: 'Cash', value: data.cash, change: data.cashChange, color: '#14b8a6' },
    { id: 'inventory', label: 'Inventory', value: data.inventory, change: data.inventoryChange, color: '#f97316' },
    { id: 'investments', label: 'Investments', value: data.investments, change: data.investmentsChange, color: '#6366f1' }
  ];

  const totalValue = segments.reduce((sum, segment) => sum + segment.value, 0);

  const formatValue = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const createSegmentPath = (segment: any, index: number) => {
    const centerX = 250;
    const centerY = 250;
    const radius = 150;
    const innerRadius = 80;
    
    const percentage = segment.value / totalValue;
    const angle = percentage * 360;
    
    let startAngle = 0;
    for (let i = 0; i < index; i++) {
      startAngle += (segments[i].value / totalValue) * 360;
    }
    
    const endAngle = startAngle + angle;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const outerStartX = centerX + radius * Math.cos(startAngleRad);
    const outerStartY = centerY + radius * Math.sin(startAngleRad);
    const outerEndX = centerX + radius * Math.cos(endAngleRad);
    const outerEndY = centerY + radius * Math.sin(endAngleRad);
    
    const innerStartX = centerX + innerRadius * Math.cos(startAngleRad);
    const innerStartY = centerY + innerRadius * Math.sin(startAngleRad);
    const innerEndX = centerX + innerRadius * Math.cos(endAngleRad);
    const innerEndY = centerY + innerRadius * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    return `M ${innerStartX} ${innerStartY} 
            L ${outerStartX} ${outerStartY} 
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}
            L ${innerEndX} ${innerEndY} 
            A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY} Z`;
  };

  const getSegmentCenter = (segment: any, index: number) => {
    const centerX = 250;
    const centerY = 250;
    const radius = 115;
    
    const percentage = segment.value / totalValue;
    const angle = percentage * 360;
    
    let startAngle = 0;
    for (let i = 0; i < index; i++) {
      startAngle += (segments[i].value / totalValue) * 360;
    }
    
    const midAngle = startAngle + angle / 2;
    const midAngleRad = (midAngle * Math.PI) / 180;
    
    const x = centerX + radius * Math.cos(midAngleRad);
    const y = centerY + radius * Math.sin(midAngleRad);
    
    return { x, y };
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-2">Money Wheel - {ticker}</h3>
        <p className="text-gray-600">Static circular view of financial segments</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Wheel Visualization */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            <svg width="500" height="500" className="drop-shadow-lg">
              {/* Outer ring */}
              <circle
                cx="250"
                cy="250"
                r="180"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="2"
              />
              
              {/* Inner ring */}
              <circle
                cx="250"
                cy="250"
                r="60"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="2"
              />

              {/* Segments */}
              <g transform={`rotate(${rotation} 250 250)`}>
                {segments.map((segment, index) => {
                  const path = createSegmentPath(segment, index);
                  const center = getSegmentCenter(segment, index);
                  
                  return (
                    <g key={segment.id}>
                      <path
                        d={path}
                        fill={segment.color}
                        stroke="white"
                        strokeWidth="2"
                        opacity={selectedSegment === segment.id ? 1 : 0.8}
                        className="cursor-pointer hover:opacity-100 transition-opacity"
                        onClick={() => setSelectedSegment(selectedSegment === segment.id ? null : segment.id)}
                      />
                      
                      {/* Segment labels */}
                      <text
                        x={center.x}
                        y={center.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="12"
                        fontWeight="bold"
                        className="pointer-events-none"
                      >
                        {segment.label}
                      </text>
                      
                      <text
                        x={center.x}
                        y={center.y + 15}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="10"
                        className="pointer-events-none"
                      >
                        {formatValue(segment.value)}
                      </text>
                    </g>
                  );
                })}
              </g>

              {/* Center circle */}
              <circle
                cx="250"
                cy="250"
                r="60"
                fill="#1f2937"
                stroke="white"
                strokeWidth="3"
              />
              
              {/* Center text */}
              <text
                x="250"
                y="240"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="14"
                fontWeight="bold"
              >
                {ticker}
              </text>
              
              <text
                x="250"
                y="255"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="12"
              >
                {quarter}
              </text>
              
              <text
                x="250"
                y="270"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="10"
              >
                Total: {formatValue(totalValue)}
              </text>
            </svg>

            {/* Rotation control */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setRotation(0)}
                className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                title="Reset rotation"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Segment Details */}
        <div className="flex-1 space-y-4">
          <h4 className="font-semibold text-lg">Segment Details</h4>
          
          {segments.map((segment) => (
            <div
              key={segment.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedSegment === segment.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedSegment(selectedSegment === segment.id ? null : segment.id)}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: segment.color }}
                ></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{segment.label}</span>
                    <div className="flex items-center space-x-2">
                      {segment.change > 0 ? (
                        <TrendingUp className="text-green-600" size={16} />
                      ) : (
                        <TrendingDown className="text-red-600" size={16} />
                      )}
                      <span className={`font-semibold ${segment.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {segment.change > 0 ? '+' : ''}{segment.change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-gray-600">{formatValue(segment.value)}</div>
                  <div className="text-sm text-gray-500">
                    {((segment.value / totalValue) * 100).toFixed(1)}% of total
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Segment Details */}
      {selectedSegment && (
        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          {(() => {
            const segment = segments.find(s => s.id === selectedSegment);
            if (!segment) return null;
            
            return (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  ></div>
                  <h4 className="font-semibold">{segment.label} - Detailed View</h4>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Current Value:</span>
                    <div className="font-semibold text-lg">{formatValue(segment.value)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Change:</span>
                    <div className={`font-semibold text-lg ${segment.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {segment.change > 0 ? '+' : ''}{segment.change.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Percentage of Total:</span>
                    <div className="font-semibold text-lg">
                      {((segment.value / totalValue) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default MoneyWheel;
