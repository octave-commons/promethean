// SPDX-License-Identifier: GPL-3.0-only
// @ts-nocheck
export interface Person {
  name: string;
}

export class User implements Person {
  constructor(public name: string) {}
  rename(n: string) {
    this.name = n;
  }
}

export const makeUser = (n: string) => new User(n);
