// SPDX-License-Identifier: GPL-3.0-only
// Math Utils Types - Core types for mathematical calculations

// Fibonacci Types
export type FibonacciMethod = 'recursive' | 'iterative' | 'matrix' | 'memoized';

export type FibonacciCache = {
  [key: number]: bigint;
};

export interface FibonacciResult {
  readonly value: bigint;
  readonly method: FibonacciMethod;
  readonly index: number;
  readonly computationTime?: number;
}

// Mandelbrot Types
export type ColorScheme = 'grayscale' | 'rainbow' | 'fire' | 'ocean' | 'monochrome';

export interface ComplexNumber {
  readonly real: number;
  readonly imaginary: number;
}

export interface MandelbrotConfig {
  readonly width: number;
  readonly height: number;
  readonly xMin: number;
  readonly xMax: number;
  readonly yMin: number;
  readonly yMax: number;
  readonly maxIterations: number;
  readonly escapeRadius: number;
}

export interface MandelbrotPoint {
  readonly x: number;
  readonly y: number;
  readonly iterations: number;
  readonly escaped: boolean;
  readonly complex: ComplexNumber;
}

export interface MandelbrotResult {
  readonly points: readonly MandelbrotPoint[];
  readonly config: MandelbrotConfig;
  readonly computationTime: number;
  readonly totalPoints: number;
  readonly escapedPoints: number;
}

export interface MandelbrotImage {
  readonly width: number;
  readonly height: number;
  readonly data: readonly number[];
  readonly colorScheme: ColorScheme;
  readonly config: MandelbrotConfig;
}
