import { Navigation } from '@/components';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f9f2e9]">
      {/* Navigation */}
      <Navigation logoText="ProblemBank" />

      {/* Main Content */}
      <main className="relative z-30 max-w-4xl mx-auto px-4 md:px-8 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-none tracking-tight text-[#1e1e1e] mb-6"
            style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500 }}
          >
            <div className="block" style={{ transform: 'rotate(-2deg)' }}>
              TERMS AND
            </div>
            <div className="block" style={{ transform: 'rotate(1.2deg)' }}>
              CONDITIONS
            </div>
          </h1>
          <p
            className="text-lg text-gray-700"
            style={{ fontFamily: 'Raleway, sans-serif', fontWeight: 600 }}
          >
            For Participation in the Big Five AI and Blockchain Hackathon
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-[#fffaf3] rounded-[28px] md:rounded-[34px] border-2 border-[#1e1e1e] p-8 md:p-12 shadow-lg">
          <div
            className="prose prose-lg max-w-none"
            style={{ fontFamily: 'Raleway, sans-serif' }}
          >
            <p className="text-base md:text-lg leading-relaxed mb-6">
              By signing and participating in this Hackathon, you provide your full and informed consent to the following terms and conditions:
            </p>

            {/* Section 1 */}
            <div className="mb-8">
              <h2
                className="text-2xl md:text-3xl mb-4 text-[#1e1e1e]"
                style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500 }}
              >
                1. Open-Source Requirement
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>All solutions, software, and codebases developed during the Hackathon must be open sourced.</li>
                <li>You agree that your final code will be made publicly available under the applicable open-source license and may be freely accessed, used, or modified by others.</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="mb-8">
              <h2
                className="text-2xl md:text-3xl mb-4 text-[#1e1e1e]"
                style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500 }}
              >
                2. Government Right to Use Solutions
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>The Government of Sierra Leone has the right to use any of the solutions, with or without modification, that is submitted for the Hackathon.</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="mb-8">
              <h2
                className="text-2xl md:text-3xl mb-4 text-[#1e1e1e]"
                style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500 }}
              >
                3. Right to Use the Solution for Other Clients
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You are free to use, adapt, and commercialise the solution you develop to serve other clients, including building a startup or business.</li>
                <li>However, the source code itself must remain open-source and publicly accessible.</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="mb-8">
              <h2
                className="text-2xl md:text-3xl mb-4 text-[#1e1e1e]"
                style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500 }}
              >
                4. Program Integration
              </h2>
              <p className="text-gray-700 mb-2">By participating, you consent that your project may be integrated into:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>The Government&apos;s innovation pipeline, and</li>
                <li>The Digital Public Goods (DPG) Pipeline, as part of ongoing national digital transformation efforts.</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="mb-8">
              <h2
                className="text-2xl md:text-3xl mb-4 text-[#1e1e1e]"
                style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500 }}
              >
                5. Legal Claims
              </h2>
              <p className="text-gray-700 mb-2">By entering the Hackathon, you agree that no legal claims of any kind may be brought against the Government of Sierra Leone arising from:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>The open-source nature of the project,</li>
                <li>The Government&apos;s use of your solution, or</li>
                <li>The ownership of the project idea.</li>
              </ul>
            </div>

            {/* Section 6 */}
            <div className="mb-8">
              <h2
                className="text-2xl md:text-3xl mb-4 text-[#1e1e1e]"
                style={{ fontFamily: 'Decoy, sans-serif', fontWeight: 500 }}
              >
                6. Acceptance of Terms
              </h2>
              <p className="text-gray-700">
                Your participation in the Hackathon constitutes full acceptance of these Terms and Conditions.
              </p>
            </div>

            {/* Footer note */}
            <div className="mt-12 pt-8 border-t-2 border-gray-200">
              <p className="text-sm text-gray-600 italic text-center">
                Last Updated: November 26, 2025
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
