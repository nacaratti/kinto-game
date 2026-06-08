import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Clock, X, ChevronRight, MessageSquare, Flame, Coffee, Trophy, UserPlus, Dumbbell } from 'lucide-react';
import { getDailyResults } from '@/lib/stats';
import { getDailyResults6 } from '@/lib/stats6';
import { getTodayDateStr } from '@/lib/wordOfDay';
import { getStreak, getBestStreak, getPersonalHistory, isVeteran, DAILY_KEY_5, DAILY_KEY_6 } from '@/lib/streak';
import { buildShareText, buildChallengeText } from '@/lib/shareText';
import { GAME_MODES } from '@/config/gameModes';
import { MAX_GUESSES } from '@/config/constants';
import { submitComment, hasSubmittedComment } from '@/lib/comments';

const BouncingCoffee = () => {
  const ref = useRef(null);
  const state = useRef({
    x: Math.random() * 80 + 10,
    y: Math.random() * 80 + 10,
    vx: (Math.random() > 0.5 ? 1 : -1) * (0.6 + Math.random() * 0.4),
    vy: (Math.random() > 0.5 ? 1 : -1) * (0.6 + Math.random() * 0.4),
  });
  const raf = useRef(null);

  const animate = useCallback(() => {
    const s = state.current;
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    const pw = parent.clientWidth;
    const ph = parent.clientHeight;
    const size = 56;

    s.x += s.vx;
    s.y += s.vy;

    if (s.x <= 0 || s.x >= pw - size) {
      s.vx *= -1;
      s.x = Math.max(0, Math.min(s.x, pw - size));
    }
    if (s.y <= 0 || s.y >= ph - size) {
      s.vy *= -1;
      s.y = Math.max(0, Math.min(s.y, ph - size));
    }

    el.style.transform = `translate(${s.x}px, ${s.y}px)`;
    raf.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [animate]);

  return (
    <a
      ref={ref}
      href="/apoie"
      onClick={(e) => e.stopPropagation()}
      className="absolute top-0 left-0 z-10 w-14 h-14 flex items-center justify-center bg-amber-900/20 border border-amber-800/30 hover:bg-amber-900/40 rounded-2xl shadow-xl transition-colors"
      aria-label="Apoiar o Kinto"
      style={{ willChange: 'transform' }}
    >
      <Coffee className="w-7 h-7 text-amber-400" />
    </a>
  );
};

const useCountdown = () => {
  const getSecondsLeft = () => {
    const now = Date.now();
    const brasilia = new Date(now - 3 * 60 * 60 * 1000);
    const nextMidnight = Date.UTC(
      brasilia.getUTCFullYear(),
      brasilia.getUTCMonth(),
      brasilia.getUTCDate() + 1,
      3, 0, 0
    );
    return Math.max(0, Math.floor((nextMidnight - now) / 1000));
  };
  const [seconds, setSeconds] = useState(getSecondsLeft);
  useEffect(() => {
    const id = setInterval(() => setSeconds(getSecondsLeft()), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const CommentBox = ({ dateStr, solution, mode, isGameWon, currentAttempt, maxGuesses }) => {
  const modeId = mode?.id === 'classic' ? '5' : '6';
  const alreadySubmitted = hasSubmittedComment(dateStr, modeId);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [status, setStatus] = useState(alreadySubmitted ? 'done' : 'idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setStatus('loading');
    const result = await submitComment({
      dateStr,
      word: solution,
      mode: modeId,
      comment: text,
      won: isGameWon,
      attempts: isGameWon ? currentAttempt + 1 : maxGuesses,
      authorName: authorName.trim() || null,
      isAuthenticated: false,
    });
    setStatus(result.ok ? (result.needsApproval ? 'pending' : 'done') : 'error');
  };

  if (status === 'done') {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-800/40 px-4 py-3 text-center">
        <p className="text-sm text-zinc-400">Obrigado pelo comentário!</p>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-800/40 px-4 py-3 text-center">
        <p className="text-sm text-zinc-400">Obrigado pelo comentário!</p>
        <p className="text-xs text-zinc-600 mt-1">Seu comentário será exibido após aprovação do admin.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-800/40 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-zinc-400 hover:text-white transition-colors"
      >
        <MessageSquare className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Deixe um comentário sobre o jogo</span>
        <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <form onSubmit={handleSubmit} className="border-t border-zinc-800 px-4 pb-4 pt-3 flex flex-col gap-2">
          <input
            value={authorName}
            onChange={e => setAuthorName(e.target.value.slice(0, 50))}
            placeholder="Seu nome (opcional — deixe vazio para anônimo)"
            className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 bg-zinc-900 border border-zinc-700 outline-none focus:border-zinc-500 transition-colors"
          />
          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, 300))}
            placeholder="O que achou da palavra de hoje? Sugestões?"
            rows={3}
            className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 bg-zinc-900 border border-zinc-700 outline-none resize-none focus:border-zinc-500 transition-colors"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-zinc-600">{text.length}/300</span>
            {status === 'error' && (
              <span className="text-xs text-red-400">Erro ao enviar. Tente novamente.</span>
            )}
            <button
              type="submit"
              disabled={!text.trim() || status === 'loading'}
              className="bg-white hover:bg-zinc-100 text-black text-sm font-bold px-4 py-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Enviando…' : 'Enviar'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const GameStatus = ({
  isGameWon,
  solution,
  currentAttempt,
  submittedGuessesInfo,
  isOpen,
  onClose,
  maxGuesses = MAX_GUESSES,
  currentMode,
  hardMode = false,
  onTraining,
}) => {
  const [copied, setCopied] = useState(false);
  const [challengeCopied, setChallengeCopied] = useState(false);
  const [todayResults, setTodayResults] = useState([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [personalHistory, setPersonalHistory] = useState([]);

  const countdown = useCountdown();
  const today = getTodayDateStr();

  useEffect(() => {
    if (!isOpen) return;
    const fn = currentMode.id === 'classic' ? getDailyResults : getDailyResults6;
    fn(today, solution).then(setTodayResults);
    // Ler best ANTES de getStreak(), que atualiza _bsk quando streak > best.
    // Assim bestStreak reflete o recorde anterior e streak > bestStreak indica
    // verdadeiro recorde novo (não apenas igualar o antigo).
    const prevBest = getBestStreak();
    const current = getStreak();
    setStreak(current);
    setBestStreak(prevBest);
    const modeKey = currentMode.id === 'classic' ? DAILY_KEY_5 : DAILY_KEY_6;
    setPersonalHistory(getPersonalHistory(30, modeKey));
  }, [isOpen, today]); // eslint-disable-line react-hooks/exhaustive-deps

  const buildShareTextLocal = () =>
    buildShareText({ isGameWon, currentAttempt, maxGuesses, submittedGuessesInfo, currentMode, hardMode, today, streak });

  const handleShare = async () => {
    const text = buildShareTextLocal();
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // user cancelled or not supported — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard API blocked — fallback via execCommand
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChallenge = async () => {
    const text = buildChallengeText({ currentAttempt, maxGuesses, submittedGuessesInfo, currentMode });
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // user cancelled or not supported — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setChallengeCopied(true);
    setTimeout(() => setChallengeCopied(false), 2000);
  };

  const distribution = {};
  for (let i = 1; i <= maxGuesses; i++) distribution[i] = 0;
  distribution.X = 0;
  for (const r of todayResults) {
    if (r.won) distribution[r.attempts] = (distribution[r.attempts] || 0) + 1;
    else distribution.X = (distribution.X || 0) + 1;
  }
  const maxVal = Math.max(...Object.values(distribution), 1);

  const otherModes = GAME_MODES.filter((m) => m.id !== currentMode.id);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm"
        >
          {/* Botão flutuante cafezinho — DVD bounce */}
          <BouncingCoffee />

          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-sm bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 pb-8 sm:pb-6 space-y-5 max-h-[90dvh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-600 hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Result */}
            <div className="text-center pt-1">
              {isGameWon ? (
                <>
                  <p className="text-4xl mb-1">🎉</p>
                  <h2 className="text-xl font-bold text-white">Você acertou!</h2>
                  <p className="text-zinc-500 text-sm mt-1">
                    em <span className="text-white font-semibold">{currentAttempt + 1}/{maxGuesses}</span> tentativa{currentAttempt + 1 !== 1 ? 's' : ''}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-4xl mb-1">😔</p>
                  <h2 className="text-xl font-bold text-white">Não foi dessa vez</h2>
                  <p className="text-zinc-500 text-sm mt-1">
                    A palavra era <span className="text-white font-bold tracking-widest">{solution}</span>
                  </p>
                </>
              )}
              {isGameWon && (
                <p className="text-zinc-500 text-sm mt-0.5">
                  A palavra era <span className="text-white font-bold tracking-widest">{solution}</span>
                </p>
              )}
            </div>

            {/* Streak */}
            {streak >= 2 && (
              <div className="flex items-center justify-center gap-2 rounded-xl theme-badge-present border py-2.5 px-4">
                <Flame className="h-5 w-5 theme-text-present shrink-0" />
                <div className="text-center">
                  <p className="text-sm font-bold theme-text-present">
                    {streak > bestStreak ? `🏆 Novo recorde! ${streak} dias seguidos!` : `${streak} dias seguidos!`}
                  </p>
                  {bestStreak > streak && (
                    <p className="text-[10px] theme-text-present opacity-60 mt-0.5">Recorde: {bestStreak} dias</p>
                  )}
                </div>
              </div>
            )}

            {/* Badge Veterano — núcleo fiel (streak atual ou recorde ≥ 20 dias).
                Visual dourado distinto do badge verde de streak. */}
            {isVeteran(streak, bestStreak) && (
              <div
                className="flex items-center justify-center gap-2 rounded-xl border py-2.5 px-4"
                style={{ backgroundColor: 'rgba(245,197,24,0.10)', borderColor: 'rgba(245,197,24,0.35)' }}
              >
                <Trophy className="h-5 w-5 shrink-0" style={{ color: '#f5c518' }} />
                <div className="text-center">
                  <p className="text-sm font-bold" style={{ color: '#f5c518' }}>Jogador Veterano</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#f5c518', opacity: 0.7 }}>
                    {Math.max(streak, bestStreak)} dias de dedicação ao Kinto
                  </p>
                </div>
              </div>
            )}

            {/* Share */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-100 text-black font-bold py-3 rounded-xl transition-colors text-sm"
              >
                <Share2 className="h-4 w-4" />
                {copied ? 'Copiado!' : 'Compartilhar'}
              </button>
              {isGameWon && (
                <button
                  onClick={handleChallenge}
                  className="w-full flex items-center justify-center gap-2 border border-emerald-700/60 bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-300 font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  <UserPlus className="h-4 w-4" />
                  {challengeCopied ? 'Link copiado!' : 'Desafiar um amigo'}
                </button>
              )}
            </div>

            {/* Other modes */}
            {otherModes.map((mode) => (
              <a
                key={mode.id}
                href={mode.path}
                className="flex items-center justify-between w-full rounded-xl border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 transition-colors px-4 py-3.5 group"
              >
                <div>
                  <p className="text-sm font-semibold text-white">Jogar {mode.label}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{mode.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors shrink-0" />
              </a>
            ))}

            {/* Apoiar o Kinto */}
            <a
              href="/apoie"
              className="flex items-center justify-between w-full rounded-xl border border-amber-800/40 bg-amber-900/15 hover:bg-amber-900/30 transition-colors px-4 py-3.5 group"
            >
              <div className="flex items-center gap-3">
                <Coffee className="h-5 w-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">Apoiar o Kinto</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Ajude o experimento com um cafézinho via Pix</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-amber-500/70 group-hover:text-amber-300 transition-colors shrink-0" />
            </a>

            {/* Modo Treino — palavras aleatórias, sem contar para estatísticas */}
            {onTraining && (
              <button
                onClick={onTraining}
                className="flex items-center justify-between w-full rounded-xl border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 transition-colors px-4 py-3.5 group"
              >
                <div className="flex items-center gap-3">
                  <Dumbbell className="h-5 w-5 text-zinc-400 shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">Modo Treino</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Palavras aleatórias · sem limite diário</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors shrink-0" />
              </button>
            )}

            {/* Ranking */}
            {todayResults.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-3 text-center">
                  Ranking de hoje · {todayResults.length} {todayResults.length === 1 ? 'jogo' : 'jogos'}
                </p>
                <div className="space-y-1.5">
                  {Array.from({ length: maxGuesses }, (_, i) => i + 1).map(n => {
                    const count = distribution[n] || 0;
                    const pct = Math.round((count / maxVal) * 100);
                    const isMine = isGameWon && currentAttempt + 1 === n;
                    return (
                      <div key={n} className="flex items-center gap-2 text-xs">
                        <span className="text-zinc-600 w-4 text-right shrink-0">{n}</span>
                        <div className="flex-1 bg-zinc-800 rounded-sm h-5 overflow-hidden">
                          <div
                            className={`h-5 rounded-sm flex items-center justify-end pr-2 transition-all duration-500 ${
                              isMine ? 'bg-white' : 'theme-bg-correct'
                            }`}
                            style={{ width: `${Math.max(pct, count > 0 ? 10 : 0)}%` }}
                          >
                            {count > 0 && (
                              <span className={`text-xs font-bold ${isMine ? 'text-black' : 'text-white'}`}>{count}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {distribution.X > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-zinc-600 w-4 text-right shrink-0">✗</span>
                      <div className="flex-1 bg-zinc-800 rounded-sm h-5 overflow-hidden">
                        <div
                          className={`h-5 rounded-sm flex items-center justify-end pr-2 transition-all duration-500 ${!isGameWon ? 'bg-white' : 'bg-zinc-600'}`}
                          style={{ width: `${Math.max(Math.round((distribution.X / maxVal) * 100), 10)}%` }}
                        >
                          <span className={`text-xs font-bold ${!isGameWon ? 'text-black' : 'text-white'}`}>{distribution.X}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Personal history grid */}
            {personalHistory.some(h => h.status !== null) && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-2 text-center">
                  Seus últimos 30 dias
                </p>
                <div className="grid grid-cols-10 gap-1">
                  {personalHistory.map(({ date, status }) => (
                    <div
                      key={date}
                      title={date}
                      className={`aspect-square rounded-sm ${
                        status === 'won'
                          ? 'theme-bg-correct'
                          : status === 'lost'
                          ? 'bg-red-900/50'
                          : 'bg-zinc-800/70'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 mt-2">
                  {[
                    { cls: 'theme-bg-correct', label: 'Acertou' },
                    { cls: 'bg-red-900/50', label: 'Errou' },
                    { cls: 'bg-zinc-800/70', label: 'Não jogou' },
                  ].map(({ cls, label }) => (
                    <span key={label} className="flex items-center gap-1 text-[10px] text-zinc-600">
                      <span className={`w-2.5 h-2.5 rounded-sm shrink-0 ${cls}`} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Comment */}
            <CommentBox
              dateStr={today}
              solution={solution}
              mode={currentMode}
              isGameWon={isGameWon}
              currentAttempt={currentAttempt}
              maxGuesses={maxGuesses}
            />

            {/* Countdown */}
            <div className="flex items-center justify-center gap-1.5 text-zinc-600 text-xs">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Próxima palavra em <strong className="text-zinc-400">{countdown}</strong></span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameStatus;
