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

  describe('Use Case 2: Accept a scanned item and weight', () => {
    it('should accept a scanned item with weight and increase total by price per weight', () => {
      const checkout = new Checkout()
      checkout.setPricing('ground beef', 5.99)
      checkout.scan('ground beef', 2.5)
      
      expect(checkout.getTotal()).toBeCloseTo(14.975)
    })
  })

  describe('Use Case 3: Support markdowns', () => {
    it('should apply markdown to per-unit items', () => {
      const checkout = new Checkout()
      checkout.setPricing('soup', 1.89)
      checkout.setMarkdown('soup', 0.20)
      checkout.scan('soup')
      
      expect(checkout.getTotal()).toBe(1.69)
    })

    it('should apply markdown to weighted items per unit', () => {
      const checkout = new Checkout()
      checkout.setPricing('ground beef', 5.99)
      checkout.setMarkdown('ground beef', 1.00)
      checkout.scan('ground beef', 2.0)
      
      expect(checkout.getTotal()).toBeCloseTo(9.98)
    })
  })
})
