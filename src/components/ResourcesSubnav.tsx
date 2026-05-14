'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ResourcesSubnav: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="flex justify-center mb-8 px-4 sm:px-0">
      <div
        className="flex items-center rounded-full border px-3 py-2 sm:px-6 sm:py-3 w-full sm:w-auto max-w-md sm:max-w-none"
        style={{
          backgroundColor: '#fffaf3',
          borderColor: '#e8ddd0',
          fontFamily: 'Raleway, sans-serif'
        }}
      >
        <Link
          href="/hackathon/resources/kits"
          className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2 rounded-full transition-all duration-200 text-xs sm:text-base text-center ${
            pathname === '/hackathon/resources/kits'
              ? 'font-semibold'
              : 'hover:bg-[#f2e8dc]'
          }`}
          style={{
            color: pathname === '/hackathon/resources/kits' ? '#403f3e' : '#666',
            backgroundColor: pathname === '/hackathon/resources/kits' ? '#f2e8dc' : 'transparent',
          }}
        >
          Builder&apos;s Kits
        </Link>
        <span
          className="mx-1 sm:mx-2 text-xs sm:text-sm"
          style={{ color: '#d8cdbc' }}
        >
          |
        </span>
        <Link
          href="/hackathon/resources/tech"
          className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-2 rounded-full transition-all duration-200 text-xs sm:text-base text-center ${
            pathname === '/hackathon/resources/tech'
              ? 'font-semibold'
              : 'hover:bg-[#f2e8dc]'
          }`}
          style={{
            color: pathname === '/hackathon/resources/tech' ? '#403f3e' : '#666',
            backgroundColor: pathname === '/hackathon/resources/tech' ? '#f2e8dc' : 'transparent',
          }}
        >
          Tech Stack
        </Link>
      </div>
    </div>
  );
};

export default ResourcesSubnav;
