"use client";
import { useState, useEffect, useRef } from 'react';

interface TickerSearchProps {
  onTickerSelect: (ticker: string, viewType?: string) => void;
  onClear: () => void;
  selectedTicker: string | null;
  currentView?: string;
}

export default function TickerSearch({ onTickerSelect, onClear, selectedTicker, currentView }: TickerSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTickers, setFilteredTickers] = useState<string[]>([]);
  const [availableTickers, setAvailableTickers] = useState<Record<string, { cik: string; title: string }>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load available tickers
  useEffect(() => {
    const loadTickers = async () => {
      try {
        const response = await fetch('/api/tickers');
        if (response.ok) {
          const data = await response.json();
          setAvailableTickers(data);
        }
      } catch (error) {
        console.error('Failed to load tickers:', error);
      }
    };
    loadTickers();
  }, []);

  // Filter tickers based on search term
  const filterTickers = (term: string) => {
    if (!term) {
      setFilteredTickers([]);
      return;
    }
    const upperTerm = term.toUpperCase();
    const results = Object.keys(availableTickers).filter(ticker => 
      ticker.includes(upperTerm) || 
      availableTickers[ticker].title.toUpperCase().includes(upperTerm)
    ).slice(0, 10);
    setFilteredTickers(results);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '/' && !isOpen) {
        event.preventDefault();
        setIsOpen(true);
        setSearchTerm('');
        setFilteredTickers([]);
        setTimeout(() => searchInputRef.current?.focus(), 0);
      } else if (event.key === '=' && !isOpen && selectedTicker) {
        event.preventDefault();
        onClear();
      } else if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchTerm('');
        setFilteredTickers([]);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, selectedTicker, onClear]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterTickers(term);
  };

  const handleTickerClick = (ticker: string) => {
    // Parse view type from suffix
    const lowerTicker = ticker.toLowerCase();
    let viewType = 'default';
    let cleanTicker = ticker;
    
    if (lowerTicker.endsWith('.d')) {
      viewType = 'detailed';
      cleanTicker = ticker.slice(0, -2);
    } else if (lowerTicker.endsWith('.q')) {
      viewType = 'quarterly';
      cleanTicker = ticker.slice(0, -2);
    } else if (lowerTicker.endsWith('.c')) {
      viewType = 'charts';
      cleanTicker = ticker.slice(0, -2);
    } else if (lowerTicker.endsWith('.i')) {
      viewType = 'income';
      cleanTicker = ticker.slice(0, -2);
    } else if (lowerTicker.endsWith('.b')) {
      viewType = 'balance';
      cleanTicker = ticker.slice(0, -2);
    } else if (lowerTicker.endsWith('.cf')) {
      viewType = 'cashflow';
      cleanTicker = ticker.slice(0, -3);
    }
    
    setIsOpen(false);
    setSearchTerm('');
    setFilteredTickers([]);
    onTickerSelect(cleanTicker, viewType);
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const term = searchTerm.trim().toUpperCase();
      
      // Parse view type from suffix
      let viewType = 'default';
      let cleanTerm = term;
      
      if (term.endsWith('.D')) {
        viewType = 'detailed';
        cleanTerm = term.slice(0, -2);
      } else if (term.endsWith('.Q')) {
        viewType = 'quarterly';
        cleanTerm = term.slice(0, -2);
      } else if (term.endsWith('.C')) {
        viewType = 'charts';
        cleanTerm = term.slice(0, -2);
      } else if (term.endsWith('.I')) {
        viewType = 'income';
        cleanTerm = term.slice(0, -2);
      } else if (term.endsWith('.B')) {
        viewType = 'balance';
        cleanTerm = term.slice(0, -2);
      } else if (term.endsWith('.CF')) {
        viewType = 'cashflow';
        cleanTerm = term.slice(0, -3);
      }
      
      if (filteredTickers.length > 0) {
        handleTickerClick(filteredTickers[0]);
      } else if (cleanTerm && availableTickers[cleanTerm]) {
        setIsOpen(false);
        setSearchTerm('');
        setFilteredTickers([]);
        onTickerSelect(cleanTerm, viewType);
      }
    }
  };

  if (!isOpen && !selectedTicker) {
    return (
      <div className="w-full bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Financial Data Lookup</h1>
          <p className="text-gray-600 mb-8">Press "/" to search for any ticker symbol</p>
          <div className="text-sm text-gray-500 space-y-2">
            <p>Examples: AAPL, MSFT, TSLA, GOOGL</p>
            <p className="text-blue-600">View types:</p>
            <div className="text-xs space-y-1 text-left max-w-md mx-auto">
              <p>• Default: <code>AAPL</code> - Key metrics overview</p>
              <p>• Quarterly: <code>AAPL.q</code> - Financial data table</p>
              <p>• Income: <code>AAPL.i</code> - Income statement with charts</p>
              <p>• Balance: <code>AAPL.b</code> - Balance sheet with charts</p>
              <p>• Cash Flow: <code>AAPL.c</code> - Cash flow with charts</p>
              <p>• Detailed: <code>AAPL.d</code> - All metrics</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen && selectedTicker) {
    const getViewDisplayName = (view?: string) => {
      switch (view) {
        case 'quarterly': return 'Quarterly Data';
        case 'income': return 'Income Statement';
        case 'balance': return 'Balance Sheet';
        case 'cashflow': return 'Cash Flow';
        case 'detailed': return 'Detailed View';
        default: return 'Overview';
      }
    };

    return (
      <div className="w-full bg-white border-b border-gray-200">
        <div className="w-[90%] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedTicker}
              </h1>
              <div className="text-sm text-gray-600">
                {availableTickers[selectedTicker]?.title || 'Loading...'}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium">
                {getViewDisplayName(currentView)}
              </div>
              <button
                onClick={onClear}
                className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
              >
                <span>✕</span>
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mt-20 p-6">
        <div className="flex justify-between items-center mb-4">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Type ticker symbol (e.g., AAPL, MSFT.d for detailed view)..."
            className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleEnter}
          />
          <button
            onClick={() => {
              setIsOpen(false);
              setSearchTerm('');
              setFilteredTickers([]);
            }}
            className="ml-4 p-2 text-gray-600 hover:text-gray-900"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4 text-sm text-gray-600">
          <p><strong>Tip:</strong> Add ".d" to any ticker for detailed view (e.g., AAPL.d)</p>
        </div>
        
        {searchTerm && filteredTickers.length === 0 && (
          <p className="text-gray-500">No tickers found matching "{searchTerm}".</p>
        )}
        
        {filteredTickers.length > 0 && (
          <ul className="max-h-80 overflow-y-auto">
            {filteredTickers.map(ticker => (
              <li key={ticker} className="border-b border-gray-200 last:border-b-0">
                <button
                  onClick={() => handleTickerClick(ticker)}
                  className="block w-full text-left p-4 hover:bg-gray-100 rounded-md"
                >
                  <div className="font-semibold text-blue-700">{ticker}</div>
                  <div className="text-sm text-gray-600">{availableTickers[ticker]?.title}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
