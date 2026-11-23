// Page-sized captures avoid blank pages caused by browser canvas size limits.
export async function captureElementToPDF(el: HTMLElement, filename: string): Promise<void> {
  const [{ default: html2canvas }, { default: JsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  await document.fonts.ready;
  const root = el.cloneNode(true) as HTMLElement;
  Object.assign(root.style, { position: 'absolute', left: '0', top: '0', width: '760px', display: 'block', zIndex: '-100', pointerEvents: 'none' });
  document.body.appendChild(root);
  try {
    await Promise.all(Array.from(root.querySelectorAll('img')).map(img => img.decode().catch(() => {})));
    root.querySelectorAll('p').forEach(node => {
      const text = node.textContent || '';
      if (!text.includes('\n\n')) return;
      node.textContent = '';
      text.split('\n\n').forEach((text, i) => {
        const span = document.createElement('span');
        span.style.display = 'block';
        if (i) span.style.marginTop = '12px';
        span.textContent = text;
        node.appendChild(span);
      });
    });
    const pdf = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    pdf.setProperties({ title: 'THE SAJU / Personal Fortune Report', creator: 'THE SAJU' });
    const margin = 10, width = 190, ratio = 760 / width, pageHeight = 272 * ratio;
    const base = root.getBoundingClientRect().top;
    const height = root.scrollHeight;
    const bounds = Array.from(root.querySelectorAll<HTMLElement>('[data-pdf-block]')).filter(node => !node.querySelector('[data-pdf-block]')).map(node => {
      const rect = node.getBoundingClientRect();
      return { top: rect.top - base, bottom: rect.bottom - base };
    });
    const paragraphs = Array.from(root.querySelectorAll<HTMLElement>('p > span')).map(node => node.getBoundingClientRect().top - base);
    const headings = Array.from(root.querySelectorAll<HTMLElement>('h2')).map(node => ({ top:node.getBoundingClientRect().top-base, bottom:node.getBoundingClientRect().bottom-base }));
    let offset = 0, page = 0;
    while (offset < height - 1) {
      const limit = Math.min(height, offset + pageHeight);
      let cut = limit;
      if (limit < height) {
        const crossing = bounds.filter(b => b.top < limit && b.bottom > limit && b.bottom - b.top <= pageHeight * .55 && b.top > offset + pageHeight * .35);
        if (crossing.length) cut = Math.min(...crossing.map(b => b.top));
        else {
          const candidates = [...bounds.map(b => b.top), ...paragraphs].filter(v => v > offset + pageHeight * .55 && v <= limit);
          if (candidates.length) cut = Math.max(...candidates);
        }
        const orphan = headings.find(h => h.top < cut && h.bottom + 100 > cut && h.top > offset + 20);
        if (orphan) cut = orphan.top;
      }
      if (cut <= offset + 1) cut = limit;
      const canvas = await html2canvas(root, { backgroundColor:'#0A0A0F', scale:1.5, useCORS:true, logging:false, x:root.getBoundingClientRect().left+window.scrollX, y:base+window.scrollY+offset, width:760, height:cut-offset, windowWidth:1000 });
      if (page) pdf.addPage();
      pdf.setFillColor(10,10,15);pdf.rect(0,0,210,297,'F');
      pdf.addImage(canvas.toDataURL('image/jpeg',.92),'JPEG',margin,margin,width,(cut-offset)/ratio);
      pdf.setTextColor(170,157,132);pdf.setFontSize(8);pdf.text('THE SAJU / PERSONAL EDITION',margin,291);pdf.text(String(page+1),200,291,{align:'right'});
      canvas.width=0;canvas.height=0;
      page++;offset=cut;
    }
    pdf.save(filename);
  } finally { root.remove(); }
}
