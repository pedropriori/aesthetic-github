# aesthetic-github

Ferramenta autoral para manter seu GitHub **esteticamente ativo** sem apelar para commits vazios: ela gera um **log diário real mínimo** (1 arquivo por dia) e mantém um índice em `LOG_INDEX.md`.

## Como funciona

- Cria `logs/YYYY-MM-DD.md` (apenas se o arquivo do dia ainda não existir).
- Atualiza `LOG_INDEX.md` adicionando o link do dia (apenas se ainda não existir).
- É idempotente: rodar 2x no mesmo dia não cria novo commit.

## Requisitos para aparecer no gráfico de contribuições

Para contar no seu gráfico do GitHub, o commit precisa estar na **branch default** do repositório e o **e-mail do autor** precisa estar associado à sua conta (ou usar seu `noreply`).

## Rodar localmente

```bash
npm install
npm run build
npm start
```

## Automatizar com GitHub Actions (sem PAT)

Este repo inclui um workflow agendado que usa apenas `secrets.GITHUB_TOKEN` (sem token pessoal).

### Observações importantes

- O agendamento do GitHub Actions roda em **UTC**.
- O workflow pode executar mais de 1x por dia (redundância), mas o script é **idempotente** e só gera mudança 1x por dia.
- Para o push funcionar, verifique em **Settings → Actions → General → Workflow permissions** se está em **Read and write permissions**.

### Secrets necessários

Crie dois secrets no repositório:

- `AESTHETIC_GIT_NAME`: seu nome (ex.: `Kadil`)
- `AESTHETIC_GIT_EMAIL`: seu e-mail do GitHub (recomendado: `noreply`)

Você encontra o `noreply` em: GitHub → Settings → Emails.

### (Opcional) Conectar ao vault do Obsidian (repo privado)

Se você quiser que o `aesthetic-github` detecte atividade do seu vault (mesmo sendo privado) e **copie mensagens de commits** para o log do dia, crie também:

- `AESTHETIC_VAULT_REPO`: `owner/repo` do vault (ex.: `kadil/meu-vault`)
- `AESTHETIC_VAULT_TOKEN`: Fine-grained PAT **read-only** com acesso a esse repositório
- `AESTHETIC_VAULT_BRANCH` (opcional): branch do vault (ex.: `main`)
