<script setup lang="ts">
import type { VNode, VNodeChild } from 'vue'
import type { SchemaFormColumn, SchemaFormLayoutType, SchemaFormProps } from '../types'
import type { FormRecord } from './utils'

import { Button, Form, Row, Space, Spin, Steps } from 'antdv-next'
import { computed, Fragment, h, isVNode, ref } from 'vue'

import { SchemaFormField } from './SchemaFormField'
import { buildSchemaSteps, normalizePath } from './utils'

interface FormApi {
  validate?: () => Promise<unknown>
  validateFields?: () => Promise<unknown>
  resetFields?: () => void
  clearValidate?: () => void
}

type SchemaSlots = Record<string, ((props: Record<string, unknown>) => VNodeChild) | undefined>

interface BodyProps {
  columns: SchemaFormColumn<FormRecord>[]
  model: FormRecord
  layoutType: SchemaFormLayoutType
  labelCol?: Record<string, unknown>
  wrapperCol?: Record<string, unknown>
  grid?: boolean
  readonly?: boolean
  submitter?: SchemaFormProps<FormRecord>['submitter']
  current?: number
  loading?: boolean
  submitting?: boolean
  schemaSlots?: SchemaSlots
}

const props = withDefaults(defineProps<BodyProps>(), {
  grid: false,
  readonly: false,
  current: 0,
  loading: false,
  submitting: false,
  schemaSlots: () => ({}),
})

const emit = defineEmits<{
  fieldChange: [path: Array<string | number>, value: unknown]
  submit: []
  reset: []
  next: []
  prev: []
  currentChange: [current: number]
}>()

const formRef = ref<FormApi>()
const isStepLayout = computed(
  () => props.layoutType === 'StepForm' || props.layoutType === 'StepsForm',
)
const steps = computed(() => buildSchemaSteps(props.columns))
const normalizedCurrent = computed(() =>
  Math.max(0, Math.min(props.current, Math.max(steps.value.length - 1, 0))),
)
const activeColumns = computed(() =>
  isStepLayout.value ? (steps.value[normalizedCurrent.value]?.columns ?? []) : props.columns,
)
const stepItems = computed(() =>
  steps.value.map((step, index) => {
    const customTitle = props.schemaSlots['step-title']?.({
      title: step.title,
      index,
      current: normalizedCurrent.value,
      step,
      steps: steps.value,
      values: props.model,
    })
    return {
      key: String(index),
      title: normalizeStepTitle(customTitle ?? step.title, index),
    }
  }),
)
const inline = computed(
  () => props.layoutType === 'QueryFilter' || props.layoutType === 'LightFilter',
)
const effectiveGrid = computed(() => props.grid || props.layoutType === 'QueryFilter')
const showSubmitter = computed(() => props.submitter !== false && !props.readonly)
const submitText = computed(() => {
  if (props.submitter && typeof props.submitter === 'object' && props.submitter.submitText) {
    return props.submitter.submitText
  }
  if (inline.value) return 'Search'
  return 'Submit'
})
const resetText = computed(() => {
  if (props.submitter && typeof props.submitter === 'object' && props.submitter.resetText) {
    return props.submitter.resetText
  }
  return 'Reset'
})
const hasPrevious = computed(() => isStepLayout.value && normalizedCurrent.value > 0)
const hasNext = computed(
  () => isStepLayout.value && normalizedCurrent.value < steps.value.length - 1,
)

async function validateFields(): Promise<void> {
  const form = formRef.value
  if (form?.validateFields) await form.validateFields()
  else if (form?.validate) await form.validate()
}

function resetFields(): void {
  formRef.value?.resetFields?.()
  formRef.value?.clearValidate?.()
}

function columnKey(column: SchemaFormColumn<FormRecord>, index: number): string {
  const key = column.key ?? normalizePath(column.dataIndex).join('.')
  return String(key === '' ? index : key)
}

function handleFieldChange(path: Array<string | number>, value: unknown): void {
  emit('fieldChange', path, value)
}

function renderActiveFields(): VNodeChild {
  const fields = activeColumns.value.map((column, index) =>
    h(SchemaFormField, {
      key: columnKey(column, index),
      column,
      model: props.model,
      readonly: props.readonly,
      grid: effectiveGrid.value,
      layoutType: props.layoutType,
      schemaSlots: props.schemaSlots,
      onValueChange: handleFieldChange,
    }),
  )

  if (!effectiveGrid.value) return fields
  return h(Row, { class: 'antdv-next-pro-schema-grid', gutter: 16 }, { default: () => fields })
}

function renderStepContent(): VNodeChild {
  if (!isStepLayout.value) return renderActiveFields()
  const slot = props.schemaSlots['step-content']
  if (!slot) return renderActiveFields()
  return slot({
    current: normalizedCurrent.value,
    step: steps.value[normalizedCurrent.value],
    steps: steps.value,
    columns: activeColumns.value,
    values: props.model,
    content: renderActiveFields,
  })
}

function requestNext(): void {
  emit('next')
}

function requestPrev(): void {
  emit('prev')
}

function requestSubmit(): void {
  emit('submit')
}

function requestReset(): void {
  emit('reset')
}

function requestStep(current: number): void {
  if (current < normalizedCurrent.value) {
    emit('currentChange', current)
    return
  }
  if (current > normalizedCurrent.value) emit('next')
}

const stepActionSlotProps = computed(() => ({
  current: normalizedCurrent.value,
  step: steps.value[normalizedCurrent.value],
  steps: steps.value,
  values: props.model,
  hasPrevious: hasPrevious.value,
  hasNext: hasNext.value,
  submitting: props.submitting,
  next: requestNext,
  prev: requestPrev,
  submit: requestSubmit,
  reset: requestReset,
}))

const ActiveContent = () => renderStepContent()

function normalizeStepTitle(title: VNodeChild, index: number): string | number | VNode {
  if (typeof title === 'string' || typeof title === 'number') return title
  if (isVNode(title)) return title
  if (Array.isArray(title)) return h(Fragment, null, title)
  return `Step ${index + 1}`
}

defineExpose({ validateFields, resetFields })
</script>

<template>
  <div class="antdv-next-pro-schema-body" :class="`is-${layoutType.toLowerCase()}`">
    <Spin :spinning="loading">
      <Steps
        v-if="layoutType === 'StepsForm' && steps.length > 1"
        class="antdv-next-pro-schema-steps"
        :current="normalizedCurrent"
        :items="stepItems"
        @change="requestStep"
      />

      <Form
        ref="formRef"
        :model="model"
        :layout="inline ? 'inline' : 'horizontal'"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        @finish="emit('submit')"
      >
        <ActiveContent />

        <div v-if="showSubmitter" class="antdv-next-pro-schema-submitter">
          <component
            :is="schemaSlots['step-actions']"
            v-if="isStepLayout && schemaSlots['step-actions']"
            v-bind="stepActionSlotProps"
          />
          <component
            :is="schemaSlots.submitter"
            v-else-if="schemaSlots.submitter"
            :values="model"
            :current="normalizedCurrent"
          />
          <Space v-else>
            <Button v-if="hasPrevious" @click="emit('prev')"> Previous </Button>
            <Button v-if="hasNext" type="primary" @click="emit('next')"> Next </Button>
            <Button v-else type="primary" html-type="submit" :loading="submitting">
              {{ submitText }}
            </Button>
            <Button @click="emit('reset')">
              {{ resetText }}
            </Button>
          </Space>
        </div>
      </Form>
    </Spin>
  </div>
</template>
