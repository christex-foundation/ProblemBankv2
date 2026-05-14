'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function TeamProfileForm() {
  // Force component refresh with version
  const VERSION = '2.0.0';
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successTimeout, setSuccessTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');
  const [formKey, setFormKey] = useState(0);
  const skillsRef = useRef<HTMLDivElement>(null);
  
  const availableSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby',
    'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL',
    'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'Linux',
    'UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Machine Learning', 'Data Science',
    'Blockchain', 'Web3', 'DevOps', 'Mobile Development', 'Game Development', 'AI/ML',
    'Cybersecurity', 'Project Management', 'Product Management', 'Marketing', 'Sales',
    'Content Writing', 'Video Editing', 'Photography', 'Other'
  ];
  
  const [formData, setFormData] = useState({
    twitter: '',
    linkedin: '',
    skills: [] as string[],
    repos: '',
  });

  const router = useRouter();



  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (skillsRef.current && !skillsRef.current.contains(event.target as Node)) {
        setIsSkillsOpen(false);
      }
    };

    if (isSkillsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSkillsOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeout) {
        clearTimeout(successTimeout);
      }
    };
  }, [successTimeout]);

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);
    
    console.log('Form data being submitted:', formData);
    console.log('Available skills:', availableSkills);
    console.log('Selected skills:', formData.skills);
    
    // Validate that all selected skills are in the available skills list
    const invalidSkills = formData.skills.filter(skill => !availableSkills.includes(skill));
    if (invalidSkills.length > 0) {
      setError(`Invalid skills selected: ${invalidSkills.join(', ')}. Please select from the dropdown.`);
      setIsSubmitting(false);
      return;
    }
    
    // Double-check: if no valid skills, show error
    if (formData.skills.length === 0) {
      setError('Please select at least one skill.');
      setIsSubmitting(false);
      return;
    }

    // Validate repository field is required
    if (!formData.repos || formData.repos.trim() === '') {
      setError('Repository URL is required.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/hackathon/api/teamboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        body: JSON.stringify({
          ...formData,
          _timestamp: Date.now(), // Add timestamp to force fresh data
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit profile');
      }

      setSuccess(true);
      setFormData({
        twitter: '',
        linkedin: '',
        skills: [],
        repos: '',
      });
      setSkillSearch('');
      setIsSkillsOpen(false);

      // Set auto-close timeout
      const timeout = setTimeout(() => {
        handleSuccessClose();
      }, 3000); // Auto-close after 3 seconds
      setSuccessTimeout(timeout);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  if (success) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/30" onClick={handleSuccessClose} />
        
        {/* Modal */}
        <div
          className="relative w-full max-w-md mx-auto border rounded-[24px] shadow-lg"
          style={{ backgroundColor: '#fffaf3', borderColor: '#e8ddd0' }}
        >
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f2e8dc' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#403f3e' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 
              className="text-lg font-semibold mb-2"
              style={{ fontFamily: 'Decoy, sans-serif', color: '#403f3e', fontWeight: 500 }}
            >
              Success!
            </h3>
            <p 
              className="text-sm mb-4"
              style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
            >
              Your profile has been added to the team board.
            </p>
            <p 
              className="text-xs mb-4"
              style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
            >
              This window will close automatically in 3 seconds...
            </p>
            <button
              onClick={handleSuccessClose}
              className="px-4 py-2 rounded-md border"
              style={{ 
                backgroundColor: '#403f3e', 
                color: '#f7efe3', 
                borderColor: '#e8ddd0',
                fontFamily: 'Raleway, sans-serif'
              }}
            >
              Close Now
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <>
              <button
                onClick={() => {
                  setIsOpen(true);
                  // Reset form completely
                  setFormData({
                    twitter: '',
                    linkedin: '',
                    skills: [],
                    repos: '',
                  });
                  setSkillSearch('');
                  setIsSkillsOpen(false);
                  setError('');
                  setSuccess(false);
                  setFormKey(prev => prev + 1); // Force re-render
                }}
                className="group relative overflow-hidden px-8 py-4 rounded-full bg-[#E6B800] text-white font-medium text-lg whitespace-nowrap transition-all duration-300 hover:scale-105"
              >
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat'
          }}
        />
        <div className="absolute inset-0 bg-black transform scale-x-0 origin-left transition-transform duration-500 ease-out group-hover:scale-x-100 rounded-full" />
        <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
          Add Your Skills
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsOpen(false)} />
          
          {/* Modal */}
          <div
            className="relative w-full max-w-2xl mx-auto border rounded-[24px] shadow-lg max-h-[90vh] overflow-hidden"
            style={{ backgroundColor: '#fffaf3', borderColor: '#e8ddd0' }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 
                  className="text-2xl font-bold"
                  style={{ fontFamily: 'Decoy, sans-serif', color: '#403f3e', fontWeight: 500 }}
                >
                  Add Your Skills
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

                      <form key={`${formKey}-${VERSION}`} onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {/* Twitter/X Handle - Required */}
                <div>
                  <label 
                    htmlFor="twitter" 
                    className="block text-sm font-medium mb-2"
                    style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
                  >
                    Twitter/X Handle *
                  </label>
                  <input
                    type="text"
                    id="twitter"
                    name="twitter"
                    value={formData.twitter}
                    onChange={handleChange}
                    placeholder="@username or https://x.com/username"
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
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
                    Enter your Twitter/X handle or full URL
                  </p>
                </div>

                {/* LinkedIn - Optional */}
                <div>
                  <label 
                    htmlFor="linkedin" 
                    className="block text-sm font-medium mb-2"
                    style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
                  >
                    LinkedIn Profile (Optional)
                  </label>
                  <input
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ 
                      borderColor: '#d8cdbc', 
                      backgroundColor: '#fffaf3',
                      color: '#403f3e',
                      fontFamily: 'Raleway, sans-serif'
                    }}
                  />
                </div>

                {/* Skills */}
                <div>
                  <label 
                    htmlFor="skills" 
                    className="block text-sm font-medium mb-2"
                    style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
                  >
                    Skills *
                  </label>
                  <div className="relative" ref={skillsRef}>
                    <input
                      type="text"
                      placeholder="Search and select skills..."
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                      style={{ 
                        borderColor: '#d8cdbc', 
                        backgroundColor: '#fffaf3',
                        color: '#403f3e',
                        fontFamily: 'Raleway, sans-serif'
                      }}
                      onFocus={() => setIsSkillsOpen(true)}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      value={skillSearch}
                    />
                    {isSkillsOpen && (
                      <div 
                        className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                        style={{ borderColor: '#d8cdbc', backgroundColor: '#fffaf3' }}
                      >
                        {availableSkills
                          .filter(skill => 
                            skill.toLowerCase().includes(skillSearch.toLowerCase())
                          )
                          .map(skill => (
                            <div
                              key={skill}
                              className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
                              onClick={() => toggleSkill(skill)}
                              style={{ 
                                backgroundColor: formData.skills.includes(skill) ? '#f2e8dc' : 'transparent',
                                color: '#403f3e',
                                fontFamily: 'Raleway, sans-serif'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={formData.skills.includes(skill)}
                                onChange={() => {}}
                                className="mr-2"
                              />
                              {skill}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  {formData.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.skills.map(skill => (
                        <span
                          key={skill}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p 
                    className="text-xs mt-1"
                    style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
                  >
                    Click to search and select multiple skills (required)
                  </p>
                </div>

                {/* Repositories */}
                <div>
                  <label 
                    htmlFor="repos" 
                    className="block text-sm font-medium mb-2"
                    style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
                  >
                    Repo/Portfolio *
                  </label>
                  <textarea
                    id="repos"
                    name="repos"
                    value={formData.repos}
                    onChange={handleChange}
                    placeholder="https://github.com/username/repo1&#10; https://yourportfolio.com&#10;"
                    rows={3}
                    required
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
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
                    Enter one repository or portfolio URL per line (required)
                  </p>
                </div>


                {/* Submit buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2 rounded-md border"
                    style={{ 
                      backgroundColor: 'transparent', 
                      color: '#403f3e', 
                      borderColor: '#e8ddd0',
                      fontFamily: 'Raleway, sans-serif'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 rounded-md border"
                    style={{ 
                      backgroundColor: '#403f3e', 
                      color: '#f7efe3', 
                      borderColor: '#e8ddd0',
                      fontFamily: 'Raleway, sans-serif',
                      opacity: isSubmitting ? 0.5 : 1
                    }}
                  >
                    {isSubmitting ? 'Adding...' : 'Add Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
