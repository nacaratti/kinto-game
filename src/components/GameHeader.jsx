import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Settings2, X, Check, ScrollText, MessageCircle, Palette, Flame, Info } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { getStats } from '@/lib/stats';
import { getBestStreak } from '@/lib/streak';

const ExampleTile = ({ letter, status }) => {
  const cls = {
    correct: 'bg-[#6aaa64] border-[#6aaa64] text-white',
    present: 'bg-[#c9a84c] border-[#c9a84c] text-white',
    absent:  'bg-[#383b4a] border-[#383b4a] text-[#676a7a]',
  }[status];
  return (
    <span className={`inline-flex items-center justify-center w-9 h-9 border-2 font-bold text-sm ${cls}`}
      style={{ borderRadius: 3 }}>
      {letter}
    </span>
  );
};

const InstructionsModal = ({ onClose, currentMode }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <div className="absolute inset-0 bg-black/80" />
    <motion.div
      className="relative w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6 text-zinc-200"
      initial={{ scale: 0.94, opacity: 0, y: 8 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.94, opacity: 0, y: 8 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold tracking-widest text-white uppercase">Como jogar</h2>
        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors" aria-label="Fechar">
          <X className="w-5 h-5" />
        </button>
      </div>

      <ul className="space-y-2 text-sm mb-5 text-zinc-400 list-disc list-inside leading-relaxed">
        <li>Adivinhe a palavra oculta em <span className="text-white font-semibold">{currentMode.maxGuesses} tentativas</span>.</li>
        <li>A palavra tem exatamente <span className="text-white font-semibold">{currentMode.wordLength} letras</span>.</li>
        <li>Cada chute deve ser uma palavra válida do dicionário.</li>
        <li>Use <span className="text-white font-semibold">ENTER</span> (direita) para confirmar e <span className="text-white font-semibold">⌫</span> (esquerda) para apagar.</li>
      </ul>

      <div className="border-t border-zinc-800 pt-4 mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Exemplos</p>
        <div className="space-y-4 text-sm">
          <div>
            <div className="flex gap-1.5 mb-1.5">
              <ExampleTile letter="T" status="correct" />
              <ExampleTile letter="E" status="absent" />
              <ExampleTile letter="M" status="absent" />
              <ExampleTile letter="P" status="absent" />
              <ExampleTile letter="O" status="absent" />
            </div>
            <p className="text-zinc-400"><span className="text-[#6aaa64] font-semibold">T</span> está na posição correta.</p>
          </div>
          <div>
            <div className="flex gap-1.5 mb-1.5">
              <ExampleTile letter="V" status="absent" />
              <ExampleTile letter="E" status="present" />
              <ExampleTile letter="R" status="absent" />
              <ExampleTile letter="D" status="absent" />
              <ExampleTile letter="E" status="absent" />
            </div>
            <p className="text-zinc-400"><span className="text-[#c9a84c] font-semibold">E</span> está na palavra, mas em outra posição.</p>
          </div>
          <div>
            <div className="flex gap-1.5 mb-1.5">
              <ExampleTile letter="F" status="absent" />
              <ExampleTile letter="O" status="absent" />
              <ExampleTile letter="R" status="absent" />
              <ExampleTile letter="T" status="absent" />
              <ExampleTile letter="E" status="absent" />
            </div>
            <p className="text-zinc-400"><span className="text-zinc-500 font-semibold">F, O, R, T, E</span> não estão na palavra.</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-600 text-center mb-5">
        Uma nova palavra todos os dias. <span className="text-white font-semibold">Uma tentativa por dia</span> — use bem!
      </p>

      <button
        onClick={onClose}
        className="w-full bg-white hover:bg-zinc-100 text-black font-bold py-3 rounded-xl transition-colors text-sm"
      >
        Jogar
      </button>
    </motion.div>
  </motion.div>
);

const StatsModal = ({ onClose, streak }) => {
  const stats = getStats();
  const bestStreak = getBestStreak();
  const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0;
  const maxDist = Math.max(...Object.values(stats.distribution), 1);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80" />
      <motion.div
        className="relative w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6 text-zinc-200"
        initial={{ scale: 0.94, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 8 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold tracking-widest text-white uppercase">Estatísticas</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="text-center rounded-lg p-3 bg-zinc-800">
            <p className="text-3xl font-black text-orange-400">{streak} 🔥</p>
            <p className="text-xs text-zinc-500 mt-1">Sequência atual</p>
          </div>
          <div className="text-center rounded-lg p-3 bg-zinc-800">
            <p className="text-3xl font-black text-white">{bestStreak}</p>
            <p className="text-xs text-zinc-500 mt-1">Melhor sequência</p>
          </div>
          <div className="text-center rounded-lg p-3 bg-zinc-800">
            <p className="text-3xl font-black text-white">{stats.totalGames}</p>
            <p className="text-xs text-zinc-500 mt-1">Jogos</p>
          </div>
          <div className="text-center rounded-lg p-3 bg-zinc-800">
            <p className="text-3xl font-black text-white">{winRate}%</p>
            <p className="text-xs text-zinc-500 mt-1">Vitórias</p>
          </div>
        </div>

        {stats.totalGames > 0 && (
          <div className="border-t border-zinc-800 pt-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Tentativas</p>
            <div className="space-y-1.5">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 w-3 shrink-0">{n}</span>
                  <div className="flex-1 bg-zinc-800 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-[#6aaa64] rounded-full flex items-center justify-end pr-2 min-w-[20px] transition-all"
                      style={{ width: `${Math.max(8, (stats.distribution[n] / maxDist) * 100)}%` }}
                    >
                      {stats.distribution[n] > 0 && (
                        <span className="text-[10px] font-bold text-white leading-none">{stats.distribution[n]}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const SobreModal = ({ onClose }) => {
  const whatsappUrl = `https://wa.me/5521985822715?text=${encodeURIComponent("Olá! Quero falar com você sobre o jogo Kinto.")}`;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80" />
      <motion.div
        className="relative w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6 text-zinc-200"
        initial={{ scale: 0.94, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 8 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold tracking-widest text-white uppercase flex items-center gap-2">
            <Info className="w-5 h-5 text-[#6aaa64]" />
            Sobre o Kinto
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors" aria-label="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm text-zinc-400 leading-relaxed mb-6">
          <p>
            O <strong className="text-white">Kinto</strong> é um jogo de palavras diário em português, inspirado no Wordle, mas com uma grande diferença: ele é um <strong className="text-white">experimento real de desenvolvimento autônomo</strong>.
          </p>
          <p>
            O jogo é mantido e evoluído por dois agentes de Inteligência Artificial colaborativos (o CEO Agent e o Dev Agent), que planejam, implementam novas funcionalidades e corrigem erros com supervisão humana mínima.
          </p>
          <p>
            Desenvolvido por <strong className="text-white">Davi Pontes Nacaratti</strong>. Quer dar um feedback, sugerir ideias ou saber mais sobre o projeto? Entre em contato!
          </p>
          <div className="border-t border-zinc-800 pt-3 mt-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Contatos</p>
            <p className="text-xs text-zinc-400">
              E-mail: <a href="mailto:davinacaratti@gmail.com" className="text-white hover:underline">davinacaratti@gmail.com</a>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20ba56] text-black font-bold py-3 rounded-xl transition-colors text-sm text-center flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.488 1.449 5.407 1.451 5.517.002 10.003-4.484 10.006-10.007.002-2.675-1.039-5.19-2.928-7.081-1.89-1.89-4.405-2.93-7.084-2.931-5.52 0-10.005 4.485-10.008 10.009-.001 1.92.501 3.793 1.453 5.4l-.993 3.626 3.71-.973zm11.758-5.321c-.328-.164-1.944-.96-2.242-1.068-.298-.108-.515-.164-.73.164-.216.329-.838 1.068-1.026 1.284-.188.217-.377.243-.705.079-.328-.164-1.386-.511-2.641-1.63-1.002-.894-1.678-2.001-1.875-2.33-.197-.329-.021-.508.143-.671.148-.147.328-.385.493-.578.164-.193.219-.329.329-.548.11-.219.055-.412-.028-.577-.082-.164-.73-1.758-1.001-2.411-.264-.635-.533-.55-.73-.55-.188-.009-.404-.01-.62-.01-.216 0-.569.082-.867.411-.298.329-1.139 1.115-1.139 2.72 0 1.605 1.168 3.155 1.328 3.372.162.217 2.298 3.51 5.568 4.921.777.336 1.384.537 1.857.687.781.249 1.492.214 2.054.13.627-.094 1.944-.795 2.216-1.564.272-.769.272-1.428.19-1.563-.081-.135-.298-.217-.626-.381z"/>
            </svg>
            Falar no WhatsApp
          </a>
          <button
            onClick={onClose}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            Voltar ao jogo
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const _TUTORIAL_KEY = '_kw';

const GameHeader = ({ allModes, currentMode, onModeChange, theme, setTheme, themes, hardMode, setHardMode, streak = 0 }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSobre, setShowSobre] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(_TUTORIAL_KEY)) setShowInfo(true);
    } catch {
      setShowInfo(true);
    }
  }, []);
  const [showModes, setShowModes] = useState(false);
  const isMobile = useIsMobile();
  const gearRef = useRef(null);
  const modeMenuRef = useRef(null);

  useEffect(() => {
    if (!showModes || isMobile) return;
    const handler = (e) => {
      if (
        gearRef.current && !gearRef.current.contains(e.target) &&
        modeMenuRef.current && !modeMenuRef.current.contains(e.target)
      ) setShowModes(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showModes, isMobile]);

  useEffect(() => {
    if (!showModes) return;
    const handler = (e) => { if (e.key === 'Escape') setShowModes(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showModes]);

  const handleModeSelect = (mode) => {
    onModeChange(mode);
    setShowModes(false);
  };

  return (
    <>
      <header className="w-full border-b border-zinc-800/60" style={{ background: 'linear-gradient(to bottom, var(--color-header-bg-start), var(--color-bg))' }}>
        <div className="flex items-center justify-between max-w-lg mx-auto w-full px-3 py-3">

          {/* Esquerda: ajuda + changelog + badge de streak */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowInfo(true)}
              className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white transition-colors rounded-lg"
              aria-label="Como jogar"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <a
              href="/changelog"
              className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white transition-colors rounded-lg"
              aria-label="Novidades"
              title="Novidades"
            >
              <ScrollText className="w-5 h-5" />
            </a>
            {streak >= 2 && (
              <button
                onClick={() => setShowStats(true)}
                className="flex items-center gap-0.5 h-9 px-2 text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors rounded-lg"
                aria-label={`Sequência de ${streak} dias`}
                title={`Sequência de ${streak} dias`}
              >
                <span>🔥</span>
                <span>{streak}</span>
              </button>
            )}
          </div>

          {/* Centro: título */}
          <h1 className="relative text-2xl sm:text-3xl font-black tracking-[0.25em] text-white uppercase select-none">
            Kinto
          </h1>

          {/* Direita: comentários + configurações de modo */}
          <div className="flex items-center gap-1 relative">
            <a
              href="/comments"
              className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white transition-colors rounded-lg"
              aria-label="Comentários"
              title="Comentários"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            <button
              ref={gearRef}
              onClick={() => setShowModes((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={showModes}
              aria-label="Modo de jogo"
              className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white transition-colors rounded-lg"
            >
              <motion.span
                animate={{ rotate: showModes ? 60 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="flex"
              >
                <Settings2 className="w-5 h-5" />
              </motion.span>
            </button>

            {/* Dropdown — desktop */}
            <AnimatePresence>
              {showModes && !isMobile && (
                <motion.div
                  ref={modeMenuRef}
                  role="menu"
                  className="absolute right-0 top-full mt-2 z-50 min-w-[210px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden"
                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-4 pt-3 pb-1">
                    Modo de jogo
                  </p>
                  {allModes.map((mode) => (
                    <button
                      key={mode.id}
                      role="menuitem"
                      onClick={() => handleModeSelect(mode)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                        currentMode.id === mode.id
                          ? 'bg-zinc-800 text-white'
                          : 'text-zinc-400 hover:bg-zinc-800/70 hover:text-white'
                      }`}
                    >
                      <span className="flex flex-col">
                        <span className="font-semibold text-sm">{mode.label}</span>
                        <span className="text-xs text-zinc-500 mt-0.5">{mode.description}</span>
                      </span>
                      {currentMode.id === mode.id && (
                        <Check className="w-4 h-4 text-[#6aaa64] ml-4 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                  {themes && (
                    <>
                      <div className="border-t border-zinc-800 mt-1" />
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-4 pt-3 pb-1 flex items-center gap-1.5">
                        <Palette className="w-3 h-3" /> Tema
                      </p>
                      {themes.map((t) => (
                        <button
                          key={t.id}
                          role="menuitem"
                          onClick={() => { setTheme(t.id); }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
                            theme === t.id
                              ? 'bg-zinc-800 text-white'
                              : 'text-zinc-400 hover:bg-zinc-800/70 hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span
                              className="w-4 h-4 rounded-full border border-zinc-600 flex-shrink-0"
                              style={{ backgroundColor: t.preview }}
                            />
                            <span className="flex flex-col">
                              <span className="font-semibold text-sm">{t.label}</span>
                              <span className="text-xs text-zinc-500 mt-0.5">{t.description}</span>
                            </span>
                          </span>
                          {theme === t.id && (
                            <Check className="w-4 h-4 text-[#6aaa64] ml-4 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </>
                  )}
                  {setHardMode && (
                    <>
                      <div className="border-t border-zinc-800 mt-1" />
                      <button
                        role="menuitem"
                        onClick={() => setHardMode(!hardMode)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                          hardMode ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/70 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Flame className="w-4 h-4 flex-shrink-0" />
                          <span className="flex flex-col">
                            <span className="font-semibold text-sm">Modo difícil</span>
                            <span className="text-xs text-zinc-500 mt-0.5">Use as dicas reveladas</span>
                          </span>
                        </span>
                        {hardMode && <Check className="w-4 h-4 text-[#6aaa64] ml-4 flex-shrink-0" />}
                      </button>
                    </>
                  )}
                  <div className="border-t border-zinc-800 mt-1" />
                  <button
                    role="menuitem"
                    onClick={() => {
                      setShowSobre(true);
                      setShowModes(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors rounded-b-xl text-zinc-400 hover:bg-zinc-800/70 hover:text-white"
                  >
                    <Info className="w-4 h-4 flex-shrink-0 text-[#6aaa64]" />
                    <span className="flex flex-col">
                      <span className="font-semibold text-sm">Sobre o Kinto</span>
                      <span className="text-xs text-zinc-500 mt-0.5">O experimento e contatos</span>
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Bottom sheet — mobile */}
      <AnimatePresence>
        {showModes && isMobile && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-stretch justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowModes(false)}
          >
            <div className="absolute inset-0 bg-black/70" />
            <motion.div
              role="menu"
              className="relative bg-zinc-900 border-t border-zinc-700 rounded-t-2xl overflow-hidden"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-zinc-700" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 text-center pt-2 pb-3">
                Configurações
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 px-6 pb-1">
                Modo de jogo
              </p>
              {allModes.map((mode) => (
                <button
                  key={mode.id}
                  role="menuitem"
                  onClick={() => handleModeSelect(mode)}
                  className={`w-full flex items-center justify-between px-6 py-4 text-left border-t border-zinc-800 transition-colors active:bg-zinc-800 ${
                    currentMode.id === mode.id
                      ? 'bg-zinc-800/60 text-white'
                      : 'text-zinc-400'
                  }`}
                >
                  <span className="flex flex-col">
                    <span className="font-semibold text-base">{mode.label}</span>
                    <span className="text-sm text-zinc-500 mt-0.5">{mode.description}</span>
                  </span>
                  {currentMode.id === mode.id && (
                    <Check className="w-5 h-5 text-[#6aaa64]" />
                  )}
                </button>
              ))}

              {themes && (
                <>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 px-6 pt-4 pb-1 flex items-center gap-1.5">
                    <Palette className="w-3 h-3" /> Tema
                  </p>
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      role="menuitem"
                      onClick={() => { setTheme(t.id); }}
                      className={`w-full flex items-center justify-between px-6 py-4 text-left border-t border-zinc-800 transition-colors active:bg-zinc-800 ${
                        theme === t.id
                          ? 'bg-zinc-800/60 text-white'
                          : 'text-zinc-400'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className="w-5 h-5 rounded-full border border-zinc-600 flex-shrink-0"
                          style={{ backgroundColor: t.preview }}
                        />
                        <span className="flex flex-col">
                          <span className="font-semibold text-base">{t.label}</span>
                          <span className="text-sm text-zinc-500 mt-0.5">{t.description}</span>
                        </span>
                      </span>
                      {theme === t.id && (
                        <Check className="w-5 h-5 text-[#6aaa64]" />
                      )}
                    </button>
                  ))}
                </>
              )}
              {setHardMode && (
                <>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 px-6 pt-4 pb-1 flex items-center gap-1.5">
                    <Flame className="w-3 h-3" /> Dificuldade
                  </p>
                  <button
                    role="menuitem"
                    onClick={() => setHardMode(!hardMode)}
                    className={`w-full flex items-center justify-between px-6 py-4 text-left border-t border-zinc-800 transition-colors active:bg-zinc-800 ${
                      hardMode ? 'bg-zinc-800/60 text-white' : 'text-zinc-400'
                    }`}
                  >
                    <span className="flex flex-col">
                      <span className="font-semibold text-base">Modo difícil</span>
                      <span className="text-sm text-zinc-500 mt-0.5">Use as dicas reveladas</span>
                    </span>
                    {hardMode && <Check className="w-5 h-5 text-[#6aaa64]" />}
                  </button>
                </>
              )}
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 px-6 pt-4 pb-1 flex items-center gap-1.5">
                <Info className="w-3 h-3" /> Ajuda & Info
              </p>
              <button
                role="menuitem"
                onClick={() => {
                  setShowSobre(true);
                  setShowModes(false);
                }}
                className="w-full flex items-center justify-between px-6 py-4 text-left border-t border-zinc-800 transition-colors active:bg-zinc-800 text-zinc-400"
              >
                <span className="flex flex-col">
                  <span className="font-semibold text-base">Sobre o Kinto</span>
                  <span className="text-sm text-zinc-500 mt-0.5">Conheça o experimento e contatos</span>
                </span>
              </button>
              <div className="pb-8" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de instruções */}
      <AnimatePresence>
        {showInfo && (
        <InstructionsModal
          onClose={() => {
            setShowInfo(false);
            try { localStorage.setItem(_TUTORIAL_KEY, '1'); } catch {}
          }}
          currentMode={currentMode}
        />
      )}
      </AnimatePresence>

      {/* Modal de estatísticas */}
      <AnimatePresence>
        {showStats && (
          <StatsModal onClose={() => setShowStats(false)} streak={streak} />
        )}
      </AnimatePresence>

      {/* Modal Sobre */}
      <AnimatePresence>
        {showSobre && (
          <SobreModal onClose={() => setShowSobre(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default GameHeader;
