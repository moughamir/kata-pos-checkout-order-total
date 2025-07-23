import { VALIDATION_CONSTANTS } from './contract'

export class ValidationService {
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
    if (percentOff > VALIDATION_CONSTANTS.MAX_PERCENT)
      throw new Error('percentOff cannot exceed 100')

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
