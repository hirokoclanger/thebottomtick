import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
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

    // Try to load company facts from persistent storage
    const factsPath = path.join('/var/lib/data', 'companyfacts', `CIK${company.cik}.json`);
    let financialData = null;
    
    try {
      financialData = JSON.parse(await readFile(factsPath, 'utf-8'));
    } catch {
      // Financial data not available locally
    }

    return NextResponse.json({
      ticker: upperSymbol,
      cik: company.cik,
      title: company.title,
      financialData: financialData ? 'available' : 'not_loaded',
      facts: financialData?.facts || null
    });

  } catch (error) {
    console.error('Error fetching ticker data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticker data' },
      { status: 500 }
    );
  }
}
