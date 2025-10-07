// Test file for conflict resolution
function calculateTotal(items, tax = 0.1, discount = 0) {
  // Enhanced implementation on main branch
  let total = 0;
  for (const item of items) {
    const itemTotal = item.price * item.quantity;
    total += itemTotal * (1 - discount);
  }
  return total * (1 + tax);
}

module.exports = { calculateTotal };