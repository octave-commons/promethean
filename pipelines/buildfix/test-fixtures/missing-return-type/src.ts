export function calculateTotal(items: number[]) {
  return items.reduce((sum, item) => sum + item, 0);
}