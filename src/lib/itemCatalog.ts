
import { Item } from './item';

export class ItemCatalog {
  private readonly items = new Map<string, Item>();

  addItem(item: Item): void {
    this.items.set(item.id, item);
  }

  findItemById(id: string): Item | undefined {
    return this.items.get(id);
  }
}
