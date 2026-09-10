import { describe, expect, it } from 'vitest'
import {
  fromDiagnosisResponseDto,
  toDiagnosisInputDto,
  type DiagnosisResponseDto,
} from '@/domain/diagnosis/diagnosis.api-mapper'
import type { DiagnosisInputs } from '@/domain/diagnosis/diagnosis.types'

const inputs: DiagnosisInputs = {
  boneLossPercent: 38.5,
  teethLostToPerio: 3,
  extent: 'molar-incisor',
  stageMarks: { cal: 'II', boneLoss: 'III', toothLoss: 'IV', complexity: 'IV' },
  directEvidence: 'gte-2mm',
  ageYears: 52,
  phenotype: 'heavy-biofilm',
  smoking: 'gte-10',
  diabetes: 'hba1c-gte-7',
}

describe('Diagnosis API mapper', () => {
  it('maps domain values to the GraphQL input contract', () => {
    expect(toDiagnosisInputDto(inputs)).toEqual({
      extent: 'molar_incisor',
      complexity: {
        boneLossPercent: 38.5,
        teethLostToPerio: 3,
        directEvidence: 'gte_2mm',
        phenotype: 'heavy_biofilm',
        smoking: 'gte_10',
        diabetes: 'hba1c_gte_7',
        ageYears: 52,
        calStageOverride: 'stage_2',
        boneLossStageOverride: 'stage_3',
        toothLossStageOverride: 'stage_4',
        complexityStageOverride: 'stage_4',
      },
    })
  })

  it('maps API values back to valid domain values', () => {
    const response: DiagnosisResponseDto = {
      extent: 'molar_incisor',
      complexity: {
        boneLossPercent: 38.5,
        teethLostToPerio: 3,
        directEvidence: 'gte_2mm',
        phenotype: 'heavy_biofilm',
        smoking: 'gte_10',
        diabetes: 'hba1c_gte_7',
        ageYears: 52,
        calStageOverride: 'stage_2',
        boneLossStageOverride: 'stage_3',
        toothLossStageOverride: 'stage_4',
        complexityStageOverride: 'stage_4',
      },
    }

    expect(fromDiagnosisResponseDto(response)).toEqual(inputs)
  })

  it('sanitizes invalid numeric values before saving', () => {
    const dto = toDiagnosisInputDto({
      ...inputs,
      boneLossPercent: Number.NaN,
      teethLostToPerio: 1.5,
      ageYears: 52.5,
    })

    expect(dto.complexity).toMatchObject({
      boneLossPercent: null,
      teethLostToPerio: null,
      ageYears: null,
    })
  })
})
