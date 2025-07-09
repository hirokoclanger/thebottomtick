"use client";
import { useState } from "react";

export default function TickerManager() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const updateTickerList = async () => {
    setIsUpdating(true);
    setStatus('idle');
    
    try {
      const response = await fetch('/api/tickers/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setMessage(`Successfully updated ${result.count} ticker symbols`);
        setLastUpdated(new Date().toLocaleString());
      } else {
        setStatus('error');
        setMessage(result.error || 'Failed to update ticker list');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error occurred while updating ticker list');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
      
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4">Ticker Symbol Management</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">SEC EDGAR Ticker Database</h3>
              <p className="text-sm text-gray-600">
                Updates ticker-to-CIK mapping from SEC database
              </p>
              {lastUpdated && (
                <p className="text-xs text-gray-500">
                  Last updated: {lastUpdated}
                </p>
              )}
            </div>
            
            <button
              onClick={updateTickerList}
              disabled={isUpdating}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isUpdating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isUpdating ? 'Updating...' : 'Update Ticker List'}
            </button>
          </div>
          
          {status !== 'idle' && (
            <div className={`p-3 rounded-md text-sm ${
              status === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}
          
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Downloads latest company tickers from SEC EDGAR database</p>
            <p>• Maps ticker symbols to CIK numbers for financial data lookup</p>
            <p>• Required for accurate company financial data retrieval</p>
            <p>• Data source: https://www.sec.gov/files/company_tickers.json</p>
          </div>
        </div>
      </div>
    </div>
  );
}
