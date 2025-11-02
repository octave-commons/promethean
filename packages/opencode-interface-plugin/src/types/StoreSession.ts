// SPDX-License-Identifier: GPL-3.0-only

export type StoreSession = {
  readonly text: string;
  readonly id?: string;
  readonly timestamp?: number | string | Date;
};
