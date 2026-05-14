'use client';

import { Navigation } from '@/components';

export default function AboutPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#f9f2e9]">
      {/* Noise Texture Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-10 opacity-30"
        style={{
          backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
          mixBlendMode: 'multiply'
        }}
      />

      {/* Shared Navigation */}
      <Navigation logoText="ProblemBank" />

      {/* Hero Section */}
      <main className="relative z-30 pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 
            className="text-5xl md:text-6xl lg:text-7xl leading-none tracking-tight text-[#1e1e1e] mb-6"
            style={{ 
              fontFamily: 'Decoy, sans-serif', 
              fontWeight: 500,
              transform: 'rotate(-1deg)' 
            }}
          >
            About ProblemBank
          </h1>
          <p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            style={{ fontFamily: 'Raleway, sans-serif' }}
          >
            Empowering builders with vetted ideas and step-by-step guidance to bring innovative projects to life.
          </p>
        </div>
      </main>

      {/* Mission Section */}
      <section className="relative z-30 py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 
            className="text-4xl md:text-5xl mb-8 text-center"
            style={{ 
              fontFamily: 'Decoy, sans-serif', 
              fontWeight: 500,
              color: '#403f3e',
              transform: 'rotate(0.5deg)' 
            }}
          >
            Our Mission
          </h2>
          <p 
            className="text-lg leading-relaxed text-center"
            style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e' }}
          >
            We believe that great ideas deserve great execution. ProblemBank curates 25+ vetted project ideas 
            and provides comprehensive builder kits to help developers, entrepreneurs, and innovators 
            transform concepts into reality. Our platform bridges the gap between inspiration and implementation, 
            making it easier for builders to create meaningful solutions.
          </p>
        </div>
      </section>


      {/* How It Works Section */}
      <section className="relative z-40 w-full py-12 md:py-16 lg:py-20">
        <div className="mt-12 md:mt-16 lg:mt-20 mx-auto max-w-7xl px-4 md:px-8">
          <div className="bg-[#121212] overflow-hidden rounded-[28px] md:rounded-[40px] lg:rounded-[56px]">
            <div className="px-4 md:px-8 py-24 md:py-32">
              {/* Heading */}
              <div className="relative flex flex-col items-center text-center select-none">
                <div className="text-5xl md:text-6xl lg:text-7xl uppercase leading-none mb-8 md:mb-12">
                  <span style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#f7efe3', display: 'block', transform: 'rotate(-2deg)' }}>
                    How It Works
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
                <div className="transform" style={{ transform: 'rotate(-1deg)' }}>
                  <div className="relative border border-[#e8ddd0] shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#d8cdbc] overflow-hidden rounded-[28px] md:rounded-[34px] lg:rounded-[38px] bg-[#f2e8dc]" style={{ height: '300px' }}>
                    {/* Speckled texture overlay */}
                    <div
                      className="absolute inset-0 opacity-10 pointer-events-none"
                      style={{
                        backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
                        backgroundSize: '200px 200px',
                        backgroundRepeat: 'repeat',
                      }}
                    />
                    {/* Card content */}
                    <div className="relative flex flex-col h-full px-6 pt-6 pb-6">
                      <div className="text-center mb-4">
                        <div
                          className="w-12 h-12 rounded-full bg-[#E6B800] border-2 border-[#1e1e1e] flex items-center justify-center text-[#1e1e1e] font-bold text-lg mx-auto mb-4"
                          style={{ fontFamily: 'Raleway, sans-serif' }}
                        >
                          1
                        </div>
                        <h3
                          className="text-2xl mb-3"
                          style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#403f3e' }}
                        >
                          Explore Ideas
                        </h3>
                      </div>
                      <div className="mt-auto">
                        <p
                          className="text-sm leading-relaxed text-center"
                          style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
                        >
                          Browse our curated collection of project ideas, each with detailed descriptions and implementation guidance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="transform" style={{ transform: 'rotate(1deg)' }}>
                  <div className="relative border border-[#e8ddd0] shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#d8cdbc] overflow-hidden rounded-[28px] md:rounded-[34px] lg:rounded-[38px] bg-[#fffaf3]" style={{ height: '300px' }}>
                    {/* Speckled texture overlay */}
                    <div
                      className="absolute inset-0 opacity-10 pointer-events-none"
                      style={{
                        backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
                        backgroundSize: '200px 200px',
                        backgroundRepeat: 'repeat',
                      }}
                    />
                    {/* Card content */}
                    <div className="relative flex flex-col h-full px-6 pt-6 pb-6">
                      <div className="text-center mb-4">
                        <div
                          className="w-12 h-12 rounded-full bg-[#E6B800] border-2 border-[#1e1e1e] flex items-center justify-center text-[#1e1e1e] font-bold text-lg mx-auto mb-4"
                          style={{ fontFamily: 'Raleway, sans-serif' }}
                        >
                          2
                        </div>
                        <h3
                          className="text-2xl mb-3"
                          style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#403f3e' }}
                        >
                          Pick a Kit
                        </h3>
                      </div>
                      <div className="mt-auto">
                        <p
                          className="text-sm leading-relaxed text-center"
                          style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
                        >
                          Choose from our comprehensive builder kits that provide step-by-step guidance for your chosen project.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="transform" style={{ transform: 'rotate(-0.5deg)' }}>
                  <div className="relative border border-[#e8ddd0] shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#d8cdbc] overflow-hidden rounded-[28px] md:rounded-[34px] lg:rounded-[38px] bg-[#f2e8dc]" style={{ height: '300px' }}>
                    {/* Speckled texture overlay */}
                    <div
                      className="absolute inset-0 opacity-10 pointer-events-none"
                      style={{
                        backgroundImage: 'url(/images/6707b45e1c28f88fc781209a_noise.webp)',
                        backgroundSize: '200px 200px',
                        backgroundRepeat: 'repeat',
                      }}
                    />
                    {/* Card content */}
                    <div className="relative flex flex-col h-full px-6 pt-6 pb-6">
                      <div className="text-center mb-4">
                        <div
                          className="w-12 h-12 rounded-full bg-[#E6B800] border-2 border-[#1e1e1e] flex items-center justify-center text-[#1e1e1e] font-bold text-lg mx-auto mb-4"
                          style={{ fontFamily: 'Raleway, sans-serif' }}
                        >
                          3
                        </div>
                        <h3
                          className="text-2xl mb-3"
                          style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500, color: '#403f3e' }}
                        >
                          Build and Iterate
                        </h3>
                      </div>
                      <div className="mt-auto">
                        <p
                          className="text-sm leading-relaxed text-center"
                          style={{ fontFamily: 'Raleway, sans-serif', color: '#403f3e', fontWeight: 600 }}
                        >
                          Follow the kit&apos;s guidance to build your project, iterate based on feedback, and bring your idea to life.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
