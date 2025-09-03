// SPDX-License-Identifier: GPL-3.0-only
import crypto from "crypto";
export type EmbedConfig = {
  driver: string;
  fn: string;
  dims: number;
  extra?: Record<string, any>;
};
export const CONFIG_FP = (cfg: EmbedConfig) =>
  crypto.createHash("sha256").update(JSON.stringify(cfg)).digest("hex");
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
export const collectionFor = (
  family: string,
  version: string,
  cfg: EmbedConfig,
) => `${family}__v:${version}__${slug(cfg.fn)}`;
export const aliasIdFor = (family: string) => family;
