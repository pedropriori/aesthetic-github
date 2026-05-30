interface ProfileKitCtaConfig {
  readonly email: string;
  readonly subject: string;
  readonly body: string;
  readonly label: string;
}

interface ProfileKitIdentityConfig {
  readonly displayName: string;
  readonly headline: string;
  readonly heroQuote: string;
  readonly timezone?: string;
}

interface ProfileKitOfferPackageConfig {
  readonly title: string;
  readonly bullets: readonly string[];
}

interface ProfileKitOffersConfig {
  readonly packages: readonly ProfileKitOfferPackageConfig[];
  readonly availability?: string;
}

interface ProfileKitProofLimitsConfig {
  readonly maxSecondaryCards: number;
  readonly maxFeaturedWorkItems: number;
}

type ProfileKitProofPrimary = "metrics" | "none";

type ProfileKitProofSecondary = "stats" | "langs" | "prs";

interface ProfileKitProofConfig {
  readonly primary: ProfileKitProofPrimary;
  readonly secondary: readonly ProfileKitProofSecondary[];
  readonly limits: ProfileKitProofLimitsConfig;
}

type ProfileKitLayoutBlueprint = "creator-premium" | "consulting-premium" | "hybrid-premium";

interface ProfileKitLayoutConfig {
  readonly blueprint: ProfileKitLayoutBlueprint;
  readonly sectionsOrder?: readonly string[];
  readonly enabledSections?: readonly string[];
}

type ProfileKitThemePreset = "minimal-premium-dark" | "minimal-premium-light" | "midnight";

interface ProfileKitThemeOverridesConfig {
  readonly accentColorHex?: string;
  readonly backgroundColorHex?: string;
  readonly textColorHex?: string;
}

interface ProfileKitThemeConfig {
  readonly preset: ProfileKitThemePreset;
  readonly overrides?: ProfileKitThemeOverridesConfig;
}

interface ProfileKitLinksConfig {
  readonly github?: string;
  readonly linkedin?: string;
  readonly x?: string;
  readonly youtube?: string;
  readonly devto?: string;
  readonly medium?: string;
  readonly website?: string;
}

interface ProfileKitFeaturedWorkItemConfig {
  readonly title: string;
  readonly description: string;
  readonly url: string;
}

/**
 * Configuração do Profile Kit (V1).
 */
export interface ProfileKitConfig {
  readonly identity: ProfileKitIdentityConfig;
  readonly cta: ProfileKitCtaConfig;
  readonly layout: ProfileKitLayoutConfig;
  readonly offers: ProfileKitOffersConfig;
  readonly proof: ProfileKitProofConfig;
  readonly theme: ProfileKitThemeConfig;
  readonly links?: ProfileKitLinksConfig;
  readonly featuredWork?: readonly ProfileKitFeaturedWorkItemConfig[];
}

