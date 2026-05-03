/**
 * Corpus juridico consolidado - ponto de entrada unico para retrieval.
 *
 * Wave R3 audit (2026-05-03): expansao corpus pra cobrir tributario,
 * intertemporal, locacao, internet e regime juridico federal alem do
 * basicao constitucional/processual/trabalhista que ja tinha. Cada novo
 * diploma segue o pattern de cf88.ts: campo temas[] curado, area
 * canonica, paragrafos/incisos quando criticos pra retrieval.
 */

import type { LegalProvision, Sumula } from '../types'
import { CF88 } from './cf88'
import { CPC } from './cpc'
import { CLT } from './clt'
import { CDC } from './cdc'
import { CC } from './cc'
import { CP } from './cp'
import { CTN } from './ctn'
import { LINDB } from './lindb'
import { INQUILINATO } from './inquilinato'
import { MARCO_CIVIL } from './marco-civil'
import { LEI_8112 } from './8112'
import { ECA } from './eca'
import { PROVIMENTO_205 } from './provimento-205'
import { SUMULAS } from './sumulas'

export const ALL_PROVISIONS: LegalProvision[] = [
  ...CF88,
  ...CPC,
  ...CLT,
  ...CDC,
  ...CC,
  ...CP,
  ...CTN,
  ...LINDB,
  ...INQUILINATO,
  ...MARCO_CIVIL,
  ...LEI_8112,
  ...ECA,
  ...PROVIMENTO_205,
]

export const ALL_SUMULAS: Sumula[] = SUMULAS

export {
  CF88, CPC, CLT, CDC, CC, CP,
  CTN, LINDB, INQUILINATO, MARCO_CIVIL, LEI_8112, ECA,
  PROVIMENTO_205, SUMULAS,
}

export const CORPUS_STATS = {
  provisions: ALL_PROVISIONS.length,
  sumulas: ALL_SUMULAS.length,
  diplomas: 13,
  areas: [
    'constitucional', 'processo civil', 'trabalhista', 'consumidor',
    'civel', 'penal', 'administrativo', 'tributario', 'ambiental',
    'familia', 'etica advocacia', 'processual', 'previdenciario',
  ],
}
