import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // SEC requires a proper User-Agent header
    const headers = {
      "User-Agent": "TheBottomTick/1.0 (financial-analysis-platform)"
    };

    // Fetch ticker-CIK mapping from SEC
    const response = await fetch(
      "https://www.sec.gov/files/company_tickers.json",
      { headers }
    );

    if (!response.ok) {
      throw new Error(`SEC API error: ${response.status} ${response.statusText}`);
    }

    const tickerData = await response.json();
    
    // Transform the data to a more usable format
    const tickerMap: Record<string, { cik: string; title: string }> = {};
    
    Object.values(tickerData).forEach((company: any) => {
      const ticker = company.ticker?.toUpperCase();
      if (ticker) {
        tickerMap[ticker] = {
          cik: String(company.cik_str).padStart(10, '0'), // Ensure 10-digit CIK
          title: company.title
        };
      }
    });

    // Save to data directory
    const filePath = path.join(process.cwd(), 'src', 'data', 'company_tickers.json');
    await writeFile(filePath, JSON.stringify(tickerMap, null, 2));

    return NextResponse.json({
      success: true,
      count: Object.keys(tickerMap).length,
      message: 'Ticker list updated successfully'
    });

  } catch (error) {
    console.error('Error updating ticker list:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update ticker list',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
