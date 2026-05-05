import { redirect } from "next/navigation";

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  );
}

async function handleSearch(formData: FormData) {
  'use server';
  const q = formData.get('q') as string;
  if (q?.trim()) {
    redirect(`/search?q=${encodeURIComponent(q.trim())}`);
  }
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 bg-white">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-4xl font-bold text-[#1a1f2e] mb-3">Find the Right Equipment</h1>
          <p className="text-gray-500 mb-10 text-base">
            Search for products and submit your interest.<br />We will get back to you.
          </p>

          {/* Search Form */}
          <form action={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-16">
            <input
              name="q"
              type="text"
              placeholder="Search for products (e.g. loader, excavator, parts)"
              className="flex-1 px-5 py-3.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63329] focus:border-transparent shadow-sm"
            />
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3.5 bg-[#e63329] text-white font-semibold rounded-lg hover:bg-[#c42820] transition-colors shadow-sm text-sm"
            >
              <SearchIcon />
              Search
            </button>
          </form>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-4">
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-7 h-7 text-[#e63329]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#1a1f2e]">Search Products</h3>
              <p className="text-sm text-gray-500 text-center">Search from a wide range of equipment available.</p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-7 h-7 text-[#e63329]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#1a1f2e]">Fill Details</h3>
              <p className="text-sm text-gray-500 text-center">Provide your details and product of interest.</p>
            </div>

            <div className="flex flex-col items-center gap-3 p-6 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-7 h-7 text-[#e63329]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#1a1f2e]">More About Our Products</h3>
              <p className="text-sm text-gray-500 text-center">Learn more about our equipment and solutions.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
