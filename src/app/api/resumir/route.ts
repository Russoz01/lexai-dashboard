import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { texto } = await req.json()

    if (!texto || texto.trim().length < 50) {
      return NextResponse.json(
        { error: 'Texto muito curto. Forneça pelo menos 50 caracteres.' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `Você é um assistente jurídico especializado em análise de documentos legais brasileiros.

Analise o documento jurídico abaixo e forneça uma resposta estruturada em JSON com os seguintes campos:

{
  "resumo": "Resumo executivo do documento em 3-5 parágrafos claros e objetivos",
  "tipo_documento": "Tipo do documento (contrato, petição, acórdão, lei, parecer, etc.)",
  "pontos_principais": ["lista com os 5-8 pontos jurídicos mais relevantes"],
  "riscos": ["lista com os principais riscos, cláusulas problemáticas ou pontos de atenção identificados"],
  "partes_envolvidas": ["lista das partes identificadas no documento"],
  "prazos_identificados": ["lista de prazos ou datas importantes mencionados no documento"]
}

Responda APENAS com o JSON, sem markdown, sem texto adicional.

DOCUMENTO:
${texto}`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text().trim()

    let analise
    try {
      const jsonStr = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      analise = JSON.parse(jsonStr)
    } catch {
      analise = {
        resumo: responseText,
        tipo_documento: 'Não identificado',
        pontos_principais: [],
        riscos: [],
        partes_envolvidas: [],
        prazos_identificados: [],
      }
    }

    return NextResponse.json({ analise })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    console.error('[API /resumir]', message)
    return NextResponse.json({ error: 'Erro ao processar documento: ' + message }, { status: 500 })
  }
}
