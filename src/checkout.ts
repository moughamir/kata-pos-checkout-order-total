export class Checkout {
  private prices: Map<string, number> = new Map()
  private markdowns: Map<string, number> = new Map()
  private total: number = 0

  setPricing(item: string, price: number): void {
    this.prices.set(item, price)
  }

  setMarkdown(item: string, markdown: number): void {
    this.markdowns.set(item, markdown)
  }

  scan(item: string, weight?: number): void {
    const price = this.prices.get(item)
    if (price !== undefined) {
      const markdown = this.markdowns.get(item) || 0
      const effectivePrice = price - markdown
      
      if (weight !== undefined) {
        this.total += effectivePrice * weight
      } else {
        this.total += effectivePrice
      }
    }
  }

  getTotal(): number {
    return this.total
  }
}
