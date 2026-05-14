'use client';

import TeamProfileForm from '@/components/TeamProfileForm';
import TeamProfilesClient from '@/components/TeamProfilesClient';
import { Navigation } from '@/components';

export default function FindATeamPage() {
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
            Find a Team
          </h1>
          <p
            className="text-lg md:text-xl max-w-3xl mx-auto mb-8"
            style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
          >
            Connect with talented developers and builders in our community
          </p>
          
          {/* Add Skills Button */}
          <div className="mb-4">
            <TeamProfileForm />
          </div>
          
          {/* Disclaimer */}
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p 
              className="text-sm text-center font-medium"
              style={{ fontFamily: 'Raleway, sans-serif', color: '#8b5a00' }}
            >
              ⚠️ Submissions are public and may be removed if found to violate guidelines.
            </p>
          </div>
        </div>

        {/* Profiles Grid */}
        <TeamProfilesClient />
      </main>
    </div>
  );
}
