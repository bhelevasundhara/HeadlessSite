import { notFound } from "next/navigation";
import { getProductById } from "@/app/actions/salesforce";
import { getProductImage } from "@/lib/productImage";
import LeadFormClient from "./LeadFormClient";

interface ProductPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { id } = await params;
  const { from } = await searchParams;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const imgSrc = getProductImage(product);

  return <LeadFormClient product={product} imgSrc={imgSrc} searchQuery={from || ''} />;
}
