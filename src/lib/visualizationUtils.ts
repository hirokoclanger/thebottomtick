// Utility functions for preparing financial data for visualizations

export interface VisualizationData {
  revenue: number;
  operatingExpenses: number;
  rnd: number;
  assets: number;
  debt: number;
  cash: number;
  inventory: number;
  investments: number;
  revenueChange: number;
  opexChange: number;
  rdChange: number;
  assetsChange: number;
  debtChange: number;
  cashChange: number;
  inventoryChange: number;
  investmentsChange: number;
  growingAreas: string[];
  decliningAreas: string[];
  keyMetrics: {
    revenue: string;
    profit: string;
    cash: string;
  };
}

export function prepareVisualizationData(quarterData: any, quarter: string): VisualizationData {
  // Extract financial metrics with fallback values
  const revenue = quarterData?.Revenues || quarterData?.RevenueFromContractWithCustomerExcludingAssessedTax || 0;
  const operatingExpenses = quarterData?.OperatingExpenses || quarterData?.CostOfRevenue || 0;
  const rnd = quarterData?.ResearchAndDevelopmentExpense || 0;
  const assets = quarterData?.Assets || quarterData?.AssetsCurrent || 0;
  const debt = quarterData?.LongTermDebt || quarterData?.DebtCurrent || 0;
  const cash = quarterData?.CashAndCashEquivalentsAtCarryingValue || 0;
  const inventory = quarterData?.InventoryNet || 0;
  const investments = quarterData?.Investments || quarterData?.MarketableSecurities || 0;

  // Calculate percentage changes (mock data for now - in real implementation, compare with previous quarter)
  const revenueChange = Math.random() * 20 - 10; // -10% to +10%
  const opexChange = Math.random() * 15 - 7.5; // -7.5% to +7.5%
  const rdChange = Math.random() * 25 - 12.5; // -12.5% to +12.5%
  const assetsChange = Math.random() * 10 - 5; // -5% to +5%
  const debtChange = Math.random() * 15 - 7.5; // -7.5% to +7.5%
  const cashChange = Math.random() * 30 - 15; // -15% to +15%
  const inventoryChange = Math.random() * 20 - 10; // -10% to +10%
  const investmentsChange = Math.random() * 40 - 20; // -20% to +20%

  // Determine growing and declining areas
  const changes = [
    { name: 'Revenue', change: revenueChange },
    { name: 'Operating Expenses', change: opexChange },
    { name: 'R&D', change: rdChange },
    { name: 'Assets', change: assetsChange },
    { name: 'Debt', change: debtChange },
    { name: 'Cash', change: cashChange },
    { name: 'Inventory', change: inventoryChange },
    { name: 'Investments', change: investmentsChange }
  ];

  const growingAreas = changes
    .filter(item => item.change > 5)
    .map(item => `${item.name} (+${item.change.toFixed(1)}%)`)
    .slice(0, 3);

  const decliningAreas = changes
    .filter(item => item.change < -5)
    .map(item => `${item.name} (${item.change.toFixed(1)}%)`)
    .slice(0, 3);

  // Format key metrics
  const formatValue = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  const profit = Math.max(0, revenue - operatingExpenses);

  return {
    revenue,
    operatingExpenses,
    rnd,
    assets,
    debt,
    cash,
    inventory,
    investments,
    revenueChange,
    opexChange,
    rdChange,
    assetsChange,
    debtChange,
    cashChange,
    inventoryChange,
    investmentsChange,
    growingAreas,
    decliningAreas,
    keyMetrics: {
      revenue: formatValue(revenue),
      profit: formatValue(profit),
      cash: formatValue(cash)
    }
  };
}

export function calculateQuarterlyChange(currentQuarter: any, previousQuarter: any): number {
  if (!previousQuarter || !currentQuarter) return 0;
  
  const current = typeof currentQuarter === 'number' ? currentQuarter : 0;
  const previous = typeof previousQuarter === 'number' ? previousQuarter : 0;
  
  if (previous === 0) return current > 0 ? 100 : 0;
  
  return ((current - previous) / previous) * 100;
}

export function getFinancialHealth(data: VisualizationData): 'healthy' | 'warning' | 'critical' {
  const healthScore = 
    (data.revenueChange > 0 ? 1 : 0) +
    (data.cashChange > 0 ? 1 : 0) +
    (data.debtChange < 0 ? 1 : 0) +
    (data.assetsChange > 0 ? 1 : 0);
  
  if (healthScore >= 3) return 'healthy';
  if (healthScore >= 2) return 'warning';
  return 'critical';
}

export function getTopChanges(data: VisualizationData): Array<{ metric: string; change: number; direction: 'up' | 'down' }> {
  const changes = [
    { metric: 'Revenue', change: data.revenueChange },
    { metric: 'Operating Expenses', change: data.opexChange },
    { metric: 'R&D', change: data.rdChange },
    { metric: 'Assets', change: data.assetsChange },
    { metric: 'Debt', change: data.debtChange },
    { metric: 'Cash', change: data.cashChange },
    { metric: 'Inventory', change: data.inventoryChange },
    { metric: 'Investments', change: data.investmentsChange }
  ];

  return changes
    .map(item => ({
      metric: item.metric,
      change: Math.abs(item.change),
      direction: item.change > 0 ? 'up' : 'down' as 'up' | 'down'
    }))
    .sort((a, b) => b.change - a.change)
    .slice(0, 5);
}
