// convex/lib/utils.ts
// Utility functions for CleanRecipe

import { createHash } from "crypto";

/**
 * Tracking parameters to remove from URLs
 */
const TRACKING_PARAMS = [
  // UTM parameters
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  // Social/ad tracking
  "fbclid",
  "gclid",
  "gclsrc",
  "dclid",
  "msclkid",
  "twclid",
  // Common referral params
  "ref",
  "source",
  "referrer",
  "origin",
  // Recipe site specific
  "printview",
  "print",
  "shared",
];

/**
 * Normalizes a URL for consistent cache lookups
 * - Removes tracking parameters
 * - Removes www prefix
 * - Lowercases hostname
 * - Removes trailing slashes
 * - Sorts remaining query params
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // Remove tracking parameters
    TRACKING_PARAMS.forEach((param) => parsed.searchParams.delete(param));

    // Remove www prefix
    parsed.hostname = parsed.hostname.replace(/^www\./, "");

    // Sort remaining query params for consistency
    parsed.searchParams.sort();

    // Build normalized URL
    let normalized = parsed.toString();

    // Remove trailing slash (but keep root slash)
    if (normalized.endsWith("/") && parsed.pathname !== "/") {
      normalized = normalized.slice(0, -1);
    }

    // Lowercase (URLs are case-insensitive for hostname, but paths may vary)
    // Only lowercase the hostname part
    const hostnameEnd = normalized.indexOf(parsed.pathname);
    normalized =
      normalized.slice(0, hostnameEnd).toLowerCase() +
      normalized.slice(hostnameEnd);

    return normalized;
  } catch {
    // If URL parsing fails, return original
    return url;
  }
}

/**
 * Creates a hash of the normalized URL for database indexing
 * Uses first 16 characters of SHA256 (64 bits = ~18 quintillion possibilities)
 */
export function hashUrl(url: string): string {
  const normalized = normalizeUrl(url);
  return createHash("sha256").update(normalized).digest("hex").substring(0, 16);
}

/**
 * Validates that a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Extracts the domain from a URL
 */
export function getDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * Checks if a URL is from a known recipe site
 */
export const KNOWN_RECIPE_SITES: Record<string, string> = {
  "allrecipes.com": "allrecipes",
  "seriouseats.com": "seriouseats",
  "bonappetit.com": "bonappetit",
  "epicurious.com": "epicurious",
  "foodnetwork.com": "foodnetwork",
  "food52.com": "food52",
  "smittenkitchen.com": "smittenkitchen",
  "budgetbytes.com": "budgetbytes",
  "cookinglight.com": "cookinglight",
  "delish.com": "delish",
  "eatingwell.com": "eatingwell",
  "foodandwine.com": "foodandwine",
  "myrecipes.com": "myrecipes",
  "simplyrecipes.com": "simplyrecipes",
  "tasteoflome.com": "tasteofhome",
  "thekitchn.com": "thekitchn",
  "cooking.nytimes.com": "nytcooking",
};

export function getKnownSite(url: string): string | null {
  const domain = getDomain(url);
  return KNOWN_RECIPE_SITES[domain] || null;
}
