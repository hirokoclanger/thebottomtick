import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

// Helper function to process financial data server-side
function processFinancialDataServer(facts: any, viewType: string = 'default') {
  if (!facts || !facts['us-gaap']) {
    return { metrics: [], periods: [] };
  }

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

  const isDetailedView = viewType === 'detailed';
  const metricsToProcess = isDetailedView 
    ? Object.keys(facts['us-gaap']) 
    : keyMetrics;

  console.log(`Server processing: viewType=${viewType}, isDetailedView=${isDetailedView}, total available metrics=${Object.keys(facts['us-gaap']).length}, processing ${metricsToProcess.length} metrics`);

  const processedMetrics: any[] = [];
  const allPeriods = new Set<string>();

  metricsToProcess.forEach(metricKey => {
    const metric = facts['us-gaap'][metricKey];
    if (!metric || !metric.units) return;

    const units = Object.keys(metric.units);
    const primaryUnit = units.find(unit => unit === 'USD') || units[0];
    
    if (!primaryUnit || !metric.units[primaryUnit]) return;

    const dataPoints = metric.units[primaryUnit]
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
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (dataPoints.length > 0) {
      processedMetrics.push({
        name: metricKey,
        description: metricKey.replace(/([A-Z])/g, ' $1').trim(),
        unit: primaryUnit,
        dataPoints: dataPoints.slice(-20) // Last 20 quarters
      });
    }
  });

  return {
    metrics: processedMetrics,
    periods: Array.from(allPeriods).sort()
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'default';
    const upperSymbol = symbol.toUpperCase();

    // Load ticker-CIK mapping
    const tickerPath = path.join(process.cwd(), 'src', 'data', 'company_tickers.json');
    const tickerData = JSON.parse(await readFile(tickerPath, 'utf-8'));
    
    const company = tickerData[upperSymbol];
    if (!company) {
      return NextResponse.json(
        { error: `Ticker ${upperSymbol} not found` },
        { status: 404 }
      );
    }

    // Load and process company facts from persistent storage
    const factsPath = path.join('/var/lib/data', 'companyfacts', `CIK${company.cik}.json`);
    let processedData = null;
    let entityName = null;
    let companyInfo = null;
    
    try {
      const rawData = JSON.parse(await readFile(factsPath, 'utf-8'));
      processedData = processFinancialDataServer(rawData.facts, view);
      entityName = rawData.entityName;
      
      // Extract basic company info for the UI
      companyInfo = {
        entityName: rawData.entityName,
        dei: rawData.facts?.dei || null
      };
    } catch {
      // Financial data not available
    }

    return NextResponse.json({
      ticker: upperSymbol,
      cik: company.cik,
      title: company.title,
      entityName: entityName,
      view: view,
      financialData: processedData ? 'available' : 'not_loaded',
      facts: companyInfo, // Keep basic company info for compatibility
      ...processedData
    });

  } catch (error) {
    console.error('Error fetching ticker data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticker data' },
      { status: 500 }
    );
  }
}
