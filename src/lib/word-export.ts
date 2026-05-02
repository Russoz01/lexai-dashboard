import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  LevelFormat,
  convertInchesToTwip,
  PageNumber,
  Header,
  Footer,
} from 'docx'

/* ════════════════════════════════════════════════════════════════════
 * word-export.ts (v2 — ABNT compliant editorial · 2026-04-30)
 * ────────────────────────────────────────────────────────────────────
 * Geração DOCX padrão peça jurídica brasileira:
 *  · Fonte: Times New Roman 12pt (body), 14pt (heading), 18pt (title)
 *  · Margens ABNT: 3cm esq/sup, 2cm dir/inf
 *  · Espaçamento: linha 1.5, antes/depois ajustado
 *  · Alinhamento: justificado no body, centro no title
 *  · Recuo de primeira linha: 1.25cm em parágrafos do corpo
 *  · Header/Footer com paginação
 *
 * Inline formatting via markdown leve em strings:
 *  · **texto**       → bold
 *  · *texto*         → italic
 *  · "Art. X" / "art. X" — auto-bold (referências legais destacam)
 *  · Súmula NN, Lei NN/AA — auto-bold
 *
 * Signature mantida (DocxSection compat) — nenhum agente quebra.
 * ═══════════════════════════════════════════════════════════════════ */

export interface DocxSection {
  heading?: string
  paragraphs: string[]
}

const FONT = 'Times New Roman'
// Sizes em half-points (docx.js convention): 24 = 12pt
const SIZE_TITLE = 36 // 18pt
const SIZE_HEADING = 28 // 14pt
const SIZE_BODY = 24 // 12pt
const SIZE_SMALL = 20 // 10pt

/**
 * Parser inline pra string com **bold**, *italic* e auto-bold legal.
 * Retorna lista de TextRun pronta pro Paragraph.children.
 */
function parseInlineRuns(text: string, baseSize = SIZE_BODY): TextRun[] {
  if (!text) return []

  // Auto-destaca refs legais: Art. 123, art. 5º, Súmula 231, Lei 8.078/90, CF/88
  // Marcamos com sentinela ⟪⟫ pra processar junto com **bold**
  const LEGAL_PATTERNS: RegExp[] = [
    /\b[Aa]rt\.?\s*\d+[º°ª]?(?:\s*,\s*[§I-XV]+)?(?:\s+(?:do|da|de)\s+[A-Z][A-Za-z./]+)?/g,
    /\b[Ss]úmula\s+\d+(?:\s+do\s+[A-Z]+)?/g,
    /\b[Ll]ei\s+(?:n\.?º?\s*)?\d{1,3}(?:[.\d]+)?(?:\/\d{2,4})?/g,
    /\bCF\/?\d{0,4}\b/g,
    /\b(?:CPC|CPP|CC|CDC|CLT|CTN|CP)\b/g,
  ]
  let marked = text
  for (const re of LEGAL_PATTERNS) {
    marked = marked.replace(re, (m) => `⟪${m}⟫`)
  }

  // Tokenize: **bold**, *italic*, ⟪auto-bold⟫, plain
  const tokens: { text: string; bold?: boolean; italic?: boolean }[] = []
  let i = 0
  while (i < marked.length) {
    if (marked.startsWith('**', i)) {
      const end = marked.indexOf('**', i + 2)
      if (end > i) {
        tokens.push({ text: marked.slice(i + 2, end), bold: true })
        i = end + 2
        continue
      }
    }
    if (marked.startsWith('⟪', i)) {
      const end = marked.indexOf('⟫', i + 1)
      if (end > i) {
        tokens.push({ text: marked.slice(i + 1, end), bold: true })
        i = end + 1
        continue
      }
    }
    if (
      marked[i] === '*' &&
      marked[i + 1] !== '*' &&
      marked[i + 1] !== ' '
    ) {
      const end = marked.indexOf('*', i + 1)
      if (end > i + 1 && marked[end - 1] !== ' ') {
        tokens.push({ text: marked.slice(i + 1, end), italics: true } as never)
        i = end + 1
        continue
      }
    }
    // Plain run — consume até próximo marker
    let next = marked.length
    for (const marker of ['**', '⟪', '*']) {
      const idx = marked.indexOf(marker, i + 1)
      if (idx > i && idx < next) next = idx
    }
    tokens.push({ text: marked.slice(i, next) })
    i = next
  }

  return tokens
    .filter(t => t.text.length > 0)
    .map(
      t =>
        new TextRun({
          text: t.text,
          font: FONT,
          size: baseSize,
          bold: t.bold,
          italics: (t as { italics?: boolean }).italics,
        }),
    )
}

export async function generateDocx(
  title: string,
  sections: DocxSection[],
): Promise<Blob> {
  const children: Paragraph[] = []

  // Title — 18pt bold centro
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: title.toUpperCase(),
          font: FONT,
          size: SIZE_TITLE,
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 240, before: 0, line: 360 }, // line 360 = 1.5 spacing
    }),
  )

  // Subtitle date — 10pt italic centro
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Gerado em ${new Date().toLocaleDateString('pt-BR')} via Pralvex`,
          font: FONT,
          italics: true,
          size: SIZE_SMALL,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 480 },
    }),
  )

  // Hairline separator
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '────────────────────────',
          font: FONT,
          size: SIZE_BODY,
          color: 'BFA68E',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
    }),
  )

  // Sections
  for (const section of sections) {
    if (section.heading) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.heading.toUpperCase(),
              font: FONT,
              size: SIZE_HEADING,
              bold: true,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 360, after: 240, line: 360 },
          alignment: AlignmentType.LEFT,
        }),
      )
    }
    for (const para of section.paragraphs) {
      if (!para?.trim()) continue
      children.push(
        new Paragraph({
          children: parseInlineRuns(para, SIZE_BODY),
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 200, line: 360 }, // 1.5 line height
          indent: { firstLine: convertInchesToTwip(0.49) }, // ~1.25cm ABNT
        }),
      )
    }
  }

  // Footer com paginação
  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            children: ['Página ', PageNumber.CURRENT, ' de ', PageNumber.TOTAL_PAGES],
            font: FONT,
            size: SIZE_SMALL,
            color: '888888',
          }),
        ],
      }),
    ],
  })

  const header = new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: 'Pralvex · Gabinete jurídico digital',
            font: FONT,
            size: 18, // 9pt
            italics: true,
            color: 'BFA68E',
          }),
        ],
      }),
    ],
  })

  const doc = new Document({
    creator: 'Pralvex',
    title,
    description: `Peça jurídica gerada via Pralvex em ${new Date().toLocaleDateString('pt-BR')}`,
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SIZE_BODY },
          paragraph: { spacing: { line: 360 } },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: 'numbered-headings',
          levels: [
            {
              level: 0,
              format: LevelFormat.UPPER_ROMAN,
              text: '%1.',
              alignment: AlignmentType.START,
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              // ABNT: 3cm esq + sup, 2cm dir + inf
              top: convertInchesToTwip(1.18),
              bottom: convertInchesToTwip(0.79),
              left: convertInchesToTwip(1.18),
              right: convertInchesToTwip(0.79),
            },
          },
        },
        headers: { default: header },
        footers: { default: footer },
        children,
      },
    ],
  })

  return await Packer.toBlob(doc)
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
