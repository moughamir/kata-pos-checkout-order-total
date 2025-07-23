export enum SpecialType {
  BUY_N_GET_M = 'buyNGetM',
  N_FOR_X = 'nForX',
  WEIGHTED_BUY_N_GET_M = 'weightedBuyNGetM'
}

export const VALIDATION_CONSTANTS = {
  MIN_VALUE: 0,
  MAX_PERCENT: 100
} as const

export const DISCOUNT_CONSTANTS = {
  FULL_PERCENT: 100
} as const

export interface BaseSpecial {
  readonly type: SpecialType
  readonly limit?: number
}

export interface BuyNGetMSpecial extends BaseSpecial {
  readonly type: SpecialType.BUY_N_GET_M
  readonly buyN: number
  readonly getM: number
  readonly percentOff: number
}

export interface NForXSpecial extends BaseSpecial {
  readonly type: SpecialType.N_FOR_X
  readonly n: number
  readonly x: number
}

export interface WeightedBuyNGetMSpecial extends BaseSpecial {
  readonly type: SpecialType.WEIGHTED_BUY_N_GET_M
  readonly buyN: number
  readonly getM: number
  readonly percentOff: number
}

export type Special = BuyNGetMSpecial | NForXSpecial | WeightedBuyNGetMSpecial

export interface ItemData {
  readonly price: number
  readonly markdown: number
  readonly count: number
  readonly special?: Special
}

export interface LimitResult {
  readonly effectiveCount: number
  readonly extraItems: number
}

export interface IValidationService {
  validatePositiveNumber(value: number, paramName: string): void
  validateSpecialParams(
    buyN: number,
    getM: number,
    percentOff: number,
    limit?: number
  ): void
  validateNForXParams(n: number, x: number, limit?: number): void
}

export interface IPricingCalculator {
  applyLimit(count: number, limit?: number): LimitResult
  calculateBuyNGetMPrice(
    price: number,
    count: number,
    special: BuyNGetMSpecial
  ): number
  calculateNForXPrice(
    price: number,
    count: number,
    special: NForXSpecial
  ): number
  calculateWeightedSpecialPrice(
    price: number,
    weight: number,
    special: WeightedBuyNGetMSpecial
  ): number
  calculateSpecialPrice(price: number, count: number, special: Special): number
}

export interface IItemDataService {
  getItemData(item: string, count: number): ItemData | null
  calculateItemTotal(itemData: ItemData): number
  calculateWeightedItemTotal(itemData: ItemData): number
}
