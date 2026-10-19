import { describe, expect, it } from 'vitest'
import {
  assessGrade,
  assessStage,
  autoStageMarks,
  gradeForRatio,
  stagesForBoneLoss,
  stagesForCal,
  stagesForToothLoss,
} from '@/domain/diagnosis/diagnosis.rules'
import type { StageRow, StageId } from '@/domain/diagnosis/diagnosis.types'

const noMarks: Record<StageRow, StageId | null> = {
  cal: null,
  boneLoss: null,
  toothLoss: null,
  complexity: null,
}

describe('diagnosis staging rules', () => {
  it('preserves the clinical boundaries for each severity criterion', () => {
    expect(stagesForCal(2)).toEqual(['I'])
    expect(stagesForCal(3)).toEqual(['II'])
    expect(stagesForCal(5)).toEqual(['III', 'IV'])

    expect(stagesForBoneLoss(14.9)).toEqual(['I'])
    expect(stagesForBoneLoss(15)).toEqual(['II'])
    expect(stagesForBoneLoss(33)).toEqual(['II'])
    expect(stagesForBoneLoss(33.1)).toEqual(['III', 'IV'])

    expect(stagesForToothLoss(0)).toEqual(['I', 'II'])
    expect(stagesForToothLoss(4)).toEqual(['III'])
    expect(stagesForToothLoss(5)).toEqual(['IV'])
  })

  it('allows complexity to raise but not lower the severity stage', () => {
    const raised = assessStage(noMarks, autoStageMarks(2, 20, 0, 'IV'))
    const unchanged = assessStage(noMarks, autoStageMarks(5, 40, 5, 'II'))

    expect(raised.severity).toBe('II')
    expect(raised.stage).toBe('IV')
    expect(unchanged.severity).toBe('IV')
    expect(unchanged.stage).toBe('IV')
  })

  it('lets a selected row override its automatic band', () => {
    const assessment = assessStage(
      { ...noMarks, boneLoss: 'IV' },
      autoStageMarks(2, 20, 0, 'I'),
    )

    expect(assessment.resolved.boneLoss).toBe('IV')
    expect(assessment.stage).toBe('IV')
  })
})

describe('diagnosis grading rules', () => {
  it('preserves ratio boundaries', () => {
    expect(gradeForRatio(0.24)).toBe('A')
    expect(gradeForRatio(0.25)).toBe('B')
    expect(gradeForRatio(1)).toBe('B')
    expect(gradeForRatio(1.01)).toBe('C')
  })

  it('starts an unassessed case at Grade B', () => {
    const assessment = assessGrade({
      directEvidence: null,
      boneLossPercent: null,
      ageYears: null,
      phenotype: null,
      smoking: null,
      diabetes: null,
    })

    expect(assessment.grade).toBe('B')
    expect(assessment.primary).toBe('B')
    expect(assessment.missing).toContain('smoking')
    expect(assessment.missing).toContain('diabetes')
  })

  it('allows risk modifiers to raise but not lower the primary grade', () => {
    const raised = assessGrade({
      directEvidence: 'no-loss',
      boneLossPercent: null,
      ageYears: null,
      phenotype: null,
      smoking: 'gte-10',
      diabetes: 'none',
    })
    const unchanged = assessGrade({
      directEvidence: 'gte-2mm',
      boneLossPercent: null,
      ageYears: null,
      phenotype: null,
      smoking: 'non-smoker',
      diabetes: 'none',
    })

    expect(raised.primary).toBe('A')
    expect(raised.grade).toBe('C')
    expect(unchanged.primary).toBe('C')
    expect(unchanged.grade).toBe('C')
  })
})
