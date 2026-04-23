import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'

export interface DocxSection {
  heading?: string
  paragraphs: string[]
}

export async function generateDocx(title: string, sections: DocxSection[]): Promise<Blob> {
  const children: Paragraph[] = []

  // Title
  children.push(new Paragraph({
    text: title,
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  }))

  // Date
  children.push(new Paragraph({
    children: [new TextRun({ text: `Gerado em ${new Date().toLocaleDateString('pt-BR')} via Pralvex`, italics: true, size: 20 })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
  }))

  // Sections
  for (const section of sections) {
    if (section.heading) {
      children.push(new Paragraph({
        text: section.heading,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 200 },
      }))
    }
    for (const para of section.paragraphs) {
      if (!para?.trim()) continue
      children.push(new Paragraph({
        children: [new TextRun({ text: para, size: 22 })],
        spacing: { after: 160 },
      }))
    }
  }

  const doc = new Document({
    creator: 'Pralvex',
    title,
    sections: [{ properties: {}, children }],
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
