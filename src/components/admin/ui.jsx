import React from 'react';

export const BG   = '#16181d';
export const CARD = '#1e2028';
export const SURF = '#22252f';
export const BDR  = '#2c2f3a';
export const BDR2 = '#363a47';

export const Card = ({ children, className = '' }) => (
  <div
    className={`rounded-xl p-4 sm:p-5 border ${className}`}
    style={{ backgroundColor: CARD, borderColor: BDR }}
  >
    {children}
  </div>
);

export const SectionTitle = ({ children }) => (
  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">{children}</p>
);

export const Input = ({ className = '', ...props }) => (
  <input
    className={`rounded-lg px-4 py-2.5 text-white outline-none transition-colors placeholder:text-zinc-600 border ${className}`}
    style={{ backgroundColor: SURF, borderColor: BDR2 }}
    onFocus={e => (e.target.style.borderColor = '#7a7d8e')}
    onBlur={e  => (e.target.style.borderColor = BDR2)}
    {...props}
  />
);

export const BtnPrimary = ({ children, className = '', ...props }) => (
  <button
    className={`bg-white hover:bg-zinc-100 text-black font-bold rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const BtnGhost = ({ children, className = '', ...props }) => (
  <button
    className={`text-zinc-400 hover:text-white rounded-lg transition-colors text-sm border ${className}`}
    style={{ borderColor: BDR2 }}
    onMouseEnter={e => (e.currentTarget.style.borderColor = '#4a4d5e')}
    onMouseLeave={e => (e.currentTarget.style.borderColor = BDR2)}
    {...props}
  >
    {children}
  </button>
);
