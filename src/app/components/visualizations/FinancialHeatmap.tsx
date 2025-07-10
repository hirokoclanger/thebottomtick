'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FinancialHeatmapProps {
  data: any;
  quarter: string;
  ticker: string;
}

const FinancialHeatmap: React.FC<FinancialHeatmapProps> = ({ data, quarter, ticker }) => {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  // Define sections with their respective metrics
  const sections = [
    {
      id: 'revenue',
      label: 'REVENUE PERFORMANCE',
      items: [
        { id: 'revenue', label: 'Total Revenue', value: data.revenue, change: data.revenueChange },
        { id: 'recurring', label: 'Recurring Revenue', value: data.revenue * 0.8, change: data.revenueChange * 1.2 },
        { id: 'growth', label: 'Growth Rate', value: data.revenue * 0.1, change: data.revenueChange * 0.8 },
        { id: 'margins', label: 'Gross Margins', value: data.revenue * 0.3, change: data.revenueChange * 0.6 }
      ]
    },
    {
      id: 'expenses',
      label: 'OPERATING EXPENSES',
      items: [
        { id: 'opex', label: 'OpEx', value: data.operatingExpenses, change: data.opexChange },
        { id: 'rd', label: 'R&D', value: data.rnd, change: data.rdChange },
        { id: 'sales', label: 'Sales & Marketing', value: data.operatingExpenses * 0.4, change: data.opexChange * 0.8 },
        { id: 'admin', label: 'G&A', value: data.operatingExpenses * 0.2, change: data.opexChange * 1.1 }
      ]
    },
    {
      id: 'assets',
      label: 'BALANCE SHEET',
      items: [
        { id: 'assets', label: 'Total Assets', value: data.assets, change: data.assetsChange },
        { id: 'cash', label: 'Cash', value: data.cash, change: data.cashChange },
        { id: 'inventory', label: 'Inventory', value: data.inventory, change: data.inventoryChange },
        { id: 'investments', label: 'Investments', value: data.investments, change: data.investmentsChange }
      ]
    },
    {
      id: 'liabilities',
      label: 'DEBT & LIABILITIES',
      items: [
        { id: 'debt', label: 'Total Debt', value: data.debt, change: data.debtChange },
        { id: 'shortDebt', label: 'Short-term Debt', value: data.debt * 0.3, change: data.debtChange * 1.2 },
        { id: 'longDebt', label: 'Long-term Debt', value: data.debt * 0.7, change: data.debtChange * 0.9 },
        { id: 'payables', label: 'Payables', value: data.debt * 0.2, change: data.debtChange * 0.7 }
      ]
    }
  ];

  const getColor = (change: number) => {
    if (change > 10) return '#16a34a'; // Strong green
    if (change > 5) return '#22c55e'; // Medium green
    if (change > 0) return '#4ade80'; // Light green
    if (change === 0) return '#6b7280'; // Gray
    if (change > -5) return '#f87171'; // Light red
    if (change > -10) return '#ef4444'; // Medium red
    return '#dc2626'; // Strong red
  };

  const getTextColor = (change: number) => {
    return Math.abs(change) > 2 ? 'white' : 'black';
  };

  const formatValue = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const getItemSize = (value: number, sectionItems: any[]) => {
    const maxValue = Math.max(...sectionItems.map(item => item.value));
    const minValue = Math.min(...sectionItems.map(item => item.value));
    const range = maxValue - minValue;
    
    if (range === 0) return 1; // Equal sizes if all values are the same
    
    const normalized = (value - minValue) / range;
    return 0.5 + (normalized * 0.5); // Size between 0.5 and 1
  };

  const getSectionLayout = (items: any[]) => {
    // Calculate total "area" for the section
    const totalValue = items.reduce((sum, item) => sum + item.value, 0);
    
    // Calculate relative sizes
    const itemsWithSize = items.map(item => ({
      ...item,
      relativeSize: item.value / totalValue
    }));

    return itemsWithSize;
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-2">Financial Heatmap - {ticker}</h3>
        <p className="text-gray-600">Finviz-style view: Size shows value, color shows change</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section) => {
          const layoutItems = getSectionLayout(section.items);
          
          return (
            <div key={section.id} className="border-2 border-gray-300 rounded-lg overflow-hidden">
              {/* Section Header */}
              <div className="bg-gray-700 text-white p-3 text-sm font-bold tracking-wider">
                {section.label}
              </div>
              
              {/* Section Content */}
              <div className="p-2 bg-gray-100 min-h-[300px]">
                <div className="grid grid-cols-2 gap-2 h-full">
                  {layoutItems.map((item, index) => {
                    const color = getColor(item.change);
                    const textColor = getTextColor(item.change);
                    const size = getItemSize(item.value, section.items);
                    
                    return (
                      <div
                        key={item.id}
                        className="rounded cursor-pointer hover:opacity-80 transition-opacity flex flex-col justify-center items-center p-2 text-center"
                        style={{
                          backgroundColor: color,
                          color: textColor,
                          minHeight: `${100 + (size * 50)}px`,
                          fontSize: `${0.7 + (size * 0.3)}rem`
                        }}
                        onClick={() => setSelectedCell(selectedCell === item.id ? null : item.id)}
                      >
                        <div className="font-bold text-xs mb-1">{item.label.toUpperCase()}</div>
                        <div className="font-semibold">
                          {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
                        </div>
                        <div className="text-xs mt-1 opacity-90">
                          {formatValue(item.value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <h4 className="font-semibold mb-2">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#16a34a' }}></div>
            <span className="text-xs">Strong Growth (+10%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }}></div>
            <span className="text-xs">Growth (+5%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6b7280' }}></div>
            <span className="text-xs">Stable (0%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc2626' }}></div>
            <span className="text-xs">Declining (-10%)</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          Box size represents relative value within each section
        </div>
      </div>

      {/* Selected Cell Details */}
      {selectedCell && (
        <div className="bg-blue-50 p-4 rounded-lg mt-4">
          <h4 className="font-semibold mb-2">
            {sections.flatMap(s => s.items).find(item => item.id === selectedCell)?.label} Details
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">Current Value:</span>
              <div className="font-semibold text-lg">
                {formatValue(sections.flatMap(s => s.items).find(item => item.id === selectedCell)?.value || 0)}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Change from Previous Quarter:</span>
              <div className="font-semibold text-lg">
                {sections.flatMap(s => s.items).find(item => item.id === selectedCell)?.change || 0 > 0 ? '+' : ''}
                {sections.flatMap(s => s.items).find(item => item.id === selectedCell)?.change.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialHeatmap;
