export function formatCardBrand(brand: string | null | undefined): string {
  if (!brand) {
    return 'Card';
  }

  return brand.charAt(0).toUpperCase() + brand.slice(1);
}
