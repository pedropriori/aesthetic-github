import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

interface AppendDailyLogOptions {
  readonly projectRootPath: string;
}

interface TodayUtc {
  readonly dateIso: string;
  readonly dateTimeIso: string;
}

interface AestheticStateV1 {
  readonly version: 1;
  readonly vault?: {
    readonly repo: string;
    readonly branch?: string;
    readonly lastProcessedSha?: string;
    readonly lastCheckedAtUtc?: string;
  };
}

interface VaultCommitItem {
  readonly sha: string;
  readonly htmlUrl: string;
  readonly message: string;
  readonly authorDateUtc: string;
}

function getTodayUtc(): TodayUtc {
  const now: Date = new Date();
  return {
    dateIso: now.toISOString().slice(0, 10),
    dateTimeIso: now.toISOString()
  };
}

function getStartOfDayUtcIso(input: { readonly dateIso: string }): string {
  return `${input.dateIso}T00:00:00.000Z`;
}

function buildDailyLogMarkdown(input: { readonly dateIso: string; readonly dateTimeIso: string }): string {
  return [
    "---",
    `date: ${input.dateIso}`,
    `createdAtUtc: ${input.dateTimeIso}`,
    "---",
    "",
    `## ${input.dateIso}`,
    "",
    "- shipped:",
    "- learned:",
    "- next:",
    ""
  ].join("\n");
}

async function ensureDirectoryExists(input: { readonly directoryPath: string }): Promise<void> {
  await mkdir(input.directoryPath, { recursive: true });
}

async function writeFileIfMissing(input: { readonly filePath: string; readonly content: string }): Promise<boolean> {
  if (existsSync(input.filePath)) return false;
  await writeFile(input.filePath, input.content, { encoding: "utf-8" });
  return true;
}

async function readJsonFileIfExists<T>(input: { readonly filePath: string }): Promise<T | null> {
  if (!existsSync(input.filePath)) return null;
  const raw: string = await readFile(input.filePath, { encoding: "utf-8" });
  return JSON.parse(raw) as T;
}

async function writeJsonFile(input: { readonly filePath: string; readonly value: unknown }): Promise<void> {
  const raw: string = `${JSON.stringify(input.value, null, 2)}\n`;
  await writeFile(input.filePath, raw, { encoding: "utf-8" });
}

async function appendIndexIfMissing(input: { readonly indexPath: string; readonly dateIso: string }): Promise<boolean> {
  const indexLine: string = `- [${input.dateIso}](logs/${input.dateIso}.md)`;
  const exists: boolean = existsSync(input.indexPath);
  if (!exists) {
    const initial: string = ["# Aesthetic GitHub — Log Index", "", indexLine, ""].join("\n");
    await writeFile(input.indexPath, initial, { encoding: "utf-8" });
    return true;
  }
  const current: string = await readFile(input.indexPath, { encoding: "utf-8" });
  if (current.includes(indexLine)) return false;
  const next: string = current.endsWith("\n") ? `${current}${indexLine}\n` : `${current}\n${indexLine}\n`;
  await writeFile(input.indexPath, next, { encoding: "utf-8" });
  return true;
}

function getVaultEnv(): { readonly repo: string; readonly branch?: string; readonly token: string } | null {
  const repo: string | undefined = process.env.AESTHETIC_VAULT_REPO;
  const token: string | undefined = process.env.AESTHETIC_VAULT_TOKEN;
  const branch: string | undefined = process.env.AESTHETIC_VAULT_BRANCH;
  if (!repo || !token) return null;
  return { repo, branch, token };
}

async function fetchVaultCommits(input: {
  readonly repo: string;
  readonly branch?: string;
  readonly token: string;
  readonly perPage: number;
}): Promise<VaultCommitItem[]> {
  const baseUrl: string = "https://api.github.com";
  const searchParams: URLSearchParams = new URLSearchParams({ per_page: String(input.perPage) });
  if (input.branch) searchParams.set("sha", input.branch);
  const url: string = `${baseUrl}/repos/${input.repo}/commits?${searchParams.toString()}`;
  const response: Response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${input.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "aesthetic-github"
    }
  });
  if (!response.ok) {
    const body: string = await response.text();
    throw new Error(`GitHub API error (${response.status}): ${body}`);
  }
  const json: unknown = await response.json();
  if (!Array.isArray(json)) return [];
  return json
    .map((item: any): VaultCommitItem | null => {
      const sha: unknown = item?.sha;
      const htmlUrl: unknown = item?.html_url;
      const message: unknown = item?.commit?.message;
      const authorDateUtc: unknown = item?.commit?.author?.date;
      if (typeof sha !== "string") return null;
      if (typeof htmlUrl !== "string") return null;
      if (typeof message !== "string") return null;
      if (typeof authorDateUtc !== "string") return null;
      return { sha, htmlUrl, message, authorDateUtc };
    })
    .filter((x: VaultCommitItem | null): x is VaultCommitItem => x !== null);
}

function selectNewVaultCommits(input: {
  readonly commits: VaultCommitItem[];
  readonly lastProcessedSha?: string;
  readonly todayStartUtcIso: string;
}): VaultCommitItem[] {
  if (input.commits.length === 0) return [];
  if (input.lastProcessedSha) {
    const index: number = input.commits.findIndex((c: VaultCommitItem) => c.sha === input.lastProcessedSha);
    if (index === -1) {
      return input.commits.filter((c: VaultCommitItem) => c.authorDateUtc >= input.todayStartUtcIso);
    }
    return input.commits.slice(0, index);
  }
  return input.commits.filter((c: VaultCommitItem) => c.authorDateUtc >= input.todayStartUtcIso);
}

function buildVaultSectionMarkdown(input: { readonly repo: string; readonly commits: VaultCommitItem[] }): string {
  const header: string = `### Vault activity (${input.repo})`;
  const lines: string[] = [header, ""];
  for (const c of input.commits) {
    const shortSha: string = c.sha.slice(0, 7);
    const titleLine: string = c.message.split("\n")[0] ?? "";
    lines.push(`- ${c.authorDateUtc} — ${titleLine} ([${shortSha}](${c.htmlUrl}))`);
  }
  lines.push("");
  return lines.join("\n");
}

async function appendVaultActivityIfNeeded(input: {
  readonly projectRootPath: string;
  readonly today: TodayUtc;
  readonly dailyLogPath: string;
}): Promise<{ readonly vaultActivityAppended: boolean; readonly stateUpdated: boolean }> {
  const vaultEnv: { readonly repo: string; readonly branch?: string; readonly token: string } | null = getVaultEnv();
  if (!vaultEnv) return { vaultActivityAppended: false, stateUpdated: false };
  const aestheticDirectoryPath: string = path.join(input.projectRootPath, ".aesthetic");
  const statePath: string = path.join(aestheticDirectoryPath, "state.json");
  await ensureDirectoryExists({ directoryPath: aestheticDirectoryPath });
  const existingState: AestheticStateV1 | null = await readJsonFileIfExists<AestheticStateV1>({ filePath: statePath });
  const lastProcessedSha: string | undefined = existingState?.vault?.lastProcessedSha;
  const commits: VaultCommitItem[] = await fetchVaultCommits({ repo: vaultEnv.repo, branch: vaultEnv.branch, token: vaultEnv.token, perPage: 50 });
  const todayStartUtcIso: string = getStartOfDayUtcIso({ dateIso: input.today.dateIso });
  const newCommits: VaultCommitItem[] = selectNewVaultCommits({ commits, lastProcessedSha, todayStartUtcIso }).reverse();
  const latestSha: string | undefined = commits[0]?.sha;
  const nextLastProcessedSha: string | undefined = latestSha ?? lastProcessedSha;
  const nextState: AestheticStateV1 = {
    version: 1,
    vault: {
      repo: vaultEnv.repo,
      branch: vaultEnv.branch,
      lastProcessedSha: nextLastProcessedSha,
      lastCheckedAtUtc: input.today.dateTimeIso
    }
  };
  const shouldUpdateState: boolean =
    existingState === null ||
    existingState.vault?.repo !== nextState.vault?.repo ||
    existingState.vault?.branch !== nextState.vault?.branch ||
    existingState.vault?.lastProcessedSha !== nextState.vault?.lastProcessedSha;
  if (shouldUpdateState) {
    await writeJsonFile({ filePath: statePath, value: nextState });
  }
  process.stdout.write(
    `aesthetic-github: vault commits fetched=${commits.length}, new=${newCommits.length}, lastProcessed=${lastProcessedSha ?? "none"}, latest=${latestSha ?? "none"}\n`
  );
  if (newCommits.length === 0) return { vaultActivityAppended: false, stateUpdated: shouldUpdateState };
  const currentLog: string = await readFile(input.dailyLogPath, { encoding: "utf-8" });
  const sectionHeader: string = `### Vault activity (${vaultEnv.repo})`;
  const section: string = buildVaultSectionMarkdown({ repo: vaultEnv.repo, commits: newCommits });
  const nextLog: string = currentLog.includes(sectionHeader)
    ? currentLog.endsWith("\n")
      ? `${currentLog}${newCommits
          .map((c: VaultCommitItem) => {
            const shortSha: string = c.sha.slice(0, 7);
            const titleLine: string = c.message.split("\n")[0] ?? "";
            return `- ${c.authorDateUtc} — ${titleLine} ([${shortSha}](${c.htmlUrl}))`;
          })
          .join("\n")}\n`
      : `${currentLog}\n${newCommits
          .map((c: VaultCommitItem) => {
            const shortSha: string = c.sha.slice(0, 7);
            const titleLine: string = c.message.split("\n")[0] ?? "";
            return `- ${c.authorDateUtc} — ${titleLine} ([${shortSha}](${c.htmlUrl}))`;
          })
          .join("\n")}\n`
    : currentLog.endsWith("\n")
      ? `${currentLog}\n${section}`
      : `${currentLog}\n\n${section}`;
  await writeFile(input.dailyLogPath, nextLog, { encoding: "utf-8" });
  return { vaultActivityAppended: true, stateUpdated: shouldUpdateState };
}

export async function executeAppendDailyLog(options: AppendDailyLogOptions): Promise<void> {
  const today: TodayUtc = getTodayUtc();
  const logsDirectoryPath: string = path.join(options.projectRootPath, "logs");
  const dailyLogPath: string = path.join(logsDirectoryPath, `${today.dateIso}.md`);
  const indexPath: string = path.join(options.projectRootPath, "LOG_INDEX.md");
  await ensureDirectoryExists({ directoryPath: logsDirectoryPath });
  const dailyLogCreated: boolean = await writeFileIfMissing({
    filePath: dailyLogPath,
    content: buildDailyLogMarkdown(today)
  });
  const indexUpdated: boolean = await appendIndexIfMissing({ indexPath, dateIso: today.dateIso });
  const vaultResult: { readonly vaultActivityAppended: boolean; readonly stateUpdated: boolean } = await appendVaultActivityIfNeeded({
    projectRootPath: options.projectRootPath,
    today,
    dailyLogPath
  });
  const vaultActivityAppended: boolean = vaultResult.vaultActivityAppended;
  const changedFiles: string[] = [];
  if (dailyLogCreated) changedFiles.push(path.relative(options.projectRootPath, dailyLogPath));
  if (indexUpdated) changedFiles.push(path.relative(options.projectRootPath, indexPath));
  if (vaultActivityAppended && !changedFiles.includes(path.relative(options.projectRootPath, dailyLogPath))) {
    changedFiles.push(path.relative(options.projectRootPath, dailyLogPath));
  }
  if (vaultResult.stateUpdated) changedFiles.push(path.relative(options.projectRootPath, path.join(".aesthetic", "state.json")));
  const output: string =
    changedFiles.length === 0 ? "aesthetic-github: nada a atualizar hoje." : `aesthetic-github: atualizado (${changedFiles.join(", ")}).`;
  process.stdout.write(`${output}\n`);
}

async function main(): Promise<void> {
  const projectRootPath: string = process.cwd();
  await executeAppendDailyLog({ projectRootPath });
}

main().catch((err: unknown) => {
  process.stderr.write(`aesthetic-github: erro inesperado: ${String(err)}\n`);
  process.exitCode = 1;
});

