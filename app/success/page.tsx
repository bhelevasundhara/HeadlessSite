import Link from "next/link";

interface SuccessPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { id } = await searchParams;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-6">
      <div className="max-w-lg w-full text-center py-16">
        {/* Checkmark */}
        <div className="w-24 h-24 rounded-full bg-[#e63329] flex items-center justify-center mx-auto mb-8 shadow-lg">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-[#1a1f2e] mb-3">Thank You!</h1>
        <p className="text-[#e63329] font-semibold text-base mb-4">
          Your interest has been submitted successfully.
        </p>
        <p className="text-gray-500 text-sm mb-2">
          We have created a lead and our team will get back to you shortly.
        </p>

        {id && (
          <p className="text-xs text-gray-400 font-mono mb-8">
            Reference ID: {id}
          </p>
        )}

        <Link
          href="/"
          className="inline-block px-10 py-3.5 bg-[#e63329] text-white font-bold rounded-lg hover:bg-[#c42820] transition-colors text-sm"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
