/** Discounted unit price in cents, rounded half away from zero, times quantity. */
export function lineTotalCents(priceCents: number, discount: number, quantity: number): number {
  const unitCents = Math.round((priceCents * (100 - discount)) / 100)
  return unitCents * quantity
}

export function priceFromCents(cents: number): number {
  return cents / 100
}
