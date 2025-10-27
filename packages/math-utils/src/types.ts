// SPDX-License-Identifier: GPL-3.0-only
// Fibonacci Types - Core types for Fibonacci calculations

export type FibonacciMethod = 'recursive' | 'iterative' | 'matrix' | 'memoized';

export interface FibonacciCache {
  readonly [key: number]: bigint;
}

export interface FibonacciResult {
  readonly value: bigint;
  readonly method: FibonacciMethod;
  readonly index: number;
  readonly computationTime?: number;
}
