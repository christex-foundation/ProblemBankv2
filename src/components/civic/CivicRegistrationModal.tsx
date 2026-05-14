'use client';
import { useEffect, useState } from 'react';

interface CivicRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CivicRegistrationModal({ isOpen, onClose }: CivicRegistrationModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    districtOfResidence: '',
    gender: '',
    age: '',
    whatsappNumber: '',
    track: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Submit to Airtable API
      const response = await fetch('/hackathon/api/civic-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setShowConfirmation(true);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    onClose();
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      districtOfResidence: '',
      gender: '',
      age: '',
      whatsappNumber: '',
      track: '',
    });
    setSubmitStatus('idle');
  };

  if (!isOpen) return null;

  // Confirmation Modal
  if (showConfirmation) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleConfirmationClose}
      >
        <div
          className="relative w-full max-w-md bg-[#f9f2e9] rounded-[28px] shadow-2xl p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <h3
            className="text-2xl md:text-3xl text-center mb-4"
            style={{
              fontFamily: 'Decoy, sans-serif',
              fontWeight: 500,
              color: '#1e1e1e',
            }}
          >
            REGISTRATION SUCCESSFUL!
          </h3>

          <p
            className="text-center mb-8 text-base"
            style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#403f3e' }}
          >
            Thank you for registering for the Civic Youth Innovation Hackathon! We&apos;ve received your application
            for the <strong>{formData.track}</strong>.
          </p>

          {/* Close Button */}
          <button
            onClick={handleConfirmationClose}
            className="group relative overflow-hidden w-full px-8 py-4 rounded-full bg-[#E6B800] border-2 border-[#1e1e1e] text-[#1e1e1e] font-medium text-lg transition-all duration-300 hover:scale-105"
          >
            <div
              className="absolute inset-0 opacity-20 mix-blend-overlay"
              style={{
                backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
                backgroundSize: '200px 200px',
                backgroundRepeat: 'repeat',
              }}
            />
            <div className="absolute inset-0 bg-black transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100 rounded-full" />
            <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
              Close
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#f9f2e9] rounded-[28px] shadow-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-[#1e1e1e] text-white hover:bg-[#E6B800] transition-all duration-300"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Header */}
        <div className="bg-[#1e1e1e] px-6 py-6">
          <h2
            className="text-2xl md:text-3xl text-center"
            style={{
              fontFamily: 'Decoy, sans-serif',
              fontWeight: 500,
              color: '#f7efe3',
            }}
          >
            CIVIC YOUTH INNOVATION HACKATHON REGISTRATION
          </h2>
          <p
            className="text-center mt-2 text-sm"
            style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600, color: '#f7efe3' }}
          >
            National Civic Festival 2025
          </p>
        </div>

        {/* Form */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block mb-2 text-sm font-bold"
                  style={{ fontFamily: 'Raleway, sans-serif', color: '#1e1e1e' }}
                >
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[#1e1e1e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6B800] bg-white"
                  style={{ fontFamily: 'Raleway, sans-serif' }}
                  placeholder="First name"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block mb-2 text-sm font-bold"
                  style={{ fontFamily: 'Raleway, sans-serif', color: '#1e1e1e' }}
                >
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[#1e1e1e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6B800] bg-white"
                  style={{ fontFamily: 'Raleway, sans-serif' }}
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-bold"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#1e1e1e' }}
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#1e1e1e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6B800] bg-white"
                style={{ fontFamily: 'Raleway, sans-serif' }}
                placeholder="your@email.com"
              />
            </div>

            {/* District of Residence */}
            <div>
              <label
                htmlFor="districtOfResidence"
                className="block mb-2 text-sm font-bold"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#1e1e1e' }}
              >
                District of Residence *
              </label>
              <input
                type="text"
                id="districtOfResidence"
                name="districtOfResidence"
                required
                value={formData.districtOfResidence}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#1e1e1e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6B800] bg-white"
                style={{ fontFamily: 'Raleway, sans-serif' }}
                placeholder="e.g., Western Area, Bo, Kenema"
              />
            </div>

            {/* Gender & Age */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="gender"
                  className="block mb-2 text-sm font-bold"
                  style={{ fontFamily: 'Raleway, sans-serif', color: '#1e1e1e' }}
                >
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[#1e1e1e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6B800] bg-white"
                  style={{ fontFamily: 'Raleway, sans-serif' }}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="age"
                  className="block mb-2 text-sm font-bold"
                  style={{ fontFamily: 'Raleway, sans-serif', color: '#1e1e1e' }}
                >
                  Age *
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  required
                  min="15"
                  max="100"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[#1e1e1e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6B800] bg-white"
                  style={{ fontFamily: 'Raleway, sans-serif' }}
                  placeholder="Your age"
                />
              </div>
            </div>

            {/* WhatsApp Number */}
            <div>
              <label
                htmlFor="whatsappNumber"
                className="block mb-2 text-sm font-bold"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#1e1e1e' }}
              >
                WhatsApp Number *
              </label>
              <input
                type="tel"
                id="whatsappNumber"
                name="whatsappNumber"
                required
                value={formData.whatsappNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#1e1e1e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6B800] bg-white"
                style={{ fontFamily: 'Raleway, sans-serif' }}
                placeholder="+232 XX XXX XXXX"
              />
            </div>

            {/* Which Track are you applying for? */}
            <div>
              <label
                htmlFor="track"
                className="block mb-2 text-sm font-bold"
                style={{ fontFamily: 'Raleway, sans-serif', color: '#1e1e1e' }}
              >
                Which Track are you applying for? *
              </label>
              <select
                id="track"
                name="track"
                required
                value={formData.track}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#1e1e1e] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6B800] bg-white"
                style={{ fontFamily: 'Raleway, sans-serif' }}
              >
                <option value="">Select a track</option>
                <option value="Tech Track">Tech Track</option>
                <option value="Content Track">Content Track</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative overflow-hidden w-full px-8 py-4 rounded-full bg-[#E6B800] border-2 border-[#1e1e1e] text-[#1e1e1e] font-medium text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div
                className="absolute inset-0 opacity-20 mix-blend-overlay"
                style={{
                  backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
                  backgroundSize: '200px 200px',
                  backgroundRepeat: 'repeat',
                }}
              />
              <div className="absolute inset-0 bg-black transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100 rounded-full" />
              <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                {isSubmitting ? 'Submitting...' : submitStatus === 'success' ? 'Registered! ✓' : 'Complete Registration'}
              </span>
            </button>

            {submitStatus === 'error' && (
              <p className="text-center text-red-600 text-sm" style={{ fontFamily: 'Raleway, sans-serif' }}>
                Something went wrong. Please try again or contact us for help.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
