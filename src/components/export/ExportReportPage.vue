<script setup lang="ts">
import type { ExportRenderModel, ExportRenderPageModel } from '@/domain/export/export-renderer'

defineProps<{ page: ExportRenderPageModel; model: ExportRenderModel }>()
</script>

<template>
  <main
    :data-export-page-id="page.id"
    class="export-report-page bg-white text-slate-900"
    :class="{ 'grayscale': model.options.grayscale }"
    :style="{ width: `${page.widthMm}mm`, height: `${page.heightMm}mm` }"
  >
    <section class="export-report-body"><slot /></section>
    <footer class="export-report-footer">
      <span>Generated {{ new Date(model.generatedAt).toLocaleString('en-GB') }}</span>
      <span>Page {{ page.pageNumber }} of {{ page.pageCount }}</span>
    </footer>
  </main>
</template>

<style scoped>
.export-report-page { position: relative; overflow: hidden; box-sizing: border-box; font-family: Inter, Arial, sans-serif; }
.export-report-body { position: absolute; inset: 8mm 9mm 13mm; overflow: hidden; }
.export-report-footer { position: absolute; inset: auto 9mm 6mm; display: flex; justify-content: space-between; border-top: .2mm solid #e2e8f0; padding-top: 2mm; color: #64748b; font-size: 7px; }
</style>
