'use client';

import React, { useState, useEffect } from 'react';

interface TechStackFiltersProps {
  onSearchChange: (query: string) => void;
  onCategoriesChange: (categories: string[]) => void;
  searchQuery: string;
  selectedCategories: string[];
}

const TechStackFilters: React.FC<TechStackFiltersProps> = ({
  onSearchChange,
  onCategoriesChange,
  searchQuery,
  selectedCategories
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/hackathon/api/tech-stacks/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleCategory = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    onCategoriesChange(newCategories);
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        {/* Category Chips */}
        <div className="flex-1">
          <div className="mb-3">
            <h3 
              className="text-sm font-medium"
              style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
            >
              Filter by Category
            </h3>
          </div>
          
          {loading ? (
            <div className="text-sm" style={{ color: '#666' }}>
              Loading categories...
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category);
                return (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className="px-4 py-2 rounded-full border text-sm transition-all duration-200"
                    style={{
                      borderColor: isSelected ? '#403f3e' : '#d8cdbc',
                      backgroundColor: isSelected ? '#403f3e' : '#fffaf3',
                      color: isSelected ? '#f7efe3' : '#403f3e',
                      fontFamily: 'Raleway, sans-serif',
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="flex-shrink-0 w-full sm:max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tech stacks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-3 pr-10 rounded-full border"
              style={{ 
                borderColor: '#e8ddd0', 
                backgroundColor: '#fffaf3',
                color: '#403f3e',
                fontFamily: 'Raleway, sans-serif'
              }}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                style={{ color: '#666' }}
              >
                <path
                  d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Clear filters */}
        {(searchQuery || selectedCategories.length > 0) && (
          <div className="flex-shrink-0">
            <button
              onClick={() => {
                onSearchChange('');
                onCategoriesChange([]);
              }}
              className="px-4 py-2 rounded-full border text-sm transition-all duration-200 hover:opacity-80"
              style={{
                borderColor: '#d8cdbc',
                backgroundColor: '#f2e8dc',
                color: '#403f3e',
                fontFamily: 'Raleway, sans-serif'
              }}
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechStackFilters;
