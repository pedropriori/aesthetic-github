import { ProfileKitConfig } from "./models/profile-kit-config.js";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item: unknown) => typeof item === "string");
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function validateEmail(input: { readonly email: string }): void {
  const isValid: boolean = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email);
  assert(isValid, `cta.email inválido: "${input.email}"`);
}

/**
 * Valida schema + guardrails para manter o perfil premium (sem exageros).
 */
export function validateProfileKitConfig(input: { readonly config: ProfileKitConfig }): void {
  const { config } = input;
  assert(config !== null && typeof config === "object", "Config inválida: esperado objeto.");
  assert(isNonEmptyString(config.identity?.displayName), "identity.displayName é obrigatório.");
  assert(isNonEmptyString(config.identity?.headline), "identity.headline é obrigatório.");
  assert(isNonEmptyString(config.identity?.heroQuote), "identity.heroQuote é obrigatório.");
  assert(isNonEmptyString(config.cta?.email), "cta.email é obrigatório.");
  assert(isNonEmptyString(config.cta?.subject), "cta.subject é obrigatório.");
  assert(isNonEmptyString(config.cta?.body), "cta.body é obrigatório.");
  assert(isNonEmptyString(config.cta?.label), "cta.label é obrigatório.");
  validateEmail({ email: config.cta.email });
  assert(isNonEmptyString(config.layout?.blueprint), "layout.blueprint é obrigatório.");
  assert(Array.isArray(config.offers?.packages), "offers.packages deve ser uma lista.");
  assert(config.offers.packages.length === 3, "offers.packages deve ter exatamente 3 pacotes (Audit/Build/Retainer).");
  for (const pkg of config.offers.packages) {
    assert(isNonEmptyString(pkg.title), "offers.packages[].title é obrigatório.");
    assert(isStringArray(pkg.bullets), "offers.packages[].bullets deve ser uma lista de strings.");
    assert(pkg.bullets.length >= 2 && pkg.bullets.length <= 4, "offers.packages[].bullets deve ter entre 2 e 4 itens.");
  }
  assert(config.proof?.limits?.maxSecondaryCards >= 0, "proof.limits.maxSecondaryCards deve ser >= 0.");
  assert(config.proof?.limits?.maxFeaturedWorkItems >= 0, "proof.limits.maxFeaturedWorkItems deve ser >= 0.");
  assert(
    config.proof.secondary.length <= config.proof.limits.maxSecondaryCards,
    `proof.secondary excede o limite (max=${config.proof.limits.maxSecondaryCards}).`
  );
  if (config.featuredWork) {
    assert(Array.isArray(config.featuredWork), "featuredWork deve ser uma lista.");
    assert(
      config.featuredWork.length <= config.proof.limits.maxFeaturedWorkItems,
      `featuredWork excede o limite (max=${config.proof.limits.maxFeaturedWorkItems}).`
    );
    for (const item of config.featuredWork) {
      assert(isNonEmptyString(item.title), "featuredWork[].title é obrigatório.");
      assert(isNonEmptyString(item.description), "featuredWork[].description é obrigatório.");
      assert(isNonEmptyString(item.url), "featuredWork[].url é obrigatório.");
    }
  }
}

