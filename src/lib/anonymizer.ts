export interface AnonymizeResult {
  text: string
  replacements: { tipo: string; original: string; mascara: string }[]
}

export function anonymize(text: string): AnonymizeResult {
  const replacements: AnonymizeResult['replacements'] = []
  const counter = { cpf: 0, cnpj: 0, email: 0, telefone: 0, cep: 0 }

  // CPF: XXX.XXX.XXX-XX
  let result = text.replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, (m) => {
    counter.cpf++
    const mask = `[CPF_${counter.cpf}]`
    replacements.push({ tipo: 'CPF', original: m, mascara: mask })
    return mask
  })

  // CNPJ: XX.XXX.XXX/XXXX-XX
  result = result.replace(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, (m) => {
    counter.cnpj++
    const mask = `[CNPJ_${counter.cnpj}]`
    replacements.push({ tipo: 'CNPJ', original: m, mascara: mask })
    return mask
  })

  // Email
  result = result.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (m) => {
    counter.email++
    const mask = `[EMAIL_${counter.email}]`
    replacements.push({ tipo: 'EMAIL', original: m, mascara: mask })
    return mask
  })

  // Telefone (BR pattern)
  result = result.replace(/\(\d{2}\)\s?\d{4,5}-\d{4}/g, (m) => {
    counter.telefone++
    const mask = `[TEL_${counter.telefone}]`
    replacements.push({ tipo: 'TELEFONE', original: m, mascara: mask })
    return mask
  })

  // CEP
  result = result.replace(/\b\d{5}-\d{3}\b/g, (m) => {
    counter.cep++
    const mask = `[CEP_${counter.cep}]`
    replacements.push({ tipo: 'CEP', original: m, mascara: mask })
    return mask
  })

  return { text: result, replacements }
}

export function deAnonymize(text: string, replacements: AnonymizeResult['replacements']): string {
  let result = text
  for (const r of replacements) {
    result = result.split(r.mascara).join(r.original)
  }
  return result
}
