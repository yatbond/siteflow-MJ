import { useState, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface CascadingSelectProps {
  // Data arrays
  categories: string[];
  brands: string[];
  models: string[];
  
  // Values
  selectedCategory: string | null;
  selectedBrand: string | null;
  selectedModel: string | null;
  
  // Handlers
  onCategoryChange: (category: string | null) => void;
  onBrandChange: (brand: string | null) => void;
  onModelChange: (model: string | null) => void;
  
  // Labels
  categoryLabel?: string;
  brandLabel?: string;
  modelLabel?: string;
  
  // Optional
  disabled?: boolean;
  className?: string;
}

export default function CascadingSelect({
  categories,
  brands,
  models,
  selectedCategory,
  selectedBrand,
  selectedModel,
  onCategoryChange,
  onBrandChange,
  onModelChange,
  categoryLabel = 'Type',
  brandLabel = 'Brand',
  modelLabel = 'Model',
  disabled = false,
  className = '',
}: CascadingSelectProps) {
  // Reset downstream selections when upstream changes
  useEffect(() => {
    if (selectedCategory && !categories.includes(selectedCategory)) {
      onCategoryChange(null);
    }
  }, [categories, selectedCategory, onCategoryChange]);

  useEffect(() => {
    if (selectedBrand && !brands.includes(selectedBrand)) {
      onBrandChange(null);
    }
  }, [brands, selectedBrand, onBrandChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Category (Type) */}
      <div>
        <label className="block text-lg mb-2 text-gray-300">{categoryLabel}</label>
        <select
          value={selectedCategory || ''}
          onChange={(e) => {
            onCategoryChange(e.target.value || null);
            onBrandChange(null);
            onModelChange(null);
          }}
          disabled={disabled}
          className="w-full p-4 text-xl bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
        >
          <option value="">Select Type</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Brand (only enabled if category selected) */}
      <div>
        <label className="block text-lg mb-2 text-gray-300">{brandLabel}</label>
        <select
          value={selectedBrand || ''}
          onChange={(e) => {
            onBrandChange(e.target.value || null);
            onModelChange(null);
          }}
          disabled={disabled || !selectedCategory || brands.length === 0}
          className="w-full p-4 text-xl bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
        >
          <option value="">Select Brand</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      {/* Model (only enabled if brand selected) */}
      <div>
        <label className="block text-lg mb-2 text-gray-300">{modelLabel}</label>
        <select
          value={selectedModel || ''}
          onChange={(e) => onModelChange(e.target.value || null)}
          disabled={disabled || !selectedBrand || models.length === 0}
          className="w-full p-4 text-xl bg-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
        >
          <option value="">Select Model</option>
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}