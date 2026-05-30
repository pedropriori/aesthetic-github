# Aesthetic GitHub — Profile Kit premium (design spec)

Data: 2026-05-22  
Status: draft para revisão

## 1) Objetivo e não-objetivos

### Objetivo

Evoluir o `aesthetic-github` de um gerador de log diário idempotente para um **Profile Kit premium** que:

- gere/atualize o **Profile README** (repo `username/username`)
- gere **assets visuais (SVG)** com tema consistente
- integre **métricas/cards** com baixa manutenção
- mantenha um estilo **minimalista, claro, organizado e premium** (sem exageros)
- seja **altamente personalizável** com **defaults opinativos** e **guardrails** anti-poluição

### Não-objetivos (V1)

- “Commit art/painter” para desenhar no gráfico de contribuições
- Portfólio completo/site (mini-landing foi explicitamente fora do escopo V1)
- Um editor visual web (V1 é config + templates)
- Treinar um modelo/agente “do zero”

## 2) Requisitos do usuário (inputs já definidos)

- **Objetivos do perfil**: consultoria/freela, DevRel/conteúdo, networking, (secundário: empregabilidade)
- **CTA principal**: email (mailto com assunto e corpo pré-preenchidos)
- **Blueprint default**: `creator-premium`
- **Tom**: “premium sem exagero” (menos elementos, mais coesão)

## 3) Princípios de design (“guardrails”)

- **1 CTA principal** acima da dobra.
- **Provas em poucos blocos**: no máximo 1 infográfico principal + 0–2 cards secundários.
- **Evitar ruído**: não virar dashboard, não virar mural de badges.
- **Cohesive theming**: o kit controla paleta/espaçamento e impede “colcha de retalhos”.
- **Idempotência**: rodar duas vezes deve produzir o mesmo output.
- **Commit condicionado**: comitar somente se algo mudou.
- **Assets versionados** preferencialmente (evitar dependência de endpoints externos quando possível).

## 4) Escopo funcional (V1)

### 4.1 Outputs gerados

- `README.md` do repo de profile (`username/username`)
- `assets/` com SVGs:
  - `assets/header.svg`
  - `assets/divider.svg`
  - `assets/footer.svg`
  - `assets/cards/*.svg` (dependendo da estratégia de métricas)
- Opcional: `assets/typing.svg` (apenas se fizer sentido no tema e sem “carnaval”)

### 4.2 Seções do README (blueprint `creator-premium`)

Ordem default (customizável):

- **Hero**
  - frase: “Be, and it is”
  - 1 linha de posicionamento (curta e objetiva)
  - CTA (mailto) com copy curto
- **Now / Focus**
  - 3 bullets: “construindo”, “aprendendo”, “aberto a…”
- **Content / DevRel**
  - links fixos (YouTube, Dev.to, X, etc.) quando existirem
  - bloco “Latest” é opcional e só entra se houver fonte (RSS) configurada
- **Consulting (discreto, porém claro)**
  - 3 pacotes (Audit / Build / Retainer) com 2–4 bullets
- **Proof**
  - 1 bloco principal (infográfico) + 0–2 cards adicionais, no máximo
- **Featured work**
  - 3–6 itens curados
- **Contact**
  - repetir CTA email + links sociais essenciais

## 5) Configuração: `aesthetic.config.*`

### 5.1 Formato

V1 suporta **um** formato (para evitar fragmentação). Recomendação: `aesthetic.config.json`.

### 5.2 Schema (alto nível)

- `identity`
  - `displayName` (string)
  - `headline` (string curta)
  - `heroQuote` (default “Be, and it is”)
  - `timezone` (opcional; útil para cron e “latest”)
- `cta`
  - `email` (string)
  - `subject` (string)
  - `body` (string)
  - `label` (string curta; ex.: “Vamos conversar”)
- `layout`
  - `blueprint` (`creator-premium` | `consulting-premium` | `hybrid-premium`)
  - `sectionsOrder` (opcional; lista)
  - `enabledSections` (opcional; toggles)
- `offers`
  - `packages` (lista de 3; cada um com `title`, `bullets`, `ctaLabel?`)
  - `availability` (opcional; ex.: “Disponível a partir de …”)
- `proof`
  - `primary` (ex.: `metrics`)
  - `secondary` (0–2 itens; ex.: `stats`, `langs`, `prs`)
  - `limits`
    - `maxBadges`
    - `maxCards`
- `theme`
  - `preset` (`minimal-premium-dark` | `minimal-premium-light` | `midnight`)
  - `overrides` (cores, espaçamento, densidade; limitado por guardrails)
- `links`
  - `github`, `linkedin`, `x`, `youtube`, `devto`, `medium` etc. (opcionais)
- `featuredWork`
  - lista com `title`, `description`, `url`

### 5.3 Guardrails (validações)

- Não permitir:
  - `proof.secondary.length > 2`
  - `featuredWork.length > 6` (default)
  - `theme.overrides` que conflite com acessibilidade (contraste mínimo)
- Lint de config:
  - erro claro com mensagem acionável
  - fallback para defaults quando possível

## 6) Estratégia de métricas/cards (integrações)

### 6.1 Recomendação V1

- **Primária**: `lowlighter/metrics` para gerar 1 SVG principal (coeso e premium quando bem configurado).
- **Fallback/alternativa**:
  - `ghstats` (assets gerados e commitados)
  - `github-readme-stats` (quando quiser 2 cards alinhados)

### 6.2 Critérios de escolha (automáticos)

- Se `proof.primary === "metrics"`: gerar `assets/cards/metrics.svg`.
- Se `proof.secondary` inclui `stats/langs`: gerar ou embedar conforme modo:
  - **modo assets versionados** (preferido): action gera SVGs e comita.
  - **modo embed remoto** (permitido, mas não default): usa endpoint externo.

## 7) Entrega técnica (arquitetura do `aesthetic-github`)

### 7.1 Componentes

- **Core** (já existe): `src/append-daily-log.ts` (mantém, mas vira “módulo log”)
- **Profile Kit module (novo)**:
  - carregar config
  - validar schema + guardrails
  - renderizar template de README (blueprint + theme)
  - gerar/atualizar assets locais (header/divider/footer) e delegar métricas/cards para actions

### 7.2 Formatos de entrega (V1)

Escolha preferida para V1:
- **CLI local** (ex.: `node dist/...`) + **workflow** no repo `username/username` que roda essa CLI.

Evolução possível (V2):
- empacotar como **GitHub Action** reutilizável (melhor UX para fork/uso por terceiros).

## 8) Workflows (GitHub Actions)

### 8.1 Workflow do repo de profile (`username/username`)

Um workflow `profile-kit.yml`:
- `schedule` diário (UTC) + `workflow_dispatch`
- permissões: `contents: write`
- steps:
  - checkout
  - setup node + cache
  - install/build
  - `generate profile kit` (gera README + assets)
  - commit/push somente se mudou

### 8.2 Workflow do repo atual (`aesthetic-github`)

Mantém o `daily-log.yml` existente para o log diário (sem conflitar).

## 9) Conteúdo “concierge” (opcional, sem treino pesado)

Objetivo: ajudar você a gerar copy consistente, sem ficar genérico, a partir da config.

V1 (opcional):
- um comando que produz sugestões de:
  - headline curta
  - bullets dos pacotes
  - seção “Now/Focus”
- guardrails:
  - não inventar números/cases
  - exigir que `featuredWork` tenha links reais

## 10) Checklist de qualidade (definição de “premium”)

- README cabe em 1–2 telas (sem rolagem infinita)
- 1 CTA acima da dobra
- 0–3 blocos visuais no total (header/footer contam como moldura, não como “card”)
- máxima clareza: “quem/entrega/contato” aparece em < 10s
- consistência de tema: paleta e estilo único

## 11) Próximos passos (após sua revisão)

- Ajustar este spec conforme feedback.
- Produzir plano de implementação (arquivos, nomes de comandos, scripts, testes).
- Só então iniciar implementação em código.

