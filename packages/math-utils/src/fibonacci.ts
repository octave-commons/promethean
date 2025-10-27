// SPDX-License-Identifier: GPL-3.0-only
// Fibonacci Calculator - Efficient Fibonacci sequence calculations

import type { FibonacciMethod, FibonacciCache, FibonacciResult } from './types.js';

export class Fibonacci {
  private cache: FibonacciCache = { 0: 0n, 1: 1n };

  constructor(private readonly defaultMethod: FibonacciMethod = 'iterative') {}

  calculate(n: number, method?: FibonacciMethod): FibonacciResult {
    if (n < 0) {
      throw new RangeError('Fibonacci number must be non-negative');
    }

    const selectedMethod = method ?? this.defaultMethod;
    const startTime = performance.now();

    let value: bigint;

    switch (selectedMethod) {
      case 'recursive':
        value = this.recursive(n);
        break;
      case 'iterative':
        value = this.iterative(n);
        break;
      case 'matrix':
        value = this.matrix(n);
        break;
      case 'memoized':
        value = this.memoized(n);
        break;
      default:
        throw new Error(`Unknown method: ${selectedMethod}`);
    }

    const endTime = performance.now();

    return {
      value,
      method: selectedMethod,
      index: n,
      computationTime: endTime - startTime,
    };
  }

  private recursive(n: number): bigint {
    if (n <= 1) return BigInt(n);
    return this.recursive(n - 1) + this.recursive(n - 2);
  }

  private iterative(n: number): bigint {
    if (n <= 1) return BigInt(n);

    let prev = 0n;
    let curr = 1n;

    for (let i = 2; i <= n; i++) {
      const next = prev + curr;
      prev = curr;
      curr = next;
    }

    return curr;
  }

  private matrix(n: number): bigint {
    if (n <= 1) return BigInt(n);

    const result = this.matrixPower(
      [
        [1n, 1n],
        [1n, 0n],
      ],
      n - 1,
    );
    return result[0]?.[0] ?? 0n;
  }

  private matrixPower(matrix: bigint[][], power: number): bigint[][] {
    if (power === 1) return matrix;
    if (power % 2 === 0) {
      const half = this.matrixPower(matrix, power / 2);
      return this.matrixMultiply(half, half);
    }
    return this.matrixMultiply(matrix, this.matrixPower(matrix, power - 1));
  }

  private matrixMultiply(a: bigint[][], b: bigint[][]): bigint[][] {
    const a00 = a[0]?.[0] ?? 0n;
    const a01 = a[0]?.[1] ?? 0n;
    const a10 = a[1]?.[0] ?? 0n;
    const a11 = a[1]?.[1] ?? 0n;
    const b00 = b[0]?.[0] ?? 0n;
    const b01 = b[0]?.[1] ?? 0n;
    const b10 = b[1]?.[0] ?? 0n;
    const b11 = b[1]?.[1] ?? 0n;

    return [
      [a00 * b00 + a01 * b10, a00 * b01 + a01 * b11],
      [a10 * b00 + a11 * b10, a10 * b01 + a11 * b11],
    ];
  }

  private memoized(n: number): bigint {
    if (n in this.cache) return this.cache[n]!;

    this.cache[n] = this.memoized(n - 1) + this.memoized(n - 2);
    return this.cache[n]!;
  }

  sequence(length: number, method?: FibonacciMethod): readonly bigint[] {
    if (length < 0) {
      throw new RangeError('Sequence length must be non-negative');
    }

    const result: bigint[] = [];
    for (let i = 0; i < length; i++) {
      result.push(this.calculate(i, method).value);
    }

    return result;
  }

  isFibonacci(num: bigint): boolean {
    if (num < 0n) return false;

    const test1 = this.isPerfectSquare(5n * num * num + 4n);
    const test2 = this.isPerfectSquare(5n * num * num - 4n);

    return test1 || test2;
  }

  private isPerfectSquare(n: bigint): boolean {
    if (n < 0n) return false;

    const sqrt = this.integerSqrt(n);
    return sqrt * sqrt === n;
  }

  private integerSqrt(n: bigint): bigint {
    if (n < 2n) return n;

    let left = 1n;
    let right = n;

    while (left <= right) {
      const mid = (left + right) >> 1n;
      const midSquared = mid * mid;

      if (midSquared === n) return mid;
      if (midSquared < n) left = mid + 1n;
      else right = mid - 1n;
    }

    return right;
  }

  clearCache(): void {
    const keysToDelete = Object.keys(this.cache).filter((key) => key !== '0' && key !== '1');
    keysToDelete.forEach((key) => {
      delete this.cache[Number(key)];
    });
  }

  getCacheSize(): number {
    return Object.keys(this.cache).length;
  }
}
