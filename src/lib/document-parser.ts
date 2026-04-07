'use client'

/**
 * Universal document parser — handles PDF, DOCX, DOC, TXT.
 * All parsing happens in the browser to avoid sending raw files to the server.
 */

export interface ParsedDocument {
  text: string
  pages?: number
  format: 'pdf' | 'docx' | 'doc' | 'txt' | 'unknown'
  filename: string
  size: number
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export async function parseDocument(file: File): Promise<ParsedDocument> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Arquivo muito grande (max ${MAX_FILE_SIZE / 1024 / 1024} MB)`)
  }

  const name = file.name.toLowerCase()
  const meta = { filename: file.name, size: file.size }

  if (name.endsWith('.pdf')) {
    const { text, pages } = await parsePdf(file)
    return { text, pages, format: 'pdf', ...meta }
  }

  if (name.endsWith('.docx')) {
    const text = await parseDocx(file)
    return { text, format: 'docx', ...meta }
  }

  if (name.endsWith('.doc')) {
    // Legacy .doc — mammoth supports it partially via the same API
    const text = await parseDocx(file).catch(() => '')
    if (!text) throw new Error('Formato .doc legado nao suportado. Salve como .docx ou .pdf.')
    return { text, format: 'doc', ...meta }
  }

  if (name.endsWith('.txt') || name.endsWith('.md')) {
    const text = await file.text()
    return { text: text.trim(), format: 'txt', ...meta }
  }

  // Try as text fallback
  try {
    const text = await file.text()
    if (text.trim().length > 50) {
      return { text: text.trim(), format: 'unknown', ...meta }
    }
  } catch { /* ignore */ }

  throw new Error('Formato nao suportado. Use PDF, DOCX, DOC, TXT ou MD.')
}

async function parsePdf(file: File): Promise<{ text: string; pages: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjs: any = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise

  const pageTexts: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = content.items.map((item: any) => item.str).join(' ')
    pageTexts.push(text)
  }

  return {
    text: pageTexts.join('\n\n').trim(),
    pages: pdf.numPages,
  }
}

async function parseDocx(file: File): Promise<string> {
  // Dynamic import — keeps mammoth out of the main bundle
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value.trim()
}

/**
 * Truncate text to a max length, preserving sentence boundaries when possible.
 * Used to fit large documents into the AI's context window.
 */
export function truncateForAI(text: string, maxChars = 40000): string {
  if (text.length <= maxChars) return text
  const truncated = text.slice(0, maxChars)
  // Try to cut at the last sentence boundary
  const lastPeriod = truncated.lastIndexOf('. ')
  if (lastPeriod > maxChars * 0.8) {
    return truncated.slice(0, lastPeriod + 1) + '\n\n[...documento truncado para caber no contexto da IA...]'
  }
  return truncated + '\n\n[...documento truncado...]'
}
