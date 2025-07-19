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

  describe('Use Case 4: Buy N items get M at %X off', () => {
    it('should apply buy 1 get 1 free special', () => {
      const checkout = new Checkout()
      checkout.setPricing('soup', 1.89)
      checkout.setBuyNGetMPercentOffSpecial('soup', 1, 1, 100)
      checkout.scan('soup')
      checkout.scan('soup')
      
      expect(checkout.getTotal()).toBe(1.89)
    })

    it('should apply buy 2 get 1 half off special', () => {
      const checkout = new Checkout()
      checkout.setPricing('bread', 2.00)
      checkout.setBuyNGetMPercentOffSpecial('bread', 2, 1, 50)
      checkout.scan('bread')
      checkout.scan('bread')
      checkout.scan('bread')
      
      expect(checkout.getTotal()).toBe(5.00)
    })
  })

  describe('Use Case 5: N for $X specials', () => {
    it('should apply 3 for $5.00 special', () => {
      const checkout = new Checkout()
      checkout.setPricing('soup', 1.89)
      checkout.setNForXSpecial('soup', 3, 5.00)
      checkout.scan('soup')
      checkout.scan('soup')
      checkout.scan('soup')
      
      expect(checkout.getTotal()).toBe(5.00)
    })

    it('should handle partial groups in N for $X specials', () => {
      const checkout = new Checkout()
      checkout.setPricing('soup', 1.89)
      checkout.setNForXSpecial('soup', 3, 5.00)
      checkout.scan('soup')
      checkout.scan('soup')
      checkout.scan('soup')
      checkout.scan('soup')
      
      expect(checkout.getTotal()).toBe(6.89)
    })
  })

  describe('Use Case 6: Support limits on specials', () => {
    it('should enforce limit on buy N get M percent off specials', () => {
      const checkout = new Checkout()
      checkout.setPricing('soup', 2.00)
      checkout.setBuyNGetMPercentOffSpecialWithLimit('soup', 2, 1, 100, 6)
      
      for (let i = 0; i < 9; i++) {
        checkout.scan('soup')
      }
      
      expect(checkout.getTotal()).toBe(14.00)
    })

    it('should enforce limit on N for X specials', () => {
      const checkout = new Checkout()
      checkout.setPricing('bread', 2.00)
      checkout.setNForXSpecialWithLimit('bread', 3, 5.00, 6)
      
      for (let i = 0; i < 9; i++) {
        checkout.scan('bread')
      }
      
      expect(checkout.getTotal()).toBe(16.00)
    })
  })

  describe('Use Case 7: Support removing scanned items', () => {
    it('should remove item and recalculate total', () => {
      const checkout = new Checkout()
      checkout.setPricing('soup', 1.89)
      checkout.setPricing('bread', 2.50)
      checkout.scan('soup')
      checkout.scan('bread')
      checkout.scan('soup')
      
      expect(checkout.getTotal()).toBe(6.28)
      
      checkout.removeItem('soup')
      expect(checkout.getTotal()).toBe(4.39)
    })

    it('should handle removing items that invalidate specials', () => {
      const checkout = new Checkout()
      checkout.setPricing('soup', 2.00)
      checkout.setBuyNGetMPercentOffSpecial('soup', 2, 1, 100)
      checkout.scan('soup')
      checkout.scan('soup')
      checkout.scan('soup')
      
      expect(checkout.getTotal()).toBe(4.00)
      
      checkout.removeItem('soup')
      expect(checkout.getTotal()).toBe(4.00)
    })
  })
})
