'use client';

import React, { useState, useEffect } from 'react';
import { aiTools } from '@/lib/aiTools';

// Featured card background/rotation utilities (same behavior as resources kits page)
function getBackgroundForGlobalIndex(index1Based: number): string {
  const LIGHT = '#fffaf3';
  const DARK = '#f2e8dc';
  const block = Math.floor((index1Based - 1) / 4);
  const startIsLight = block % 2 === 0;
  const pos = (index1Based - 1) % 4;
  const isLight = startIsLight ? (pos % 2 === 0) : (pos % 2 === 1);
  return isLight ? LIGHT : DARK;
}

function getRotationAngleForGlobalIndex(index1Based: number): number {
  const baseAngles = [-2, 1.4, -1.2, 1.8];
  const pos = (index1Based - 1) % 4;
  const block = Math.floor((index1Based - 1) / 4);
  const angle = baseAngles[pos];
  return block % 2 === 0 ? angle : -angle;
}

interface TechStackSectionProps {
  repo?: string;
}

interface RepoData {
  name: string;
  description: string;
  url: string;
  readmeUrl?: string;
}

export default function TechStackSection({ repo }: TechStackSectionProps) {
  const [activeTab, setActiveTab] = useState<'ai-vibe' | 'dev-stack'>('ai-vibe');
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (repo && activeTab === 'dev-stack') {
      setIsLoading(true);
      setError(null);
      
      fetch(`/hackathon/api/readme?url=${encodeURIComponent(repo)}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            setRepoData(data);
          }
        })
        .catch(err => {
          setError('Failed to load repository information');
          console.error('Error fetching repo data:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [repo, activeTab]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2
          className="text-4xl md:text-5xl lg:text-6xl mb-4"
          style={{ fontFamily: 'Decoy, sans-serif', color: '#403f3e', fontWeight: 500 }}
        >
          Tech Stack
        </h2>
        <p
          className="text-lg md:text-xl max-w-3xl mx-auto"
          style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
        >
          Essential tools and technologies to build your solution
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex justify-center mb-8">
        <div 
          className="inline-flex items-center rounded-full border px-6 py-3"
          style={{ 
            backgroundColor: '#fffaf3', 
            borderColor: '#e8ddd0',
            fontFamily: 'Raleway, sans-serif'
          }}
        >
          <button
            onClick={() => setActiveTab('ai-vibe')}
            className={`px-4 py-2 rounded-full transition-all duration-200 ${
              activeTab === 'ai-vibe' 
                ? 'font-semibold' 
                : 'hover:bg-[#f2e8dc]'
            }`}
            style={{
              color: activeTab === 'ai-vibe' ? '#403f3e' : '#666',
              backgroundColor: activeTab === 'ai-vibe' ? '#f2e8dc' : 'transparent',
            }}
          >
            AI Vibe
          </button>
          <span 
            className="mx-2 text-sm"
            style={{ color: '#d8cdbc' }}
          >
            |
          </span>
          <button
            onClick={() => setActiveTab('dev-stack')}
            className={`px-4 py-2 rounded-full transition-all duration-200 ${
              activeTab === 'dev-stack' 
                ? 'font-semibold' 
                : 'hover:bg-[#f2e8dc]'
            }`}
            style={{
              color: activeTab === 'dev-stack' ? '#403f3e' : '#666',
              backgroundColor: activeTab === 'dev-stack' ? '#f2e8dc' : 'transparent',
            }}
          >
            Dev Stack
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'ai-vibe' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 items-stretch">
          {aiTools.map((tool, idx) => (
            <div key={tool.name} className="block">
              <div
                className="relative border border-[#e8ddd0] shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#d8cdbc] overflow-hidden rounded-[28px] md:rounded-[34px] lg:rounded-[38px]"
                style={{
                  height: '240px',
                  backgroundColor: getBackgroundForGlobalIndex(idx + 1),
                  transform: `rotate(${getRotationAngleForGlobalIndex(idx + 1)}deg)`,
                  transformOrigin: 'center center',
                  willChange: 'transform',
                }}
              >
                {/* Speckled texture overlay */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
                    backgroundSize: '200px 200px',
                    backgroundRepeat: 'repeat',
                  }}
                />
                <div className="relative flex flex-col h-full px-6 pt-6 pb-6">
                  <div>
                    <h3
                      className="text-2xl mb-3 text-center"
                      style={{ fontFamily: 'Decoy', fontWeight: 500, color: '#403f3e' }}
                    >
                      {tool.name}
                    </h3>
                    <p
                      className="text-sm leading-relaxed text-center"
                      style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
                    >
                      {tool.description}
                    </p>
                  </div>
                  <div className="mt-auto pt-1">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden w-full py-3 rounded-full text-sm transition-all duration-300 hover:scale-105 block text-center font-medium"
                      style={{ backgroundColor: '#403f3e', color: '#f7efe3' }}
                    >
                      <div 
                        className="absolute inset-0 opacity-10 mix-blend-overlay"
                        style={{
                          backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
                          backgroundSize: '200px 200px',
                          backgroundRepeat: 'repeat'
                        }}
                      />
                      <span className="relative z-10">
                        Visit {tool.name} <span aria-hidden style={{ marginLeft: 8 }}>→</span>
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'dev-stack' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 items-stretch">
          {repo ? (
            <div className="block">
              <div
                className="relative border border-[#e8ddd0] shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#d8cdbc] overflow-hidden rounded-[28px] md:rounded-[34px] lg:rounded-[38px]"
                style={{
                  height: '380px',
                  backgroundColor: getBackgroundForGlobalIndex(1),
                  transform: `rotate(${getRotationAngleForGlobalIndex(1)}deg)`,
                  transformOrigin: 'center center',
                  willChange: 'transform',
                }}
              >
                {/* Speckled texture overlay */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
                    backgroundSize: '200px 200px',
                    backgroundRepeat: 'repeat',
                  }}
                />
                <div className="relative flex flex-col h-full px-6 pt-6 pb-6">
                  <div>
                    <h3
                      className="text-2xl mb-3 text-center"
                      style={{ fontFamily: 'Decoy', fontWeight: 500, color: '#403f3e' }}
                    >
                      {isLoading ? 'Loading...' : error ? 'Repository' : repoData?.name || 'Repository'}
                    </h3>
                    <p
                      className="text-sm leading-relaxed text-center"
                      style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
                    >
                      {isLoading 
                        ? 'Fetching repository information...' 
                        : error 
                          ? 'Unable to load repository details'
                          : repoData?.description || 'Development repository with implementation resources.'
                      }
                    </p>
                  </div>
                  <div className="mt-auto pt-1">
                    <a
                      href={repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative overflow-hidden w-full py-3 rounded-full text-sm transition-all duration-300 hover:scale-105 block text-center font-medium"
                      style={{ backgroundColor: '#403f3e', color: '#f7efe3' }}
                    >
                      <div 
                        className="absolute inset-0 opacity-10 mix-blend-overlay"
                        style={{
                          backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
                          backgroundSize: '200px 200px',
                          backgroundRepeat: 'repeat'
                        }}
                      />
                      <span className="relative z-10">
                        View Repository <span aria-hidden style={{ marginLeft: 8 }}>→</span>
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 col-span-full">
              <div className="max-w-md mx-auto">
                <h3
                  className="text-2xl mb-4"
                  style={{ fontFamily: 'Decoy, sans-serif', color: '#403f3e', fontWeight: 500 }}
                >
                  Coming Soon
                </h3>
                <p
                  className="text-lg"
                  style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
                >
                  Development stack repositories and resources will be available soon.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
