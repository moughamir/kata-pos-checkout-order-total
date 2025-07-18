interface BuyNGetMSpecial {
  buyN: number
  getM: number
  percentOff: number
}

interface NForXSpecial {
  n: number
  x: number
}

export class Checkout {
  private prices: Map<string, number> = new Map()
  private markdowns: Map<string, number> = new Map()
  private buyNGetMSpecials: Map<string, BuyNGetMSpecial> = new Map()
  private nForXSpecials: Map<string, NForXSpecial> = new Map()
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

  setNForXSpecial(item: string, n: number, x: number): void {
    this.nForXSpecials.set(item, { n, x })
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
        const buyNGetMSpecial = this.buyNGetMSpecials.get(item)
        const nForXSpecial = this.nForXSpecials.get(item)
        
        if (buyNGetMSpecial) {
          this.total += this.calculateBuyNGetMPrice(effectivePrice, count, buyNGetMSpecial)
        } else if (nForXSpecial) {
          this.total += this.calculateNForXPrice(effectivePrice, count, nForXSpecial)
        } else {
          this.total += effectivePrice * count
        }
      }
    }
  }

  private calculateBuyNGetMPrice(price: number, count: number, special: BuyNGetMSpecial): number {
    const { buyN, getM } = special
    const groupSize = buyN + getM
    const completeGroups = Math.floor(count / groupSize)
    const remainingItems = count % groupSize
    
    const specialGroupPrice = this.calculateBuyNGetMGroupPrice(price, special)
    return this.calculateGroupBasedPrice(specialGroupPrice, completeGroups, price, remainingItems)
  }

  private calculateBuyNGetMGroupPrice(price: number, special: BuyNGetMSpecial): number {
    const { buyN, getM, percentOff } = special
    const fullPriceItems = price * buyN
    const discountedItems = price * getM * (100 - percentOff) / 100
    return fullPriceItems + discountedItems
  }

  private calculateNForXPrice(price: number, count: number, special: NForXSpecial): number {
    const { n, x } = special
    const completeGroups = Math.floor(count / n)
    const remainingItems = count % n
    
    return this.calculateGroupBasedPrice(x, completeGroups, price, remainingItems)
  }

  private calculateGroupBasedPrice(groupPrice: number, completeGroups: number, itemPrice: number, remainingItems: number): number {
    const completeGroupsTotal = groupPrice * completeGroups
    const remainingItemsTotal = itemPrice * remainingItems
    return completeGroupsTotal + remainingItemsTotal
  }

  getTotal(): number {
    return this.total
  }
}
