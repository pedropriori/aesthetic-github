import { ProfileKitConfig } from "./models/profile-kit-config.js";

interface RenderedSection {
  readonly id: string;
  readonly markdown: string;
}

function buildMailtoUrl(input: { readonly email: string; readonly subject: string; readonly body: string }): string {
  const query: string = new URLSearchParams({ subject: input.subject, body: input.body }).toString();
  return `mailto:${input.email}?${query}`;
}

function renderHeroSection(input: { readonly config: ProfileKitConfig }): RenderedSection {
  const mailtoUrl: string = buildMailtoUrl({
    email: input.config.cta.email,
    subject: input.config.cta.subject,
    body: input.config.cta.body
  });
  const links: string[] = [];
  if (input.config.links?.linkedin) links.push(`[LinkedIn](${input.config.links.linkedin})`);
  if (input.config.links?.x) links.push(`[X](${input.config.links.x})`);
  if (input.config.links?.youtube) links.push(`[YouTube](${input.config.links.youtube})`);
  if (input.config.links?.devto) links.push(`[Dev.to](${input.config.links.devto})`);
  const socialLine: string = links.length > 0 ? links.join(" · ") : "";
  return {
    id: "hero",
    markdown: [
      `<img src="assets/header.svg" width="100%" alt="header" />`,
      "",
      `<div align="center">`,
      "",
      `> ${input.config.identity.heroQuote}`,
      "",
      `<strong>${input.config.identity.headline}</strong>`,
      "",
      `<a href="${mailtoUrl}"><strong>${input.config.cta.label}</strong></a>`,
      socialLine ? `<br/><sub>${socialLine}</sub>` : "",
      "",
      `</div>`,
      "",
      `<img src="assets/divider.svg" width="100%" alt="divider" />`
    ]
      .filter((line: string) => line.length > 0)
      .join("\n")
  };
}

function renderNowSection(): RenderedSection {
  return {
    id: "now",
    markdown: [
      "## Now",
      "",
      "- building:",
      "- learning:",
      "- open to:",
      ""
    ].join("\n")
  };
}

function renderConsultingSection(input: { readonly config: ProfileKitConfig }): RenderedSection {
  const pkgMarkdown: string = input.config.offers.packages
    .map((pkg: { readonly title: string; readonly bullets: readonly string[] }) => {
      const bullets: string = pkg.bullets.map((b: string) => `- ${b}`).join("\n");
      return [`### ${pkg.title}`, "", bullets].join("\n");
    })
    .join("\n\n");
  return {
    id: "consulting",
    markdown: [
      "## Consulting",
      "",
      input.config.offers.availability ? `**Availability**: ${input.config.offers.availability}` : "",
      "",
      pkgMarkdown,
      ""
    ]
      .filter((line: string) => line.length > 0)
      .join("\n")
  };
}

function renderProofSection(input: { readonly config: ProfileKitConfig }): RenderedSection {
  const blocks: string[] = [];
  if (input.config.proof.primary === "metrics") {
    blocks.push(`<img src="assets/cards/metrics.svg" width="100%" alt="metrics" />`);
  }
  const hasSecondary: boolean = input.config.proof.secondary.length > 0;
  if (hasSecondary) {
    const items: string[] = input.config.proof.secondary.map((id: string) => {
      const src: string = `assets/cards/${id}.svg`;
      return `<img src="${src}" width="49%" alt="${id}" />`;
    });
    blocks.push(`<div align="center">\n${items.join("\n")}\n</div>`);
  }
  if (blocks.length === 0) {
    return { id: "proof", markdown: "" };
  }
  return {
    id: "proof",
    markdown: ["## Proof", "", ...blocks, ""].join("\n")
  };
}

function renderFeaturedWorkSection(input: { readonly config: ProfileKitConfig }): RenderedSection {
  if (!input.config.featuredWork || input.config.featuredWork.length === 0) return { id: "featured", markdown: "" };
  const itemsMarkdown: string = input.config.featuredWork
    .map((item: { readonly title: string; readonly description: string; readonly url: string }) => {
      return `- **[${item.title}](${item.url})** — ${item.description}`;
    })
    .join("\n");
  return { id: "featured", markdown: ["## Featured work", "", itemsMarkdown, ""].join("\n") };
}

function renderContactSection(input: { readonly config: ProfileKitConfig }): RenderedSection {
  const mailtoUrl: string = buildMailtoUrl({
    email: input.config.cta.email,
    subject: input.config.cta.subject,
    body: input.config.cta.body
  });
  return {
    id: "contact",
    markdown: [
      "## Contact",
      "",
      `- **Email**: [${input.config.cta.email}](${mailtoUrl})`,
      input.config.links?.linkedin ? `- **LinkedIn**: ${input.config.links.linkedin}` : "",
      input.config.links?.x ? `- **X**: ${input.config.links.x}` : "",
      "",
      `<img src="assets/footer.svg" width="100%" alt="footer" />`
    ]
      .filter((line: string) => line.length > 0)
      .join("\n")
  };
}

function resolveSectionsOrder(input: { readonly config: ProfileKitConfig }): readonly string[] {
  if (input.config.layout.sectionsOrder && input.config.layout.sectionsOrder.length > 0) return input.config.layout.sectionsOrder;
  if (input.config.layout.blueprint === "consulting-premium") return ["hero", "consulting", "proof", "featured", "contact"];
  if (input.config.layout.blueprint === "hybrid-premium") return ["hero", "now", "consulting", "proof", "featured", "contact"];
  return ["hero", "now", "proof", "consulting", "featured", "contact"];
}

function isSectionEnabled(input: { readonly config: ProfileKitConfig; readonly sectionId: string }): boolean {
  if (!input.config.layout.enabledSections || input.config.layout.enabledSections.length === 0) return true;
  return input.config.layout.enabledSections.includes(input.sectionId);
}

/**
 * Renderiza `README.md` do Profile Repo (username/username).
 */
export function renderProfileReadme(input: { readonly config: ProfileKitConfig }): string {
  const all: Record<string, RenderedSection> = {
    hero: renderHeroSection({ config: input.config }),
    now: renderNowSection(),
    consulting: renderConsultingSection({ config: input.config }),
    proof: renderProofSection({ config: input.config }),
    featured: renderFeaturedWorkSection({ config: input.config }),
    contact: renderContactSection({ config: input.config })
  };
  const order: readonly string[] = resolveSectionsOrder({ config: input.config });
  const parts: string[] = [];
  for (const id of order) {
    if (!isSectionEnabled({ config: input.config, sectionId: id })) continue;
    const section: RenderedSection | undefined = all[id];
    if (!section) continue;
    if (section.markdown.trim().length === 0) continue;
    parts.push(section.markdown.trim());
    parts.push("");
  }
  return `${parts.join("\n")}\n`;
}

