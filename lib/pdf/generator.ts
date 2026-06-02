import jsPDF from 'jspdf';
import { SajuResult } from '@/lib/saju/engine';
import { LocaleData } from '@/lib/i18n';

const GOLD = '#C9A84C';
const DARK = '#0A0A0F';
const CARD = '#1A1A26';
const LIGHT = '#E8E8F0';
const GRAY = '#6B6B80';

function addGoldLine(doc: jsPDF, x1: number, y: number, x2: number) {
  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.5);
  doc.line(x1, y, x2, y);
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

export async function generateSajuPDF(
  saju: SajuResult,
  interpretations: Record<string, string>,
  t: LocaleData
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210;
  const M = 20; // margin

  // Background
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, W, 297, 'F');

  // Header gradient band
  doc.setFillColor(26, 26, 38);
  doc.rect(0, 0, W, 55, 'F');

  // Logo text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(201, 168, 76);
  doc.text('THE SAJU', W / 2, 22, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130, 120, 80);
  doc.text('四柱命理 · Traditional Korean Fortune Mapping', W / 2, 30, { align: 'center' });

  addGoldLine(doc, M, 38, W - M);

  // Birth info
  doc.setFontSize(11);
  doc.setTextColor(200, 200, 210);
  doc.text(`${saju.birthDate} · ${saju.animal}띠 (${saju.animalEn}) · ${saju.gender === 'male' ? '남성' : '여성'}`, W / 2, 46, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 120);
  doc.text(`일간: ${saju.dayMasterHanja}(${saju.dayMasterKor}) · ${saju.dayMasterOhaeng}의 기운`, W / 2, 52, { align: 'center' });

  // Four Pillars section
  let y = 65;
  doc.setFontSize(10);
  doc.setTextColor(201, 168, 76);
  doc.text('사주팔자 (四柱八字)', M, y);
  addGoldLine(doc, M, y + 3, W - M);
  y += 10;

  const pillars = [
    { label: '연주', stem: saju.yearPillar.stemHanja, branch: saju.yearPillar.branchHanja },
    { label: '월주', stem: saju.monthPillar.stemHanja, branch: saju.monthPillar.branchHanja },
    { label: '일주', stem: saju.dayPillar.stemHanja, branch: saju.dayPillar.branchHanja },
    ...(saju.hourPillar ? [{ label: '시주', stem: saju.hourPillar.stemHanja, branch: saju.hourPillar.branchHanja }] : []),
  ];

  const cardW = saju.hourPillar ? 38 : 50;
  const cardGap = saju.hourPillar ? 4 : 5;
  const startX = (W - (pillars.length * cardW + (pillars.length - 1) * cardGap)) / 2;

  pillars.forEach((p, i) => {
    const x = startX + i * (cardW + cardGap);
    doc.setFillColor(26, 26, 38);
    doc.roundedRect(x, y, cardW, 32, 3, 3, 'F');
    doc.setDrawColor(42, 42, 62);
    doc.roundedRect(x, y, cardW, 32, 3, 3, 'S');

    doc.setFontSize(7);
    doc.setTextColor(100, 100, 120);
    doc.text(p.label, x + cardW / 2, y + 6, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(201, 168, 76);
    doc.text(p.stem, x + cardW / 2, y + 17, { align: 'center' });
    doc.setTextColor(150, 140, 90);
    doc.text(p.branch, x + cardW / 2, y + 28, { align: 'center' });
  });

  y += 40;

  // Five Elements
  doc.setFontSize(10);
  doc.setTextColor(201, 168, 76);
  doc.text('오행 분포 (五行)', M, y);
  addGoldLine(doc, M, y + 3, W - M);
  y += 10;

  const ohaengColors: Record<string, [number, number, number]> = {
    '목': [45, 106, 79],
    '화': [192, 57, 43],
    '토': [212, 160, 23],
    '금': [160, 160, 176],
    '수': [26, 58, 92],
  };

  saju.ohaengCounts.forEach((o) => {
    const col = ohaengColors[o.name] || [100, 100, 100];
    doc.setTextColor(col[0], col[1], col[2]);
    doc.setFontSize(9);
    doc.text(`${o.hanja}(${o.name})`, M, y + 4);

    doc.setFillColor(30, 30, 46);
    doc.rect(M + 20, y, 120, 4, 'F');
    doc.setFillColor(col[0], col[1], col[2]);
    doc.rect(M + 20, y, 120 * o.percentage / 100, 4, 'F');

    doc.setTextColor(col[0], col[1], col[2]);
    doc.text(`${o.count}개 (${o.percentage}%)`, M + 145, y + 4);
    y += 9;
  });

  y += 5;

  // Fortune sections
  const fortuneKeys = ['total', 'health', 'love', 'marriage', 'business', 'career', 'work', 'wealth'] as const;
  const fortuneKorNames: Record<string, string> = {
    total: '총운 (總運)', health: '건강운', love: '연애운', marriage: '결혼운',
    business: '사업운', career: '취업운', work: '직장운', wealth: '재물운',
  };

  doc.setFontSize(10);
  doc.setTextColor(201, 168, 76);
  doc.text('운세 분석', M, y);
  addGoldLine(doc, M, y + 3, W - M);
  y += 12;

  for (const key of fortuneKeys) {
    if (y > 260) {
      doc.addPage();
      doc.setFillColor(10, 10, 15);
      doc.rect(0, 0, W, 297, 'F');
      y = 20;
    }

    doc.setFillColor(20, 20, 32);
    const textLines = doc.splitTextToSize(interpretations[key] || '분석 중입니다.', W - M * 2 - 6);
    const boxH = 8 + textLines.length * 5;
    doc.roundedRect(M, y - 2, W - M * 2, boxH, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setTextColor(201, 168, 76);
    doc.text(fortuneKorNames[key], M + 3, y + 4);

    doc.setFontSize(8);
    doc.setTextColor(180, 180, 196);
    doc.text(textLines, M + 3, y + 10);

    y += boxH + 5;
  }

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(60, 60, 80);
  const today = new Date().toLocaleDateString('ko-KR');
  doc.text(`THE SAJU · ${today} · thesaju.vercel.app`, W / 2, 290, { align: 'center' });

  doc.save(`THE-SAJU-${saju.birthDate}.pdf`);
}
