
import { Item } from '../../../src/lib/item';

describe('Item', () => {
  it('should create an item with id, name, and price', () => {
    const item = new Item('item-1', 'soup', 1.89);
    expect(item.id).toBe('item-1');
    expect(item.name).toBe('soup');
    expect(item.price).toBe(1.89);
  });
});
