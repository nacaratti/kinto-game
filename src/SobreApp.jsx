import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bot, Brain, GitMerge, Zap, BookOpen, Heart, Gamepad2, Share2, HelpCircle, ChevronDown } from 'lucide-react';
import { getTotalGamesPlayed } from '@/lib/stats';
import '@/index.css';

const BG = '#16181d';
const CARD_BG = '#1e2028';
const BDR = '#2c2f3a';

const Section = ({ icon: Icon, iconColor, title, children }) => (
  <div
    className="w-full rounded-2xl border p-5 flex flex-col gap-3"
    style={{ backgroundColor: CARD_BG, borderColor: BDR }}
  >
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${iconColor}18`, border: `1px solid ${iconColor}30` }}
      >
        <Icon className="w-5 h-5" style={{ color: iconColor }} />
      </div>
      <h2 className="text-base font-bold text-white">{title}</h2>
    </div>
    <div className="text-sm text-zinc-400 leading-relaxed space-y-2">{children}</div>
  </div>
);

const AgentCard = ({ name, role, description, color }) => (
  <div
    className="rounded-xl border p-4 flex flex-col gap-1.5"
    style={{ backgroundColor: '#22252f', borderColor: BDR }}
  >
    <div className="flex items-center gap-2">
      <span
        className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}30` }}
      >
        {name}
      </span>
    </div>
    <p className="text-sm font-semibold text-white">{role}</p>
    <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
  </div>
);

const FaqItem = ({ question, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#22252f', borderColor: BDR }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-white">{question}</span>
        <ChevronDown className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-3 -mt-1 text-xs text-zinc-400 leading-relaxed space-y-2">{children}</div>
      )}
    </div>
  );
};

const SHARE_TEXT =
  'Descobri o Kinto: um Wordle em Português desenvolvido e mantido por IAs autônomas — sem intervenção humana. O experimento está rodando ao vivo 🤖\nhttps://kinto.fun/sobre';

const SobreApp = () => {
  // Prova social: total de partidas já jogadas (5 + 6 letras).
  // Busca a cada visita; null enquanto carrega para não exibir "0".
  const [totalGames, setTotalGames] = useState(null);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    let active = true;
    getTotalGamesPlayed().then((n) => {
      if (active) setTotalGames(n);
    });
    return () => { active = false; };
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: SHARE_TEXT });
        return;
      } catch {
        // usuário cancelou ou não suportado — cai para clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(SHARE_TEXT);
    } catch {
      const el = document.createElement('textarea');
      el.value = SHARE_TEXT;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setShared(true);
    setTimeout(() => setShared(false), 2500);
  };

  return (
  <div
    className="min-h-dvh flex flex-col"
    style={{ backgroundColor: BG, color: '#e8eaf0', fontFamily: 'Inter, sans-serif' }}
  >
    {/* Header */}
    <header
      className="w-full border-b border-zinc-800/60 px-4 py-3"
      style={{ background: 'linear-gradient(to bottom, var(--color-header-bg-start), var(--color-bg))' }}
    >
      <div className="max-w-lg mx-auto flex items-center gap-3">
        <a
          href="/"
          className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white transition-colors rounded-lg"
          aria-label="Voltar ao jogo"
        >
          <ArrowLeft className="w-5 h-5" />
        </a>
        <h1 className="text-lg font-bold tracking-wide text-white">Sobre o Kinto</h1>
      </div>
    </header>

    <main className="flex-1 flex flex-col items-center px-4 py-10 gap-6 max-w-lg mx-auto w-full">

      {/* Hero */}
      <div className="flex flex-col items-center gap-3 text-center mb-2">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: '#6aaa6418', border: '1px solid #6aaa6430' }}
        >
          <Bot className="w-8 h-8" style={{ color: '#6aaa64' }} />
        </div>
        <h2 className="text-2xl font-bold text-white">Um jogo feito por IAs</h2>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
          O Kinto é um Wordle em Português — e um experimento real: ele é desenvolvido e
          mantido por agentes de inteligência artificial autônomos.
        </p>

        {totalGames > 0 && (
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mt-1"
            style={{ backgroundColor: '#6aaa6418', border: '1px solid #6aaa6430' }}
          >
            <Gamepad2 className="w-4 h-4 shrink-0" style={{ color: '#6aaa64' }} />
            <span className="text-sm text-zinc-300">
              <strong className="font-bold text-white">{totalGames.toLocaleString('pt-BR')}</strong>
              {' '}partidas já jogadas
            </span>
          </div>
        )}
      </div>

      {/* O experimento */}
      <Section icon={Brain} iconColor="#a78bfa" title="O experimento">
        <p>
          E se agentes de IA pudessem planejar, priorizar e implementar funcionalidades de um
          produto real — sem intervenção humana no dia a dia?
        </p>
        <p>
          Essa é a hipótese que estamos testando com o Kinto. O jogo existe, tem jogadores
          reais, e cada nova funcionalidade é decidida e codificada por agentes rodando em
          segundo plano.
        </p>
        <p>
          O humano por trás do projeto define a visão geral e garante a infraestrutura.
          O resto — planejamento, desenvolvimento, testes e deploy — é autônomo.
        </p>
      </Section>

      {/* Os agentes */}
      <Section icon={GitMerge} iconColor="#60a5fa" title="Os agentes">
        <p className="pb-1">Dois agentes trabalham em conjunto para manter o Kinto evoluindo:</p>
        <AgentCard
          name="CEO Agent"
          role="Estratégia e planejamento"
          description="Analisa métricas, lê feedback dos jogadores e decide o que construir a seguir. Cria e prioriza os cards no quadro Kanban."
          color="#f59e0b"
        />
        <AgentCard
          name="Dev Agent"
          role="Implementação e qualidade"
          description="Pega os cards do Kanban, escreve o código, roda os testes e faz deploy. Foca em segurança, performance e experiência do usuário."
          color="#6aaa64"
        />
      </Section>

      {/* Como funciona */}
      <Section icon={Zap} iconColor="#f59e0b" title="Como funciona na prática">
        <p>
          Os agentes rodam em horários programados via Windows Task Scheduler. O CEO Agent
          roda uma vez por semana, analisa o estado do produto e agenda o trabalho da semana
          seguinte. O Dev Agent roda diariamente e implementa um card por vez.
        </p>
        <p>
          Todo o histórico de decisões e implementações fica registrado. Você pode acompanhar
          o que foi construído na{' '}
          <a href="/changelog" className="font-semibold underline underline-offset-2" style={{ color: '#6aaa64' }}>
            página de evolução
          </a>
          .
        </p>
      </Section>

      {/* Por que isso importa */}
      <Section icon={BookOpen} iconColor="#34d399" title="Por que isso é interessante">
        <p>
          A maioria dos projetos de IA mostra demos isoladas. O Kinto é diferente: é um produto
          real, com usuários reais, sendo evoluído continuamente por agentes autônomos.
        </p>
        <p>
          Isso permite observar questões práticas: Qual é a qualidade do código produzido?
          Os agentes cometem os mesmos erros que humanos? Como eles lidam com bugs em produção?
          Conseguem manter consistência visual e de UX ao longo do tempo?
        </p>
        <p>
          O experimento está em andamento. Os resultados aparecem no próprio produto.
        </p>
      </Section>

      {/* Perguntas frequentes */}
      <Section icon={HelpCircle} iconColor="#f472b6" title="Perguntas frequentes">
        <div className="flex flex-col gap-2">
          <FaqItem question="As IAs realmente fazem tudo sozinhas?">
            <p>
              No dia a dia, sim. Os agentes planejam, priorizam, escrevem o código, rodam os
              testes e fazem o deploy. O humano por trás cuida da visão geral e da
              infraestrutura, mas não codifica as funcionalidades.
            </p>
          </FaqItem>
          <FaqItem question="Preciso criar conta para jogar?">
            <p>
              Não. É só abrir e jogar. Seu progresso e estatísticas ficam salvos apenas no seu
              próprio navegador.
            </p>
          </FaqItem>
          <FaqItem question="Posso jogar mais de uma vez por dia?">
            <p>
              A palavra do dia é uma só, igual para todo mundo. Mas existe o{' '}
              <strong className="text-zinc-300">Modo Treino</strong>: palavras aleatórias, sem
              limite, que não contam para as estatísticas. Ele aparece na tela de fim de jogo.
            </p>
          </FaqItem>
          <FaqItem question="Como as palavras são escolhidas?">
            <p>
              De uma lista curada de palavras comuns do português. Nomes próprios e sobrenomes
              não entram no sorteio. Há dois modos: 5 e 6 letras.
            </p>
          </FaqItem>
          <FaqItem question="Como acompanho o que os agentes fizeram?">
            <p>
              Cada funcionalidade e correção fica registrada na{' '}
              <a href="/changelog" className="font-semibold underline underline-offset-2" style={{ color: '#6aaa64' }}>
                página de evolução
              </a>
              , em ordem cronológica.
            </p>
          </FaqItem>
        </div>
      </Section>

      {/* CTA links */}
      <div className="w-full flex flex-col gap-3 pt-2">
        <a
          href="/changelog"
          className="w-full flex items-center justify-between px-5 py-4 rounded-xl font-semibold text-sm transition-colors"
          style={{ backgroundColor: '#6aaa6418', border: '1px solid #6aaa6430', color: '#6aaa64' }}
        >
          <span>Ver o que os agentes construíram</span>
          <span aria-hidden>→</span>
        </a>
        <a
          href="/apoie"
          className="w-full flex items-center justify-between px-5 py-4 rounded-xl font-semibold text-sm transition-colors"
          style={{ backgroundColor: '#b4530918', border: '1px solid #b4530930', color: '#f59e0b' }}
        >
          <span>Apoiar o experimento</span>
          <span aria-hidden>→</span>
        </a>
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl font-semibold text-sm transition-colors"
          style={{ backgroundColor: '#60a5fa18', border: '1px solid #60a5fa30', color: '#60a5fa' }}
        >
          <Share2 className="w-4 h-4 shrink-0" />
          {shared ? 'Link copiado!' : 'Compartilhe a jornada'}
        </button>
      </div>

      <p className="text-xs text-zinc-600 text-center leading-relaxed pt-2">
        Feito com curiosidade — e um pouco de fé na IA ·{' '}
        <a href="/" className="underline underline-offset-2 hover:text-zinc-400 transition-colors">
          Jogar agora
        </a>
      </p>
    </main>
  </div>
  );
};

export default SobreApp;
