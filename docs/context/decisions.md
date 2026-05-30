# Decisões e direção do produto

Este documento registra decisões atuais para manter o projeto coerente e “premium” (sem exageros), mesmo com alta personalização.

## Objetivo do perfil (prioridades)

- vender serviço/freela/consultoria
- atrair audiência (DevRel/conteúdo)
- networking
- talvez ser contratado
- manter posicionamento elegante, claro e organizado

## CTA principal (enquanto não há portfólio)

- **Email** (mailto com assunto/corpo pré-preenchidos)

## Direção do `aesthetic-github`

- Foco inicial: **Profile Kit**
  - gerar/atualizar **Profile README** + **assets** com tema consistente
  - automação via GitHub Actions (cron + manual)
  - commit somente se houver mudança

## Blueprint default (V1)

- **`creator-premium`**
  - destaca conteúdo/DevRel e presença
  - oferta/consultoria aparece de forma discreta (mas clara)
  - CTA por email no topo

## Escopo V1

- **Somente Profile README** (sem mini-landing provisória por enquanto)

## Princípios (guardrails)

- estética sem exageros: “menos, melhor”
- defaults minimalistas/premium; customização máxima vem por overrides
- evitar “commit art”/painter
- priorizar assets versionados no repo (evitar dependência de endpoints externos quando possível)

