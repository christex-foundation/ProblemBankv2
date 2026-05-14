'use client';
import { useEffect, useState } from 'react';
import { Navigation } from '@/components';
import Link from 'next/link';

type Submission = {
  id: string;
  name: string;
  email: string;
  category: string;
  phone: string;
  ideaTitle: string;
  teamName: string;
  teamMembers: string;
  submissionLink: string;
  presentationVideo: string;
  productDescription: string;
  submittedAt: string;
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Check if current time is in display window (Dec 12 noon - midnight GMT)
  const displayStart = new Date('2025-12-12T12:00:00Z');
  const displayEnd = new Date('2025-12-13T00:00:00Z');
  const now = new Date();
  const isInDisplayWindow = now >= displayStart && now < displayEnd;
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch('/hackathon/api/civic/submissions');
        const data = await response.json();
        setSubmissions(data.items || []);
        setMessage(data.message || '');
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if in display window or development mode
    if (isInDisplayWindow || isDevelopment) {
      fetchSubmissions();
    } else {
      setIsLoading(false);
    }
  }, [isInDisplayWindow, isDevelopment]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9f2e9]">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-20">
          <p
            className="text-center text-xl"
            style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
          >
            Loading submissions...
          </p>
        </main>
      </div>
    );
  }

  // Show message if not in display window and not development
  if (!isInDisplayWindow && !isDevelopment) {
    return (
      <div className="min-h-screen bg-[#f9f2e9]">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 py-20">
          <div
            className="max-w-2xl mx-auto border-2 border-[#1e1e1e] rounded-[28px] p-8 text-center"
            style={{ backgroundColor: '#f2e8dc' }}
          >
            <h1
              className="text-4xl mb-4"
              style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#1e1e1e' }}
            >
              Submissions Not Available
            </h1>
            <p
              className="text-lg"
              style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
            >
              Submissions will be visible from December 12th at noon GMT until midnight GMT.
            </p>
            <Link
              href="/hackathon/civic-hackathon"
              className="inline-block mt-6 px-6 py-3 rounded-lg border-2 border-[#1e1e1e]"
              style={{
                fontFamily: 'Raleway, sans-serif',
                fontWeight: 700,
                backgroundColor: '#1e1e1e',
                color: '#ffffff',
              }}
            >
              Back to Hackathon
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f2e9]">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-20">
        <h1
          className="text-5xl md:text-6xl text-center mb-4"
          style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#1e1e1e' }}
        >
          Civic Hackathon Submissions
        </h1>

        <p
          className="text-center text-xl mb-12"
          style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
        >
          {submissions.length} project{submissions.length !== 1 ? 's' : ''} submitted
        </p>

        {submissions.length === 0 ? (
          <div
            className="max-w-2xl mx-auto border-2 border-[#1e1e1e] rounded-[28px] p-8 text-center"
            style={{ backgroundColor: '#fffaf3' }}
          >
            <p
              className="text-lg"
              style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
            >
              No submissions yet. Be the first to submit your project!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="border-2 border-[#1e1e1e] rounded-[28px] p-6 transition-all hover:shadow-lg"
                style={{ backgroundColor: '#fffaf3' }}
              >
                {/* Category Badge */}
                <div className="mb-3">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs border"
                    style={{
                      borderColor: '#d8cdbc',
                      color: '#403f3e',
                      backgroundColor: '#f2e8dc',
                      fontFamily: 'Raleway, sans-serif',
                      fontWeight: 600,
                    }}
                  >
                    {submission.category}
                  </span>
                </div>

                {/* Idea Title */}
                <h3
                  className="text-2xl mb-2"
                  style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#1e1e1e' }}
                >
                  {submission.ideaTitle}
                </h3>

                {/* Team Name */}
                <p
                  className="mb-2"
                  style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 700, color: '#403f3e' }}
                >
                  Team: {submission.teamName}
                </p>

                {/* Product Description */}
                <p
                  className="mb-4 line-clamp-3"
                  style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontSize: '14px' }}
                >
                  {submission.productDescription}
                </p>

                {/* Links */}
                <div className="flex flex-col gap-2">
                  {submission.submissionLink && (
                    <a
                      href={submission.submissionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center px-4 py-2 rounded-lg border-2 border-[#1e1e1e] transition-all hover:scale-105"
                      style={{
                        fontFamily: 'Raleway, sans-serif',
                        fontWeight: 600,
                        backgroundColor: '#1e1e1e',
                        color: '#ffffff',
                        fontSize: '14px',
                      }}
                    >
                      View Submission
                    </a>
                  )}

                  {submission.presentationVideo && (
                    <a
                      href={submission.presentationVideo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center px-4 py-2 rounded-lg border-2 border-[#1e1e1e] transition-all hover:scale-105"
                      style={{
                        fontFamily: 'Raleway, sans-serif',
                        fontWeight: 600,
                        backgroundColor: '#ffffff',
                        color: '#1e1e1e',
                        fontSize: '14px',
                      }}
                    >
                      Watch Video
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
