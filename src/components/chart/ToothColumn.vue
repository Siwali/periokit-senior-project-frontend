<script setup lang="ts">
import ClinicalInputCell from './ClinicalInputCell.vue'
import { SITE_INDEXES } from '@/domain/chart/chart.constants'
import { getFurImage, getToothColumnWidth } from '@/domain/chart/chart.image'
import type { SiteIndex, Surface, ToothData, ToothId } from '@/domain/chart/chart.types'

const props = defineProps<{
  id: ToothId
  toothData: ToothData
  surface: Surface
  section?: string
  selected: boolean
  midline?: boolean
  headerPosition?: 'top' | 'bottom' | 'none'
  order: 'standard' | 'reverse'
  getFieldValidation: (id: ToothId, surface: Surface, field: string, site: number) => 'valid' | 'invalid' | 'none'
}>()

const emit = defineEmits<{
  select: [id: ToothId]
  toggleBop: [id: ToothId, surface: Surface, site: SiteIndex]
  togglePi: [id: ToothId, surface: Surface, site: SiteIndex]
  toggleFur: [id: ToothId, surface: Surface, index: number]
  updatePd: [id: ToothId, surface: Surface, site: SiteIndex, value: string]
  updateRec: [id: ToothId, surface: Surface, site: SiteIndex, value: string]
  updateMobility: [id: ToothId, value: string]
  updateKtw: [id: ToothId, value: string]
  validateField: [id: ToothId, surface: Surface, field: string, site: number, state: 'valid' | 'invalid' | 'none']
}>()

const select = () => emit('select', props.id)
const validateField = (field: string, site: number, state: 'valid' | 'invalid' | 'none') => {
  emit('validateField', props.id, props.surface, field, site, state)
}

const getToothColumnStyle = (id: ToothId) => {
  const width = `${getToothColumnWidth(id)}px`

  return {
    width,
    flexBasis: width
  }
}
</script>

<template>
  <div
    class="flex flex-col shrink-0 border-r border-slate-400 last:border-r-0 transition-all duration-200 cursor-default"
    :class="[midline ? 'border-l-2 border-l-slate-500' : '', selected ? 'bg-blue-50/50 ring-2 ring-[#0052ff] ring-inset z-10' : '']"
    :style="getToothColumnStyle(id)"
  >
    <div
      v-if="headerPosition === 'top'"
      class="h-7 flex items-center justify-center font-black text-[11px] border-b border-slate-400 cursor-pointer transition-all duration-200"
      :class="selected ? 'bg-[#0052ff] text-white' : 'bg-slate-50 text-slate-800 hover:bg-[#0052ff] hover:text-white'"
      @click.stop="select"
    >
      {{ id }}
    </div>

    <template v-if="order === 'standard'">
      <div class="h-6 border-b border-slate-400 flex items-center justify-center"><input v-model="toothData.implant" type="checkbox" :disabled="toothData.extracted" class="w-3.5 h-3.5 accent-slate-800 disabled:opacity-30" /></div>
      <div class="flex h-6 border-b border-slate-400">
        <ClinicalInputCell
          :section="section"
          :tooth-number="id"
          :site-position="0"
          field-name="mo"
          :surface="surface"
          input-type="numeric"
          :value="toothData.mo"
          :validation-state="getFieldValidation(id, surface, 'mo', 0)"
          :disabled="toothData.extracted || toothData.implant"
          @change="value => emit('updateMobility', id, String(value))"
          @validate="state => validateField('mo', 0, state)"
        />
      </div>
      <div class="flex h-6 border-b border-slate-400">
        <ClinicalInputCell
          :section="section"
          :tooth-number="id"
          :site-position="0"
          field-name="ktw"
          :surface="surface"
          input-type="numeric"
          :value="toothData.ktw"
          :validation-state="getFieldValidation(id, surface, 'ktw', 0)"
          :disabled="toothData.extracted"
          @change="value => emit('updateKtw', id, String(value))"
          @validate="state => validateField('ktw', 0, state)"
        />
      </div>
      <div class="h-6 border-b border-slate-400 flex items-center justify-center gap-1 cursor-pointer select-none text-slate-800" :class="{ 'pointer-events-none opacity-30': toothData.extracted || toothData.implant }">
        <div v-for="(grade, fIdx) in toothData.fur[surface]" :key="fIdx" class="flex items-center justify-center w-4 h-4 cursor-pointer" @click.stop="emit('toggleFur', id, surface, fIdx)">
          <img v-if="grade > 0" :src="getFurImage(grade)" class="w-3.5 h-3.5 object-contain" />
          <div v-else class="w-3 h-3 border border-slate-400 rounded-full bg-white/50"></div>
        </div>
      </div>
      <div class="flex h-6 border-b border-slate-400">
        <ClinicalInputCell
          v-for="site in SITE_INDEXES"
          :key="site"
          :tooth-number="id"
          :site-position="site"
          field-name="bop"
          :surface="surface"
          :section="section"
          input-type="toggle"
          :value="toothData[surface].bop[site]"
          :disabled="toothData.extracted"
          @change="emit('toggleBop', id, surface, site)"
        />
      </div>
      <div class="flex h-6 border-b border-slate-400">
        <ClinicalInputCell
          v-for="site in SITE_INDEXES"
          :key="site"
          :tooth-number="id"
          :site-position="site"
          field-name="pi"
          :surface="surface"
          :section="section"
          input-type="toggle"
          :value="toothData[surface].pi[site]"
          :disabled="toothData.extracted"
          @change="emit('togglePi', id, surface, site)"
        />
      </div>
      <div class="flex h-6 border-b border-slate-400">
        <ClinicalInputCell
          v-for="site in SITE_INDEXES"
          :key="site"
          :tooth-number="id"
          :site-position="site"
          field-name="rec"
          :surface="surface"
          :section="section"
          input-type="numeric"
          :value="toothData[surface].rec[site]"
          :validation-state="getFieldValidation(id, surface, 'rec', site)"
          :disabled="toothData.extracted"
          @change="value => emit('updateRec', id, surface, site, String(value))"
          @validate="state => validateField('rec', site, state)"
        />
      </div>
      <div class="flex h-6 border-b border-slate-400">
        <ClinicalInputCell
          v-for="site in SITE_INDEXES"
          :key="site"
          :tooth-number="id"
          :site-position="site"
          field-name="pd"
          :surface="surface"
          :section="section"
          input-type="numeric"
          :value="toothData[surface].pd[site]"
          :validation-state="getFieldValidation(id, surface, 'pd', site)"
          :disabled="toothData.extracted"
          @change="value => emit('updatePd', id, surface, site, String(value))"
          @validate="state => validateField('pd', site, state)"
        />
      </div>
      <div class="flex h-6 border-b border-slate-400 bg-slate-50/30">
        <ClinicalInputCell
          v-for="site in SITE_INDEXES"
          :key="site"
          :tooth-number="id"
          :site-position="site"
          field-name="cal"
          :surface="surface"
          :section="section"
          input-type="numeric"
          :value="toothData[surface].cal[site] || '0'"
          readonly
        />
      </div>
    </template>

    <template v-else>
      <div class="flex h-6 border-b border-slate-400 bg-slate-50/30">
        <ClinicalInputCell
          v-for="site in SITE_INDEXES"
          :key="site"
          :tooth-number="id"
          :site-position="site"
          field-name="cal"
          :surface="surface"
          :section="section"
          input-type="numeric"
          :value="toothData[surface].cal[site] || '0'"
          readonly
        />
      </div>
      <div class="flex h-6 border-b border-slate-400">
        <ClinicalInputCell
          v-for="site in SITE_INDEXES"
          :key="site"
          :tooth-number="id"
          :site-position="site"
          field-name="pd"
          :surface="surface"
          :section="section"
          input-type="numeric"
          :value="toothData[surface].pd[site]"
          :validation-state="getFieldValidation(id, surface, 'pd', site)"
          :disabled="toothData.extracted"
          @change="value => emit('updatePd', id, surface, site, String(value))"
          @validate="state => validateField('pd', site, state)"
        />
      </div>
      <div class="flex h-6 border-b border-slate-400">
        <ClinicalInputCell
          v-for="site in SITE_INDEXES"
          :key="site"
          :tooth-number="id"
          :site-position="site"
          field-name="rec"
          :surface="surface"
          :section="section"
          input-type="numeric"
          :value="toothData[surface].rec[site]"
          :validation-state="getFieldValidation(id, surface, 'rec', site)"
          :disabled="toothData.extracted"
          @change="value => emit('updateRec', id, surface, site, String(value))"
          @validate="state => validateField('rec', site, state)"
        />
      </div>
      <div class="flex h-6 border-b border-slate-400">
        <ClinicalInputCell
          v-for="site in SITE_INDEXES"
          :key="site"
          :tooth-number="id"
          :site-position="site"
          field-name="pi"
          :surface="surface"
          :section="section"
          input-type="toggle"
          :value="toothData[surface].pi[site]"
          :disabled="toothData.extracted"
          @change="emit('togglePi', id, surface, site)"
        />
      </div>
      <div class="flex h-6 border-b border-slate-400">
        <ClinicalInputCell
          v-for="site in SITE_INDEXES"
          :key="site"
          :tooth-number="id"
          :site-position="site"
          field-name="bop"
          :surface="surface"
          :section="section"
          input-type="toggle"
          :value="toothData[surface].bop[site]"
          :disabled="toothData.extracted"
          @change="emit('toggleBop', id, surface, site)"
        />
      </div>
      <div class="h-6 border-b border-slate-400 flex items-center justify-center gap-1 cursor-pointer select-none text-slate-800" :class="{ 'pointer-events-none opacity-30': toothData.extracted || toothData.implant }">
        <div v-for="(grade, fIdx) in toothData.fur[surface]" :key="fIdx" class="flex items-center justify-center w-4 h-4 cursor-pointer" @click.stop="emit('toggleFur', id, surface, fIdx)">
          <img v-if="grade > 0" :src="getFurImage(grade)" class="w-3.5 h-3.5 object-contain" />
          <div v-else class="w-3 h-3 border border-slate-400 rounded-full bg-white/50"></div>
        </div>
      </div>
      <div class="flex h-6 border-b border-slate-400">
        <ClinicalInputCell
          :section="section"
          :tooth-number="id"
          :site-position="0"
          field-name="ktw"
          :surface="surface"
          input-type="numeric"
          :value="toothData.ktw"
          :validation-state="getFieldValidation(id, surface, 'ktw', 0)"
          :disabled="toothData.extracted"
          @change="value => emit('updateKtw', id, String(value))"
          @validate="state => validateField('ktw', 0, state)"
        />
      </div>
      <div class="flex h-6 border-b border-slate-400">
        <ClinicalInputCell
          :section="section"
          :tooth-number="id"
          :site-position="0"
          field-name="mo"
          :surface="surface"
          input-type="numeric"
          :value="toothData.mo"
          :validation-state="getFieldValidation(id, surface, 'mo', 0)"
          :disabled="toothData.extracted || toothData.implant"
          @change="value => emit('updateMobility', id, String(value))"
          @validate="state => validateField('mo', 0, state)"
        />
      </div>
      <div class="h-6 flex items-center justify-center"><input v-model="toothData.implant" type="checkbox" :disabled="toothData.extracted" class="w-3.5 h-3.5 accent-slate-800 disabled:opacity-30" /></div>
    </template>

    <div
      v-if="headerPosition === 'bottom'"
      class="h-7 flex items-center justify-center font-black text-[11px] border-t border-slate-400 cursor-pointer transition-all duration-200"
      :class="selected ? 'bg-[#0052ff] text-white' : 'bg-slate-50 text-slate-800 hover:bg-[#0052ff] hover:text-white'"
      @click.stop="select"
    >
      {{ id }}
    </div>
  </div>
</template>
