<script setup lang="ts">
import { computed } from 'vue'
import DiagnosisField from '@/components/diagnosis/DiagnosisField.vue'
import GradeCriteriaTable from '@/components/diagnosis/GradeCriteriaTable.vue'
import StageCriteriaTable from '@/components/diagnosis/StageCriteriaTable.vue'
import { rendererDiagnosisReport, type ExportRenderModel } from '@/domain/export/export-renderer'
import {
  DIABETES_LABEL,
  DIRECT_EVIDENCE_LABEL,
  EXTENT_LABEL,
  FURCATION_CLASS,
  GRADE_MEANING,
  PHENOTYPE_LABEL,
  SMOKING_LABEL,
  STAGE_MEANING,
} from '@/domain/diagnosis/diagnosis.types'

const props = defineProps<{ model: ExportRenderModel }>()
const report = computed(() => rendererDiagnosisReport(props.model))
const inputs = computed(() => report.value!.inputs)
const findings = computed(() => report.value!.findings)
const assessment = computed(() => report.value!.assessment)

const recorded = (value: string | number | null | undefined, suffix = '') =>
  value === null || value === undefined || value === '' ? 'Not recorded' : `${value}${suffix}`
const gradeValue = computed(() => assessment.value.finalGrade ?? assessment.value.grade.grade)
</script>

<template>
  <div v-if="report" class="export-diagnosis-content text-slate-900" inert>
    <header class="px-1">
      <h1 class="text-[15px] font-bold text-slate-500">Periodontal diagnosis · AAP / EFP 2017</h1>
      <h2 class="mt-1 text-[21px] font-extrabold tracking-tight text-[#0052ff]">
        Result : {{ assessment.diagnosisTitle }}
      </h2>
    </header>

    <section class="diagnosis-card">
      <div class="section-title"><span>1</span><h3>Periodontitis Stage</h3></div>
      <div class="grid grid-cols-5 gap-5">
        <DiagnosisField label="Interdental CAL">
          <b>{{ recorded(assessment.interdentalCal, ' mm') }}</b>
        </DiagnosisField>
        <DiagnosisField label="Max probing depth">
          <b>{{ recorded(assessment.probingDepth, ' mm') }}</b>
        </DiagnosisField>
        <DiagnosisField label="Furcation / mobility">
          <b>{{ findings.furcation ? FURCATION_CLASS[findings.furcation.grade] : 'None' }}<template v-if="findings.mobility"> · Mob {{ findings.mobility.grade }}</template></b>
        </DiagnosisField>
        <DiagnosisField label="Radiographic bone loss">
          <b>{{ recorded(assessment.boneLoss, '%') }}</b>
          <template #hint>At worst site</template>
        </DiagnosisField>
        <DiagnosisField label="Tooth loss cause">
          <b>{{ recorded(assessment.teethLost) }}</b>
          <template #hint>Teeth lost to perio</template>
        </DiagnosisField>
      </div>

      <StageCriteriaTable
        :stage="assessment.finalStage"
        :marks="inputs.stageMarks"
        :resolved="assessment.stage.resolved"
        :cal="assessment.interdentalCal"
        :bone-loss-percent="assessment.boneLoss"
        :teeth-lost="assessment.teethLost"
        :complexity="assessment.complexity"
        readonly
      />

      <div class="result-box flex items-center justify-between gap-5">
        <div>
          <b class="text-[12px]">Extent and distribution</b>
          <p class="text-[10px] text-slate-400">Counted from chart: {{ findings.affectedTeeth }} of {{ findings.remainingTeeth }} teeth affected ({{ findings.affectedPercentage }}%)</p>
        </div>
        <div class="extent-options">
          <span v-for="(label, id) in EXTENT_LABEL" :key="id" :class="{ active: assessment.extent === id }">{{ label.split(' (')[0] }}</span>
        </div>
      </div>
      <div class="system-result">
        <span>System result</span><strong>Stage {{ assessment.finalStage ?? '—' }}</strong>
        <em>{{ assessment.missingStageInputs.length ? `Still needs ${assessment.missingStageInputs.join(', ')}` : 'All criteria recorded' }}</em>
        <p>{{ assessment.finalStage ? STAGE_MEANING[assessment.finalStage] : 'Stage cannot be determined until the required criteria are recorded.' }}</p>
      </div>
    </section>

    <section class="diagnosis-card">
      <div class="section-title"><span>2</span><h3>Periodontitis Grade</h3></div>
      <div class="grid grid-cols-6 gap-5">
        <DiagnosisField label="Direct evidence"><b>{{ inputs.directEvidence ? DIRECT_EVIDENCE_LABEL[inputs.directEvidence] : 'Not available' }}</b></DiagnosisField>
        <DiagnosisField label="Bone loss, worst site"><b>{{ recorded(assessment.boneLoss, '%') }}</b></DiagnosisField>
        <DiagnosisField label="Patient age"><b>{{ recorded(assessment.age, ' years') }}</b></DiagnosisField>
        <DiagnosisField label="% bone loss ÷ age"><b>{{ recorded(assessment.grade.ratio) }}</b></DiagnosisField>
        <DiagnosisField label="Smoking"><b>{{ inputs.smoking ? SMOKING_LABEL[inputs.smoking] : 'Not recorded' }}</b></DiagnosisField>
        <DiagnosisField label="Diabetes"><b>{{ inputs.diabetes ? DIABETES_LABEL[inputs.diabetes] : 'Not recorded' }}</b></DiagnosisField>
      </div>
      <p class="-mt-2 text-[10px] text-slate-400">Case phenotype: {{ assessment.phenotype ? PHENOTYPE_LABEL[assessment.phenotype] : 'Not assessed' }}</p>

      <GradeCriteriaTable
        :grade="assessment.finalGrade"
        :direct-evidence="inputs.directEvidence"
        :bone-loss-percent="assessment.boneLoss"
        :age-years="assessment.age"
        :ratio="assessment.grade.ratio"
        :ratio-grade="assessment.grade.ratioGrade"
        :phenotype="assessment.phenotype"
        :phenotype-from-chart="assessment.phenotypeFromChart"
        :smoking="inputs.smoking"
        :diabetes="inputs.diabetes"
        readonly
      />

      <div class="system-result">
        <span>System result</span><strong>Grade {{ gradeValue }}</strong>
        <em>{{ assessment.grade.missing.length ? `Still needs ${assessment.grade.missing.join(', ')}` : 'All required input provided' }}</em>
        <p>{{ GRADE_MEANING[gradeValue] }}</p>
      </div>
    </section>
  </div>
  <div v-else class="export-diagnosis-content grid place-items-center rounded-2xl border border-slate-200 text-slate-500">
    No diagnosis details were recorded.
  </div>
</template>

<style scoped>
.export-diagnosis-content { width: 1050px; display: flex; flex-direction: column; gap: 16px; pointer-events: none; user-select: none; }
.diagnosis-card { display: flex; flex-direction: column; gap: 14px; border: 1px solid #cbd5e1; border-radius: 18px; padding: 18px; background: white; }
.section-title { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; }
.section-title span { display: grid; width: 20px; height: 20px; place-items: center; border-radius: 999px; background: #0052ff; color: white; font-size: 10px; }
.result-box { border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 12px; }
.extent-options { display: flex; gap: 4px; padding: 3px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f1f5f9; }
.extent-options span { padding: 4px 8px; border-radius: 5px; color: #64748b; font-size: 10px; font-weight: 600; }
.extent-options .active { background: #0052ff; color: white; }
.system-result { border: 1px solid #e2e8f0; border-radius: 12px; padding: 11px 13px; font-size: 11px; }
.system-result > span { color: #64748b; }
.system-result > strong { margin-left: 12px; color: #f59e0b; font-size: 14px; }
.system-result > em { margin-left: 10px; border-radius: 999px; background: #d1fae5; padding: 3px 8px; color: #047857; font-style: normal; font-weight: 700; }
.system-result > p { margin-top: 6px; color: #475569; line-height: 1.45; }
</style>
