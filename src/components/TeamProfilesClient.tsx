'use client';

import { useState, useEffect } from 'react';
import { TeamProfile } from '@/lib/teamboard';
import TeamProfileCard from './TeamProfileCard';
import { Button } from './ui/button';

interface TeamProfilesClientProps {
  initialProfiles?: TeamProfile[];
}

export default function TeamProfilesClient({ initialProfiles = [] }: TeamProfilesClientProps) {
  const [profiles, setProfiles] = useState<TeamProfile[]>(initialProfiles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/hackathon/api/teamboard');
      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }
      
      const data = await response.json();
      setProfiles(data.profiles || []);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profiles');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (initialProfiles.length === 0) {
      fetchProfiles();
    }
  }, [initialProfiles.length]);

  if (loading && profiles.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div 
          className="text-lg"
          style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
        >
          Loading profiles...
        </div>
      </div>
    );
  }

  if (error && profiles.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 space-y-4">
        <div 
          className="text-lg text-center"
          style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
        >
          {error}
        </div>
        <Button
          onClick={fetchProfiles}
          variant="outline"
          style={{ 
            borderColor: '#d8cdbc', 
            color: '#403f3e',
            backgroundColor: '#fffaf3'
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 space-y-4">
        <div 
          className="text-lg text-center"
          style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
        >
          No profiles yet. Be the first to add your skills!
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {profiles.map((profile, index) => (
        <div
          key={profile.id}
          className="relative"
          style={{
            backgroundColor: getBackgroundForGlobalIndex(index + 1),
            transform: `rotate(${getRotationAngleForGlobalIndex(index + 1)}deg)`,
          }}
        >
          <div className="p-1">
            <div 
              className="h-full border rounded-lg shadow-sm"
              style={{ 
                borderColor: '#d8cdbc',
                backgroundColor: '#fffaf3'
              }}
            >
              <TeamProfileCard
                profile={profile}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper functions for styling (copied from page.tsx)
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
