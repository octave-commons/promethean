export function deleteItem(item: any) {
  return item.remove();
}

export function processItems(items: any[]) {
  return items.map(deleteItem);
}