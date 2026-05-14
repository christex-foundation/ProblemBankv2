'use client';

import React from 'react';
import Link from 'next/link';

interface IdeaBottomNavProps {
  previousIdea?: { title: string; slug: string } | null;
  nextIdea?: { title: string; slug: string } | null;
  isCivicIdea?: boolean;
  isBig5Idea?: boolean;
}

export default function IdeaBottomNav({ previousIdea, nextIdea, isCivicIdea, isBig5Idea }: IdeaBottomNavProps) {
  // Determine the correct back link based on the idea category
  const getBackLink = () => {
    if (isCivicIdea) {
      return '/hackathon/ideas/civic';
    }
    if (isBig5Idea) {
      return '/hackathon/ideas/big5';
    }
    return '/hackathon/ideas';
  };

  const backLink = getBackLink();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#f9f2e9] border-t border-[#e8ddd0] h-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12 h-full">
        <div className="flex items-center justify-center h-full">
          {/* Closely Packed Navigation Group */}
          <div className="flex items-center gap-3">
            {/* Previous Button - Left Arrow */}
            {previousIdea ? (
              <Link
                href={`/hackathon/ideas/${previousIdea.slug}`}
                className="inline-flex items-center justify-center w-12 h-12 rounded-full border transition-colors hover:bg-[#f2e8dc] hover:border-[#d8cdbc]"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: '#d8cdbc',
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="flex-shrink-0"
                >
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ) : (
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border opacity-50 cursor-not-allowed"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: '#d8cdbc',
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="flex-shrink-0"
                >
                  <path
                    d="M15 18l-6-6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}

            {/* Center: Back to Ideas (Pill-shaped) */}
            <Link
              href={backLink}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border transition-colors hover:bg-[#f2e8dc] hover:border-[#d8cdbc]"
              style={{
                fontFamily: 'Raleway, sans-serif',
                fontWeight: 500,
                color: '#403f3e',
                backgroundColor: 'transparent',
                borderColor: '#d8cdbc',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                className="flex-shrink-0"
              >
                <path
                  d="M19 12H5M12 19l-7-7 7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Back to Ideas</span>
            </Link>

            {/* Next Button - Right Arrow */}
            {nextIdea ? (
              <Link
                href={`/hackathon/ideas/${nextIdea.slug}`}
                className="inline-flex items-center justify-center w-12 h-12 rounded-full border transition-colors hover:bg-[#f2e8dc] hover:border-[#d8cdbc]"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: '#d8cdbc',
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="flex-shrink-0"
                >
                  <path
                    d="M9 18l6-6-6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ) : (
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border opacity-50 cursor-not-allowed"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: '#d8cdbc',
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="flex-shrink-0"
                >
                  <path
                    d="M9 18l6-6-6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
