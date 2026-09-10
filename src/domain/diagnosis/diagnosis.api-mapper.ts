import type {
  DiagnosisInputs,
  DirectEvidence,
  Diabetes,
  Phenotype,
  Smoking,
  StageId,
} from './diagnosis.types'

export interface DiagnosisComplexityInputDto {
  boneLossPercent: number | null
  teethLostToPerio: number | null
  directEvidence: 'no_loss' | 'lt_2mm' | 'gte_2mm' | null
  phenotype: 'heavy_biofilm' | 'commensurate' | 'exceeds' | null
  smoking: 'non_smoker' | 'lt_10' | 'gte_10' | null
  diabetes: 'none' | 'hba1c_lt_7' | 'hba1c_gte_7' | null
  ageYears: number | null
  calStageOverride: 'stage_1' | 'stage_2' | 'stage_3' | 'stage_4' | null
  boneLossStageOverride: 'stage_1' | 'stage_2' | 'stage_3' | 'stage_4' | null
  toothLossStageOverride: 'stage_1' | 'stage_2' | 'stage_3' | 'stage_4' | null
  complexityStageOverride: 'stage_1' | 'stage_2' | 'stage_3' | 'stage_4' | null
}

export interface DiagnosisInputDto {
  extent: 'localized' | 'generalized' | 'molar_incisor' | null
  complexity: DiagnosisComplexityInputDto
}

export interface DiagnosisResponseDto {
  extent: DiagnosisInputDto['extent']
  complexity: DiagnosisComplexityInputDto
}

type ApiDirectEvidence = NonNullable<DiagnosisComplexityInputDto['directEvidence']>
type ApiPhenotype = NonNullable<DiagnosisComplexityInputDto['phenotype']>
type ApiSmoking = NonNullable<DiagnosisComplexityInputDto['smoking']>
type ApiDiabetes = NonNullable<DiagnosisComplexityInputDto['diabetes']>
type ApiStageOverride = NonNullable<DiagnosisComplexityInputDto['complexityStageOverride']>

const DIRECT_EVIDENCE_TO_API = {
  'no-loss': 'no_loss',
  'lt-2mm': 'lt_2mm',
  'gte-2mm': 'gte_2mm',
} satisfies Record<DirectEvidence, ApiDirectEvidence>

const DIRECT_EVIDENCE_FROM_API = {
  no_loss: 'no-loss',
  lt_2mm: 'lt-2mm',
  gte_2mm: 'gte-2mm',
} satisfies Record<ApiDirectEvidence, DirectEvidence>

const PHENOTYPE_TO_API = {
  'heavy-biofilm': 'heavy_biofilm',
  commensurate: 'commensurate',
  exceeds: 'exceeds',
} satisfies Record<Phenotype, ApiPhenotype>

const PHENOTYPE_FROM_API = {
  heavy_biofilm: 'heavy-biofilm',
  commensurate: 'commensurate',
  exceeds: 'exceeds',
} satisfies Record<ApiPhenotype, Phenotype>

const SMOKING_TO_API = {
  'non-smoker': 'non_smoker',
  'lt-10': 'lt_10',
  'gte-10': 'gte_10',
} satisfies Record<Smoking, ApiSmoking>

const SMOKING_FROM_API = {
  non_smoker: 'non-smoker',
  lt_10: 'lt-10',
  gte_10: 'gte-10',
} satisfies Record<ApiSmoking, Smoking>

const DIABETES_TO_API = {
  none: 'none',
  'hba1c-lt-7': 'hba1c_lt_7',
  'hba1c-gte-7': 'hba1c_gte_7',
} satisfies Record<Diabetes, ApiDiabetes>

const DIABETES_FROM_API = {
  none: 'none',
  hba1c_lt_7: 'hba1c-lt-7',
  hba1c_gte_7: 'hba1c-gte-7',
} satisfies Record<ApiDiabetes, Diabetes>

const STAGE_TO_API = {
  I: 'stage_1',
  II: 'stage_2',
  III: 'stage_3',
  IV: 'stage_4',
} satisfies Record<StageId, ApiStageOverride>

const STAGE_FROM_API = {
  stage_1: 'I',
  stage_2: 'II',
  stage_3: 'III',
  stage_4: 'IV',
} satisfies Record<ApiStageOverride, StageId>

function mapNullable<T extends string, U extends string>(
  value: T | null,
  map: Record<T, U>,
): U | null {
  return value === null ? null : map[value]
}

export function toDiagnosisInputDto(inputs: DiagnosisInputs): DiagnosisInputDto {
  return {
    extent: inputs.extent === 'molar-incisor' ? 'molar_incisor' : inputs.extent,
    complexity: {
      boneLossPercent: finiteOrNull(inputs.boneLossPercent),
      teethLostToPerio: integerOrNull(inputs.teethLostToPerio),
      directEvidence: mapNullable(inputs.directEvidence, DIRECT_EVIDENCE_TO_API),
      phenotype: mapNullable(inputs.phenotype, PHENOTYPE_TO_API),
      smoking: mapNullable(inputs.smoking, SMOKING_TO_API),
      diabetes: mapNullable(inputs.diabetes, DIABETES_TO_API),
      ageYears: integerOrNull(inputs.ageYears),
      calStageOverride: mapNullable(inputs.stageMarks.cal, STAGE_TO_API),
      boneLossStageOverride: mapNullable(inputs.stageMarks.boneLoss, STAGE_TO_API),
      toothLossStageOverride: mapNullable(inputs.stageMarks.toothLoss, STAGE_TO_API),
      complexityStageOverride: inputs.stageMarks.complexity
        ? STAGE_TO_API[inputs.stageMarks.complexity]
        : null,
    },
  }
}

export function fromDiagnosisResponseDto(response: DiagnosisResponseDto): Partial<DiagnosisInputs> {
  const complexity = response.complexity
  return {
    extent: response.extent === 'molar_incisor' ? 'molar-incisor' : response.extent,
    boneLossPercent: complexity.boneLossPercent,
    teethLostToPerio: complexity.teethLostToPerio,
    directEvidence: mapNullable(complexity.directEvidence, DIRECT_EVIDENCE_FROM_API),
    phenotype: mapNullable(complexity.phenotype, PHENOTYPE_FROM_API),
    smoking: mapNullable(complexity.smoking, SMOKING_FROM_API),
    diabetes: mapNullable(complexity.diabetes, DIABETES_FROM_API),
    ageYears: complexity.ageYears,
    stageMarks: {
      cal: mapNullable(complexity.calStageOverride, STAGE_FROM_API),
      boneLoss: mapNullable(complexity.boneLossStageOverride, STAGE_FROM_API),
      toothLoss: mapNullable(complexity.toothLossStageOverride, STAGE_FROM_API),
      complexity: mapNullable(complexity.complexityStageOverride, STAGE_FROM_API),
    },
  }
}

function finiteOrNull(value: number | null) {
  return value !== null && Number.isFinite(value) ? value : null
}

function integerOrNull(value: number | null) {
  return value !== null && Number.isInteger(value) ? value : null
}
