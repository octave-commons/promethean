// SPDX-License-Identifier: GPL-3.0-only
// @ts-nocheck
export class Broken {
  // missing closing brace below is intentional to test resilience
  method(): void {
    const x = 1
