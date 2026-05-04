'use client'

/**
 * PDF parser via pdfjs-dist client-side.
 *
 * Bug-fix CRITICO 2026-05-04 (cliente "Erro ao ler PDF" repetido):
 * Antes worker era carregado do CDN externo cdnjs.cloudflare.com.
 * Brave Shields + uBlock + Adblock Plus bloqueiam fetch externo de
 * .js workers (visto ERR_BLOCKED_BY_CLIENT no console). Resultado:
 * worker nao carrega -> getDocument() trava ou throws -> "Erro ao ler PDF".
 *
 * Fix: copia worker pra public/pdf/pdf.worker.min.mjs (servido same-origin).
 * Browser nunca bloqueia same-origin. CSP nao precisa allow CDN externo.
 *
 * Versao pdfjs-dist: 5.6.205 (worker atualizado em build via copy script).
 *
 * Caveat: se atualizarem pdfjs-dist no package.json, precisa re-copiar
 * o worker pra public/. Pode automatizar via postinstall hook se virar
 * problema (raro — pdfjs muda 1-2x por ano).
 */

const WORKER_URL = '/pdf/pdf.worker.min.mjs'

export async function extractTextFromPdf(file: File): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjs: any = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = WORKER_URL

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise

  const pageTexts: string[] = []
  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const text = content.items.map((item: any) => item.str).join(' ')
      pageTexts.push(text)
    }
  } finally {
    // Memory cleanup: pdf.destroy() libera recursos workers.
    // Sem isso, browser pode acumular 100+MB depois de varios PDFs.
    try { await pdf.destroy() } catch { /* silent */ }
  }

  return pageTexts.join('\n\n').trim()
}

// Variant que tambem retorna page count (usado pra toast feedback).
export async function extractPdfWithMeta(file: File): Promise<{ text: string; numPages: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjs: any = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = WORKER_URL

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  const numPages = pdf.numPages

  const pageTexts: string[] = []
  try {
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const text = content.items.map((item: any) => item.str).join(' ')
      pageTexts.push(text)
    }
  } finally {
    try { await pdf.destroy() } catch { /* silent */ }
  }

  return {
    text: pageTexts.join('\n\n').trim(),
    numPages,
  }
}
