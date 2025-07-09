"use client";
import { useState } from "react";
import TickerSearch from "./components/TickerSearch";
import TickerDisplay from "./components/TickerDisplay";

export default function HomePage() {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<any>(null);

  const handleTickerSelect = async (ticker: string) => {
    setSelectedTicker(ticker);
    
    try {
      const response = await fetch(`/api/tickers/${ticker}`);
      if (response.ok) {
        const data = await response.json();
        setCompanyData(data);
      } else {
        setCompanyData(null);
      }
    } catch (error) {
      console.error('Error fetching ticker data:', error);
      setCompanyData(null);
    }
  };

  const handleClearTicker = () => {
    setSelectedTicker(null);
    setCompanyData(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-12">
      <TickerSearch 
        onTickerSelect={handleTickerSelect}
        onClear={handleClearTicker}
        selectedTicker={selectedTicker}
      />
      
      {selectedTicker && (
        <TickerDisplay 
          ticker={selectedTicker}
          data={companyData}
        />
      )}
    </div>
  );
}