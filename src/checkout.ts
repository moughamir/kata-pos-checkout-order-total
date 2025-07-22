enum SpecialType {
  BUY_N_GET_M = 'buyNGetM',
  N_FOR_X = 'nForX',
  WEIGHTED_BUY_N_GET_M = 'weightedBuyNGetM'
}

interface BaseSpecial {
  readonly type: SpecialType
  readonly limit?: number
}

interface BuyNGetMSpecial extends BaseSpecial {
  readonly type: SpecialType.BUY_N_GET_M
  readonly buyN: number
  readonly getM: number
  readonly percentOff: number
}

interface NForXSpecial extends BaseSpecial {
  readonly type: SpecialType.N_FOR_X
  readonly n: number
  readonly x: number
}

interface WeightedBuyNGetMSpecial extends BaseSpecial {
  readonly type: SpecialType.WEIGHTED_BUY_N_GET_M
  readonly buyN: number
  readonly getM: number
  readonly percentOff: number
}

type Special = BuyNGetMSpecial | NForXSpecial | WeightedBuyNGetMSpecial

interface ItemData {
  readonly price: number
  readonly markdown: number
  readonly count: number
  readonly special?: Special
}

interface LimitResult {
  readonly effectiveCount: number
  readonly extraItems: number
}

class ValidationService {
  static validatePositiveNumber(value: number, paramName: string): void {
    if (value < 0) {
      throw new Error(`${paramName} must be non-negative, got ${value}`)
    }
  }

  static validateSpecialParams(
    buyN: number,
    getM: number,
    percentOff: number,
    limit?: number
  ): void {
    this.validatePositiveNumber(buyN, 'buyN')
    this.validatePositiveNumber(getM, 'getM')
    this.validatePositiveNumber(percentOff, 'percentOff')

    if (buyN === 0) throw new Error('buyN must be greater than 0')
    if (getM === 0) throw new Error('getM must be greater than 0')
    if (percentOff > 100) throw new Error('percentOff cannot exceed 100')

    if (limit !== undefined) {
      this.validatePositiveNumber(limit, 'limit')
      if (limit === 0) throw new Error('limit must be greater than 0')
    }
  }

  static validateNForXParams(n: number, x: number, limit?: number): void {
    this.validatePositiveNumber(n, 'n')
    this.validatePositiveNumber(x, 'x')

    if (n === 0) throw new Error('n must be greater than 0')

    if (limit !== undefined) {
      this.validatePositiveNumber(limit, 'limit')
      if (limit === 0) throw new Error('limit must be greater than 0')
    }
  }
}

class PricingCalculator {
  static applyLimit(count: number, limit?: number): LimitResult {
    if (limit !== undefined) {
      const effectiveCount = Math.min(count, limit)
      const extraItems = count - effectiveCount
      return { effectiveCount, extraItems }
    }
    return { effectiveCount: count, extraItems: 0 }
  }

  static calculateBuyNGetMPrice(
    price: number,
    count: number,
    special: BuyNGetMSpecial
  ): number {
    const { buyN, getM, limit } = special
    const groupSize = buyN + getM
    const { effectiveCount, extraItems } = this.applyLimit(count, limit)

    const completeGroups = Math.floor(effectiveCount / groupSize)
    const remainingItems = effectiveCount % groupSize

    const groupPrice = this.calculateBuyNGetMGroupPrice(price, special)
    const specialTotal = this.calculateGroupBasedPrice(
      groupPrice,
      completeGroups,
      price,
      remainingItems
    )
    const extraTotal = price * extraItems

    return specialTotal + extraTotal
  }

  static calculateBuyNGetMGroupPrice(
    price: number,
    special: BuyNGetMSpecial
  ): number {
    const { buyN, getM, percentOff } = special
    const fullPriceItems = price * buyN
    const discountedItems = (price * getM * (100 - percentOff)) / 100
    return fullPriceItems + discountedItems
  }

  static calculateNForXPrice(
    price: number,
    count: number,
    special: NForXSpecial
  ): number {
    const { n, x, limit } = special
    const { effectiveCount, extraItems } = this.applyLimit(count, limit)

    const completeGroups = Math.floor(effectiveCount / n)
    const remainingItems = effectiveCount % n

    const specialTotal = this.calculateGroupBasedPrice(
      x,
      completeGroups,
      price,
      remainingItems
    )
    const extraTotal = price * extraItems

    return specialTotal + extraTotal
  }

  static calculateWeightedSpecialPrice(
    price: number,
    weight: number,
    special: WeightedBuyNGetMSpecial
  ): number {
    const { buyN, getM, percentOff, limit } = special
    const groupSize = buyN + getM
    let effectiveWeight = weight

    if (limit !== undefined) {
      effectiveWeight = Math.min(weight, limit)
    }

    const completeGroups = Math.floor(effectiveWeight / groupSize)
    const remainingWeight = effectiveWeight % groupSize
    const extraWeight = weight - effectiveWeight

    let total = 0

    for (let i = 0; i < completeGroups; i++) {
      total += price * buyN
      total += (price * getM * (100 - percentOff)) / 100
    }

    total += price * remainingWeight
    total += price * extraWeight

    return total
  }

  static calculateGroupBasedPrice(
    groupPrice: number,
    completeGroups: number,
    itemPrice: number,
    remainingItems: number
  ): number {
    const completeGroupsTotal = groupPrice * completeGroups
    const remainingItemsTotal = itemPrice * remainingItems
    return completeGroupsTotal + remainingItemsTotal
  }

  static calculateSpecialPrice(
    price: number,
    count: number,
    special: Special
  ): number {
    switch (special.type) {
      case SpecialType.BUY_N_GET_M:
        return this.calculateBuyNGetMPrice(price, count, special)
      case SpecialType.N_FOR_X:
        return this.calculateNForXPrice(price, count, special)
      case SpecialType.WEIGHTED_BUY_N_GET_M:
        return price * count
      default:
        throw new Error(`Unhandled special type: ${JSON.stringify(special)}`)
    }
  }
}

class ItemDataService {
  constructor(
    private prices: Map<string, number>,
    private markdowns: Map<string, number>,
    private specials: Map<string, Special>
  ) {}

  getItemData(item: string, count: number): ItemData | null {
    const price = this.prices.get(item)
    if (price === undefined) return null

    const markdown = this.markdowns.get(item) || 0
    const special = this.specials.get(item)

    return { price, markdown, count, special }
  }

  calculateItemTotal(itemData: ItemData): number {
    const { price, markdown, count, special } = itemData
    const effectivePrice = price - markdown

    if (!special) {
      return effectivePrice * count
    }

    return PricingCalculator.calculateSpecialPrice(
      effectivePrice,
      count,
      special
    )
  }

  calculateWeightedItemTotal(itemData: ItemData): number {
    const { price, markdown, count: weight, special } = itemData
    const effectivePrice = price - markdown

    if (!special || special.type !== SpecialType.WEIGHTED_BUY_N_GET_M) {
      return effectivePrice * weight
    }

    return PricingCalculator.calculateWeightedSpecialPrice(
      effectivePrice,
      weight,
      special
    )
  }
}

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
