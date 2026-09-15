import React from 'react';
import { LanguageCode } from '../types';

// Maharashtra State Seal SVG Component
export const MaharashtraGovtSeal: React.FC<{ className?: string; language?: LanguageCode }> = ({ className = "w-10 h-10", language = "en" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#0A2540" stroke="#D97706" strokeWidth="3" />
    <circle cx="50" cy="50" r="42" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 3" />
    {/* Inner Lion / Fort Crest Representation */}
    <path d="M50 16 L56 26 L67 26 L58 33 L62 44 L50 37 L38 44 L42 33 L33 26 L44 26 Z" fill="#D97706" />
    <path d="M30 52 C30 42 70 42 70 52 C70 65 30 65 30 52 Z" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="1.5" />
    <text x="50" y="60" textAnchor="middle" fill="#FFFFFF" fontSize={language === 'en' ? "7.5" : "9"} fontWeight="bold" fontFamily="sans-serif">
      {language === 'mr' ? 'महाराष्ट्र' : language === 'hi' ? 'महाराष्ट्र' : 'MAHARASHTRA'}
    </text>
    <path d="M32 72 Q50 82 68 72" stroke="#D97706" strokeWidth="2.5" fill="none" />
    <text x="50" y="80" textAnchor="middle" fill="#F59E0B" fontSize={language === 'en' ? "6" : "6.5"} fontWeight="600" fontFamily="sans-serif">
      {language === 'mr' ? 'आरोग्य सेवा' : language === 'hi' ? 'स्वास्थ्य सेवा' : 'HEALTH SERVICES'}
    </text>
  </svg>
);

// Ashoka Emblem SVG Component
export const AshokaEmblem: React.FC<{ className?: string }> = ({ className = "w-7 h-9" }) => (
  <svg viewBox="0 0 40 50" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2 C25 2 28 6 28 10 C28 14 25 18 20 18 C15 18 12 14 12 10 C12 6 15 2 20 2 Z" fill="#D97706" />
    <path d="M12 10 H28 V24 H12 Z" fill="#B45309" />
    <circle cx="20" cy="30" r="8" fill="#1E3A8A" stroke="#FFFFFF" strokeWidth="1.5" />
    <path d="M20 22 V38 M12 30 H28 M14 24 L26 36 M14 36 L26 24" stroke="#FFFFFF" strokeWidth="1" />
    <rect x="6" y="40" width="28" height="6" rx="2" fill="#D97706" />
    <text x="20" y="44.5" textAnchor="middle" fill="#FFFFFF" fontSize="4" fontWeight="bold">सत्यमेव जयते</text>
  </svg>
);

// Ministry of Health and Family Welfare Official Logo Component
export const MohfwLogo: React.FC<{ className?: string }> = ({ className = "h-8 sm:h-9" }) => (
  <img
    src="/mohfw-logo.jpg"
    alt="Ministry of Health and Family Welfare - Government of India"
    className={`object-contain bg-white px-2 py-0.5 rounded border border-slate-200 shadow-xs ${className}`}
  />
);

// Aarogya Rakshak Emblem Brand Logo Component
export const AarogyaRakshakLogo: React.FC<{ className?: string }> = ({ className = "w-11 h-11" }) => (
  <img
    src="/aarogya-rakshak-logo.jpg"
    alt="Aarogya Rakshak - Healthy Villages, Stronger Maharashtra"
    className={`object-cover rounded-xl border-2 border-amber-400 shadow-md ${className}`}
  />
);

// ABHA (Ayushman Bharat Digital Mission) Badge
export const AbhaBadge: React.FC<{ className?: string }> = ({ className = "h-5" }) => (
  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-900/90 text-blue-100 border border-blue-600 text-[10px] font-bold ${className}`}>
    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
    <span>ABHA Mapped</span>
  </div>
);

// U-WIN Immunization Badge
export const UWinBadge: React.FC<{ className?: string }> = ({ className = "h-5" }) => (
  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-900/90 text-emerald-100 border border-emerald-600 text-[10px] font-bold ${className}`}>
    <span className="text-amber-400">★</span>
    <span>U-WIN Verified</span>
  </div>
);

// eSanjeevani Teleconsultation Badge
export const ESanjeevaniBadge: React.FC<{ className?: string }> = ({ className = "h-5" }) => (
  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/90 text-amber-200 border border-amber-600 text-[10px] font-bold ${className}`}>
    <span>e-Sanjeevani 2.0</span>
  </div>
);
