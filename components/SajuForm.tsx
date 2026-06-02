'use client';

import { useState } from 'react';
import { LocaleData } from '@/lib/i18n';
import { SajuResult } from '@/lib/saju/engine';

interface Props {
  t: LocaleData;
  onResult: (saju: SajuResult, formData: FormData) => void;
  onLoading: (loading: boolean) => void;
}

export interface FormData {
  year: number;
  month: number;
  day: number;
  hour?: number;
  gender: 'male' | 'female';
  timeUnknown: boolean;
  calendarType: 'solar' | 'lunar';
  isLeapMonth: boolean;
}

const hours = Array.from({ length: 24 }, (_, i) => i);
const hourLabels: Record<number, string> = {
  0: '23:00~01:00 (자시)', 1: '01:00~03:00 (축시)', 2: '03:00~05:00 (인시)',
  3: '05:00~07:00 (묘시)', 4: '07:00~09:00 (진시)', 5: '09:00~11:00 (사시)',
  6: '11:00~13:00 (오시)', 7: '13:00~15:00 (미시)', 8: '15:00~17:00 (신시)',
  9: '17:00~19:00 (유시)', 10: '19:00~21:00 (술시)', 11: '21:00~23:00 (해시)',
};

export default function SajuForm({ t, onResult, onLoading }: Props) {
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [hour, setHour] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!year || !month || !day) {
      setError('생년월일을 모두 입력해주세요.');
      return;
    }
    if (!timeUnknown && !hour) {
      setError('태어난 시간을 선택하거나 "시간 모름"을 체크해주세요.');
      return;
    }

    onLoading(true);
    try {
      const res = await fetch('/api/saju', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: Number(year),
          month: Number(month),
          day: Number(day),
          hour: timeUnknown ? undefined : Number(hour),
          gender,
          timeUnknown,
          calendarType,
          isLeapMonth: calendarType === 'lunar' ? isLeapMonth : false,
        }),
      });

      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      onResult(data.saju, {
        year: Number(year), month: Number(month), day: Number(day),
        hour: timeUnknown ? undefined : Number(hour),
        gender, timeUnknown,
        calendarType, isLeapMonth: calendarType === 'lunar' ? isLeapMonth : false,
      });
    } catch {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      onLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Gender */}
      <div>
        <label className="block text-saju-gold/80 text-sm font-medium mb-2">{t.form.gender}</label>
        <div className="grid grid-cols-2 gap-3">
          {(['male', 'female'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`py-3 rounded-xl border font-medium transition-all ${
                gender === g
                  ? 'border-saju-gold bg-saju-gold/10 text-saju-gold'
                  : 'border-saju-border text-gray-400 hover:border-saju-gold/40'
              }`}
            >
              {g === 'male' ? `♂ ${t.form.male}` : `♀ ${t.form.female}`}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar type: Solar / Lunar */}
      <div>
        <label className="block text-saju-gold/80 text-sm font-medium mb-2">{t.form.calendarLabel}</label>
        <div className="grid grid-cols-2 gap-3">
          {(['solar', 'lunar'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { setCalendarType(c); if (c === 'solar') setIsLeapMonth(false); }}
              className={`py-3 rounded-xl border font-medium transition-all ${
                calendarType === c
                  ? 'border-saju-gold bg-saju-gold/10 text-saju-gold'
                  : 'border-saju-border text-gray-400 hover:border-saju-gold/40'
              }`}
            >
              {c === 'solar' ? `☀ ${t.form.solar}` : `🌙 ${t.form.lunar}`}
            </button>
          ))}
        </div>
        {calendarType === 'lunar' && (
          <label className="flex items-center gap-2 cursor-pointer mt-3">
            <input
              type="checkbox"
              checked={isLeapMonth}
              onChange={(e) => setIsLeapMonth(e.target.checked)}
              className="w-4 h-4 accent-saju-gold"
            />
            <span className="text-sm text-gray-400">{t.form.leapMonth}</span>
          </label>
        )}
      </div>

      {/* Year */}
      <div>
        <label className="block text-saju-gold/80 text-sm font-medium mb-2">{t.form.year}</label>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-full bg-saju-card border border-saju-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-saju-gold/60 appearance-none"
        >
          <option value="">{t.form.yearPlaceholder}</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </select>
      </div>

      {/* Month & Day */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-saju-gold/80 text-sm font-medium mb-2">{t.form.month}</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full bg-saju-card border border-saju-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-saju-gold/60 appearance-none"
          >
            <option value="">{t.form.selectMonth}</option>
            {t.form.months.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-saju-gold/80 text-sm font-medium mb-2">{t.form.day}</label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full bg-saju-card border border-saju-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-saju-gold/60 appearance-none"
          >
            <option value="">{t.form.selectDay}</option>
            {days.map((d) => (
              <option key={d} value={d}>{d}일</option>
            ))}
          </select>
        </div>
      </div>

      {/* Hour */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-saju-gold/80 text-sm font-medium">{t.form.hour}</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={timeUnknown}
              onChange={(e) => setTimeUnknown(e.target.checked)}
              className="w-4 h-4 accent-saju-gold"
            />
            <span className="text-sm text-gray-400">{t.form.timeUnknown}</span>
          </label>
        </div>
        {!timeUnknown && (
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="w-full bg-saju-card border border-saju-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-saju-gold/60 appearance-none"
          >
            <option value="">{t.form.selectHour}</option>
            {Object.entries(hourLabels).map(([h, label]) => (
              <option key={h} value={h}>{label}</option>
            ))}
          </select>
        )}
        {timeUnknown && (
          <p className="text-gray-500 text-sm py-2 px-4 bg-saju-card rounded-xl border border-saju-border">
            시주 없이 연·월·일주만으로 분석합니다
          </p>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full py-4 bg-gradient-gold text-saju-black font-bold text-lg rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-gold-lg"
      >
        {t.form.submit}
      </button>
    </form>
  );
}
