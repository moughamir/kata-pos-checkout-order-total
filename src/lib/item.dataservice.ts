import { Special, ItemData, SpecialType } from './contract'
import { PricingCalculator } from './pricing'

export class ItemDataService {
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
