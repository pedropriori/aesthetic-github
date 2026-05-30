import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ProfileKitConfig } from "./models/profile-kit-config.js";
import { resolveProfileKitTheme } from "./resolve-profile-kit-theme.js";

function buildHeaderSvg(input: { readonly displayName: string; readonly headline: string; readonly accentColorHex: string; readonly textColorHex: string }): string {
  const width: number = 1200;
  const height: number = 220;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${input.displayName}">`,
    `<defs>`,
    `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">`,
    `<stop offset="0" stop-color="${input.accentColorHex}" stop-opacity="0.9" />`,
    `<stop offset="1" stop-color="${input.accentColorHex}" stop-opacity="0.2" />`,
    `</linearGradient>`,
    `</defs>`,
    `<rect width="100%" height="100%" fill="url(#g)" />`,
    `<rect x="0" y="${height - 2}" width="${width}" height="2" fill="${input.textColorHex}" fill-opacity="0.2" />`,
    `<g font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" fill="${input.textColorHex}">`,
    `<text x="64" y="108" font-size="44" font-weight="700" letter-spacing="0.2">${escapeXml(input.displayName)}</text>`,
    `<text x="64" y="156" font-size="20" font-weight="500" fill-opacity="0.92">${escapeXml(input.headline)}</text>`,
    `</g>`,
    `</svg>`
  ].join("");
}

function buildDividerSvg(input: { readonly accentColorHex: string }): string {
  const width: number = 1200;
  const height: number = 28;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="divider">`,
    `<rect width="100%" height="100%" fill="transparent" />`,
    `<rect x="0" y="${Math.floor(height / 2)}" width="${width}" height="1" fill="${input.accentColorHex}" fill-opacity="0.35" />`,
    `<circle cx="${Math.floor(width / 2)}" cy="${Math.floor(height / 2)}" r="3" fill="${input.accentColorHex}" />`,
    `</svg>`
  ].join("");
}

function buildFooterSvg(input: { readonly accentColorHex: string; readonly textColorHex: string }): string {
  const width: number = 1200;
  const height: number = 110;
  const tagline: string = "crafted with aesthetic-github";
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="footer">`,
    `<rect width="100%" height="100%" fill="transparent" />`,
    `<rect x="0" y="0" width="${width}" height="2" fill="${input.accentColorHex}" fill-opacity="0.35" />`,
    `<g font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial">`,
    `<text x="${Math.floor(width / 2)}" y="68" text-anchor="middle" font-size="14" fill="${input.textColorHex}" fill-opacity="0.65">${tagline}</text>`,
    `</g>`,
    `</svg>`
  ].join("");
}

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

/**
 * Gera assets SVG locais (header/divider/footer).
 */
export async function generateProfileKitAssets(input: { readonly projectRootPath: string; readonly config: ProfileKitConfig }): Promise<void> {
  const theme: { readonly accentColorHex: string; readonly backgroundColorHex: string; readonly textColorHex: string } = resolveProfileKitTheme({
    config: input.config
  });
  const assetsPath: string = path.join(input.projectRootPath, "assets");
  const cardsPath: string = path.join(assetsPath, "cards");
  await mkdir(cardsPath, { recursive: true });
  const headerSvg: string = buildHeaderSvg({
    displayName: input.config.identity.displayName,
    headline: input.config.identity.headline,
    accentColorHex: theme.accentColorHex,
    textColorHex: theme.textColorHex
  });
  const dividerSvg: string = buildDividerSvg({ accentColorHex: theme.accentColorHex });
  const footerSvg: string = buildFooterSvg({ accentColorHex: theme.accentColorHex, textColorHex: theme.textColorHex });
  await writeFile(path.join(assetsPath, "header.svg"), headerSvg, { encoding: "utf-8" });
  await writeFile(path.join(assetsPath, "divider.svg"), dividerSvg, { encoding: "utf-8" });
  await writeFile(path.join(assetsPath, "footer.svg"), footerSvg, { encoding: "utf-8" });
  await writeFile(path.join(cardsPath, ".gitkeep"), "", { encoding: "utf-8" });
}

