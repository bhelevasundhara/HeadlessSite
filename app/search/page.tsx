import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { searchProducts, type Product } from "@/app/actions/salesforce";
import { getProductImage } from "@/lib/productImage";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

async function handleSearch(formData: FormData) {
  'use server';
  const q = formData.get('q') as string;
  if (q?.trim()) redirect(`/search?q=${encodeURIComponent(q.trim())}`);
}

function ProductCard({ product, query }: { product: Product; query: string }) {
  const imgSrc = getProductImage(product);
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="bg-gray-50 p-6 flex items-center justify-center h-48">
        <Image
          src={imgSrc}
          alt={product.Name}
          width={200}
          height={160}
          className="object-contain max-h-36"
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-[#1a1f2e] text-base mb-1">{product.Name}</h3>
        {product.ProductCode && (
          <p className="text-xs text-gray-500 mb-2">SKU: {product.ProductCode}</p>
        )}
        <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-2">
          {product.Description || `${product.Name} — premium Bobcat equipment for your project needs.`}
        </p>
        <Link
          href={`/product/${product.Id}?from=${encodeURIComponent(query)}`}
          className="w-full text-center py-2.5 border-2 border-[#e63329] text-[#e63329] font-semibold rounded-lg hover:bg-[#e63329] hover:text-white transition-colors text-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q || '';
  const products = query ? await searchProducts(query) : [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Search Bar */}
      <form action={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-8">
        <input
          name="q"
          type="text"
          defaultValue={query}
          placeholder="Search for products..."
          className="flex-1 px-5 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63329] focus:border-transparent"
        />
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 bg-[#e63329] text-white font-semibold rounded-lg hover:bg-[#c42820] transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          Search
        </button>
      </form>

      {/* Results Count */}
      {query && (
        <p className="text-center text-sm text-gray-500 mb-8">
          {products.length > 0
            ? `Showing ${products.length} result${products.length !== 1 ? 's' : ''} for "${query}"`
            : `No results found for "${query}"`}
        </p>
      )}

      {/* Products Grid */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.Id} product={product} query={query} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {query && products.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
          <p className="text-gray-500 text-sm">Try searching with different keywords like "loader", "excavator", or "telehandler".</p>
        </div>
      )}
    </div>
  );
}
