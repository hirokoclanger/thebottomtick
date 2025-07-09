"use client";
import { useState, useEffect, useRef } from 'react';

interface TickerSearchProps {
  onTickerSelect: (ticker: string, isDetailedView?: boolean) => void;
  onClear: () => void;
  selectedTicker: string | null;
}

export default function TickerSearch({ onTickerSelect, onClear, selectedTicker }: TickerSearchProps) {
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
    const isDetailedView = ticker.toLowerCase().endsWith('.d');
    const cleanTicker = isDetailedView ? ticker.slice(0, -2) : ticker;
    
    setIsOpen(false);
    setSearchTerm('');
    setFilteredTickers([]);
    onTickerSelect(cleanTicker, isDetailedView);
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const term = searchTerm.trim().toUpperCase();
      const isDetailedView = term.endsWith('.D');
      const cleanTerm = isDetailedView ? term.slice(0, -2) : term;
      
      if (filteredTickers.length > 0) {
        handleTickerClick(filteredTickers[0]);
      } else if (cleanTerm && availableTickers[cleanTerm]) {
        handleTickerClick(term);
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
            <p className="text-blue-600">For detailed view: Add .d (e.g., AAPL.d, MSFT.d)</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen && selectedTicker) {
    return (
      <div className="w-full bg-white px-6 py-4">
        <div className="w-[90%] mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedTicker} - {availableTickers[selectedTicker]?.title || 'Loading...'}
          </h1>
          <button
            onClick={onClear}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Clear (Press =)
          </button>
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
