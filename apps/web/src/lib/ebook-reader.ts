import QRCode from 'qrcode';
import type { EbookReaderPage } from './platform-api';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function buildQrCodeDataUrl(value: string | null): Promise<string | null> {
  if (!value) return null;
  return QRCode.toDataURL(value, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 96,
  });
}

export function createWatermarkedEbookHtml(input: {
  title: string;
  pages: EbookReaderPage[];
  watermarkText: string;
  qrCodeDataUrl: string | null;
}): string {
  const pagesMarkup = input.pages
    .map((page) => {
      const imageMarkup = page.imageUrl
        ? `<img class="page-image" src="${escapeHtml(page.imageUrl)}" alt="${escapeHtml(page.title)}" />`
        : '';
      const qrMarkup = input.qrCodeDataUrl
        ? `<img class="qr" src="${input.qrCodeDataUrl}" alt="QR watermark" />`
        : '';

      return `
        <section class="page">
          <div class="watermark">${escapeHtml(input.watermarkText)}</div>
          ${qrMarkup}
          <div class="page-inner">
            <div class="page-number">Page ${page.pageNumber}</div>
            <h2>${escapeHtml(page.title)}</h2>
            ${imageMarkup}
            <p>${escapeHtml(page.body).replace(/\n/g, '<br />')}</p>
          </div>
        </section>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(input.title)}</title>
    <style>
      body { margin: 0; background: #e2e8f0; font-family: Arial, sans-serif; }
      .page {
        position: relative;
        width: min(760px, calc(100vw - 48px));
        min-height: 980px;
        margin: 24px auto;
        padding: 48px;
        background: #fff;
        box-sizing: border-box;
        overflow: hidden;
        border: 1px solid #cbd5e1;
      }
      .page-inner { position: relative; z-index: 2; }
      .page-number { color: #475569; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; }
      h2 { margin: 12px 0 20px; font-size: 28px; }
      p { font-size: 16px; line-height: 1.7; color: #0f172a; }
      .page-image { width: 100%; max-height: 320px; object-fit: cover; border-radius: 12px; margin: 0 0 20px; }
      .watermark {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(-28deg);
        color: rgba(15, 23, 42, 0.10);
        font-size: 44px;
        font-weight: 700;
        pointer-events: none;
        white-space: nowrap;
      }
      .qr {
        position: absolute;
        right: 24px;
        bottom: 24px;
        width: 96px;
        height: 96px;
        z-index: 2;
      }
      @media print {
        body { background: #fff; }
        .page { margin: 0 auto; border: none; width: auto; min-height: auto; page-break-after: always; }
      }
    </style>
  </head>
  <body>${pagesMarkup}</body>
</html>`;
}

export function triggerHtmlDownload(filename: string, html: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}
