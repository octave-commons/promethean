import { describe, it, expect } from "vitest";
import {
  isGlobalCategory,
  isLocalCategory,
  GLOBAL_CATEGORIES,
  LOCAL_CATEGORIES,
} from "../lane-routing";

// ---------------------------------------------------------------------------
// isGlobalCategory tests
// ---------------------------------------------------------------------------

describe("isGlobalCategory", () => {
  it("returns true for 'geopolitical'", () => {
    expect(isGlobalCategory("geopolitical")).toBe(true);
  });

  it("returns true for 'infrastructure'", () => {
    expect(isGlobalCategory("infrastructure")).toBe(true);
  });

  it("returns true for 'global'", () => {
    expect(isGlobalCategory("global")).toBe(true);
  });

  it("returns false for 'technology'", () => {
    expect(isGlobalCategory("technology")).toBe(false);
  });

  it("returns false for 'community'", () => {
    expect(isGlobalCategory("community")).toBe(false);
  });

  it("returns false for 'local'", () => {
    expect(isGlobalCategory("local")).toBe(false);
  });

  it("returns false for 'oss'", () => {
    expect(isGlobalCategory("oss")).toBe(false);
  });

  it("returns false for 'economic'", () => {
    expect(isGlobalCategory("economic")).toBe(false);
  });

  it("returns false for 'security'", () => {
    expect(isGlobalCategory("security")).toBe(false);
  });

  it("returns false for 'climate'", () => {
    expect(isGlobalCategory("climate")).toBe(false);
  });

  it("returns false for unknown categories", () => {
    expect(isGlobalCategory("random")).toBe(false);
    expect(isGlobalCategory("unknown")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isLocalCategory tests
// ---------------------------------------------------------------------------

describe("isLocalCategory", () => {
  it("returns true for 'technology'", () => {
    expect(isLocalCategory("technology")).toBe(true);
  });

  it("returns true for 'community'", () => {
    expect(isLocalCategory("community")).toBe(true);
  });

  it("returns true for 'oss'", () => {
    expect(isLocalCategory("oss")).toBe(true);
  });

  it("returns true for 'local'", () => {
    expect(isLocalCategory("local")).toBe(true);
  });

  it("returns true for 'economic'", () => {
    expect(isLocalCategory("economic")).toBe(true);
  });

  it("returns true for 'security'", () => {
    expect(isLocalCategory("security")).toBe(true);
  });

  it("returns true for 'climate'", () => {
    expect(isLocalCategory("climate")).toBe(true);
  });

  it("returns false for 'geopolitical'", () => {
    expect(isLocalCategory("geopolitical")).toBe(false);
  });

  it("returns false for 'infrastructure'", () => {
    expect(isLocalCategory("infrastructure")).toBe(false);
  });

  it("returns false for 'global'", () => {
    expect(isLocalCategory("global")).toBe(false);
  });

  it("returns true for unknown categories (broad approach: non-global = local)", () => {
    expect(isLocalCategory("random")).toBe(true);
    expect(isLocalCategory("unknown")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Category set consistency
// ---------------------------------------------------------------------------

describe("GLOBAL_CATEGORIES / LOCAL_CATEGORIES sets", () => {
  it("GLOBAL_CATEGORIES and LOCAL_CATEGORIES do not overlap", () => {
    for (const cat of GLOBAL_CATEGORIES) {
      expect(LOCAL_CATEGORIES.has(cat)).toBe(false);
    }
    for (const cat of LOCAL_CATEGORIES) {
      expect(GLOBAL_CATEGORIES.has(cat)).toBe(false);
    }
  });

  it("GLOBAL_CATEGORIES has exactly 3 entries", () => {
    expect(GLOBAL_CATEGORIES.size).toBe(3);
  });

  it("LOCAL_CATEGORIES has at least 4 entries", () => {
    expect(LOCAL_CATEGORIES.size).toBeGreaterThanOrEqual(4);
  });

  it("technology is in LOCAL_CATEGORIES, not GLOBAL_CATEGORIES", () => {
    expect(LOCAL_CATEGORIES.has("technology")).toBe(true);
    expect(GLOBAL_CATEGORIES.has("technology")).toBe(false);
  });
});
