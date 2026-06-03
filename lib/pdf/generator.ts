// 화면에 렌더된 결과(한글/한자 포함)를 이미지로 캡처하여 PDF로 저장.
// 개선점:
//  1) 모든 페이지를 어두운 배경(#0A0A0F)으로 채워 마지막 페이지 흰 여백 제거
//  2) [data-pdf-block] 요소의 경계에서만 페이지를 분할하여 내용이 잘리지 않게 함

export async function captureElementToPDF(el: HTMLElement, filename: string): Promise<void> {
  const html2canvas = (await import('html2canvas')).default;
  const { default: jsPDF } = await import('jspdf');

  const SCALE = 2;
  const canvas = await html2canvas(el, {
    backgroundColor: '#0A0A0F',
    scale: SCALE,
    useCORS: true,
    logging: false,
    onclone: (doc: Document) => {
      doc.querySelectorAll('.line-clamp-2, .line-clamp-3').forEach((e) => {
        e.classList.remove('line-clamp-2');
        e.classList.remove('line-clamp-3');
      });
      doc.querySelectorAll('[data-pdf-capture]').forEach((e) => {
        (e as HTMLElement).style.position = 'static';
        (e as HTMLElement).style.left = '0';
        (e as HTMLElement).style.display = 'block';
      });
    },
  });

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const pxPerMm = canvas.width / pageW;     // 캔버스 px / mm
  const pageHpx = pageH * pxPerMm;          // 한 페이지 높이(캔버스 px)

  // 블록 경계(각 블록의 top, 캔버스 px)를 분할 후보로 수집
  const containerTop = el.getBoundingClientRect().top;
  const blocks = Array.from(el.querySelectorAll('[data-pdf-block]')) as HTMLElement[];
  const tops = blocks
    .map((b) => (b.getBoundingClientRect().top - containerTop) * SCALE)
    .filter((v) => v > 5);
  const breaks = Array.from(new Set(tops.map((v) => Math.round(v)))).sort((a, b) => a - b);

  function fillDark() {
    pdf.setFillColor(10, 10, 15);
    pdf.rect(0, 0, pageW, pageH, 'F');
  }

  let y = 0;
  let first = true;

  while (y < canvas.height - 1) {
    const limit = y + pageHpx;
    let cut: number;

    if (limit >= canvas.height) {
      cut = canvas.height;
    } else {
      // y 아래이면서 limit 이하인 가장 큰 블록 경계에서 분할
      const candidates = breaks.filter((b) => b > y + 20 && b <= limit);
      cut = candidates.length ? candidates[candidates.length - 1] : limit;
    }

    const sliceH = Math.max(1, cut - y);

    // 해당 구간을 임시 캔버스에 어두운 배경과 함께 그림
    const tmp = document.createElement('canvas');
    tmp.width = canvas.width;
    tmp.height = Math.ceil(sliceH);
    const ctx = tmp.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0A0A0F';
      ctx.fillRect(0, 0, tmp.width, tmp.height);
      ctx.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
    }
    const imgData = tmp.toDataURL('image/png');

    if (!first) pdf.addPage();
    fillDark();
    const sliceHmm = sliceH / pxPerMm;
    pdf.addImage(imgData, 'PNG', 0, 0, pageW, sliceHmm);

    first = false;
    y = cut;
  }

  pdf.save(filename);
}
