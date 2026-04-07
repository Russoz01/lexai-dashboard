// SM-2 spaced repetition algorithm — used by Professor flashcards.
// Reference: https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm
//
// quality scale:
//   0 = total blackout
//   1 = wrong answer (recalled with effort after seeing it)
//   2 = wrong answer (felt familiar)
//   3 = correct but hard
//   4 = correct (good)
//   5 = correct (perfect/easy)

export interface Sm2Result {
  facilidade: number
  intervalo_dias: number
  proxima_revisao: string // YYYY-MM-DD
  total_revisoes: number
}

/**
 * Returns updated facilidade and intervalo_dias based on quality (0-5).
 * Pure function — does not touch the database.
 */
export function sm2Update(
  facilidade: number,
  intervalo_dias: number,
  total_revisoes: number,
  quality: number,
): Sm2Result {
  let newFacilidade = facilidade + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (newFacilidade < 1.3) newFacilidade = 1.3

  let newIntervalo: number
  if (quality < 3) {
    newIntervalo = 1 // reset
  } else if (total_revisoes === 0) {
    newIntervalo = 1
  } else if (total_revisoes === 1) {
    newIntervalo = 6
  } else {
    newIntervalo = Math.round(intervalo_dias * newFacilidade)
  }

  const proxima = new Date()
  proxima.setDate(proxima.getDate() + newIntervalo)

  return {
    facilidade: newFacilidade,
    intervalo_dias: newIntervalo,
    proxima_revisao: proxima.toISOString().slice(0, 10),
    total_revisoes: total_revisoes + 1,
  }
}
