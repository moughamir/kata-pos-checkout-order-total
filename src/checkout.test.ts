import { Checkout } from './checkout'

describe('Checkout', () => {
  describe('Use Case 1: Accept a scanned item', () => {
    it('should accept a scanned item and increase total by per-unit price', () => {
      const checkout = new Checkout()
      checkout.setPricing('soup', 1.89)
      checkout.scan('soup')
      
      expect(checkout.getTotal()).toBe(1.89)
    })
  })
})
