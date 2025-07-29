
import { Item } from '../../../src/lib/item';
import { ItemCatalog } from '../../../src/lib/itemCatalog';

describe('ItemCatalog', () => {
  it('should add an item to the catalog', () => {
    const catalog = new ItemCatalog();
    const item = new Item('item-1', 'soup', 1.89);
    catalog.addItem(item);
    expect(catalog.findItemById('item-1')).toBe(item);
  });
});
