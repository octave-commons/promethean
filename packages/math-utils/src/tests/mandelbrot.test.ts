// SPDX-License-Identifier: GPL-3.0-only
// Mandelbrot Tests

import test from 'ava';
import { Mandelbrot } from '../mandelbrot.js';

test('Mandelbrot - basic calculation', (t) => {
  const mandelbrot = new Mandelbrot();

  const result = mandelbrot.calculate({ width: 10, height: 10, maxIterations: 10 });

  t.is(result.config.width, 10);
  t.is(result.config.height, 10);
  t.is(result.config.maxIterations, 10);
  t.is(result.totalPoints, 100);
  t.true(result.computationTime >= 0);
  t.true(result.escapedPoints >= 0);
  t.true(result.escapedPoints <= result.totalPoints);
});

test('Mandelbrot - default configuration', (t) => {
  const mandelbrot = new Mandelbrot();

  const result = mandelbrot.calculate();

  t.is(result.config.width, 800);
  t.is(result.config.height, 600);
  t.is(result.config.xMin, -2.5);
  t.is(result.config.xMax, 1.0);
  t.is(result.config.yMin, -1.25);
  t.is(result.config.yMax, 1.25);
  t.is(result.config.maxIterations, 100);
  t.is(result.config.escapeRadius, 2.0);
});

test('Mandelbrot - custom configuration', (t) => {
  const customConfig = {
    width: 400,
    height: 300,
    xMin: -1.0,
    xMax: 1.0,
    yMin: -1.0,
    yMax: 1.0,
    maxIterations: 50,
    escapeRadius: 1.5,
  };

  const mandelbrot = new Mandelbrot(customConfig);
  const result = mandelbrot.calculate();

  t.is(result.config.width, 400);
  t.is(result.config.height, 300);
  t.is(result.config.xMin, -1.0);
  t.is(result.config.xMax, 1.0);
  t.is(result.config.yMin, -1.0);
  t.is(result.config.yMax, 1.0);
  t.is(result.config.maxIterations, 50);
  t.is(result.config.escapeRadius, 1.5);
});

test('Mandelbrot - image rendering', (t) => {
  const mandelbrot = new Mandelbrot({ width: 4, height: 4, maxIterations: 10 });

  const result = mandelbrot.calculate();
  const image = mandelbrot.renderImage(result, 'grayscale');

  t.is(image.width, 4);
  t.is(image.height, 4);
  t.is(image.colorScheme, 'grayscale');
  t.is(image.data.length, 16);
  t.deepEqual(image.config, result.config);
});

test('Mandelbrot - color schemes', (t) => {
  const mandelbrot = new Mandelbrot({ width: 2, height: 2, maxIterations: 10 });

  const result = mandelbrot.calculate();

  const grayscale = mandelbrot.renderImage(result, 'grayscale');
  const rainbow = mandelbrot.renderImage(result, 'rainbow');
  const fire = mandelbrot.renderImage(result, 'fire');
  const ocean = mandelbrot.renderImage(result, 'ocean');
  const monochrome = mandelbrot.renderImage(result, 'monochrome');

  t.is(grayscale.colorScheme, 'grayscale');
  t.is(rainbow.colorScheme, 'rainbow');
  t.is(fire.colorScheme, 'fire');
  t.is(ocean.colorScheme, 'ocean');
  t.is(monochrome.colorScheme, 'monochrome');

  t.true(grayscale.data.every((color) => color >= 0 && color <= 255));
  t.true(rainbow.data.every((color) => color >= 0 && color <= 16777215));
});

test('Mandelbrot - zoom functionality', (t) => {
  const mandelbrot = new Mandelbrot({ width: 800, height: 600 });

  const zoomConfig = mandelbrot.zoomIn(400, 300, 2.0);

  t.true(zoomConfig.xMin !== undefined);
  t.true(zoomConfig.xMax !== undefined);
  t.true(zoomConfig.yMin !== undefined);
  t.true(zoomConfig.yMax !== undefined);

  if (zoomConfig.xMin && zoomConfig.xMax) {
    const originalRange = 1.0 - -2.5;
    const newRange = zoomConfig.xMax - zoomConfig.xMin;
    t.true(newRange < originalRange);
  }
});

test('Mandelbrot - interesting points', (t) => {
  const mandelbrot = new Mandelbrot();

  const points = mandelbrot.getInterestingPoints();

  t.true(points.length > 0);
  t.true(
    points.every(
      (point) =>
        typeof point.x === 'number' &&
        typeof point.y === 'number' &&
        typeof point.name === 'string',
    ),
  );

  const centerPoint = points.find((point) => point.name === 'Center');
  t.truthy(centerPoint);
  t.is(centerPoint?.x, 400);
  t.is(centerPoint?.y, 300);
});

test('Mandelbrot - complex number validation', (t) => {
  const mandelbrot = new Mandelbrot();

  // Test known points in the set
  t.true(mandelbrot.isInMandelbrotSet({ real: 0, imaginary: 0 }));
  t.true(mandelbrot.isInMandelbrotSet({ real: -1, imaginary: 0 }));
  t.true(mandelbrot.isInMandelbrotSet({ real: 0.25, imaginary: 0 }));

  // Test known points not in the set
  t.false(mandelbrot.isInMandelbrotSet({ real: 1, imaginary: 0 }));
  t.false(mandelbrot.isInMandelbrotSet({ real: 0, imaginary: 1 }));
  t.false(mandelbrot.isInMandelbrotSet({ real: -2, imaginary: 1 }));
});

test('Mandelbrot - iteration count', (t) => {
  const mandelbrot = new Mandelbrot();

  // Test points that should escape quickly
  const iterations1 = mandelbrot.getIterationCount({ real: 1, imaginary: 0 }, 10);
  const iterations2 = mandelbrot.getIterationCount({ real: 0, imaginary: 1 }, 10);

  t.true(iterations1 < 10);
  t.true(iterations2 < 10);

  // Test point that should not escape
  const iterations3 = mandelbrot.getIterationCount({ real: 0, imaginary: 0 }, 10);
  t.is(iterations3, 10);
});

test('Mandelbrot - performance tracking', (t) => {
  const mandelbrot = new Mandelbrot({ width: 100, height: 100, maxIterations: 50 });

  const result = mandelbrot.calculate();

  t.true(typeof result.computationTime === 'number');
  t.true(result.computationTime >= 0);
  t.true(result.computationTime < 10000); // Should complete in less than 10 seconds
});

test('Mandelbrot - edge cases', (t) => {
  const mandelbrot = new Mandelbrot();

  // Very small calculation
  const smallResult = mandelbrot.calculate({ width: 1, height: 1, maxIterations: 1 });
  t.is(smallResult.totalPoints, 1);
  t.is(smallResult.points.length, 1);

  // Single iteration
  const singleIterResult = mandelbrot.calculate({ maxIterations: 1 });
  t.is(singleIterResult.config.maxIterations, 1);
});

test('Mandelbrot - configuration merging', (t) => {
  const baseConfig = { width: 400, height: 300, maxIterations: 50 };
  const overrideConfig = { width: 200, xMin: -1.0 };

  const mandelbrot = new Mandelbrot(baseConfig);
  const result = mandelbrot.calculate(overrideConfig);

  // Should use override for width, base for height, and default for xMin
  t.is(result.config.width, 200);
  t.is(result.config.height, 300);
  t.is(result.config.maxIterations, 50);
  t.is(result.config.xMin, -1.0);
});
