'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

export default function Big5SubmissionForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successTimeout, setSuccessTimeout] = useState<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);
  const [ideas, setIdeas] = useState<Array<{ id: string; title: string }>>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [isBeforeDeadline, setIsBeforeDeadline] = useState(true);

  const [formData, setFormData] = useState({
    teamName: '',
    name: '',
    email: '',
    phone: '',
    track: 'AI Pulse' as 'AI Pulse' | 'DeepStack',
    ideaTitle: '',
    teamMembers: '',
    githubRepo: '',
    presentationVideo: '',
    technicalVideo: '',
    productLogo: '',
    location: '',
    productDescription: '',
    website: '', // honeypot field
  });

  const router = useRouter();

  // Track if component is mounted for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Check deadline in real-time
  useEffect(() => {
    const DEADLINE = new Date('2025-12-13T12:00:00Z');

    const checkDeadline = () => {
      const now = new Date();
      const beforeDeadline = now < DEADLINE;
      setIsBeforeDeadline(beforeDeadline);
    };

    // Check immediately
    checkDeadline();

    // Check every second
    const interval = setInterval(checkDeadline, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch ideas when modal opens
  useEffect(() => {
    if (isOpen && ideas.length === 0) {
      fetchIdeas();
    }
  }, [isOpen]);

  const fetchIdeas = async () => {
    setLoadingIdeas(true);
    try {
      const response = await fetch('/hackathon/api/ideas?pageSize=100');
      if (response.ok) {
        const data = await response.json();
        // Extract title from each idea - API returns 'items' not 'ideas'
        const ideaTitles = data.items?.map((idea: { id: string; title: string }) => ({
          id: idea.id,
          title: idea.title
        })) || [];
        setIdeas(ideaTitles);
      }
    } catch (err) {
      console.error('Failed to fetch ideas:', err);
    } finally {
      setLoadingIdeas(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeout) {
        clearTimeout(successTimeout);
      }
    };
  }, [successTimeout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/hackathon/api/big5', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        body: JSON.stringify({
          ...formData,
          _timestamp: Date.now(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSuccess(true);
      setFormData({
        teamName: '',
        name: '',
        email: '',
        phone: '',
        track: 'AI Pulse',
        ideaTitle: '',
        teamMembers: '',
        githubRepo: '',
        presentationVideo: '',
        technicalVideo: '',
        productLogo: '',
        location: '',
        productDescription: '',
        website: '',
      });

      // Set auto-close timeout
      const timeout = setTimeout(() => {
        handleSuccessClose();
      }, 5000); // Auto-close after 5 seconds
      setSuccessTimeout(timeout);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSuccessClose = () => {
    if (successTimeout) {
      clearTimeout(successTimeout);
      setSuccessTimeout(null);
    }
    setSuccess(false);
    setIsOpen(false);
    router.refresh();
  };

  const successModal = success && mounted ? createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleSuccessClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-md mx-auto border rounded-[24px] shadow-lg"
        style={{ backgroundColor: '#fffaf3', borderColor: '#e8ddd0' }}
      >
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E6B800' }}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#1e1e1e' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3
            className="text-2xl mb-3"
            style={{ fontFamily: 'Decoy, sans-serif', color: '#403f3e', fontWeight: 500 }}
          >
            Application Submitted!
          </h3>
          <p
            className="text-base mb-2"
            style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
          >
            Your Big5 hackathon application has been successfully submitted.
          </p>
          <p
            className="text-sm mb-6"
            style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
          >
            We&apos;ll review your application and notify you via email. Good luck!
          </p>
          <p
            className="text-xs mb-6"
            style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', opacity: 0.7 }}
          >
            This window will close automatically in 5 seconds...
          </p>
          <button
            onClick={handleSuccessClose}
            className="px-6 py-3 rounded-full"
            style={{
              backgroundColor: '#403f3e',
              color: '#f7efe3',
              fontFamily: 'Raleway, sans-serif',
              fontWeight: 600
            }}
          >
            Close Now
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  const formModal = isOpen && mounted ? createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl mx-auto border rounded-[24px] shadow-lg max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#fffaf3', borderColor: '#e8ddd0' }}
      >
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2
              className="text-2xl md:text-3xl"
              style={{ fontFamily: 'Decoy, sans-serif', color: '#403f3e', fontWeight: 500 }}
            >
              BIG5 APPLICATION
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              style={{ color: '#403f3e' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Honeypot field - hidden from users */}
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
              >
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  borderColor: '#d8cdbc',
                  backgroundColor: '#fffaf3',
                  color: '#403f3e',
                  fontFamily: 'Raleway, sans-serif'
                }}
              />
            </div>

            {/* Team Name - Optional */}
            <div>
              <label
                htmlFor="teamName"
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
              >
                Team Name (Optional)
              </label>
              <input
                type="text"
                id="teamName"
                name="teamName"
                value={formData.teamName}
                onChange={handleChange}
                placeholder="Enter your team name (if applicable)"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  borderColor: '#d8cdbc',
                  backgroundColor: '#fffaf3',
                  color: '#403f3e',
                  fontFamily: 'Raleway, sans-serif'
                }}
              />
            </div>

            {/* Email and Phone - Two columns on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                  style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="team@example.com"
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{
                    borderColor: '#d8cdbc',
                    backgroundColor: '#fffaf3',
                    color: '#403f3e',
                    fontFamily: 'Raleway, sans-serif'
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium mb-2"
                  style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
                >
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+232 XX XXX XXXX"
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{
                    borderColor: '#d8cdbc',
                    backgroundColor: '#fffaf3',
                    color: '#403f3e',
                    fontFamily: 'Raleway, sans-serif'
                  }}
                />
              </div>
            </div>

            {/* Track Selection */}
            <div>
              <label
                htmlFor="track"
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
              >
                Track *
              </label>
              <select
                id="track"
                name="track"
                value={formData.track}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  borderColor: '#d8cdbc',
                  backgroundColor: '#fffaf3',
                  color: '#403f3e',
                  fontFamily: 'Raleway, sans-serif'
                }}
              >
                <option value="AI Pulse">AI Pulse (No-Code)</option>
                <option value="DeepStack">DeepStack (Advanced Development)</option>
              </select>
              <p
                className="text-xs mt-1"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
              >
                Choose your competition track
              </p>
            </div>

            {/* Idea Title */}
            <div>
              <label
                htmlFor="ideaTitle"
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
              >
                Idea Title *
              </label>
              {loadingIdeas ? (
                <div className="w-full px-4 py-3 border rounded-lg" style={{ borderColor: '#d8cdbc', backgroundColor: '#fffaf3' }}>
                  <span style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}>Loading ideas...</span>
                </div>
              ) : (
                <select
                  id="ideaTitle"
                  name="ideaTitle"
                  value={formData.ideaTitle}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{
                    borderColor: '#d8cdbc',
                    backgroundColor: '#fffaf3',
                    color: '#403f3e',
                    fontFamily: 'Raleway, sans-serif'
                  }}
                >
                  <option value="">Select an idea from the problem bank</option>
                  {ideas.map(idea => (
                    <option key={idea.id} value={idea.title}>
                      {idea.title}
                    </option>
                  ))}
                </select>
              )}
              <p
                className="text-xs mt-1"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
              >
                Choose an idea from our problem bank or browse ideas at /ideas
              </p>
            </div>

            {/* Team Members - Optional */}
            <div>
              <label
                htmlFor="teamMembers"
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
              >
                Team Members (Optional)
              </label>
              <textarea
                id="teamMembers"
                name="teamMembers"
                value={formData.teamMembers}
                onChange={handleChange}
                placeholder="List your team members (one per line)"
                rows={4}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  borderColor: '#d8cdbc',
                  backgroundColor: '#fffaf3',
                  color: '#403f3e',
                  fontFamily: 'Raleway, sans-serif'
                }}
              />
            </div>

            {/* GitHub Repo - Required */}
            <div>
              <label
                htmlFor="githubRepo"
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
              >
                GitHub Repository *
              </label>
              <input
                type="url"
                id="githubRepo"
                name="githubRepo"
                value={formData.githubRepo}
                onChange={handleChange}
                placeholder="https://github.com/username/repo"
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  borderColor: '#d8cdbc',
                  backgroundColor: '#fffaf3',
                  color: '#403f3e',
                  fontFamily: 'Raleway, sans-serif'
                }}
              />
              <p
                className="text-xs mt-1"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
              >
                Share your project repository (GitHub, v0, etc.)
              </p>
            </div>

            {/* Presentation Video - Required */}
            <div>
              <label
                htmlFor="presentationVideo"
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
              >
                Presentation Video Link *
              </label>
              <input
                type="url"
                id="presentationVideo"
                name="presentationVideo"
                value={formData.presentationVideo}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  borderColor: '#d8cdbc',
                  backgroundColor: '#fffaf3',
                  color: '#403f3e',
                  fontFamily: 'Raleway, sans-serif'
                }}
              />
              <p
                className="text-xs mt-1"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
              >
                Maximum 3 minutes - Share a video presenting your solution
              </p>
            </div>

            {/* Technical Video - Required */}
            <div>
              <label
                htmlFor="technicalVideo"
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
              >
                Technical Overview Video Link *
              </label>
              <input
                type="url"
                id="technicalVideo"
                name="technicalVideo"
                value={formData.technicalVideo}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  borderColor: '#d8cdbc',
                  backgroundColor: '#fffaf3',
                  color: '#403f3e',
                  fontFamily: 'Raleway, sans-serif'
                }}
              />
              <p
                className="text-xs mt-1"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
              >
                Maximum 3 minutes - Technical walkthrough of your solution
              </p>
            </div>

            {/* Product Logo - Required */}
            <div>
              <label
                htmlFor="productLogo"
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
              >
                Product Logo/Graphic Link *
              </label>
              <input
                type="url"
                id="productLogo"
                name="productLogo"
                value={formData.productLogo}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  borderColor: '#d8cdbc',
                  backgroundColor: '#fffaf3',
                  color: '#403f3e',
                  fontFamily: 'Raleway, sans-serif'
                }}
              />
              <p
                className="text-xs mt-1"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
              >
                Link to your product logo or graphic
              </p>
            </div>

            {/* Location - Required */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
              >
                Team Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Freetown, Sierra Leone"
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  borderColor: '#d8cdbc',
                  backgroundColor: '#fffaf3',
                  color: '#403f3e',
                  fontFamily: 'Raleway, sans-serif'
                }}
              />
              <p
                className="text-xs mt-1"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
              >
                Where is your team located?
              </p>
            </div>

            {/* Product Description - Required */}
            <div>
              <label
                htmlFor="productDescription"
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
              >
                Product Description *
              </label>
              <textarea
                id="productDescription"
                name="productDescription"
                value={formData.productDescription}
                onChange={handleChange}
                placeholder="Brief description of your product..."
                rows={4}
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none"
                style={{
                  borderColor: '#d8cdbc',
                  backgroundColor: '#fffaf3',
                  color: '#403f3e',
                  fontFamily: 'Raleway, sans-serif'
                }}
              />
              <p
                className="text-xs mt-1"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
              >
                Short description of your product
              </p>
            </div>

            {/* Submit buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-6 py-3 rounded-full border-2 transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'transparent',
                  color: '#403f3e',
                  borderColor: '#e8ddd0',
                  fontFamily: 'Raleway, sans-serif',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: '#403f3e',
                  color: '#f7efe3',
                  fontFamily: 'Raleway, sans-serif',
                  fontWeight: 600,
                  opacity: isSubmitting ? 0.5 : 1
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          if (isBeforeDeadline) {
            setIsOpen(true);
            setError('');
            setSuccess(false);
          }
        }}
        disabled={!isBeforeDeadline}
        className={`group relative overflow-hidden px-8 py-4 rounded-full font-medium text-lg whitespace-nowrap transition-all duration-300 ${
          isBeforeDeadline
            ? 'bg-[#E6B800] text-[#1e1e1e] hover:scale-105 cursor-pointer'
            : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
        }`}
      >
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat'
          }}
        />
        {isBeforeDeadline && (
          <div className="absolute inset-0 bg-white transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100 rounded-full" />
        )}
        <span className={`relative z-10 transition-colors duration-300 ${isBeforeDeadline ? 'group-hover:text-[#1e1e1e]' : ''}`}>
          {isBeforeDeadline ? 'Submit Your Application' : 'Submissions Closed'}
        </span>
      </button>

      {formModal}
      {successModal}
    </>
  );
}
