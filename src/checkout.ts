interface BuyNGetMSpecial {
  buyN: number
  getM: number
  percentOff: number
}

export class Checkout {
  private prices: Map<string, number> = new Map()
  private markdowns: Map<string, number> = new Map()
  private buyNGetMSpecials: Map<string, BuyNGetMSpecial> = new Map()
  private scannedItems: Map<string, number> = new Map()
  private total: number = 0

  setPricing(item: string, price: number): void {
    this.prices.set(item, price)
  }

  setMarkdown(item: string, markdown: number): void {
    this.markdowns.set(item, markdown)
  }

  setBuyNGetMPercentOffSpecial(item: string, buyN: number, getM: number, percentOff: number): void {
    this.buyNGetMSpecials.set(item, { buyN, getM, percentOff })
  }

  scan(item: string, weight?: number): void {
    if (weight !== undefined) {
      this.scanWeightedItem(item, weight)
    } else {
      this.scanUnitItem(item)
    }
  }

  private scanUnitItem(item: string): void {
    const currentCount = this.scannedItems.get(item) || 0
    this.scannedItems.set(item, currentCount + 1)
    this.recalculateTotal()
  }

  private scanWeightedItem(item: string, weight: number): void {
    const price = this.prices.get(item)
    if (price !== undefined) {
      const markdown = this.markdowns.get(item) || 0
      const effectivePrice = price - markdown
      this.total += effectivePrice * weight
    }
  }

  private recalculateTotal(): void {
    this.total = 0
    
    for (const [item, count] of this.scannedItems) {
      const price = this.prices.get(item)
      if (price !== undefined) {
        const markdown = this.markdowns.get(item) || 0
        const effectivePrice = price - markdown
        const special = this.buyNGetMSpecials.get(item)
        
        if (special) {
          this.total += this.calculateSpecialPrice(effectivePrice, count, special)
        } else {
          this.total += effectivePrice * count
        }
      }
    }
  }

  private calculateSpecialPrice(price: number, count: number, special: BuyNGetMSpecial): number {
    const { buyN, getM, percentOff } = special
    const groupSize = buyN + getM
    const completeGroups = Math.floor(count / groupSize)
    const remainingItems = count % groupSize
    
    let total = 0
    
    for (let i = 0; i < completeGroups; i++) {
      total += price * buyN
      total += price * getM * (100 - percentOff) / 100
    }
    
    total += price * remainingItems
    
    return total
  }

  getTotal(): number {
    return this.total
  }
}
