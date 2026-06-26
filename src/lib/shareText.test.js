import { describe, it, expect } from 'vitest';
import { buildShareText, buildChallengeText, buildSocialShareUrl } from './shareText.js';

const MODE_5 = { id: 'classic', label: '5 letras', path: '/' };
const MODE_6 = { id: 'challenge', label: '6 letras', path: '/6' };

const guessRow = (statuses) => statuses.map(s => ({ status: s }));

describe('buildShareText', () => {
  it('inclui o URL do jogo de 5 letras', () => {
    const text = buildShareText({
      isGameWon: true, currentAttempt: 2, maxGuesses: 6,
      submittedGuessesInfo: [], currentMode: MODE_5,
      hardMode: false, today: '2026-05-18', streak: 0,
    });
    expect(text).toContain('https://kinto.fun');
    expect(text).not.toContain('https://kinto.fun/6');
  });

  it('inclui o URL do jogo de 6 letras', () => {
    const text = buildShareText({
      isGameWon: true, currentAttempt: 3, maxGuesses: 7,
      submittedGuessesInfo: [], currentMode: MODE_6,
      hardMode: false, today: '2026-05-18', streak: 0,
    });
    expect(text).toContain('https://kinto.fun/6');
  });

  it('exibe resultado de vitória com tentativas', () => {
    const text = buildShareText({
      isGameWon: true, currentAttempt: 1, maxGuesses: 6,
      submittedGuessesInfo: [], currentMode: MODE_5,
      hardMode: false, today: '2026-06-03', streak: 0,
    });
    expect(text).toContain('2/6');
  });

  it('exibe resultado de derrota com X', () => {
    const text = buildShareText({
      isGameWon: false, currentAttempt: 5, maxGuesses: 6,
      submittedGuessesInfo: [], currentMode: MODE_5,
      hardMode: false, today: '2026-06-03', streak: 0,
    });
    expect(text).toContain('X/6');
  });

  it('inclui emojis corretos na grade', () => {
    const guesses = [
      guessRow(['correct', 'present', 'absent', 'correct', 'correct']),
    ];
    const text = buildShareText({
      isGameWon: true, currentAttempt: 0, maxGuesses: 6,
      submittedGuessesInfo: guesses, currentMode: MODE_5,
      hardMode: false, today: '2026-06-03', streak: 0,
    });
    expect(text).toContain('🟢🟡⚫🟢🟢');
  });

  it('inclui label do modo 6 letras no texto', () => {
    const text = buildShareText({
      isGameWon: true, currentAttempt: 2, maxGuesses: 7,
      submittedGuessesInfo: [], currentMode: MODE_6,
      hardMode: false, today: '2026-06-03', streak: 0,
    });
    expect(text).toContain('(6 letras)');
  });

  it('nao inclui label de modo no jogo classico', () => {
    const text = buildShareText({
      isGameWon: true, currentAttempt: 2, maxGuesses: 6,
      submittedGuessesInfo: [], currentMode: MODE_5,
      hardMode: false, today: '2026-06-03', streak: 0,
    });
    expect(text).not.toContain('(');
  });

  it('inclui sufixo de modo difícil quando ativo', () => {
    const text = buildShareText({
      isGameWon: true, currentAttempt: 2, maxGuesses: 6,
      submittedGuessesInfo: [], currentMode: MODE_5,
      hardMode: true, today: '2026-06-03', streak: 0,
    });
    expect(text).toContain(' *');
  });

  it('inclui emoji de streak quando streak >= 2', () => {
    const text = buildShareText({
      isGameWon: true, currentAttempt: 2, maxGuesses: 6,
      submittedGuessesInfo: [], currentMode: MODE_5,
      hardMode: false, today: '2026-06-03', streak: 5,
    });
    expect(text).toContain('🔥5');
  });

  it('nao inclui emoji de streak quando streak < 2', () => {
    const text = buildShareText({
      isGameWon: true, currentAttempt: 2, maxGuesses: 6,
      submittedGuessesInfo: [], currentMode: MODE_5,
      hardMode: false, today: '2026-06-03', streak: 1,
    });
    expect(text).not.toContain('🔥');
  });

  it('inclui a data no texto', () => {
    const text = buildShareText({
      isGameWon: true, currentAttempt: 0, maxGuesses: 6,
      submittedGuessesInfo: [], currentMode: MODE_5,
      hardMode: false, today: '2026-06-03', streak: 0,
    });
    expect(text).toContain('2026-06-03');
  });
});

describe('buildChallengeText', () => {
  it('inclui resultado e convite', () => {
    const text = buildChallengeText({
      currentAttempt: 2, maxGuesses: 6,
      submittedGuessesInfo: [], currentMode: MODE_5,
    });
    expect(text).toContain('3/6');
    expect(text).toContain('kinto.fun');
  });

  it('inclui URL de 6 letras quando modo 6', () => {
    const text = buildChallengeText({
      currentAttempt: 3, maxGuesses: 7,
      submittedGuessesInfo: [], currentMode: MODE_6,
    });
    expect(text).toContain('kinto.fun/6');
  });

  it('inclui emoji de desafio', () => {
    const text = buildChallengeText({
      currentAttempt: 0, maxGuesses: 6,
      submittedGuessesInfo: [], currentMode: MODE_5,
    });
    expect(text).toContain('🎯');
  });

  it('inclui emojis da grade de tentativas', () => {
    const guesses = [
      guessRow(['correct', 'present', 'absent', 'correct', 'correct']),
    ];
    const text = buildChallengeText({
      currentAttempt: 0, maxGuesses: 6,
      submittedGuessesInfo: guesses, currentMode: MODE_5,
    });
    expect(text).toContain('🟢🟡⚫🟢🟢');
  });
});

describe('buildSocialShareUrl', () => {
  it('X (Twitter) leva o texto no parâmetro', () => {
    const url = buildSocialShareUrl('x', { text: 'Kinto 1/6' });
    expect(url.startsWith('https://twitter.com/intent/tweet?text=')).toBe(true);
    expect(url).toContain(encodeURIComponent('Kinto 1/6'));
  });

  it('WhatsApp usa wa.me com o texto', () => {
    const url = buildSocialShareUrl('whatsapp', { text: 'Kinto 1/6' });
    expect(url.startsWith('https://wa.me/?text=')).toBe(true);
    expect(url).toContain(encodeURIComponent('Kinto 1/6'));
  });

  it('LinkedIn usa share-offsite com a URL do jogo', () => {
    const url = buildSocialShareUrl('linkedin', { url: 'https://kinto.fun/6' });
    expect(url.startsWith('https://www.linkedin.com/sharing/share-offsite/?url=')).toBe(true);
    expect(url).toContain(encodeURIComponent('https://kinto.fun/6'));
  });

  it('rede desconhecida cai na URL', () => {
    expect(buildSocialShareUrl('foo', { url: 'https://kinto.fun' })).toBe('https://kinto.fun');
  });
});
