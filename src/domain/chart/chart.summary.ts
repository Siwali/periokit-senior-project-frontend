import type { ChartData, Surface } from './chart.types'
import { getSiteLabel, getSiteRegion, type SiteRegion } from './chart.mapper'

const toNumber = (value: string) => Number.parseInt(value, 10) || 0

// ── Site-aware summary types & helpers (for the Overview display) ──────────────
// Each finding keeps the affected site(s) so the UI can show *where* on the tooth
// the value was recorded, not just the tooth number.

export interface SiteRef {
  label: string       // base position label, e.g. 'MB' | 'B' | 'DB' | 'MP' …
  region: SiteRegion  // buccal-upper | palatal | lingual | buccal-lower (color + arch)
}

export interface ToothSiteEntry {
  toothId: number
  sites: SiteRef[]    // empty ⇒ whole-tooth finding (e.g. mobility)
}

const SURFACES: Surface[] = ['buccal', 'lingual']

const sortedToothIds = (chartData: ChartData): number[] =>
  Object.keys(chartData).map(Number).sort((a, b) => a - b)

// Append a site to the per-tooth accumulator, creating the entry on first hit.
// Iterating surfaces buccal→lingual and index 0→2 keeps sites in display order.
const pushSite = (
  map: Map<number, ToothSiteEntry>,
  toothId: number,
  surface: Surface,
  siteIndex: number,
) => {
  let entry = map.get(toothId)
  if (!entry) {
    entry = { toothId, sites: [] }
    map.set(toothId, entry)
  }
  entry.sites.push({
    label: getSiteLabel(toothId, surface, siteIndex),
    region: getSiteRegion(toothId, surface),
  })
}

const toEntries = (map: Map<number, ToothSiteEntry>): ToothSiteEntry[] =>
  Array.from(map.values()).sort((a, b) => a.toothId - b.toothId)


/**
 * Get teeth by mobility grade
 * @param chartData - Chart data
 * @param grade - Mobility grade (0-3)
 * @returns Array of tooth IDs with the specified mobility grade
 */
export const getTeethByMobility = (
  chartData: ChartData,
  grade: number,
): number[] => {
  const result: number[] = []

  Object.entries(chartData).forEach(([toothId, tooth]) => {
    if (tooth.extracted || tooth.implant) return
    if (toNumber(tooth.mo) === grade) {
      result.push(Number.parseInt(toothId, 10))
    }
  })

  return result.sort((a, b) => a - b)
}

// ── Site-aware accessors (used by the Overview's Clinical Data Summary) ────────

/**
 * Group abnormal Probing Depth (PD > 4mm) by value, keeping the affected site(s)
 * of each tooth.
 */
export const getPdByValueWithSites = (
  chartData: ChartData,
): Record<number, ToothSiteEntry[]> => {
  const grouped: Record<number, Map<number, ToothSiteEntry>> = {}

  sortedToothIds(chartData).forEach((toothId) => {
    const tooth = chartData[toothId]
    if (tooth.extracted) return

    SURFACES.forEach((surface) => {
      tooth[surface].pd.forEach((value, siteIndex) => {
        const pd = toNumber(value)
        if (pd > 4) {
          if (!grouped[pd]) grouped[pd] = new Map()
          pushSite(grouped[pd], toothId, surface, siteIndex)
        }
      })
    })
  })

  const out: Record<number, ToothSiteEntry[]> = {}
  Object.keys(grouped).forEach((key) => {
    out[Number(key)] = toEntries(grouped[Number(key)])
  })
  return out
}

/**
 * Group keratinized tissue width (0 < KTW < 2mm) by value, keeping the affected
 * surface(s). KTW is per-surface, so the center label (index 1) is used as the
 * surface code (Bᵘ / P / L / Bˡ).
 */
export const getKtwByValueWithSites = (
  chartData: ChartData,
): Record<string, ToothSiteEntry[]> => {
  const grouped: Record<string, Map<number, ToothSiteEntry>> = {}

  sortedToothIds(chartData).forEach((toothId) => {
    const tooth = chartData[toothId]
    if (tooth.extracted) return

    SURFACES.forEach((surface) => {
      const val = parseFloat(tooth[surface].ktw)
      if (val > 0 && val < 2) {
        const key = String(val)
        if (!grouped[key]) grouped[key] = new Map()
        pushSite(grouped[key], toothId, surface, 1)
      }
    })
  })

  const out: Record<string, ToothSiteEntry[]> = {}
  Object.keys(grouped).forEach((key) => {
    out[key] = toEntries(grouped[key])
  })
  return out
}

/**
 * Teeth whose maximum furcation grade equals the requested grade (matching
 * getTeethByFurcation), keeping the site(s) that carry that grade.
 */
export const getFurcationWithSites = (
  chartData: ChartData,
  grade: number,
): ToothSiteEntry[] => {
  const entries: ToothSiteEntry[] = []

  sortedToothIds(chartData).forEach((toothId) => {
    const tooth = chartData[toothId]
    if (tooth.extracted || tooth.implant) return

    let maxFur = 0
    SURFACES.forEach((surface) => {
      tooth.fur[surface].forEach((f) => {
        if (f > maxFur) maxFur = f
      })
    })
    if (maxFur !== grade) return

    const sites: SiteRef[] = []
    SURFACES.forEach((surface) => {
      tooth.fur[surface].forEach((f, siteIndex) => {
        if (f === maxFur && siteIndex <= 2) {
          sites.push({
            label: getSiteLabel(toothId, surface, siteIndex),
            region: getSiteRegion(toothId, surface),
          })
        }
      })
    })

    entries.push({ toothId, sites })
  })

  return entries
}

