import { readFile } from "node:fs/promises";
import path from "node:path";
import { ProfileKitConfig } from "./models/profile-kit-config.js";

function parseJson(input: { readonly raw: string; readonly filePath: string }): unknown {
  try {
    return JSON.parse(input.raw) as unknown;
  } catch (err: unknown) {
    throw new Error(`Falha ao parsear JSON em ${input.filePath}: ${String(err)}`);
  }
}

/**
 * Carrega a configuração do Profile Kit a partir do projeto de destino.
 */
export async function loadProfileKitConfig(input: {
  readonly projectRootPath: string;
  readonly configPath?: string;
}): Promise<ProfileKitConfig> {
  const defaultConfigPath: string = path.join(input.projectRootPath, "aesthetic.config.json");
  const configPath: string = input.configPath ? path.resolve(input.projectRootPath, input.configPath) : defaultConfigPath;
  const raw: string = await readFile(configPath, { encoding: "utf-8" });
  const parsed: unknown = parseJson({ raw, filePath: configPath });
  return parsed as ProfileKitConfig;
}

