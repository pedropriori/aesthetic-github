import { writeFile } from "node:fs/promises";
import path from "node:path";
import { loadProfileKitConfig } from "./load-profile-kit-config.js";
import { validateProfileKitConfig } from "./validate-profile-kit-config.js";
import { generateProfileKitAssets } from "./generate-profile-kit-assets.js";
import { renderProfileReadme } from "./render-profile-readme.js";

/**
 * Gera `README.md` + assets do Profile Kit no projeto de destino.
 */
export async function executeGenerateProfileKit(input: {
  readonly projectRootPath: string;
  readonly configPath?: string;
}): Promise<void> {
  const config = await loadProfileKitConfig({ projectRootPath: input.projectRootPath, configPath: input.configPath });
  validateProfileKitConfig({ config });
  await generateProfileKitAssets({ projectRootPath: input.projectRootPath, config });
  const readme: string = renderProfileReadme({ config });
  const readmePath: string = path.join(input.projectRootPath, "README.md");
  await writeFile(readmePath, readme, { encoding: "utf-8" });
  process.stdout.write("aesthetic-github: profile kit gerado (README.md + assets/).\n");
}

