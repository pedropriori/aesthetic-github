# Padrões e “estruturas invisíveis”

Este documento captura padrões recorrentes em perfis GitHub “premium”: organização, hierarquia e escolhas visuais que aumentam conversão (consultoria/networking) sem exageros.

## Hierarquia (landing page em Markdown)

### Above the fold (primeira dobra)

Deve responder em segundos:
- **Quem é você**
- **O que você entrega**
- **Como te contratar/falar**

Conteúdo típico:
- 1 frase curta (ex.: “Be, and it is”)
- 1 headline de posicionamento (1 linha)
- 1 CTA (no seu caso: **email**)
- 1 prova discreta (um único bloco visual opcional)

### Oferta empacotada (para consultoria sem parecer “desespero”)

Um padrão comum em perfis que vendem serviço:
- **Pacotes** (3) com nomes memoráveis
- Cada pacote com 2–4 bullets de entregáveis
- Sem “lista infinita” de tecnologias

### Provas (“proof”, sem virar dashboard)

Padrões que funcionam melhor visualmente:
- **1 infográfico principal** (ex.: `lowlighter/metrics`) ou
- **2 cards alinhados** (ex.: stats + langs)

Regra prática do premium: **menos cards, mais coesão**.

### Featured work (curadoria)

3 a 6 itens:
- nome do projeto
- 1 linha de resultado/impacto
- link

## Padrões visuais

### Coesão de tema

Perfis bonitos normalmente evitam:
- misturar 3 estilos diferentes de card
- misturar paletas conflitantes (ex.: neon + pastel + “github dark”)
- excesso de badges

### Layout via HTML no README

Quando precisa de alinhamento “premium”, perfis usam HTML:
- centralização (`<div align="center">`)
- grid simples com duas imagens lado a lado
- imagens `width="100%"` para header/divider/footer

## Automação “sem manutenção”

Padrão recorrente de perfis bem cuidados:
- GitHub Actions em cron (diário) + `workflow_dispatch`
- gerar assets (SVG) para o repo (evita depender de endpoints)
- commit **somente se houver mudança**

## O que evitar (anti-padrões de “perfil poluído”)

- 30+ badges “tecnologia por tecnologia” (vira ruído)
- múltiplas animações (snake + typing + gifs + counters)
- métricas demais sem contexto (“dashboard sem narrativa”)
- “commit art”/painter (risco reputacional e desalinhado com premium)

