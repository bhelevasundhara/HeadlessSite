import { type Product } from "@/app/actions/salesforce";

// Fallback images by category/keyword — used until real images are stored in Salesforce
const FALLBACK_IMAGES: Record<string, string> = {
  skid: '/img-skid-steer.png',
  loader: '/img-wheel-loader.png',
  excavator: '/img-excavator.png',
  telehandler: '/img-telehandler.png',
  default: '/img-skid-steer.png',
};

export function getProductImage(product: Product): string {
  const nameLower = (product.Name || '').toLowerCase();
  const familyLower = (product.Family || '').toLowerCase();
  const combined = `${nameLower} ${familyLower}`;

  if (combined.includes('excavat')) return FALLBACK_IMAGES['excavator'];
  if (combined.includes('telehand')) return FALLBACK_IMAGES['telehandler'];
  if (combined.includes('skid') || combined.includes('compact')) return FALLBACK_IMAGES['skid'];
  if (combined.includes('loader') || combined.includes('wheel')) return FALLBACK_IMAGES['loader'];
  return FALLBACK_IMAGES['default'];
}
