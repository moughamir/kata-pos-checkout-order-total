export class Checkout {
  private prices: Map<string, number> = new Map()
  private total: number = 0

  setPricing(item: string, price: number): void {
    this.prices.set(item, price)
  }

  scan(item: string, weight?: number): void {
    const price = this.prices.get(item)
    if (price !== undefined) {
      if (weight !== undefined) {
        this.total += price * weight
      } else {
        this.total += price
      }
    }
  }

  getTotal(): number {
    return this.total
  }
}
