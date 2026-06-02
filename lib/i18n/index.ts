import { ko } from './locales/ko';
import { en } from './locales/en';
import { ja } from './locales/ja';
import { zh } from './locales/zh';
import { tw } from './locales/tw';

export type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'tw';
export type LocaleData = typeof ko;

export const locales: Record<Locale, LocaleData> = { ko, en, ja, zh, tw } as any;

export const localeNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh: '中文(简体)',
  tw: '中文(繁體)',
};

export const localeFlags: Record<Locale, string> = {
  ko: '🇰🇷',
  en: '🇺🇸',
  ja: '🇯🇵',
  zh: '🇨🇳',
  tw: '🇹🇼',
};

export function getLocaleData(locale: Locale): LocaleData {
  return locales[locale] || locales.ko;
}

export function formatPrice(amount: number, currency: string, symbol: string): string {
  if (currency === 'KRW' || currency === 'JPY') {
    return `${symbol}${amount.toLocaleString()}`;
  }
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
}
