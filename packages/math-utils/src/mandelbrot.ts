// SPDX-License-Identifier: GPL-3.0-only
// Mandelbrot Calculator - Mandelbrot set calculations and visualization

import type {
  ComplexNumber,
  MandelbrotConfig,
  MandelbrotPoint,
  MandelbrotResult,
  MandelbrotImage,
  ColorScheme,
} from './types.js';

export class Mandelbrot {
  private static readonly DEFAULT_CONFIG: MandelbrotConfig = {
    width: 800,
    height: 600,
    xMin: -2.5,
    xMax: 1.0,
    yMin: -1.25,
    yMax: 1.25,
    maxIterations: 100,
    escapeRadius: 2.0,
  };

  constructor(private readonly config: Partial<MandelbrotConfig> = {}) {}

  calculate(customConfig?: Partial<MandelbrotConfig>): MandelbrotResult {
    const finalConfig = { ...Mandelbrot.DEFAULT_CONFIG, ...this.config, ...customConfig };
    const startTime = performance.now();

    const points: MandelbrotPoint[] = [];
    let escapedPoints = 0;

    for (let py = 0; py < finalConfig.height; py++) {
      for (let px = 0; px < finalConfig.width; px++) {
        const point = this.calculatePoint(px, py, finalConfig);
        points.push(point);
        if (point.escaped) escapedPoints++;
      }
    }

    const endTime = performance.now();

    return {
      points,
      config: finalConfig,
      computationTime: endTime - startTime,
      totalPoints: finalConfig.width * finalConfig.height,
      escapedPoints,
    };
  }

  private calculatePoint(px: number, py: number, config: MandelbrotConfig): MandelbrotPoint {
    const x0 = this.mapToComplex(px, 0, config.width - 1, config.xMin, config.xMax);
    const y0 = this.mapToComplex(py, 0, config.height - 1, config.yMin, config.yMax);

    const complex: ComplexNumber = { real: x0, imaginary: y0 };
    let x = 0.0;
    let y = 0.0;
    let iteration = 0;

    while (
      x * x + y * y <= config.escapeRadius * config.escapeRadius &&
      iteration < config.maxIterations
    ) {
      const xTemp = x * x - y * y + x0;
      y = 2 * x * y + y0;
      x = xTemp;
      iteration++;
    }

    return {
      x: px,
      y: py,
      iterations: iteration,
      escaped: iteration < config.maxIterations,
      complex,
    };
  }

  private mapToComplex(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number,
  ): number {
    return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
  }

  renderImage(result: MandelbrotResult, colorScheme: ColorScheme = 'grayscale'): MandelbrotImage {
    const imageData = new Array<number>(result.config.width * result.config.height);

    for (let i = 0; i < result.points.length; i++) {
      const point = result.points[i];
      imageData[i] = this.getColorForPoint(point, colorScheme, result.config.maxIterations);
    }

    return {
      width: result.config.width,
      height: result.config.height,
      data: imageData,
      colorScheme,
      config: result.config,
    };
  }

  private getColorForPoint(
    point: MandelbrotPoint,
    scheme: ColorScheme,
    maxIterations: number,
  ): number {
    if (!point.escaped) return 0;

    const normalized = point.iterations / maxIterations;

    switch (scheme) {
      case 'grayscale':
        return Math.floor(normalized * 255);

      case 'rainbow':
        return this.rainbowColor(normalized);

      case 'fire':
        return this.fireColor(normalized);

      case 'ocean':
        return this.oceanColor(normalized);

      case 'monochrome':
        return point.iterations % 2 === 0 ? 0 : 255;

      default:
        return Math.floor(normalized * 255);
    }
  }

  private rainbowColor(normalized: number): number {
    const hue = normalized * 360;
    const saturation = 1.0;
    const lightness = 0.5;

    return this.hslToRgb(hue, saturation, lightness);
  }

  private fireColor(normalized: number): number {
    const r = Math.min(255, Math.floor(normalized * 3 * 255));
    const g = Math.min(255, Math.floor(normalized * 1.5 * 255));
    const b = Math.floor(normalized * 0.5 * 255);

    return (r << 16) | (g << 8) | b;
  }

  private oceanColor(normalized: number): number {
    const r = Math.floor(normalized * 0.2 * 255);
    const g = Math.floor(normalized * 0.5 * 255);
    const b = Math.min(255, Math.floor(normalized * 255));

    return (r << 16) | (g << 8) | b;
  }

  private hslToRgb(h: number, s: number, l: number): number {
    h = h / 360;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return (Math.round(r * 255) << 16) | (Math.round(g * 255) << 8) | Math.round(b * 255);
  }

  zoomIn(centerX: number, centerY: number, zoomFactor: number): Partial<MandelbrotConfig> {
    const currentConfig = { ...Mandelbrot.DEFAULT_CONFIG, ...this.config };

    const xRange = currentConfig.xMax - currentConfig.xMin;
    const yRange = currentConfig.yMax - currentConfig.yMin;

    const newXRange = xRange / zoomFactor;
    const newYRange = yRange / zoomFactor;

    const centerComplexX = this.mapToComplex(
      centerX,
      0,
      currentConfig.width - 1,
      currentConfig.xMin,
      currentConfig.xMax,
    );
    const centerComplexY = this.mapToComplex(
      centerY,
      0,
      currentConfig.height - 1,
      currentConfig.yMin,
      currentConfig.yMax,
    );

    return {
      xMin: centerComplexX - newXRange / 2,
      xMax: centerComplexX + newXRange / 2,
      yMin: centerComplexY - newYRange / 2,
      yMax: centerComplexY + newYRange / 2,
    };
  }

  getInterestingPoints(): Array<{ x: number; y: number; name: string }> {
    return [
      { x: 400, y: 300, name: 'Center' },
      { x: 320, y: 300, name: 'Main bulb' },
      { x: 480, y: 300, name: 'Right side' },
      { x: 400, y: 200, name: 'Top' },
      { x: 400, y: 400, name: 'Bottom' },
      { x: 280, y: 280, name: 'Left bulb' },
      { x: 520, y: 320, name: 'Detail area 1' },
      { x: 380, y: 380, name: 'Detail area 2' },
    ];
  }

  isInMandelbrotSet(complex: ComplexNumber, maxIterations: number = 100): boolean {
    let x = 0.0;
    let y = 0.0;
    let iteration = 0;

    while (x * x + y * y <= 4.0 && iteration < maxIterations) {
      const xTemp = x * x - y * y + complex.real;
      y = 2 * x * y + complex.imaginary;
      x = xTemp;
      iteration++;
    }

    return iteration === maxIterations;
  }

  getIterationCount(complex: ComplexNumber, maxIterations: number = 100): number {
    let x = 0.0;
    let y = 0.0;
    let iteration = 0;

    while (x * x + y * y <= 4.0 && iteration < maxIterations) {
      const xTemp = x * x - y * y + complex.real;
      y = 2 * x * y + complex.imaginary;
      x = xTemp;
      iteration++;
    }

    return iteration;
  }
}
