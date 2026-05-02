/**
 * Corpus juridico consolidado - ponto de entrada unico para retrieval.
 */

import type { LegalProvision, Sumula } from '../types'
import { CF88 } from './cf88'
import { CPC } from './cpc'
import { CLT } from './clt'
import { CDC } from './cdc'
import { CC } from './cc'
import { CP } from './cp'
import { PROVIMENTO_205 } from './provimento-205'
import { SUMULAS } from './sumulas'

export const ALL_PROVISIONS: LegalProvision[] = [
  ...CF88,
  ...CPC,
  ...CLT,
  ...CDC,
  ...CC,
  ...CP,
  ...PROVIMENTO_205,
]

export const ALL_SUMULAS: Sumula[] = SUMULAS

export { CF88, CPC, CLT, CDC, CC, CP, PROVIMENTO_205, SUMULAS }

export const CORPUS_STATS = {
  provisions: ALL_PROVISIONS.length,
  sumulas: ALL_SUMULAS.length,
  diplomas: 7,
  areas: ['constitucional', 'processo civil', 'trabalhista', 'consumidor', 'civel', 'penal', 'administrativo', 'tributario', 'ambiental', 'familia', 'etica advocacia', 'processual'],
}
