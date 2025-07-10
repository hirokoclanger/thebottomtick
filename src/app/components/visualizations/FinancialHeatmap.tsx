'use client';

import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FinancialHeatmapProps {
  data: any;
  quarter: string;
  ticker: string;
}

const FinancialHeatmap: React.FC<FinancialHeatmapProps> = ({ data, quarter, ticker }) => {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  // Process actual financial data to create meaningful sections
  const processedData = useMemo(() => {
    if (!data || !data.metrics || !data.periods) {
      return { sections: [], maxValue: 0 };
    }

    // Group metrics by financial statement
    const incomeMetrics = data.metrics.filter((m: any) => m.statement === 'income');
    const balanceMetrics = data.metrics.filter((m: any) => m.statement === 'balance');
    const cashflowMetrics = data.metrics.filter((m: any) => m.statement === 'cashflow');

    // Get current quarter index
    const currentQuarterIndex = data.periods.indexOf(quarter);
    const previousQuarter = data.periods[currentQuarterIndex + 1]; // Next in array = previous in time

    let maxValue = 0;
    
    const createSection = (sectionName: string, metrics: any[]) => {
      const items = metrics.map(metric => {
        const currentData = metric.dataPoints.find((dp: any) => dp.period === quarter);
        if (!currentData) return null;

        const value = Math.abs(currentData.value);
        maxValue = Math.max(maxValue, value);

        // Calculate real percentage change
        let change = 0;
        if (previousQuarter) {
          const previousData = metric.dataPoints.find((dp: any) => dp.period === previousQuarter);
          if (previousData && previousData.value !== 0) {
            change = ((currentData.value - previousData.value) / Math.abs(previousData.value)) * 100;
          }
        }

        return {
          id: metric.name.toLowerCase().replace(/\s+/g, '_'),
          label: metric.name,
          value: currentData.value,
          change: change,
          unit: metric.unit || 'USD'
        };
      }).filter(Boolean);

      return {
        id: sectionName.toLowerCase().replace(/\s+/g, '_'),
        label: sectionName.toUpperCase(),
        items: items.filter(item => item !== null)
      };
    };

    const sections = [
      createSection('Income Statement', incomeMetrics),
      createSection('Balance Sheet', balanceMetrics),
      createSection('Cash Flow Statement', cashflowMetrics)
    ].filter(section => section.items.length > 0);

    return { sections, maxValue };
  }, [data, quarter]);

  // Helper functions
  const formatValue = (value: number, unit: string = 'USD') => {
    if (value === 0) return '$0';
    const absValue = Math.abs(value);
    if (absValue >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (absValue >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (absValue >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (absValue >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const formatChange = (change: number) => {
    if (change === 0) return '0%';
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change === 0) return 'text-gray-500';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change: number) => {
    if (change === 0) return <Minus className="w-3 h-3" />;
    return change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
  };

  const getCellSize = (value: number) => {
    if (processedData.maxValue === 0) return 'w-16 h-16';
    const ratio = Math.abs(value) / processedData.maxValue;
    if (ratio > 0.7) return 'w-20 h-20';
    if (ratio > 0.4) return 'w-16 h-16';
    if (ratio > 0.2) return 'w-12 h-12';
    return 'w-10 h-10';
  };

  const getCellColorClass = (change: number) => {
    if (change === 0) return 'bg-gray-100 border-gray-300';
    const intensity = Math.abs(change);
    if (change > 0) {
      if (intensity >= 20) return 'bg-green-500 border-green-600';
      if (intensity >= 10) return 'bg-green-400 border-green-500';
      if (intensity >= 5) return 'bg-green-300 border-green-400';
      return 'bg-green-200 border-green-300';
    } else {
      if (intensity >= 20) return 'bg-red-500 border-red-600';
      if (intensity >= 10) return 'bg-red-400 border-red-500';
      if (intensity >= 5) return 'bg-red-300 border-red-400';
      return 'bg-red-200 border-red-300';
    }
  };

  return (
    <div className="w-full h-full p-6 bg-white">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Comprehensive Financial Heatmap</h3>
        <p className="text-sm text-gray-600">
          Box size reflects absolute value magnitude, color intensity shows percentage change from previous quarter.
          Displays all metrics from Income Statement, Balance Sheet, and Cash Flow Statement for {quarter}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {processedData.sections.map((section) => (
          <div key={section.id} className="border rounded-lg p-4 bg-gray-50">
            <h4 className="text-sm font-bold mb-4 text-gray-700 border-b pb-2">
              {section.label}
            </h4>
            <div className="flex flex-wrap gap-2">
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className={`
                    ${getCellSize(item.value)} 
                    ${getCellColorClass(item.change)}
                    border-2 rounded-lg p-2 cursor-pointer transition-all duration-200
                    hover:scale-105 hover:shadow-lg
                    ${selectedCell === item.id ? 'ring-2 ring-blue-500' : ''}
                  `}
                  onClick={() => setSelectedCell(selectedCell === item.id ? null : item.id)}
                >
                  <div className="flex flex-col h-full justify-between text-xs">
                    <div className="font-medium text-gray-800 leading-tight">
                      {item.label.split(' ').slice(0, 2).join(' ')}
                    </div>
                    <div className="text-right mt-1">
                      <div className="font-bold text-gray-900">
                        {formatValue(item.value)}
                      </div>
                      <div className={`flex items-center justify-end gap-1 ${getChangeColor(item.change)}`}>
                        {getChangeIcon(item.change)}
                        <span className="text-xs">{formatChange(item.change)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedCell && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold mb-2">Selected Metric Details</h4>
          {processedData.sections.map((section) => {
            const item = section.items.find(i => i.id === selectedCell);
            if (!item) return null;
            return (
              <div key={item.id} className="text-sm">
                <div className="font-medium">{item.label}</div>
                <div className="text-gray-600">
                  Current Value: {formatValue(item.value)} | 
                  Change: {formatChange(item.change)} | 
                  Quarter: {quarter}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FinancialHeatmap;
