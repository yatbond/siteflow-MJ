import { useState, useEffect } from 'react';
import { useTrades } from '@/hooks/useTrades';
import BilingualSearch from '@/components/BilingualSearch';
import { t } from '@/shared/i18n/i18n';

interface TradeSelectorProps {
  value: string | null;
  onChange: (tradeId: string | null) => void;
  onUnitChange?: (unit: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function TradeSelector({
  value,
  onChange,
  onUnitChange,
  disabled = false,
  className = '',
}: TradeSelectorProps) {
  const { filteredTrades, searchQuery, setSearchQuery, getTradeById } = useTrades();
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedTrade = value ? getTradeById(value) : null;

  // Auto-populate unit when trade selection changes
  useEffect(() => {
    if (selectedTrade?.standardUnit && onUnitChange) {
      onUnitChange(selectedTrade.standardUnit);
    }
  }, [selectedTrade, onUnitChange]);

  const handleSelect = (tradeId: string) => {
    onChange(tradeId);
    setShowDropdown(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`}>
      <label className="block text-lg mb-2 text-gray-300">{t('report.trade')}</label>
      
      {/* Search Input */}
      <BilingualSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search trade... / 搜尋工種..."
        className="mb-2"
      />

      {/* Selected Trade Display */}
      {selectedTrade && !showDropdown && (
        <div className="p-4 bg-gray-700 rounded-lg mb-2 flex justify-between items-center">
          <div>
            <p className="text-xl font-bold">{selectedTrade.nameEn}</p>
            <p className="text-gray-400">{selectedTrade.nameZh}</p>
          </div>
          <button
            onClick={() => setShowDropdown(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg"
          >
            Change
          </button>
        </div>
      )}

      {/* Dropdown */}
      {(showDropdown || !selectedTrade) && (
        <div className="border border-gray-700 rounded-lg max-h-80 overflow-y-auto bg-gray-800">
          {filteredTrades.length === 0 ? (
            <p className="p-4 text-gray-400">No trades found / 沒有找到工種</p>
          ) : (
            filteredTrades.map((trade) => (
              <button
                key={trade.id}
                onClick={() => handleSelect(trade.id)}
                className="w-full p-4 text-left hover:bg-gray-700 border-b border-gray-700 last:border-0"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-bold">{trade.nameEn}</p>
                    <p className="text-gray-400">{trade.nameZh}</p>
                  </div>
                  <span className="text-sm text-teal-400 bg-teal-900/30 px-3 py-1 rounded">
                    {trade.standardUnit}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Unit Display (if dual-unit trade, show override option) */}
      {selectedTrade && (
        <p className="mt-2 text-sm text-gray-400">
          Unit: <span className="text-teal-400 font-medium">{selectedTrade.standardUnit}</span>
          {['m²', 'm³', 'm', 'kg', 'ton'].includes(selectedTrade.standardUnit) && (
            <span className="ml-2 text-xs">(can override for this report)</span>
          )}
        </p>
      )}
    </div>
  );
}