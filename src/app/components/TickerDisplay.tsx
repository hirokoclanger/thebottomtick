"use client";

interface TickerDisplayProps {
  ticker: string;
  data: any;
}

export default function TickerDisplay({ ticker, data }: TickerDisplayProps) {
  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading financial data for {ticker}...</p>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-600">{data.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Info */}
      <div className="bg-white rounded-lg shadow-lg p-6 border">
        <h2 className="text-2xl font-bold mb-4">Company Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ticker Symbol</label>
            <p className="text-lg font-semibold">{data.ticker}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CIK Number</label>
            <p className="text-lg">{data.cik}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Company Name</label>
            <p className="text-lg">{data.title}</p>
          </div>
        </div>
      </div>

      {/* Financial Data Status */}
      <div className="bg-white rounded-lg shadow-lg p-6 border">
        <h2 className="text-2xl font-bold mb-4">Financial Data Status</h2>
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            data.financialData === 'available' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
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

      {/* Financial Facts */}
      {data.facts && (
        <div className="bg-white rounded-lg shadow-lg p-6 border">
          <h2 className="text-2xl font-bold mb-4">Financial Facts</h2>
          <div className="space-y-4">
            
            {/* US GAAP Data */}
            {data.facts['us-gaap'] && (
              <div>
                <h3 className="text-lg font-semibold mb-2">US GAAP Financial Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(data.facts['us-gaap']).slice(0, 12).map(([key, value]: [string, any]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {value.description || 'No description available'}
                      </div>
                      {value.units && Object.keys(value.units).length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Units: {Object.keys(value.units).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {Object.keys(data.facts['us-gaap']).length > 12 && (
                  <p className="text-sm text-gray-500 mt-2">
                    And {Object.keys(data.facts['us-gaap']).length - 12} more financial metrics...
                  </p>
                )}
              </div>
            )}

            {/* DEI Data */}
            {data.facts.dei && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Document and Entity Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(data.facts.dei).slice(0, 6).map(([key, value]: [string, any]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded">
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {value.description || 'No description available'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
