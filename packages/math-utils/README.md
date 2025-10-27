# Math Utils

Mathematical utilities for Promethean including Fibonacci calculations.

## Features

- **Multiple Algorithms**: Recursive, iterative, matrix exponentiation, and memoized approaches
- **Large Number Support**: Uses BigInt for arbitrary precision
- **Performance Tracking**: Built-in computation time measurement
- **Sequence Generation**: Generate Fibonacci sequences of any length
- **Fibonacci Validation**: Check if a number is in the Fibonacci sequence
- **Caching**: Memoization support for improved performance

## Usage

```typescript
import { Fibonacci } from '@promethean-os/math-utils';

const fib = new Fibonacci();

// Calculate individual Fibonacci numbers
const result = fib.calculate(10, 'iterative');
console.log(result.value); // 55n
console.log(result.method); // 'iterative'
console.log(result.computationTime); // performance timing

// Generate sequences
const sequence = fib.sequence(10);
console.log(sequence); // [0n, 1n, 1n, 2n, 3n, 5n, 8n, 13n, 21n, 34n]

// Validate Fibonacci numbers
console.log(fib.isFibonacci(34n)); // true
console.log(fib.isFibonacci(35n)); // false
```

## Available Methods

- `calculate(n, method?)` - Calculate nth Fibonacci number
- `sequence(length, method?)` - Generate sequence of given length
- `isFibonacci(num)` - Check if number is in Fibonacci sequence
- `clearCache()` - Clear memoization cache
- `getCacheSize()` - Get current cache size

## Methods

- `'recursive'` - Simple recursive approach (slow for large n)
- `'iterative'` - Fast iterative approach
- `'matrix'` - Matrix exponentiation (O(log n))
- `'memoized'` - Recursive with caching

## License

GPL-3.0-only
