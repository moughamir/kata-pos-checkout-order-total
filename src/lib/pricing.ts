import {
  BuyNGetMSpecial,
  DISCOUNT_CONSTANTS,
  LimitResult,
  NForXSpecial,
  Special,
  SpecialType,
  WeightedBuyNGetMSpecial
} from './contract'

export class PricingCalculator {
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
    const discountedItems =
      (price * getM * (DISCOUNT_CONSTANTS.FULL_PERCENT - percentOff)) /
      DISCOUNT_CONSTANTS.FULL_PERCENT
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
    const { effectiveCount, extraItems } = this.applyLimit(weight, limit)
    const groupSize = buyN + getM

    if (effectiveCount === 0) return 0

    const completeGroups = Math.floor(effectiveCount / groupSize)
    const remainingWeight = effectiveCount % groupSize

    const groupPrice = this.calculateWeightedBuyNGetMGroupPrice(price, special)
    const specialTotal = this.calculateGroupBasedPrice(
      groupPrice,
      completeGroups,
      price,
      remainingWeight
    )
    const extraTotal = price * extraItems

    return specialTotal + extraTotal
  }

  static calculateWeightedBuyNGetMGroupPrice(
    price: number,
    special: WeightedBuyNGetMSpecial
  ): number {
    const { buyN, getM, percentOff } = special
    const fullPriceItems = price * buyN
    const discountedItems =
      (price * getM * (DISCOUNT_CONSTANTS.FULL_PERCENT - percentOff)) /
      DISCOUNT_CONSTANTS.FULL_PERCENT
    return fullPriceItems + discountedItems
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
