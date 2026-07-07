# Runbook — Operação dos agentes Kinto

Guia rápido para resolver os problemas mais comuns em até 5 minutos.
Os agentes rodam localmente via Windows Task Scheduler.

## Tasks agendadas

| Task | Quando | O que faz |
|---|---|---|
| Kinto Dev Agent | diário 20h00 | Implementa o card do dia e faz deploy (push na main) |
| Kinto CEO Agent | sexta 20h00 | Planeja a semana, manda relatório |
| Kinto E2E | diário 19h30 | Roda os testes end-to-end |
| Kinto Analytics Pull | diário 07h00 | Puxa métricas do GA4 |

> Os watchdogs matinais (Smoke Test 08h30 e Watchdog 09h00) foram removidos —
> não há mais alertas automáticos de manhã no Telegram.

---

## Sintoma: recebi alerta "Dev Agent não rodou ontem"

**Causa provável:** PC estava desligado às 20h, ou a task falhou.

1. Confira se o PC fica ligado às 20h. Se não, considere mudar o horário da task no Agendador de Tarefas.
2. Rode manualmente para recuperar o dia:
   ```
   scripts\run-dev-agent.bat
   ```
3. Se falhar na hora, veja o sintoma "Claude sem quota" abaixo.

## Sintoma: recebi alerta "sessão começou mas não terminou"

**Causa provável:** o Claude ficou sem tokens no meio da sessão, travou, ou bateu o limite de tempo da task (35 min).

1. Rode `node scripts/agent-status.mjs` para ver o estado do kanban.
2. Veja se algum card ficou preso em `in_progress`. Se sim, decida: mover de volta para `todo` (pelo /admin > Kanban) ou deixar o próximo Dev Agent continuar.
3. Rode `scripts\run-dev-agent.bat` manualmente se quiser recuperar.

## Sintoma: desconfio que o site está com problema

**Causa provável:** deploy quebrado, Vercel fora do ar, ou erro de runtime.
(Não há mais smoke test automático; verifique manualmente.)

1. Abra o site no navegador: https://kinto.fun — confirme o que está quebrado.
2. Veja os últimos commits: `git log --oneline -5`. Se o último commit causou, considere reverter:
   ```
   git revert HEAD
   git push
   ```
3. Já existe um card de prioridade alta no kanban — o Dev Agent vai pegar na próxima sessão. Se for urgente, rode `scripts\run-dev-agent.bat` agora.

## Sintoma: "Claude sem quota" / erro 401 / Dev ou CEO falham imediatamente

**Causa provável:** a autenticação do Claude Code expirou (erro `401 Invalid
authentication credentials`) ou a assinatura esgotou a janela de uso.

1. Abra o Claude Code manualmente. Se pedir login (401), **refaça o login**
   (`claude` → `/login`). Sem isso, o agente falha todo dia sem fazer nada.
2. Se for quota: espere a janela renovar (5h no plano Pro) ou faça upgrade.
3. Rode o `.bat` correspondente manualmente quando voltar. Em caso de 401, o
   `run-dev-agent.bat` agora cancela o deploy e sai com erro (não mascara como sucesso).

## Sintoma: nenhum alerta há dias, mas desconfio que algo está errado

1. Rode `node scripts/agent-status.mjs` — mostra cards e atividade recente.
2. Rode `node scripts/supabase-agent.mjs clientErrors` — erros de runtime reportados pelos jogadores.
3. Confira no Agendador de Tarefas (Win+R → `taskschd.msc`) se as 4 tasks existem e estão habilitadas.

## Sintoma: o Telegram parou de receber mensagens

1. Teste: `node scripts/telegram.mjs "teste"` (com o `.env` carregado).
2. Se der erro de token: o bot pode ter sido revogado. Gere novo token no @BotFather e atualize `TELEGRAM_BOT_TOKEN` no `.env`.

## Reconfigurar tudo do zero

Se as tasks sumiram ou o PC foi formatado:
```
PowerShell como Administrador, na raiz do projeto:
.\scripts\setup-tasks.ps1
```

## Contatos de infra

- Hospedagem: Vercel (deploy automático no push para `main`)
- Banco: Supabase
- Bot: Telegram (@BotFather para gerenciar)
