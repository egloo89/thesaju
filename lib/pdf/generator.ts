// 화면에 렌더된 결과(한글/한자 포함)를 그대로 이미지로 캡처하여 PDF로 저장.
// jsPDF 기본 폰트는 한글/한자를 지원하지 않으므로 html2canvas 방식을 사용한다.

export async function captureElementToPDF(el: HTMLElement, filename: string): Promise<void> {
  const html2canvas = (await import('html2canvas')).default;
  const { default: jsPDF } = await import('jspdf');

  const canvas = await html2canvas(el, {
    backgroundColor: '#0A0A0F',
    scale: 2,
    useCORS: true,
    logging: false,
    // 캡처용 복제 DOM에서 접힌 텍스트(line-clamp)를 모두 펼친다
    onclone: (doc: Document) => {
      doc.querySelectorAll('.line-clamp-2, .line-clamp-3').forEach((e) => {
        e.classList.remove('line-clamp-2');
        e.classList.remove('line-clamp-3');
      });
      // PDF 전용 영역을 화면에 보이도록 전환
      doc.querySelectorAll('[data-pdf-capture]').forEach((e) => {
        (e as HTMLElement).style.position = 'static';
        (e as HTMLElement).style.left = '0';
        (e as HTMLElement).style.display = 'block';
      });
    },
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}
