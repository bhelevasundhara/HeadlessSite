import { type Product } from "@/app/actions/salesforce";

const FALLBACK_IMAGES: Record<string, string> = {
  skid: '/img-skid-steer.png',
  loader: '/img-wheel-loader.png',
  excavator: '/img-excavator.png',
  telehandler: '/img-telehandler.png',
  track: '/img-track-loader.png',
  heavy: '/img-heavy-loader.png',
  mini: '/img-mini-loader.png',
  generator: '/img-generator.png',
  service: '/img-service.png',
  default: '/img-skid-steer.png',
};

export function getProductImage(product: Product): string {
  const nameLower = (product.Name || '').toLowerCase();
  const familyLower = (product.Family || '').toLowerCase();
  const combined = `${nameLower} ${familyLower}`;

  if (combined.includes('track')) return FALLBACK_IMAGES['track'];
  if (combined.includes('heavy')) return FALLBACK_IMAGES['heavy'];
  if (combined.includes('mini')) return FALLBACK_IMAGES['mini'];
  if (combined.includes('genwatt')) return FALLBACK_IMAGES['generator'];
  if (combined.includes('sla') || combined.includes('installation')) return FALLBACK_IMAGES['service'];
  if (combined.includes('excavat')) return FALLBACK_IMAGES['excavator'];
  if (combined.includes('telehand')) return FALLBACK_IMAGES['telehandler'];
  if (combined.includes('skid') || combined.includes('compact')) return FALLBACK_IMAGES['skid'];
  if (combined.includes('loader') || combined.includes('wheel')) return FALLBACK_IMAGES['loader'];
  
  return FALLBACK_IMAGES['default'];
}
