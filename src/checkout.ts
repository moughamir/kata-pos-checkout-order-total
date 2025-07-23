import {
  Special,
  ItemDataService,
  ValidationService,
  BuyNGetMSpecial,
  SpecialType,
  NForXSpecial,
  WeightedBuyNGetMSpecial
} from './lib'

export class Checkout {
  private readonly prices = new Map<string, number>()
  private readonly markdowns = new Map<string, number>()
  private readonly specials = new Map<string, Special>()
  private readonly scannedItems = new Map<string, number>()
  private readonly weightedItems = new Map<string, number>()
  private readonly itemDataService: ItemDataService
  private total = 0

  constructor() {
    this.itemDataService = new ItemDataService(
      this.prices,
      this.markdowns,
      this.specials
    )
  }

  setPricing(item: string, price: number): void {
    ValidationService.validatePositiveNumber(price, 'price')
    this.prices.set(item, price)
  }

  setMarkdown(item: string, markdown: number): void {
    ValidationService.validatePositiveNumber(markdown, 'markdown')
    this.markdowns.set(item, markdown)
  }

  setBuyNGetMPercentOffSpecial(
    item: string,
    buyN: number,
    getM: number,
    percentOff: number,
    limit?: number
  ): void {
    ValidationService.validateSpecialParams(buyN, getM, percentOff, limit)
    const special: BuyNGetMSpecial = {
      type: SpecialType.BUY_N_GET_M,
      buyN,
      getM,
      percentOff,
      limit
    }
    this.specials.set(item, special)
  }

  setBuyNGetMPercentOffSpecialWithLimit(
    item: string,
    buyN: number,
    getM: number,
    percentOff: number,
    limit: number
  ): void {
    this.setBuyNGetMPercentOffSpecial(item, buyN, getM, percentOff, limit)
  }

  setNForXSpecial(item: string, n: number, x: number, limit?: number): void {
    ValidationService.validateNForXParams(n, x, limit)
    const special: NForXSpecial = {
      type: SpecialType.N_FOR_X,
      n,
      x,
      limit
    }
    this.specials.set(item, special)
  }

  setNForXSpecialWithLimit(
    item: string,
    n: number,
    x: number,
    limit: number
  ): void {
    this.setNForXSpecial(item, n, x, limit)
  }

  setWeightedBuyNGetMPercentOffSpecial(
    item: string,
    buyN: number,
    getM: number,
    percentOff: number,
    limit?: number
  ): void {
    ValidationService.validateSpecialParams(buyN, getM, percentOff, limit)
    const special: WeightedBuyNGetMSpecial = {
      type: SpecialType.WEIGHTED_BUY_N_GET_M,
      buyN,
      getM,
      percentOff,
      limit
    }
    this.specials.set(item, special)
  }

  scan(item: string, weight?: number): void {
    if (weight !== undefined) {
      this.scanWeightedItem(item, weight)
    } else {
      this.scanUnitItem(item)
    }
  }

  removeItem(item: string): void {
    const currentCount = this.scannedItems.get(item) || 0
    if (currentCount > 0) {
      if (currentCount === 1) {
        this.scannedItems.delete(item)
      } else {
        this.scannedItems.set(item, currentCount - 1)
      }
      this.recalculateTotal()
    }
  }

  getTotal(): number {
    return this.total
  }

  private scanUnitItem(item: string): void {
    const currentCount = this.scannedItems.get(item) || 0
    this.scannedItems.set(item, currentCount + 1)
    this.recalculateTotal()
  }

  private scanWeightedItem(item: string, weight: number): void {
    const currentWeight = this.weightedItems.get(item) || 0
    this.weightedItems.set(item, currentWeight + weight)
    this.recalculateTotal()
  }

  private recalculateTotal(): void {
    this.total = 0

    for (const [item, count] of this.scannedItems) {
      const itemData = this.itemDataService.getItemData(item, count)
      if (itemData) {
        this.total += this.itemDataService.calculateItemTotal(itemData)
      }
    }

    for (const [item, weight] of this.weightedItems) {
      const itemData = this.itemDataService.getItemData(item, weight)
      if (itemData) {
        this.total += this.itemDataService.calculateWeightedItemTotal(itemData)
      }
    }
  }
}
