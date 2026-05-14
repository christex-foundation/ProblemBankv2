'use client';
import { useState, useEffect } from 'react';

type CivicIdea = {
  id: string;
  title: string;
  categories: string[]; // List of categories this idea belongs to
};

// Hardcoded civic ideas with their categories
const CIVIC_IDEAS: CivicIdea[] = [
  // Tech Track Ideas
  { id: "rec3ZNV4AKN2kemWu", title: "Agri-Opp Portal", categories: ["Feed Salone - Tech Track"] },
  { id: "recsWgxtR1P62Tcz4", title: "Connect Salone (The Civic Hub)", categories: ["Digitise Salone - Tech Track"] },
  { id: "recrtRTrYpAfyXePv", title: "Eco-Watch Reporter", categories: ["Clean Salone - Tech Track"] },
  { id: "rechT4cRT1M1w1ttB", title: "Med-Find Salone", categories: ["Heal Salone - Tech Track"] },
  { id: "recORkns2L53QIksA", title: "SafeSpace Salone (Tele-Therapy)", categories: ["Heal Salone - Tech Track"] },
  { id: "recpDqXeMnb1Pa5b4", title: "Salone Sounds", categories: ["Love Salone - Tech Track"] },
  { id: "recNJFOHpMdFzca1V", title: "Salone Speaks", categories: ["Digitise Salone - Tech Track"] },
  { id: "recu0IzyXFslvrjGy", title: "The Agri-LinkedIn", categories: ["Feed Salone - Tech Track"] },
  { id: "recJFBL7cEQ3RO1hL", title: "The Clean-Up League", categories: ["Clean Salone - Tech Track"] },
  { id: "reca7qAj8FtKzVJso", title: "The Digital Heritage Vault", categories: ["Love Salone - Tech Track"] },

  // Content Track Ideas
  { id: "recxsOWBOnKPtohDT", title: "Tok Bout Salone Series", categories: ["Love Salone - Content Track"] },
  { id: "recYSwdreHDVKxrQE", title: "The \"Backyard Farmer\" Series", categories: ["Feed Salone - Content Track"] },
  { id: "recmgWu4be5iZaJPs", title: "The \"Green Weekend\" Itinerary", categories: ["Clean Salone - Content Track"] },
  { id: "recuQek2mm8gnWZqe", title: "Road to Recovery (Anti-Drug)", categories: ["Heal Salone - Content Track"] },
  { id: "recqdcV7M6QY9RL90", title: "Street Law Salone", categories: ["Digitise Salone - Content Track"] },
  { id: "rec7kHZyRn02va9e7", title: "SaloneBlessed (The Live Reporters)", categories: ["Salone Big Pas We All Content"] }
];

export default function SubmissionForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    phone: '',
    ideaTitle: '',
    teamName: '',
    teamMembers: '',
    submissionLink: '',
    presentationVideo: '',
    technicalVideo: '',
    productDescription: '',
    contentLinks: '',
    contentDescription: '',
  });

  // Determine if the selected category is Tech Track or Content Track
  const isTechTrack = formData.category.includes('Tech Track');
  const isContentTrack = formData.category.includes('Content Track') || formData.category.includes('Content');

  // Filter ideas based on selected category
  const filteredIdeas = formData.category
    ? CIVIC_IDEAS.filter(idea => idea.categories.includes(formData.category))
    : [];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isBeforeDeadline, setIsBeforeDeadline] = useState(true);

  // Check if submission is allowed (before Dec 13 midnight GMT/UTC) in real-time
  // This matches when the countdown hits 0
  useEffect(() => {
    const submissionDeadline = new Date('2025-12-13T23:59:59Z');

    const checkDeadline = () => {
      const now = new Date();
      setIsBeforeDeadline(now < submissionDeadline);
    };

    // Check immediately
    checkDeadline();

    // Update every second to stay in sync with the countdown
    const interval = setInterval(checkDeadline, 1000);

    return () => clearInterval(interval);
  }, []);

  // Listen for custom event from CivicHero button
  useEffect(() => {
    const handleOpenModal = () => {
      if (isBeforeDeadline) {
        setIsModalOpen(true);
      }
    };

    window.addEventListener('openSubmissionModal', handleOpenModal);
    return () => window.removeEventListener('openSubmissionModal', handleOpenModal);
  }, [isBeforeDeadline]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // If category changes, reset ideaTitle since the available ideas will change
    if (name === 'category') {
      setFormData((prev) => ({ ...prev, [name]: value, ideaTitle: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isBeforeDeadline) {
      setErrorMessage('Submission deadline has passed');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/hackathon/api/civic/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit');
      }

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        category: '',
        phone: '',
        ideaTitle: '',
        teamName: '',
        teamMembers: '',
        submissionLink: '',
        presentationVideo: '',
        technicalVideo: '',
        productDescription: '',
        contentLinks: '',
        contentDescription: '',
      });
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#1e1e1e] rounded-[28px] p-8"
            style={{ backgroundColor: '#fffaf3' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full border-2 border-[#1e1e1e] transition-all hover:scale-110"
              style={{ backgroundColor: '#ffffff' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="#1e1e1e" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <h2
              className="text-3xl md:text-4xl text-center mb-6 pr-8"
              style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#1e1e1e' }}
            >
              Submit Your Project
            </h2>

            <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="mb-6">
          <label
            htmlFor="name"
            className="block mb-2"
            style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#403f3e' }}
          >
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-[#d8cdbc] rounded-lg"
            style={{ fontFamily: 'Raleway, sans-serif', backgroundColor: '#ffffff' }}
          />
        </div>

        {/* Email */}
        <div className="mb-6">
          <label
            htmlFor="email"
            className="block mb-2"
            style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#403f3e' }}
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-[#d8cdbc] rounded-lg"
            style={{ fontFamily: 'Raleway, sans-serif', backgroundColor: '#ffffff' }}
          />
        </div>

        {/* Category */}
        <div className="mb-6">
          <label
            htmlFor="category"
            className="block mb-2"
            style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#403f3e' }}
          >
            Challenge Category *
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-[#d8cdbc] rounded-lg"
            style={{ fontFamily: 'Raleway, sans-serif', backgroundColor: '#ffffff' }}
          >
            <option value="">Select a category</option>
            <option value="Love Salone - Tech Track">Love Salone - Tech Track</option>
            <option value="Love Salone - Content Track">Love Salone - Content Track</option>
            <option value="Feed Salone - Tech Track">Feed Salone - Tech Track</option>
            <option value="Feed Salone - Content Track">Feed Salone - Content Track</option>
            <option value="Clean Salone - Tech Track">Clean Salone - Tech Track</option>
            <option value="Clean Salone - Content Track">Clean Salone - Content Track</option>
            <option value="Heal Salone - Tech Track">Heal Salone - Tech Track</option>
            <option value="Heal Salone - Content Track">Heal Salone - Content Track</option>
            <option value="Digitise Salone - Content Track">Digitise Salone - Content Track</option>
            <option value="Digitise Salone - Tech Track">Digitise Salone - Tech Track</option>
            <option value="Salone Big Pas We All Content">Salone Big Pas We All Content</option>
          </select>
        </div>

        {/* Phone */}
        <div className="mb-6">
          <label
            htmlFor="phone"
            className="block mb-2"
            style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#403f3e' }}
          >
            Phone *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-[#d8cdbc] rounded-lg"
            style={{ fontFamily: 'Raleway, sans-serif', backgroundColor: '#ffffff' }}
          />
        </div>

        {/* Idea Title */}
        <div className="mb-6">
          <label
            htmlFor="ideaTitle"
            className="block mb-2"
            style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#403f3e' }}
          >
            Idea Title *
          </label>
          <select
            id="ideaTitle"
            name="ideaTitle"
            value={formData.ideaTitle}
            onChange={handleChange}
            required
            disabled={!formData.category}
            className="w-full px-4 py-3 border-2 border-[#d8cdbc] rounded-lg appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: 'Raleway, sans-serif',
              backgroundColor: '#ffffff',
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23403f3e\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              paddingRight: '40px'
            }}
          >
            <option value="" disabled>
              {formData.category ? 'Select an idea' : 'Please select a category first'}
            </option>
            {filteredIdeas.map((idea) => (
              <option key={idea.id} value={idea.title}>
                {idea.title}
              </option>
            ))}
          </select>
        </div>

        {/* Team Name */}
        <div className="mb-6">
          <label
            htmlFor="teamName"
            className="block mb-2"
            style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#403f3e' }}
          >
            Team Name
          </label>
          <input
            type="text"
            id="teamName"
            name="teamName"
            value={formData.teamName}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-[#d8cdbc] rounded-lg"
            style={{ fontFamily: 'Raleway, sans-serif', backgroundColor: '#ffffff' }}
          />
        </div>

        {/* Team Members */}
        <div className="mb-6">
          <label
            htmlFor="teamMembers"
            className="block mb-2"
            style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#403f3e' }}
          >
            Team Members
          </label>
          <textarea
            id="teamMembers"
            name="teamMembers"
            value={formData.teamMembers}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 border-2 border-[#d8cdbc] rounded-lg"
            style={{ fontFamily: 'Raleway, sans-serif', backgroundColor: '#ffffff' }}
            placeholder="List all team members"
          />
        </div>

        {/* Tech Track Fields */}
        {isTechTrack && (
          <>
            {/* Link to Submission */}
            <div className="mb-6">
              <label
                htmlFor="submissionLink"
                className="block mb-2"
                style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#403f3e' }}
              >
                Link to Submission *
              </label>
              <input
                type="url"
                id="submissionLink"
                name="submissionLink"
                value={formData.submissionLink}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-[#d8cdbc] rounded-lg"
                style={{ fontFamily: 'Raleway, sans-serif', backgroundColor: '#ffffff' }}
                placeholder="https://"
              />
            </div>

            {/* Presentation Video */}
            <div className="mb-6">
              <label
                htmlFor="presentationVideo"
                className="block mb-2"
                style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#403f3e' }}
              >
                Presentation Video *
              </label>
              <input
                type="url"
                id="presentationVideo"
                name="presentationVideo"
                value={formData.presentationVideo}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-[#d8cdbc] rounded-lg"
                style={{ fontFamily: 'Raleway, sans-serif', backgroundColor: '#ffffff' }}
                placeholder="https://"
              />
            </div>

            {/* Technical Video */}
            <div className="mb-6">
              <label
                htmlFor="technicalVideo"
                className="block mb-2"
                style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#403f3e' }}
              >
                Technical Video *
              </label>
              <input
                type="url"
                id="technicalVideo"
                name="technicalVideo"
                value={formData.technicalVideo}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-[#d8cdbc] rounded-lg"
                style={{ fontFamily: 'Raleway, sans-serif', backgroundColor: '#ffffff' }}
                placeholder="https://"
              />
            </div>

            {/* Product Description */}
            <div className="mb-6">
              <label
                htmlFor="productDescription"
                className="block mb-2"
                style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#403f3e' }}
              >
                Product Description *
              </label>
              <textarea
                id="productDescription"
                name="productDescription"
                value={formData.productDescription}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 border-2 border-[#d8cdbc] rounded-lg"
                style={{ fontFamily: 'Raleway, sans-serif', backgroundColor: '#ffffff' }}
                placeholder="Describe your project..."
              />
            </div>
          </>
        )}

        {/* Content Track Fields */}
        {isContentTrack && (
          <>
            {/* Content Links */}
            <div className="mb-6">
              <label
                htmlFor="contentLinks"
                className="block mb-2"
                style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#403f3e' }}
              >
                Content Links *
              </label>
              <textarea
                id="contentLinks"
                name="contentLinks"
                value={formData.contentLinks}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-3 border-2 border-[#d8cdbc] rounded-lg"
                style={{ fontFamily: 'Raleway, sans-serif', backgroundColor: '#ffffff' }}
                placeholder="YouTube, social media, podcast links, etc. (one per line)"
              />
            </div>

            {/* Presentation Video */}
            <div className="mb-6">
              <label
                htmlFor="presentationVideo"
                className="block mb-2"
                style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#403f3e' }}
              >
                Presentation Video *
              </label>
              <input
                type="url"
                id="presentationVideo"
                name="presentationVideo"
                value={formData.presentationVideo}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-[#d8cdbc] rounded-lg"
                style={{ fontFamily: 'Raleway, sans-serif', backgroundColor: '#ffffff' }}
                placeholder="https://"
              />
            </div>

            {/* Content Description */}
            <div className="mb-6">
              <label
                htmlFor="contentDescription"
                className="block mb-2"
                style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#403f3e' }}
              >
                Content Description *
              </label>
              <textarea
                id="contentDescription"
                name="contentDescription"
                value={formData.contentDescription}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 border-2 border-[#d8cdbc] rounded-lg"
                style={{ fontFamily: 'Raleway, sans-serif', backgroundColor: '#ffffff' }}
                placeholder="Describe your content, target audience, and impact..."
              />
            </div>
          </>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-lg border-2 border-[#1e1e1e] transition-all hover:scale-105"
          style={{
            fontFamily: 'Raleway, sans-serif',
            fontWeight: 700,
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Project'}
        </button>

        {/* Error Message */}
        {submitStatus === 'error' && (
          <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
            <p style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600 }}>
              {errorMessage}
            </p>
          </div>
        )}
      </form>
          </div>
        </div>
      )}

      {/* Success/Congratulations Modal */}
      {submitStatus === 'success' && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        >
          <div
            className="relative max-w-lg w-full border-2 border-[#1e1e1e] rounded-[28px] p-8 text-center"
            style={{ backgroundColor: '#fffaf3' }}
          >
            {/* Success Icon */}
            <div className="mb-6 flex justify-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#d4edda' }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17L4 12" stroke="#155724" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Congratulations Message */}
            <h2
              className="text-4xl md:text-5xl mb-4"
              style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#1e1e1e' }}
            >
              Congratulations!
            </h2>

            <p
              className="text-lg mb-6"
              style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', lineHeight: 1.6 }}
            >
              Your project has been successfully submitted to the Civic Youth Innovation Hackathon! 🎉
            </p>

            <p
              className="text-base mb-8"
              style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
            >
              We&apos;ll review your submission and get back to you soon. Good luck!
            </p>

            {/* Close Button */}
            <button
              onClick={() => {
                setSubmitStatus('idle');
                setIsModalOpen(false);
              }}
              className="px-8 py-3 rounded-lg border-2 border-[#1e1e1e] transition-all hover:scale-105"
              style={{
                fontFamily: 'Raleway, sans-serif',
                fontWeight: 700,
                backgroundColor: '#1e1e1e',
                color: '#ffffff',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
