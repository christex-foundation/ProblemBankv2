'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import ResourcesSubnav from '@/components/ResourcesSubnav';
import TechStackFilters from '@/components/TechStackFilters';
import TechStackCard from '@/components/TechStackCard';
import { TechStackItem } from '@/lib/airtable';

export default function ResourcesTechPage() {
  const [items, setItems] = useState<TechStackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','));
      
      const response = await fetch(`/hackathon/api/tech-stacks?${params.toString()}&pageSize=50`);
      if (response.ok) {
        const data = await response.json();
        console.log('Tech stacks received:', data.items?.length || 0, 'items');
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching tech stacks:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategories]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f2e9' }}>
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 md:px-8 py-10 md:py-14 lg:py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl mb-4"
            style={{ fontFamily: 'Decoy, sans-serif', color: '#403f3e', fontWeight: 500 }}
          >
            Tech Stack
          </h1>
          <p
            className="text-lg md:text-xl max-w-3xl mx-auto"
            style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
          >
            Discover and explore technology tools, frameworks, and resources for building robust applications.
          </p>
        </div>

        {/* Subnav Toggle */}
        <ResourcesSubnav />

        {/* Filters */}
        <TechStackFilters
          onSearchChange={setSearchQuery}
          onCategoriesChange={setSelectedCategories}
          searchQuery={searchQuery}
          selectedCategories={selectedCategories}
        />

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg" style={{ color: '#666' }}>
              Loading tech stacks...
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-lg mb-4" style={{ color: '#666' }}>
              {searchQuery || selectedCategories.length > 0 
                ? 'No tech stacks found matching your filters.' 
                : 'No tech stacks available. Please check your Airtable configuration.'
              }
            </div>
            {(searchQuery || selectedCategories.length > 0) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategories([]);
                }}
                className="px-6 py-3 rounded-full border text-sm transition-all duration-200 hover:opacity-80"
                style={{
                  borderColor: '#d8cdbc',
                  backgroundColor: '#f2e8dc',
                  color: '#403f3e',
                  fontFamily: 'Raleway, sans-serif'
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="text-sm" style={{ color: '#666', fontFamily: 'Raleway, sans-serif' }}>
                {items.length} tech stack{items.length !== 1 ? 's' : ''} found
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 items-stretch">
              {items.map((item, idx) => (
                <TechStackCard key={item.id} item={item} index={idx} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
