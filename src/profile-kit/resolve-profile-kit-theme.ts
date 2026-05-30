import { ProfileKitConfig } from "./models/profile-kit-config.js";

interface ProfileKitResolvedTheme {
  readonly accentColorHex: string;
  readonly backgroundColorHex: string;
  readonly textColorHex: string;
}

function normalizeHexColor(input: { readonly value: string }): string {
  const raw: string = input.value.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) throw new Error(`Cor inválida (esperado RRGGBB): "${input.value}"`);
  return `#${raw.toLowerCase()}`;
}

function resolvePreset(input: { readonly preset: string }): ProfileKitResolvedTheme {
  if (input.preset === "minimal-premium-dark") return { accentColorHex: "#8b5cf6", backgroundColorHex: "#0b0b10", textColorHex: "#e5e7eb" };
  if (input.preset === "minimal-premium-light") return { accentColorHex: "#6d28d9", backgroundColorHex: "#ffffff", textColorHex: "#111827" };
  return { accentColorHex: "#22c55e", backgroundColorHex: "#070a12", textColorHex: "#e2e8f0" };
}

/**
 * Resolve preset + overrides em um tema final.
 */
export function resolveProfileKitTheme(input: { readonly config: ProfileKitConfig }): ProfileKitResolvedTheme {
  const base: ProfileKitResolvedTheme = resolvePreset({ preset: input.config.theme.preset });
  const overrides: { readonly accentColorHex?: string; readonly backgroundColorHex?: string; readonly textColorHex?: string } | undefined =
    input.config.theme.overrides;
  if (!overrides) return base;
  return {
    accentColorHex: overrides.accentColorHex ? normalizeHexColor({ value: overrides.accentColorHex }) : base.accentColorHex,
    backgroundColorHex: overrides.backgroundColorHex ? normalizeHexColor({ value: overrides.backgroundColorHex }) : base.backgroundColorHex,
    textColorHex: overrides.textColorHex ? normalizeHexColor({ value: overrides.textColorHex }) : base.textColorHex
  };
}

