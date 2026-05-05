'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLeadAction } from "@/app/actions/salesforce";
import { type Product } from "@/app/actions/salesforce";
import { getProductImage } from "@/lib/productImage";
import Image from "next/image";

interface LeadFormClientProps {
  product: Product;
  imgSrc: string;
  searchQuery: string;
}

export default function LeadFormClient({ product, imgSrc, searchQuery }: LeadFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('productId', product.Id);
    
    // Attach product info in message
    const existingMsg = formData.get('message') as string || '';
    formData.set('message', `Interested in: ${product.Name} (SKU: ${product.ProductCode || 'N/A'})\n\n${existingMsg}`);

    const result = await createLeadAction(formData);

    if (result.success) {
      router.push(`/success?id=${result.leadId}`);
    } else {
      setError(result.error || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Back link */}
      <a
        href={searchQuery ? `/search?q=${encodeURIComponent(searchQuery)}` : '/'}
        className="inline-flex items-center gap-1.5 text-[#e63329] text-sm font-medium mb-8 hover:underline"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Results
      </a>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left — Product Info */}
        <div>
          <div className="bg-gray-50 rounded-xl p-8 flex items-center justify-center mb-6 border border-gray-100">
            <Image src={imgSrc} alt={product.Name} width={260} height={200} className="object-contain max-h-48" />
          </div>
          <h2 className="text-xl font-bold text-[#1a1f2e] mb-1">{product.Name}</h2>
          {product.ProductCode && (
            <p className="text-sm text-gray-500 mb-3">SKU: {product.ProductCode}</p>
          )}
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
            {product.Description || `${product.Name} — premium equipment for your project needs.`}
          </p>
          {product.Family && (
            <p className="text-sm text-gray-700"><span className="font-medium">Category:</span> {product.Family}</p>
          )}
        </div>

        {/* Right — Lead Form */}
        <div>
          <p className="text-base font-semibold text-[#1a1f2e] mb-6">
            Interested in this product? Please fill your details
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name <span className="text-[#e63329]">*</span>
              </label>
              <input
                name="fullName"
                required
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63329] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email <span className="text-[#e63329]">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63329] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone <span className="text-[#e63329]">*</span>
              </label>
              <input
                name="phone"
                type="tel"
                required
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63329] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
              <input
                name="company"
                placeholder="Enter your company name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63329] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message (Optional)</label>
              <textarea
                name="message"
                rows={3}
                placeholder="Tell us more about your requirement..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63329] focus:border-transparent resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#e63329] text-white font-bold rounded-lg hover:bg-[#c42820] transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-2"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Interest'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
