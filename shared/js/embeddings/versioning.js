import crypto from "crypto";
export const CONFIG_FP = (cfg) =>
  crypto.createHash("sha256").update(JSON.stringify(cfg)).digest("hex");
export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
export const collectionFor = (family, version, cfg) =>
  `${family}__v_${version}__${slug(cfg.fn)}`;
export const aliasIdFor = (family) => family;
