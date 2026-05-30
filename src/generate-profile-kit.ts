import path from "node:path";
import { executeGenerateProfileKit } from "./profile-kit/execute-generate-profile-kit.js";

interface CliArgs {
  readonly outPath?: string;
  readonly configPath?: string;
}

function parseCliArgs(): CliArgs {
  const args: string[] = process.argv.slice(2);
  const result: { outPath?: string; configPath?: string } = {};
  for (let i: number = 0; i < args.length; i += 1) {
    const arg: string | undefined = args[i];
    const next: string | undefined = args[i + 1];
    if (!arg) continue;
    if (arg === "--out" && next) {
      result.outPath = next;
      i += 1;
      continue;
    }
    if (arg === "--config" && next) {
      result.configPath = next;
      i += 1;
      continue;
    }
  }
  return result;
}

async function main(): Promise<void> {
  const args: CliArgs = parseCliArgs();
  const projectRootPath: string = args.outPath ? path.resolve(process.cwd(), args.outPath) : process.cwd();
  await executeGenerateProfileKit({ projectRootPath, configPath: args.configPath });
}

main().catch((err: unknown) => {
  process.stderr.write(`aesthetic-github: erro inesperado (profile kit): ${String(err)}\n`);
  process.exitCode = 1;
});

